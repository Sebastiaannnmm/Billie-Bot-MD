const axios = require('axios');
const fs = require('fs');

const handler = async (msg, { conn, command }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // ── « BLOQUEO NSFW (VERIFICA SI ESTÁ ACTIVO EN EL GRUPO) » ──
  const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
  if (!activos.nsfw?.[chatId]) {
    return conn.sendMessage(chatId, { text: "✦ la pureza reina aquí . dile a un admin que active el modo nsfw ( .nsfw on ) si quieren ensuciarlo ." }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "✦", key: msg.key } });

  let imageUrl = "";
  let caption = "✦ ten tu basura . no me toques .";

  const fetchWaifuAPI = async (type) => {
    try {
      const res = await axios.get(`https://api.waifu.pics/nsfw/${type}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' },
        timeout: 5000 
      });
      return res.data.url;
    } catch (e) {
      return null;
    }
  };

  switch (command) {
    case 'pack':
      const packs = [
        'https://telegra.ph/file/c0da7289bee2d97048feb.jpg', 
        'https://telegra.ph/file/b8564166f9cac4d843db3.jpg', 
        'https://telegra.ph/file/6e1a6dcf1c91bf62d3945.jpg',
        'https://telegra.ph/file/0224c1ecf6b676dda3ac0.jpg'
      ];
      imageUrl = packs[Math.floor(Math.random() * packs.length)];
      caption = "✦ ojalá esto llene tu vacío .";
      break;

    case 'hentai':
    case 'waifu':
      imageUrl = await fetchWaifuAPI('waifu');
      if (!imageUrl) imageUrl = 'https://telegra.ph/file/b71b8f04772f1b30355f1.jpg';
      caption = "✦ das pena . búscate a alguien de verdad .";
      break;

    case 'neko':
      imageUrl = await fetchWaifuAPI('neko');
      if (!imageUrl) imageUrl = 'https://telegra.ph/file/b71b8f04772f1b30355f1.jpg';
      caption = "✦ asqueroso .";
      break;

    case 'bj':
    case 'blowjob':
      imageUrl = await fetchWaifuAPI('blowjob');
      if (!imageUrl) imageUrl = 'https://telegra.ph/file/c0da7289bee2d97048feb.jpg';
      caption = "✦ pudriéndote la mente poco a poco .";
      break;
      
    case 'trapito':
      imageUrl = await fetchWaifuAPI('trap');
      if (!imageUrl) imageUrl = 'https://telegra.ph/file/e4a1419385ceec7ad46ec.jpg';
      caption = "✦ enfermo .";
      break;
  }

  if (imageUrl) {
    try {
      await conn.sendMessage(chatId, { 
        image: { url: imageUrl }, 
        caption: caption.toLowerCase(),
      }, { quoted: msg });
    } catch (e) {
      await conn.sendMessage(chatId, { text: "✦ la imagen no cargó . el universo te está haciendo un favor ." }, { quoted: msg });
    }
  }
};

handler.command = ['pack', 'hentai', 'waifu', 'neko', 'bj', 'blowjob', 'trapito'];
module.exports = handler;