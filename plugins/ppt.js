const fs = require('fs');

const handler = async (msg, { conn, args, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
    if (!activos.juegos?.[chatId]) return conn.sendMessage(chatId, { text: "✦ los juegos están apagados . no estoy para jueguitos ahora ." }, { quoted: msg });

    if (!args[0] || !['piedra', 'papel', 'tijera'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, { text: `✦ a ver si puedes ganarme .\n\nusa : ${usedPrefix}${command} piedra / papel / tijera` }, { quoted: msg });
    }

    const opciones = ['piedra', 'papel', 'tijera'];
    const botElige = opciones[Math.floor(Math.random() * opciones.length)];
    const userElige = args[0].toLowerCase();

    let resultado = "";
    let frase = "";

    if (userElige === botElige) {
        resultado = "empate";
        frase = "estamos iguales ... qué aburrido .";
    } else if (
        (userElige === 'piedra' && botElige === 'tijera') ||
        (userElige === 'papel' && botElige === 'piedra') ||
        (userElige === 'tijera' && botElige === 'papel')
    ) {
        resultado = "ganaste";
        frase = "bien hecho . tuviste suerte esta vez .";
    } else {
        resultado = "perdiste";
        frase = "te aplasté . era obvio que ibas a perder .";
    }

    const mensaje = `╭━━━━ ⟡ 𝐩 𝐩 𝐭 ⟡ ━━━━\n┃\n┃ ✦ @${sender.split("@")[0]} eligió : ${userElige}\n┃ ✦ bot eligió : ${botElige}\n┃\n┃ ⎔ 𝐫𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨 : ${resultado}\n┃ ↳ ${frase}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

    await conn.sendMessage(chatId, { text: mensaje, mentions: [sender] }, { quoted: msg });
};

handler.command = ['ppt', 'jugar'];
module.exports = handler;