const handler = async (msg, { conn, usedPrefix }) => {
  const chatId = msg.key.remoteJid;

  try {
    // Reacción estética
    await conn.sendMessage(chatId, { react: { text: "♱", key: msg.key } });

    // Imagen de Peep para Free Fire
    const imgUrl = 'https://cdn.russellxz.click/8b0e4c2c.jpeg';

    // Texto sarcástico estilo Peep
    const texto = `╭─── « peep.fire » ───♱
│
│ hi : @${msg.key.participant ? msg.key.participant.split('@')[0] : 'user'}
│ status : losing game
│
│ ┼ "life is beautiful" ┼
│ ┼ play or die , i don't care ┼
│
╰───────────────♱

╭─── « battleground » ───♱
│
│ ♱ ${usedPrefix}mapas ( maps )
│ ♱ ${usedPrefix}reglas ( law )
│ ♱ ${usedPrefix}setreglas ( edit )
│
╰───────────────♱

╭─── « versus.list » ───♱
│
│ ♱ ${usedPrefix}4vs4
│ ♱ ${usedPrefix}6vs6
│ ♱ ${usedPrefix}12vs12
│ ♱ ${usedPrefix}16vs16
│ ♱ ${usedPrefix}20vs20
│ ♱ ${usedPrefix}24vs24
│ ♱ ${usedPrefix}guerr
│
╰───────────────♱
| lil peep bot | ♱`.toLowerCase();

    await conn.sendMessage(chatId, {
      image: { url: imgUrl },
      caption: texto,
      mentions: [msg.key.participant || msg.key.remoteJid]
    }, { quoted: msg });

  } catch (err) {
    console.error("error en menufree:", err);
  }
};

handler.command = ['menufree'];
module.exports = handler;