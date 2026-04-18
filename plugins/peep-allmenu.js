const fs = require('fs');

const handler = async (msg, { conn, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  try {
    // Reacción fría con símbolo
    await conn.sendMessage(chatId, { react: { text: "✦", key: msg.key } });

    // Video de Billie configurado para reproducirse como GIF instantáneo
    const videoUrl = "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/43699e9ad80e317fba5b330c5f6d4f159a2fcf42/From%20KlickPin%20CF%20Billie%20Eilish%20Edits%20%F0%9F%92%9A%20_%20Billie%20eilish%20v%C3%ADdeos%20Billie%20Billie%20eilish.mp4";

    const header = `╭━━━━ ✦ 𝐛𝐢𝐥𝐥𝐢𝐞 . 𝐡𝐮𝐛 ✦ ━━━━
┃
┃ ✦ 𝐮𝐬𝐮𝐚𝐫𝐢𝐨 : @${sender.split("@")[0]}
┃ ✦ 𝐞𝐬𝐭𝐚𝐝𝐨 : 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨
┃ ✦ 𝐩𝐫𝐞𝐟𝐢𝐣𝐨 : [ ${usedPrefix} ]
┃
┃ ✦ 𝐰𝐡𝐞𝐧 𝐰𝐞 𝐚𝐥𝐥 𝐟𝐚𝐥𝐥 𝐚𝐬𝐥𝐞𝐞𝐩 , 𝐰𝐡𝐞𝐫𝐞 𝐝𝐨 𝐰𝐞 𝐠𝐨 ?
┃ ✦ 𝐧𝐨 𝐦𝐞 𝐡𝐚𝐛𝐥𝐞𝐬 𝐬𝐢 𝐧𝐨 𝐞𝐬 𝐧𝐞𝐜𝐞𝐬𝐚𝐫𝐢𝐨 .
┃
┡━━━━ ✦ 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 ✦ ━━━━
┃
┌── [ 𝐠𝐫𝐨𝐮𝐩 . 𝐭𝐫𝐚𝐬𝐡 ]
│ ✦ ${usedPrefix}tag
│ ✦ ${usedPrefix}kick
│ ✦ ${usedPrefix}afk
│ ✦ ${usedPrefix}antilink on/off
│ ✦ ${usedPrefix}antiinsultos on/off
│ ✦ ${usedPrefix}rpg on/off
│ ✦ ${usedPrefix}nsfw on/off
│ ✦ ${usedPrefix}modoadmins on/off
│ ✦ ${usedPrefix}autochat on/off
│ ✦ ${usedPrefix}juegos on/off
└── ✦
┃
┌── [ 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 . 𝐬𝐡𝐢𝐭 ]
│ ✦ ${usedPrefix}play
│ ✦ ${usedPrefix}whatmusic
│ ✦ ${usedPrefix}tourl
│ ✦ ${usedPrefix}tovideo
└── ✦
┃
┌── [ 𝐩𝐞𝐬𝐚𝐝𝐢𝐥𝐥𝐚 . 𝐫𝐩𝐠 ]
│ ✦ ${usedPrefix}perfil
│ ✦ ${usedPrefix}balance
│ ✦ ${usedPrefix}daily
│ ✦ ${usedPrefix}work
│ ✦ ${usedPrefix}adventure
│ ✦ ${usedPrefix}mine
│ ✦ ${usedPrefix}robar
│ ✦ ${usedPrefix}pay
│ ✦ ${usedPrefix}top
└── ✦
┃
┌── [ 𝐥𝐨𝐬𝐢𝐧𝐠 . 𝐠𝐚𝐦𝐞𝐬 ]
│ ✦ ${usedPrefix}slot
│ ✦ ${usedPrefix}ruleta
│ ✦ ${usedPrefix}moneda
│ ✦ ${usedPrefix}ppt
│ ✦ ${usedPrefix}vor
│ ✦ ${usedPrefix}bola8
│ ✦ ${usedPrefix}amor
└── ✦
┃
┌── [ 𝐝𝐚𝐫𝐤 . 𝐧𝐬𝐟𝐰 ]
│ ✦ ${usedPrefix}pack
│ ✦ ${usedPrefix}waifu
│ ✦ ${usedPrefix}hentai
│ ✦ ${usedPrefix}neko
│ ✦ ${usedPrefix}bj
│ ✦ ${usedPrefix}trapito
└── ✦
┃
┌── [ 𝐮𝐬𝐞𝐥𝐞𝐬𝐬 . 𝐭𝐨𝐨𝐥𝐬 ]
│ ✦ ${usedPrefix}sticker
│ ✦ ${usedPrefix}di
│ ✦ ${usedPrefix}dalle
│ ✦ ${usedPrefix}menuaudio
└── ✦
┃
┌── [ 𝐨𝐰𝐧𝐞𝐫 . 𝐨𝐧𝐥𝐲 ]
│ ✦ ${usedPrefix}carga
│ ✦ ${usedPrefix}modoprivado
│ ✦ ${usedPrefix}linia
│ ✦ ${usedPrefix}git
└── ✦
┃
┃ ✦ 𝐢'𝐦 𝐭𝐡𝐞 𝐛𝐚𝐝 𝐠𝐮𝐲 .
╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

    // MENSAJE 1: VIDEO/GIF Y MENÚ OSCURO
    await conn.sendMessage(chatId, { 
      video: { url: videoUrl }, 
      caption: header, 
      gifPlayback: true,
      mentions: [sender] 
    }, { quoted: msg });

    // MENSAJE 2: INFO DEL CREADOR (BAN)
    const infoCreador = `╭━━━━ ✦ 𝐜𝐫𝐞𝐚𝐭𝐨𝐫 ✦ ━━━━
┃
┃ ✦ 𝐛𝐚𝐧
┃ ✦ 𝐢𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : 
┃ instagram.com/b4an_j
┃ ✦ 𝐰𝐡𝐚𝐭𝐬𝐚𝐩𝐩 : 
┃ +52 449 578 7323
┃
┃ ✦ 𝐠𝐞𝐭 𝐭𝐨 𝐤𝐧𝐨𝐰 𝐦𝐞 𝐛𝐞𝐟𝐨𝐫𝐞 𝐢'𝐦 𝐠𝐨𝐧𝐞 .
╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

    await conn.sendMessage(chatId, { text: infoCreador }, { quoted: msg });

  } catch (error) {
    console.error("error en el menu:", error);
  }
};

handler.command = ['menu', 'allmenu', 'help'];
module.exports = handler;