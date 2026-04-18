const fs = require('fs');

const handler = async (m, { conn }) => {
    const rpgFile = "./database/peep_rpg.json";
    const chatId = m.key.remoteJid;
    
    // Verificar si existe la base de datos
    if (!fs.existsSync(rpgFile)) {
        return conn.sendMessage(chatId, { text: "┼ nadie ha empezado el viaje todavía ." }, { quoted: m });
    }

    const rpgData = JSON.parse(fs.readFileSync(rpgFile, "utf-8"));

    // Verificar si hay datos en este grupo
    if (!rpgData[chatId]) {
        return conn.sendMessage(chatId, { text: "┼ este grupo aún está sobrio . usa .rpg on para empezar ." }, { quoted: m });
    }

    // Extraer y ordenar usuarios por miligramos (mg)
    let usuarios = Object.entries(rpgData[chatId])
        .map(([jid, data]) => ({ jid, ...data }))
        .sort((a, b) => b.mg - a.mg)
        .slice(0, 10);

    let topMsg = `╭─── « 𝐭𝐨𝐩 . 𝐚𝐝𝐢𝐜𝐭𝐨𝐬 » ───♱\n│\n`;
    
    usuarios.forEach((user, i) => {
        let emoji = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "♱";
        topMsg += `│ ${emoji} ${i + 1}. @${user.jid.split('@')[0]}\n`;
        topMsg += `│    𝐝𝐨𝐬𝐢𝐬 : ${user.mg} 𝐦𝐠\n`;
        topMsg += `│    𝐯𝐢𝐚𝐣𝐞 : ${user.viaje} [ ${user.rango} ]\n│\n`;
    });

    topMsg += `╰───────────────♱\n┼ 𝐧𝐨 𝐬𝐞 𝐝𝐞𝐭𝐞𝐧𝐠𝐚𝐧 . . . 𝐞𝐥 𝐜𝐢𝐞𝐥𝐨 𝐞𝐬 𝐫𝐨𝐬𝐚 .`.toLowerCase();

    // Enviar el mensaje con menciones
    await conn.sendMessage(chatId, { 
        text: topMsg, 
        mentions: usuarios.map(u => u.jid) 
    }, { quoted: m });
};

handler.command = ['top', 'leaderboard', 'mejores', 'adictos'];

module.exports = handler;