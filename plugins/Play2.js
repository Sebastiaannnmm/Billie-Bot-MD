// commands/play2.js — YouTube Play (Lil Peep Aesthetic Edit)
"use strict";

const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

const API_BASE = (process.env.API_BASE || "https://api-sky.ultraplus.click").replace(/\/+$/, "");
const API_KEY = process.env.API_KEY || "Russellxz";

const DEFAULT_VIDEO_QUALITY = "360";
const DEFAULT_AUDIO_FORMAT = "mp3";
const MAX_MB = 200; 

const VALID_QUALITIES = new Set(["144", "240", "360", "720", "1080", "1440", "4k"]);
const pending = {};

function safeName(name = "file") {
  return (String(name).slice(0, 90).replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, " ").trim() || "file");
}

function fileSizeMB(filePath) {
  const b = fs.statSync(filePath).size;
  return b / (1024 * 1024);
}

function ensureTmp() {
  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
  return tmp;
}

function extractQualityFromText(input = "") {
  const t = String(input || "").toLowerCase();
  if (t.includes("4k")) return "4k";
  const m = t.match(/\b(144|240|360|720|1080|1440)\s*p?\b/);
  if (m && VALID_QUALITIES.has(m[1])) return m[1];
  return "";
}

function splitQueryAndQuality(rawText = "") {
  const t = String(rawText || "").trim();
  if (!t) return { query: "", quality: "" };
  const parts = t.split(/\s+/);
  const last = (parts[parts.length - 1] || "").toLowerCase();
  let q = "";
  if (last === "4k") q = "4k";
  else {
    const m = last.match(/^(144|240|360|720|1080|1440)p?$/i);
    if (m) q = m[1];
  }
  if (q) {
    parts.pop();
    return { query: parts.join(" ").trim(), quality: q };
  }
  return { query: t, quality: "" };
}

async function downloadToFile(url, filePath) {
  const headers = { "User-Agent": "Mozilla/5.0", Accept: "*/*" };
  if (url.includes(API_BASE)) headers["apikey"] = API_KEY;
  const res = await axios.get(url, { responseType: "stream", timeout: 180000, headers, maxRedirects: 5, validateStatus: () => true });
  if (res.status >= 400) throw new Error(`HTTP_${res.status}`);
  await streamPipe(res.data, fs.createWriteStream(filePath));
  return filePath;
}

async function callYoutubeResolve(videoUrl, { type, quality, format }) {
  const endpoint = `${API_BASE}/youtube/resolve`;
  const body = type === "video" ? { url: videoUrl, type: "video", quality: quality || DEFAULT_VIDEO_QUALITY } : { url: videoUrl, type: "audio", format: format || DEFAULT_AUDIO_FORMAT };
  const r = await axios.post(endpoint, body, { timeout: 120000, headers: { "Content-Type": "application/json", apikey: API_KEY }, validateStatus: () => true });
  const data = r.data;
  const result = data.result || data.data || data;
  let dl = result?.media?.dl_download || "";
  if (dl && dl.startsWith("/")) dl = API_BASE + dl;
  return { title: result.title, thumbnail: result.thumbnail, dl_download: dl, direct: result?.media?.direct || "" };
}

module.exports = async (msg, { conn, text }) => {
  const { query, quality } = splitQueryAndQuality(text);
  if (!query) return conn.sendMessage(msg.key.remoteJid, { text: `┼ escribe algo . . .\n| uso : .play2 <tema> [calidad]` }, { quoted: msg });

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "⏳", key: msg.key } });

  const res = await yts(query);
  const video = res.videos?.[0];
  if (!video) return conn.sendMessage(msg.key.remoteJid, { text: `┼ no encontré nada .` }, { quoted: msg });

  const { url: videoUrl, title, timestamp: duration, views, author, thumbnail } = video;
  const chosenQuality = VALID_QUALITIES.has(quality) ? quality : DEFAULT_VIDEO_QUALITY;

  const caption = `
╭─── « peep.play » ───♱
│
│ track : ${title.toLowerCase()}
│ length : [ ${duration} ]
│ views : [ ${(views || 0).toLocaleString()} ]
│ by : ${author?.name?.toLowerCase() || "unknown"}
│
│ ┼ quality : ${chosenQuality === "4k" ? "4K" : `${chosenQuality}p`}
│
│ 1 . audio (mp3)
│ 2 . video (mp4)
│ 3 . video doc
│ 4 . audio doc
│
╰───────────────♱
| responde con el número o reacciona .
`.trim();

  const preview = await conn.sendMessage(msg.key.remoteJid, { image: { url: thumbnail }, caption }, { quoted: msg });
  pending[preview.key.id] = { chatId: msg.key.remoteJid, videoUrl, title, thumbnail, commandMsg: msg, videoQuality: chosenQuality };

  await conn.sendMessage(msg.key.remoteJid, { react: { text: "♱", key: msg.key } });

  if (!conn._playproListener) {
    conn._playproListener = true;
    conn.ev.on("messages.upsert", async (ev) => {
      for (const m of ev.messages) {
        if (m.message?.reactionMessage) {
          const { key: reactKey, text: emoji } = m.message.reactionMessage;
          const job = pending[reactKey.id];
          if (job) await handleDownload(conn, job, emoji, job.commandMsg);
        }
        try {
          const context = m.message?.extendedTextMessage?.contextInfo;
          const citado = context?.stanzaId;
          const texto = String(m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim().toLowerCase();
          const job = pending[citado];
          if (citado && job) {
            const qFromReply = extractQualityFromText(texto);
            if (["1", "audio", "4", "audiodoc"].includes(texto.split(/\s+/)[0])) {
              const docMode = texto.startsWith("4") || texto.includes("audiodoc");
              await conn.sendMessage(m.key.remoteJid, { text: `| preparando track . . .` }, { quoted: m });
              await downloadAudio(conn, job, docMode, m);
            }
            else if (["2", "video", "3", "videodoc"].includes(texto.split(/\s+/)[0])) {
              const docMode = texto.startsWith("3") || texto.includes("videodoc");
              const useQuality = VALID_QUALITIES.has(qFromReply) ? qFromReply : (job.videoQuality || DEFAULT_VIDEO_QUALITY);
              await conn.sendMessage(m.key.remoteJid, { text: `| preparando video [ ${useQuality}p ] . . .` }, { quoted: m });
              await downloadVideo(conn, { ...job, videoQuality: useQuality }, docMode, m);
            }
          }
        } catch (e) {}
      }
    });
  }
};

