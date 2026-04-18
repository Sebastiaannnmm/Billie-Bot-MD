const fs = require("fs");
const path = require("path");

const handler = async (msg, { conn, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  // Verificar si es owner usando la función global que ya tienes
  const isOwner = global.isOwner ? global.isOwner(senderNum) : global.owner.some(([id]) => id === senderNum);

  if (!isGroup) return; 

  // Verificar admins
  const metadata = await conn.groupMetadata(chatId);
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
  const isAdmin = admins.includes(senderId);

  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, { text: `┼ no eres admin . no me des órdenes .` }, { quoted: msg });
  }

  // Detectar a quién mutear (por respuesta o por mención)
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!target) {
    return conn.sendMessage(chatId, { 
      text: `♱ peep.mod ♱\n| responde al mensaje de alguien o menciónalo .\n| no me hagas perder el tiempo .` 
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.isOwner && global.isOwner(targetNum)) {
    return conn.sendMessage(chatId, { text: `┼ intocable . no puedes mutear al owner ♱` }, { quoted: msg });
  }

  // Usar la ruta que configuramos en tu index.js
  const mutePath = "./database/peep_muted.json";
  if (!fs.existsSync("./database")) fs.mkdirSync("./database");
  
  const muteData = fs.existsSync(mutePath) ? JSON.parse(fs.readFileSync(mutePath)) : {};
  
  // Estructura: { "id_grupo": { "id_usuario": true } }
  if (!muteData[chatId]) muteData[chatId] = {};

  if (!muteData[chatId][target]) {
    muteData[chatId][target] = true;
    fs.writeFileSync(mutePath, JSON.stringify(muteData, null, 2));
    
    await conn.sendMessage(chatId, {
      text: `╭─── « ghosted » ───♱\n│ usuario : @${target.split("@")[0]}\n│ estado : muted .\n│ acción : silenciado . no me interesa oírte .\n╰───────────────♱`,
      mentions: [target]
    }, { quoted: msg });
    
    // Reacción de silencio
    await conn.sendMessage(chatId, { react: { text: "🤫", key: msg.key } });
  } else {
    await conn.sendMessage(chatId, {
      text: `♱ peep.mod ♱\n| @${target.split("@")[0]} ya está en el vacío .\n| ya lo silencié antes .`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["mute", "silenciar"];
module.exports = handler;