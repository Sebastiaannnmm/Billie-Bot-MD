const fs = require('fs');

const handler = async (msg, { conn, text, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    
    const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
    if (!activos.juegos?.[chatId]) return conn.sendMessage(chatId, { text: "✦ los juegos están apagados . no estoy para jueguitos ahora ." }, { quoted: msg });

    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text;

    if (!target) {
        return conn.sendMessage(chatId, { text: `✦ ¿con quién quieres medir tu compatibilidad ? menciona a alguien .\n\nusa : ${usedPrefix}${command} @usuario` }, { quoted: msg });
    }

    const porcentaje = Math.floor(Math.random() * 101);
    let frase = "";

    if (porcentaje >= 90) frase = "almas gemelas . hasta dan un poco de asco de lo tiernos que son 💙";
    else if (porcentaje >= 70) frase = "hay chispa . podrían aguantarse un buen rato .";
    else if (porcentaje >= 50) frase = "mitad y mitad . ni fu ni fa .";
    else if (porcentaje >= 20) frase = "mejor de lejitos . van a terminar odiándose mutuamente .";
    else frase = "huye . esa persona te va a arruinar la vida 💔 .";

    const mensaje = `╭━━━━ ⟡ 𝐥𝐨𝐯𝐞 𝐦𝐞𝐭𝐞𝐫 ⟡ ━━━━\n┃\n┃ ✦ 𝐜𝐨𝐧𝐞𝐱𝐢𝐨𝐧 :\n┃ ↳ @${sender.split("@")[0]} + ${text}\n┃\n┃ ⎔ 𝐩𝐨𝐫𝐜𝐞𝐧𝐭𝐚𝐣𝐞 : ${porcentaje}%\n┃ ↳ ${frase}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ? [sender, target] : [sender];

    await conn.sendMessage(chatId, { text: mensaje, mentions: mentions }, { quoted: msg });
};

handler.command = ['amor', 'love', 'ship'];
module.exports = handler;