async function handleDownload(conn, job, choice, quoted) {
  const mapping = { "👍": "audio", "❤️": "video", "📄": "audioDoc", "📁": "videoDoc" };
  const key = mapping[choice];
  if (!key) return;
  const isDoc = key.endsWith("Doc");
  if (key.startsWith("audio")) return downloadAudio(conn, job, isDoc, quoted || job.commandMsg);
  return downloadVideo(conn, job, isDoc, quoted || job.commandMsg);
}

async function downloadAudio(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  try {
    const resolved = await callYoutubeResolve(videoUrl, { type: "audio", format: DEFAULT_AUDIO_FORMAT });
    const mediaUrl = resolved.dl_download || resolved.direct;
    if (!mediaUrl) return conn.sendMessage(chatId, { text: "┼ error en descarga de audio ." }, { quoted });

    const tmp = ensureTmp();
    const base = safeName(title);
    const inFile = path.join(tmp, `${Date.now()}_in.bin`);
    await downloadToFile(mediaUrl, inFile);

    const outMp3 = path.join(tmp, `${Date.now()}_${base}.mp3`);
    let outFile = outMp3;
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inFile).audioCodec("libmp3lame").audioBitrate("128k").format("mp3").save(outMp3).on("end", resolve).on("error", reject);
      });
      fs.unlinkSync(inFile);
    } catch { outFile = inFile; asDocument = true; }

    if (fileSizeMB(outFile) > MAX_MB) return conn.sendMessage(chatId, { text: "┼ demasiado pesado ." }, { quoted });

    const aestheticCaption = `♱ track : ${title.toLowerCase()}\n| cortana 2.0`;
    await conn.sendMessage(chatId, { [asDocument ? "document" : "audio"]: fs.readFileSync(outFile), mimetype: "audio/mpeg", fileName: `${base}.mp3`, caption: asDocument ? aestheticCaption : undefined }, { quoted });
    fs.unlinkSync(outFile);
  } catch (e) { conn.sendMessage(chatId, { text: `┼ error : ${e.message}` }, { quoted }); }
}

async function downloadVideo(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  const q = VALID_QUALITIES.has(job.videoQuality) ? job.videoQuality : DEFAULT_VIDEO_QUALITY;
  try {
    const resolved = await callYoutubeResolve(videoUrl, { type: "video", quality: q });
    const mediaUrl = resolved.dl_download || resolved.direct;
    if (!mediaUrl) return conn.sendMessage(chatId, { text: "┼ error en descarga de video ." }, { quoted });

    const tmp = ensureTmp();
    const base = safeName(title);
    const tag = q === "4k" ? "4k" : `${q}p`;
    const file = path.join(tmp, `${Date.now()}_${base}_${tag}.mp4`);
    await downloadToFile(mediaUrl, file);

    if (fileSizeMB(file) > MAX_MB) return conn.sendMessage(chatId, { text: "┼ demasiado pesado ." }, { quoted });

    const finalCaption = `╭─── « peep.clip » ───♱\n│\n│ video : ${title.toLowerCase()}\n│ quality : ${tag}\n│\n╰───────────────♱\n| cortana 2.0 bot`;

    await conn.sendMessage(chatId, { [asDocument ? "document" : "video"]: fs.readFileSync(file), mimetype: "video/mp4", fileName: `${base}_${tag}.mp4`, caption: finalCaption }, { quoted });
    fs.unlinkSync(file);
  } catch (e) { conn.sendMessage(chatId, { text: `┼ error : ${e.message}` }, { quoted }); }
}

module.exports.command = ["play2"];