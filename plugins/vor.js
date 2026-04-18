const fs = require('fs');

const handler = async (msg, { conn, args, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
    if (!activos.juegos?.[chatId]) return conn.sendMessage(chatId, { text: "✦ los juegos están apagados . no estoy para jueguitos ahora ." }, { quoted: msg });

    if (!args[0] || !['verdad', 'reto'].includes(args[0].toLowerCase())) {
        return conn.sendMessage(chatId, { text: `✦ vamos a jugar , pero no llores si sale algo que no te gusta .\n\nescribe : ${usedPrefix}${command} verdad\no escribe : ${usedPrefix}${command} reto` }, { quoted: msg });
    }

    const verdades = [
        "¿alguna vez has fingido que te cae bien alguien de este grupo?",
        "confiesa : ¿cuál es el mensaje más vergonzoso que has enviado por error?",
        "¿alguna vez te enamostaste de alguien que te trató como basura?",
        "si pudieras borrar a una persona de tu vida con un botón, ¿quién sería?",
        "¿cuál es tu mayor inseguridad que intentas ocultar?",
        "¿has revisado el celular de otra persona a escondidas?",
        "del 1 al 10 , ¿qué tan atractiva te parece la última persona que escribió en este chat?"
    ];

    const retos = [
        "envía una nota de voz cantando la canción más infantil y vergonzosa que te sepas .",
        "pon de estado de whatsapp 'soy un payaso y necesito atención' y déjalo 1 hora .",
        "envíale un mensaje a tu crush diciendo 'me gustas, pero soy demasiado cobarde' .",
        "manda la última foto de tu galería a este chat , sin dar contexto .",
        "menciona a alguien del grupo y dile un halago sarcástico .",
        "tienes prohibido usar vocales en tus próximos 3 mensajes .",
        "envía el emoji del payaso 🤡 a la última persona con la que hablaste en privado ."
    ];

    const eleccion = args[0].toLowerCase() === 'verdad' ? verdades : retos;
    const random = eleccion[Math.floor(Math.random() * eleccion.length)];

    const respuesta = `╭━━━━ ⟡ 𝐯𝐞𝐫𝐝𝐚𝐝 𝐨 𝐫𝐞𝐭𝐨 ⟡ ━━━━\n┃\n┃ ✦ 𝐣𝐮𝐠𝐚𝐝𝐨𝐫 : @${sender.split("@")[0]}\n┃ ✦ 𝐞𝐥𝐞𝐜𝐜𝐢𝐨𝐧 : ${args[0].toLowerCase()}\n┃\n┃ ⎔ ${random}\n┃\n┃ ˗ˏˋ cumple o lárgate ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

    await conn.sendMessage(chatId, { text: respuesta, mentions: [sender] }, { quoted: msg });
};

handler.command = ['vor', 'verdadoreto'];
module.exports = handler;