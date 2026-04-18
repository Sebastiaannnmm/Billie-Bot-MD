const handler = async (msg, { conn, text }) => {
    const sender = msg.key.participant || msg.key.remoteJid;
    global.db = global.db || {};
    global.db.afk = global.db.afk || {};

    global.db.afk[sender] = {
        time: Date.now(),
        reason: text || 'simplemente no los soporta'
    };

    const mensaje = `╭━━━━ ⟡ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 ⟡ ━━━━
┃
┃ ✦ 𝐟𝐚𝐧𝐭𝐚𝐬𝐦𝐚 : @${sender.split("@")[0]}
┃ ✦ 𝐞𝐬𝐭𝐚𝐝𝐨 : desconectado
┃ ✦ 𝐦𝐨𝐭𝐢𝐯𝐨 : ${global.db.afk[sender].reason}
┃
┃ ˗ˏˋ no me busquen , me dan asco ˎˊ˗
╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
    
    await conn.sendMessage(msg.key.remoteJid, { text: mensaje, mentions: [sender] }, { quoted: msg });
};

handler.all = async function (m) {
    if (!m.message || m.key.fromMe) return;
    const sender = m.key.participant || m.key.remoteJid;
    global.db = global.db || {};
    global.db.afk = global.db.afk || {};

    // ── REGRESO DEL AFK ──
    if (global.db.afk[sender]) {
        const tiempo = Math.floor((Date.now() - global.db.afk[sender].time) / 1000);
        const h = Math.floor(tiempo / 3600);
        const m_ = Math.floor((tiempo % 3600) / 60);
        const s = tiempo % 60;
        const transcurrido = `${h > 0 ? h + 'h ' : ''}${m_ > 0 ? m_ + 'm ' : ''}${s}s`;

        const regreso = `╭━━━━ ⟡  despertar ⟡ ━━━━
┃
┃ ✦ @${sender.split("@")[0]} regresó .
┃ ✦ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 : duró ${transcurrido}
┃
┃ ↳ dejen de llorar , ya despertó .
╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();

        await this.sendMessage(m.key.remoteJid, { text: regreso, mentions: [sender] }, { quoted: m });
        delete global.db.afk[sender];
    }

    // ── DETECTAR MENCIONES A ALGUIEN AFK ──
    const jids = [...new Set([...(m.message.extendedTextMessage?.contextInfo?.mentionedJid || []), ...(m.message.conversation?.match(/@(\d+)/g) || []).map(v => v.replace('@', '') + '@s.whatsapp.net')])];
    
    for (let jid of jids) {
        if (global.db.afk[jid]) {
            const data = global.db.afk[jid];
            const frasesSarcasticas = [
                `✦ @${jid.split("@")[0]} no está . su vida es más interesante que este chat .`,
                `✦ ¿eres sordo ? @${jid.split("@")[0]} se fue por : ${data.reason} .`,
                `✦ deja de etiquetarlo , no le importas . está en : ${data.reason} .`,
                `✦ @${jid.split("@")[0]} está ignorando a idiotas como tú ahora mismo .`,
                `✦ no insistas , @${jid.split("@")[0]} prefirió irse a ${data.reason} antes que hablarte .`
            ];
            const randomMsg = frasesSarcasticas[Math.floor(Math.random() * frasesSarcasticas.length)];
            
            await this.sendMessage(m.key.remoteJid, { text: randomMsg.toLowerCase(), mentions: [jid] }, { quoted: m });
        }
    }
};

handler.command = ['afk', 'dormir'];
module.exports = handler;