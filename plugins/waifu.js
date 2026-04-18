const axios = require('axios');

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // reacción de "estoy viendo doble"
  await conn.sendMessage(chatId, {
    react: { text: '🌀', key: msg.key }
  });

  try {
    // llamada a la api
    const res = await axios.get('https://api.waifu.pics/sfw/waifu');
    const imageUrl = res.data.url;

    // diseño alineado a la izquierda para que no se desordene en el cel
    const captionText = `♱ ── « 𓆩 𝐰𝐚𝐢𝐟𝐮 . ¿𝐫𝐞𝐚𝐥? 𓆪 » ── ♱

  𓏲 ¿𝐞𝐬𝐭𝐚́ 𝐚𝐡𝐢́ 𝐨 𝐬𝐨𝐥𝐨 𝐞𝐬 𝐦𝐢 𝐢𝐦𝐚𝐠𝐢𝐧𝐚𝐜𝐢𝐨́𝐧?
  𓏲 𝐭𝐨𝐦𝐚 𝐭𝐮 . . . 𝐜𝐡𝐢𝐜𝐚 𝟐𝐝 𝐲 𝐝𝐞́𝐣𝐚𝐦𝐞 𝐯𝐨𝐥𝐚𝐫 .
  𓏲 𝐬𝐢𝐞𝐧𝐭𝐨 𝐪𝐮𝐞 𝐥𝐚𝐬 𝐩𝐚𝐫𝐞𝐝𝐞𝐬 𝐬𝐞 𝐝𝐢𝐫𝐞𝐭𝐢𝐞𝐧 . . .

  🕯️ ────────────── 🕯️
  | 𝐢'𝐦 𝐣𝐮𝐬𝐭 𝐚 𝐠𝐡𝐨𝐬𝐭 |`.toLowerCase();

    // enviar la imagen con el diseño estético
    await conn.sendMessage(chatId, {
      image: { url: imageUrl },
      caption: captionText
    }, { quoted: msg });

  } catch (err) {
    console.error('error en waifu trip:', err);
    await conn.sendMessage(chatId, {
      text: `┼ 𝐧𝐨 𝐡𝐚𝐲 𝐰𝐚𝐢𝐟𝐮 . . . 𝐬𝐨𝐥𝐨 𝐡𝐚𝐲 𝐥𝐮𝐜𝐞𝐬 𝐪𝐮𝐞 𝐦𝐞 𝐝𝐮𝐞𝐥𝐞𝐧 . . .`
    }, { quoted: msg });
  }
};

handler.command = ['waifu'];
handler.tags = ['sfw'];
handler.help = ['waifu'];

module.exports = handler;