const fs = require('fs');

const handler = async (msg, { conn, text, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;

    const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
    if (!activos.juegos?.[chatId]) return conn.sendMessage(chatId, { text: "✦ los juegos están apagados . no estoy para jueguitos ahora ." }, { quoted: msg });

    if (!text) {
        return conn.sendMessage(chatId, { text: `✦ hazme una pregunta de sí o no . y no seas aburrido .\n\nejemplo: ${usedPrefix}${command} ¿voy a pasar el examen?` }, { quoted: msg });
    }

    const respuestas = [
        "obvio que sí . no preguntes tonterías .",
        "ni de broma . supera eso .",
        "tal vez ... déjame dormir y te digo .",
        "sí , pero te va a costar caro .",
        "definitivamente no . qué pena por ti .",
        "el futuro es un misterio ... y la verdad , no me importa .",
        "no quiero responder eso . me da pereza .",
        "claro que sí , disfruta mientras dure .",
        "todo apunta a que vas a fracasar . lo siento .",
        "es muy probable . no lo arruines ."
    ];

    const random = respuestas[Math.floor(Math.random() * respuestas.length)];

    await conn.sendMessage(chatId, { text: `✦ 𝐩𝐫𝐞𝐠𝐮𝐧𝐭𝐚 : ${text}\n✦ 𝐫𝐞𝐬𝐩𝐮𝐞𝐬𝐭𝐚 : ${random}` }, { quoted: msg });
};

handler.command = ['bola8', 'ask', 'pregunta'];
module.exports = handler;