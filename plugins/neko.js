const axios = require('axios');

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // reacción de "no entiendo nada"
  await conn.sendMessage(chatId, {
    react: { text: '🌀', key: msg.key }
  });

  try {
    const res = await axios.get('https://api.waifu.pics/sfw/neko');
    const imageUrl = res.data.url;

    // diseño alineado a la izquierda (el más estable para fotos)
    const captionText = `♱ ── « 𓆩 𝐧𝐞𝐤𝐨 . ¿𝐠𝐚𝐭𝐨? 𓆪 » ── ♱

  𓏲 ¿𝐞𝐬𝐨 𝐞𝐬 𝐮𝐧 𝐠𝐚𝐭𝐨 𝐨 𝐞𝐬 𝐞𝐥 𝐜𝐢𝐞𝐥𝐨 𝐫𝐨𝐬𝐚?
  𓏲 𝐭𝐨𝐦𝐚 𝐭𝐮 . . . ¿𝐜𝐨𝐬𝐚? 𝐲 𝐧𝐨 𝐦𝐞 𝐦𝐢𝐫𝐞𝐬 𝐚𝐬𝐢́ .
  𓏲 𝐬𝐢𝐞𝐧𝐭𝐨 𝐪𝐮𝐞 𝐥𝐚 𝐢𝐦𝐚𝐠𝐞𝐧 𝐦𝐞 𝐞𝐬𝐭𝐚́ 𝐡𝐚𝐛𝐥𝐚𝐧𝐝𝐨 . . .

  🕯️ ────────────── 🕯️
  | ¿𝐪𝐮𝐢𝐞́𝐧 𝐬𝐨𝐲 𝐲𝐨? |`.toLowerCase();

    await conn.sendMessage(chatId, {
      image: { url: imageUrl },
      caption: captionText
    }, { quoted: msg });

  } catch (err) {
    console.error('error en neko trip:', err);
    await conn.sendMessage(chatId, {
      text: `┼ 𝐥𝐚𝐬 𝐥𝐮𝐜𝐞𝐬 𝐬𝐞 𝐦𝐮𝐞𝐯𝐞𝐧 𝐦𝐮𝐜𝐡𝐨 . . . 𝐧𝐨 𝐡𝐚𝐲 𝐠𝐚𝐭𝐨 , 𝐬𝐨𝐥𝐨 𝐯𝐚𝐜𝐢́𝐨 .`
    }, { quoted: msg });
  }
};

handler.command = ['neko'];
handler.tags = ['sfw'];
handler.help = ['neko'];

module.exports = handler;