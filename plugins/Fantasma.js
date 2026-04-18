const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) return;

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";
  const isOwner = global.owner.some(([id]) => id === senderClean);
  const isFromMe = msg.key.fromMe;

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: `┼ no admin . ┼` }, { quoted: msg });
  }

  const conteoPath = path.resolve("./conteo.json");
  let conteoData = {};

  if (fs.existsSync(conteoPath)) {
    conteoData = JSON.parse(fs.readFileSync(conteoPath, "utf-8"));
  }

  const groupConteo = conteoData[chatId] || {};

  const fantasmas = metadata.participants.filter(p => {
    const id = p.id;
    // Filtrar: solo usuarios que no han enviado ni un mensaje
    return !groupConteo[id];
  });

  if (fantasmas.length === 0) {
    return conn.sendMessage(chatId, {
      text: `♱ peep.mod ♱\n| todos aquí parecen estar vivos .\n| no hay fantasmas por ahora .`
    }, { quoted: msg });
  }

  let texto = `╭─── « graveyard » ───♱\n`;
  texto += `│\n`;
  texto += `│ detectados : [ ${fantasmas.length} ] almas .\n`;
  texto += `│\n`;
  texto += `│ ┼ no hablan , no existen ┼\n`;
  texto += `│\n`;

  const menciones = [];
  for (const usuario of fantasmas) {
    const num = usuario.id.split("@")[0];
    texto += `│ • @${num}\n`;
    menciones.push(usuario.id);
  }

  texto += `│\n`;
  texto += `│ > usa .fankick si quieres purgarlos .\n`;
  texto += `│ > no me importa si son nuevos .\n`;
  texto += `│\n`;
  texto += `╰───────────────♱`;

  await conn.sendMessage(chatId, {
    text: texto,
    mentions: menciones
  }, { quoted: msg });
};

handler.command = ["fantasmas", "fantasma"];
module.exports = handler;