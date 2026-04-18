const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const handler = async (msg, { conn, text, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!target) {
        return conn.sendMessage(chatId, { text: `✦ a quién quieres hacer sufrir ? menciona a tu víctima .\n\nusa : ${usedPrefix}${command} @usuario` }, { quoted: msg });
    }

    if (target === sender) {
        return conn.sendMessage(chatId, { text: `✦ no te hagas daño a ti mismo , ya das suficiente pena . i'm the bad guy , no tú .` }, { quoted: msg });
    }

    let endpoint = "";
    let verbo = "";
    let fraseFinal = "";

    switch (command) {
        // ── VIOLENCIA ──
        case 'kill':
        case 'matar':
            endpoint = "kill";
            verbo = "mandó al infierno a";
            fraseFinal = "bury a friend . estás muerto";
            break;
        case 'slap':
        case 'pegar':
            endpoint = "slap";
            verbo = "abofeteó sin piedad a";
            fraseFinal = "you should see me in a crown";
            break;
        case 'patear': // ⟡ ELIMINADO 'kick' DE AQUÍ ⟡
            endpoint = "kick";
            verbo = "pateó la cara de";
            fraseFinal = "no estorbes en mi camino";
            break;
        case 'bonk':
        case 'zape':
            endpoint = "bonk";
            verbo = "le rompió la cabeza a";
            fraseFinal = "despierta de tu pesadilla";
            break;
        case 'yeet':
        case 'lanzar':
            endpoint = "yeet";
            verbo = "tiró a la basura a";
            fraseFinal = "caída libre al abismo";
            break;
        case 'bite':
        case 'morder':
            endpoint = "bite";
            verbo = "mordió con veneno a";
            fraseFinal = "cuidado con mis dientes";
            break;
            
        // ── MOLESTAR ──
        case 'bully':
        case 'acosar':
            endpoint = "bully";
            verbo = "arruinó la paz de";
            fraseFinal = "qué divertido es verte sufrir";
            break;
        case 'poke':
        case 'picar':
            endpoint = "poke";
            verbo = "fastidió la existencia de";
            fraseFinal = "deja de respirar tan fuerte";
            break;

        // ── AMOR Y ASCO ──
        case 'hug':
        case 'abrazar':
            endpoint = "hug";
            verbo = "abrazó a";
            fraseFinal = "qué asco , me dan náuseas";
            break;
        case 'kiss':
        case 'besar':
            endpoint = "kiss";
            verbo = "besó a";
            fraseFinal = "i love you , but i'm not in love with you";
            break;
        case 'pat':
        case 'acariciar':
            endpoint = "pat";
            verbo = "acarició a";
            fraseFinal = "buen perrito . ahora lárgate";
            break;
        case 'cuddle':
        case 'acurrucar':
            endpoint = "cuddle";
            verbo = "se acurrucó con";
            fraseFinal = "birds of a feather... par de idiotas";
            break;
        case 'lick':
        case 'lamer':
            endpoint = "lick";
            verbo = "lamió a";
            fraseFinal = "qué asquerosidad . me voy a vomitar";
            break;
        case 'highfive':
        case 'chocar':
            endpoint = "highfive";
            verbo = "chocó los cinco con";
            fraseFinal = "festejando mediocridad";
            break;
    }

    try {
        await conn.sendMessage(chatId, { react: { text: "✦", key: msg.key } });

        const res = await axios.get(`https://api.waifu.pics/sfw/${endpoint}`);
        const gifUrl = res.data.url;

        const mensaje = `╭━━━━ ⟡ 𝐚𝐜𝐭𝐢𝐨𝐧𝐬 ⟡ ━━━━\n┃\n┃ ✦ @${sender.split("@")[0]} ${verbo}\n┃ ↳ @${target.split("@")[0]}\n┃\n┃ ˗ˏˋ ${fraseFinal} ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

        const tmpDir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const tempGif = path.join(tmpDir, `${Date.now()}.gif`);
        const tempMp4 = path.join(tmpDir, `${Date.now()}.mp4`);

        const writer = fs.createWriteStream(tempGif);
        const response = await axios({ url: gifUrl, method: 'GET', responseType: 'stream' });
        response.data.pipe(writer);

        writer.on('finish', () => {
            exec(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`, async (err) => {
                if (!err) {
                    await conn.sendMessage(chatId, { video: fs.readFileSync(tempMp4), caption: mensaje, gifPlayback: true, mentions: [sender, target] }, { quoted: msg });
                } else {
                    await conn.sendMessage(chatId, { image: { url: gifUrl }, caption: mensaje, mentions: [sender, target] }, { quoted: msg });
                }
                if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
                if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);
            });
        });

    } catch (error) {
        console.error("Error en la API:", error);
        conn.sendMessage(chatId, { text: "✦ la conexión al abismo falló . inténtalo más tarde ." }, { quoted: msg });
    }
};

// ⟡ ELIMINADO 'kick' DE LA LISTA DE COMANDOS ⟡
handler.command = [
    'kill', 'matar', 'slap', 'pegar', 'patear', 
    'bonk', 'zape', 'yeet', 'lanzar', 'bite', 'morder', 
    'bully', 'acosar', 'poke', 'picar', 'hug', 'abrazar', 
    'kiss', 'besar', 'pat', 'acariciar', 'cuddle', 'acurrucar', 
    'lick', 'lamer', 'highfive', 'chocar'
];
module.exports = handler;