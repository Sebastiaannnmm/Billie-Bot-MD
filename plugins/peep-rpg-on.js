const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) return;

  // Verificar permisos con estilo
  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";
  const isOwner = global.owner.some(([id]) => id === senderClean);

  if (!isAdmin && !isOwner) {
    await conn.sendMessage(chatId, { text: "┼ no eres admin . no me des órdenes ." }, { quoted: msg });
    return;
  }

  // Si no pone on/off, mostrar error aesthetic
  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, { 
      text: `𓊈 ♱ 𝐩𝐞𝐞𝐩 . 𝐜𝐨𝐧𝐟𝐢𝐠 ♱ 𓊉\n\n ❛ 𝐮𝐬𝐚 : .𝐫𝐩𝐠 𝐨𝐧/𝐨𝐟𝐟\n ❛ 𝐧𝐨 𝐦𝐞 𝐡𝐚𝐠𝐚𝐬 𝐩𝐞𝐫𝐝𝐞𝐫 𝐞𝐥 𝐭𝐢𝐞𝐦𝐩𝐨 .` 
    }, { quoted: msg });
    return;
  }

  const activosPath = "./activos.json";
  let activos = fs.existsSync(activosPath) ? JSON.parse(fs.readFileSync(activosPath, "utf-8")) : {};

  // Asegurar que la propiedad sea 'rpg' para que los plugins la reconozcan
  if (!activos.rpg) activos.rpg = {};

  if (args[0].toLowerCase() === "on") {
    activos.rpg[chatId] = true;
    await conn.sendMessage(chatId, {
      text: `╭─── « 𝐫𝐩𝐠 . 𝐨𝐧 » ───♱\n│\n│ ┼ 𝐞𝐬𝐭𝐚𝐝𝐨 : 𝐚𝐜𝐭𝐢𝐯𝐚𝐝𝐨 .\n│ ┼ 𝐦𝐬𝐠 : 𝐞𝐥 𝐣𝐮𝐞𝐠𝐨 𝐜𝐨𝐦𝐢𝐞𝐧𝐳𝐚 , 𝐩𝐞𝐫𝐨 𝐭𝐨𝐝𝐨𝐬 𝐩𝐢𝐞𝐫𝐝𝐞𝐧 .\n│\n╰───────────────♱`,
    }, { quoted: msg });
  } else {
    delete activos.rpg[chatId];
    await conn.sendMessage(chatId, {
      text: `╭─── « 𝐫𝐩𝐠 . 𝐨𝐟𝐟 » ───♱\n│\n│ ┼ 𝐞𝐬𝐭𝐚𝐝𝐨 : 𝐝𝐞𝐬𝐚𝐜𝐭𝐢𝐯𝐚𝐝𝐨 .\n│ ┼ 𝐦𝐬𝐠 : 𝐬𝐢𝐥𝐞𝐧𝐜𝐢𝐨 𝐭𝐨𝐭𝐚𝐥 .\n│\n╰───────────────♱`,
    }, { quoted: msg });
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  // Reacción gótica
  await conn.sendMessage(chatId, { react: { text: "♱", key: msg.key } });
};

handler.command = ["rpg", "rpgon", "rpgcortana"]; // Mantenemos rpgcortana por si acaso, pero usa .rpg on
module.exports = handler;