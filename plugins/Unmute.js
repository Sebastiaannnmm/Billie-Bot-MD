const fs = require("fs");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) return;

  // Verificar si es owner o admin
  const isOwner = global.isOwner ? global.isOwner(senderNum) : global.owner.some(([id]) => id === senderNum);
  const metadata = await conn.groupMetadata(chatId);
  const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
  const isAdmin = admins.includes(senderId);

  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, { text: `┼ no eres admin . no me quites el tiempo .` }, { quoted: msg });
  }

  // Detectar objetivo por respuesta o mención
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant || context?.mentionedJid?.[0];

  if (!target) {
    return conn.sendMessage(chatId, { 
      text: `♱ peep.mod ♱\n| responde a quien quieres dejar hablar .\n| hazlo rápido .` 
    }, { quoted: msg });
  }

  // Ruta sincronizada con el index y el mute
  const mutePath = "./database/peep_muted.json";
  const muteData = fs.existsSync(mutePath) ? JSON.parse(fs.readFileSync(mutePath)) : {};

  if (muteData[chatId] && muteData[chatId][target]) {
    // Eliminar del vacío
    delete muteData[chatId][target];
    
    // Si el grupo ya no tiene muteados, limpiamos el objeto del grupo
    if (Object.keys(muteData[chatId]).length === 0) delete muteData[chatId];
    
    fs.writeFileSync(mutePath, JSON.stringify(muteData, null, 2));

    await conn.sendMessage(chatId, {
      text: `╭─── « unghosted » ───♱\n│ usuario : @${target.split("@")[0]}\n│ estado : activo .\n│ acción : puedes hablar , pero no prometo escuchar .\n╰───────────────♱`,
      mentions: [target]
    }, { quoted: msg });
    
    await conn.sendMessage(chatId, { react: { text: "🔊", key: msg.key } });
  } else {
    await conn.sendMessage(chatId, {
      text: `♱ peep.mod ♱\n| @${target.split("@")[0]}\n| nunca estuvo silenciado .\n| qué pérdida de tiempo .`,
      mentions: [target]
    }, { quoted: msg });
  }
};

handler.command = ["unmute", "desmutear"];
module.exports = handler;