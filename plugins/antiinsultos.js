const fs = require("fs");

async function handler(msg, { conn, args }) {
    const chatId = msg.key.remoteJid;
    if (!chatId.endsWith("@g.us")) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    let isAdmin = false;
    try {
        const metadata = await conn.groupMetadata(chatId);
        const participant = metadata.participants.find((p) => p.id === sender);
        isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        const senderClean = sender.replace(/[^0-9]/g, "");
        if (global.owner && global.owner.some(([id]) => id === senderClean)) isAdmin = true;
    } catch (e) {}

    const activosPath = "./activos.json";
    let activos = fs.existsSync(activosPath) ? JSON.parse(fs.readFileSync(activosPath, "utf-8")) : {};
    if (!activos.antiinsultos) activos.antiinsultos = {};

    const sub = (args[0] || "").toLowerCase();

    if (!sub) {
        const st = activos.antiinsultos[chatId] ? "on" : "off";
        return conn.sendMessage(chatId, {
            text: `♱ peep.mod ♱\n| status : [ ${st} ]\n|\n| > .antiinsultos on\n| > .antiinsultos off\n|\n| ★ 3 = x_x`
        }, { quoted: msg });
    }

    if (!isAdmin) return;

    if (sub === "on") {
        activos.antiinsultos[chatId] = true;
        fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));
        return conn.sendMessage(chatId, { text: `[ ♱ ] peep.mod : on .` }, { quoted: msg });
    }

    if (sub === "off") {
        activos.antiinsultos[chatId] = false;
        fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));
        return conn.sendMessage(chatId, { text: `[ ♱ ] peep.mod : off .` }, { quoted: msg });
    }
}

handler.command = ["antiinsultos", "antitoxico", "peepmod"];
module.exports = handler;