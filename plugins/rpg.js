const fs = require('fs');

const handler = async (msg, { conn, args, command, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const dbPath = './database/peep_rpg.json';

  let rpgData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf-8")) : {};
  if (!rpgData[chatId]) rpgData[chatId] = {};
  if (!rpgData[chatId][sender]) rpgData[chatId][sender] = { mg: 0, viaje: 0, rango: "ojos de océano", inventario: [], lagrimas: 0, cooldowns: {} };
  if (!rpgData[chatId][sender].cooldowns) rpgData[chatId][sender].cooldowns = {};

  const user = rpgData[chatId][sender];
  const now = Date.now();

  switch (command) {
    case 'balance':
    case 'bal':
      await conn.sendMessage(chatId, { text: `✦ @${sender.split('@')[0]} , tienes ${user.lagrimas} lágrimas negras .\n✦ qué miseria .` }, { quoted: msg });
      break;

    case 'daily':
      const cdDaily = 86400000;
      if (user.cooldowns.daily && now - user.cooldowns.daily < cdDaily) {
        let horas = Math.floor((cdDaily - (now - user.cooldowns.daily)) / 3600000);
        let minutos = Math.floor(((cdDaily - (now - user.cooldowns.daily)) % 3600000) / 60000);
        return conn.sendMessage(chatId, { text: `✦ no seas avaricioso . vuelve en ${horas} horas y ${minutos} minutos .` }, { quoted: msg });
      }
      user.lagrimas += 2000;
      user.cooldowns.daily = now;
      await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐝𝐚𝐢𝐥𝐲 ⟡ ━━━━\n┃ ✦ tomaste tus 2000 lágrimas diarias .\n┃ ✦ úsalas antes de que te mueras .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      break;

    case 'work':
      const cdWork = 3600000;
      if (user.cooldowns.work && now - user.cooldowns.work < cdWork) {
        let minutos = Math.ceil((cdWork - (now - user.cooldowns.work)) / 60000);
        return conn.sendMessage(chatId, { text: `✦ ya te explotaron suficiente . descansa ${minutos} minutos .` }, { quoted: msg });
      }
      const trabajos = ["vendiste tu alma", "lloraste en el escenario", "grabaste un disco deprimente", "enterraste a un amigo", "te rompiste un clavo", "caminaste bajo la lluvia negra", "escribiste una carta suicida"];
      const pago = Math.floor(Math.random() * 800) + 200;
      user.lagrimas += pago;
      user.cooldowns.work = now;
      await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐰𝐨𝐫𝐤 ⟡ ━━━━\n┃ ✦ ${trabajos[Math.floor(Math.random() * trabajos.length)]} .\n┃ ✦ te pagaron ${pago} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      break;

    case 'adventure':
      const cdAdv = 7200000;
      if (user.cooldowns.adventure && now - user.cooldowns.adventure < cdAdv) {
        let minutos = Math.ceil((cdAdv - (now - user.cooldowns.adventure)) / 60000);
        return conn.sendMessage(chatId, { text: `✦ estás muy débil para salir . espera ${minutos} minutos .` }, { quoted: msg });
      }
      const advPago = Math.floor(Math.random() * 2000) + 500;
      user.lagrimas += advPago;
      user.cooldowns.adventure = now;
      await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐚𝐝𝐯𝐞𝐧𝐭𝐮𝐫𝐞 ⟡ ━━━━\n┃ ✦ caminaste por el abismo y sobreviviste .\n┃ ✦ encontraste ${advPago} lágrimas negras .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      break;

    case 'mine':
    case 'minar':
      const cdMine = 10800000; // 3 horas
      if (user.cooldowns.mine && now - user.cooldowns.mine < cdMine) {
        let minutos = Math.ceil((cdMine - (now - user.cooldowns.mine)) / 60000);
        return conn.sendMessage(chatId, { text: `✦ tus manos están sangrando . vuelve a minar en ${minutos} minutos .` }, { quoted: msg });
      }
      const exitoMinado = Math.random() > 0.3; // 70% de éxito
      user.cooldowns.mine = now;
      if (exitoMinado) {
        const minaPago = Math.floor(Math.random() * 4000) + 1000;
        user.lagrimas += minaPago;
        await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐦𝐢𝐧𝐞 ⟡ ━━━━\n┃ ✦ cavaste en la oscuridad más profunda .\n┃ ✦ extrajiste ${minaPago} lágrimas negras .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      } else {
        await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐦𝐢𝐧𝐞 ⟡ ━━━━\n┃ ✦ la cueva colapsó sobre ti .\n┃ ✦ no conseguiste nada . patético .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      }
      break;

    case 'robar':
    case 'rob':
      const cdRob = 14400000; // 4 horas
      if (user.cooldowns.rob && now - user.cooldowns.rob < cdRob) {
        let minutos = Math.ceil((cdRob - (now - user.cooldowns.rob)) / 60000);
        return conn.sendMessage(chatId, { text: `✦ la policía está cerca . escóndete ${minutos} minutos .` }, { quoted: msg });
      }
      let targetRob = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!targetRob) return conn.sendMessage(chatId, { text: "✦ menciona a la víctima a la que le vas a arruinar la vida ." }, { quoted: msg });
      if (targetRob === sender) return conn.sendMessage(chatId, { text: "✦ ¿te vas a robar a ti mismo? idiota ." }, { quoted: msg });
      
      if (!rpgData[chatId][targetRob]) return conn.sendMessage(chatId, { text: "✦ ese fantasma no existe en mi sistema ." }, { quoted: msg });
      const victima = rpgData[chatId][targetRob];
      
      if (victima.lagrimas < 500) return conn.sendMessage(chatId, { text: "✦ esa basura es más pobre que tú . déjalo en paz ." }, { quoted: msg });

      user.cooldowns.rob = now;
      const exitoRobo = Math.random() > 0.5; // 50/50 chance
      
      if (exitoRobo) {
        const botin = Math.floor(Math.random() * (victima.lagrimas * 0.3)); // Roba hasta el 30%
        user.lagrimas += botin;
        victima.lagrimas -= botin;
        await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐫𝐨𝐛𝐨 ⟡ ━━━━\n┃ ✦ te metiste en sus pesadillas .\n┃ ✦ le robaste ${botin} lágrimas a @${targetRob.split('@')[0]} .\n╰━━━━━━━━━━━━━━━━━━━━━━━`, mentions: [targetRob] }, { quoted: msg });
      } else {
        const multa = Math.floor(Math.random() * 1000) + 200;
        user.lagrimas = Math.max(0, user.lagrimas - multa); // No baja de 0
        await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐫𝐨𝐛𝐨 ⟡ ━━━━\n┃ ✦ te atraparon intentando robar .\n┃ ✦ te golpearon y perdiste ${multa} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
      }
      break;

    case 'pay':
    case 'transfer':
      let targetPay = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      if (!targetPay || !args[1] || isNaN(args[1])) return conn.sendMessage(chatId, { text: `✦ usa : ${usedPrefix}${command} @usuario cantidad` }, { quoted: msg });
      if (targetPay === sender) return conn.sendMessage(chatId, { text: "✦ no puedes pagarte a ti mismo , genio ." }, { quoted: msg });
      
      const monto = parseInt(args[1]);
      if (monto <= 0) return conn.sendMessage(chatId, { text: "✦ no seas estúpido , envía una cantidad real ." }, { quoted: msg });
      if (user.lagrimas < monto) return conn.sendMessage(chatId, { text: "✦ no tienes esa cantidad . pobre ." }, { quoted: msg });
      
      if (!rpgData[chatId][targetPay]) rpgData[chatId][targetPay] = { mg: 0, viaje: 0, rango: "ojos de océano", inventario: [], lagrimas: 0, cooldowns: {} };
      
      user.lagrimas -= monto;
      rpgData[chatId][targetPay].lagrimas += monto;
      
      await conn.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐞𝐧𝐜𝐢𝐚 ⟡ ━━━━\n┃ ✦ le diste ${monto} lágrimas a @${targetPay.split('@')[0]} .\n┃ ✦ qué generoso y patético .\n╰━━━━━━━━━━━━━━━━━━━━━━━`, mentions: [targetPay] }, { quoted: msg });
      break;

    case 'top':
    case 'lb':
    case 'gremio':
      let users = Object.entries(rpgData[chatId]).map(([jid, data]) => {
        return { jid, lagrimas: data.lagrimas || 0, viaje: data.viaje || 0, rango: data.rango || "ojos de océano" };
      });
      users.sort((a, b) => b.lagrimas - a.lagrimas || b.viaje - a.viaje);
      let top10 = users.slice(0, 10);
      
      let topMsg = `╭━━━━ ⟡ 𝐥𝐨𝐬 𝐦𝐚𝐬 𝐦𝐢𝐬𝐞𝐫𝐚𝐛𝐥𝐞𝐬 ⟡ ━━━━\n┃\n`;
      top10.forEach((u, i) => {
          topMsg += `┃ ✦ ${i + 1}. @${u.jid.split('@')[0]}\n┃ ↳ ${u.lagrimas} lágrimas | nivel: ${u.viaje}\n┃\n`;
      });
      topMsg += `╰━━━━━━━━━━━━━━━━━━━━━━━`;
      
      await conn.sendMessage(chatId, { text: topMsg.toLowerCase(), mentions: top10.map(u => u.jid) }, { quoted: msg });
      break;
  }

  fs.writeFileSync(dbPath, JSON.stringify(rpgData, null, 2));
};

handler.command = ['work', 'balance', 'bal', 'daily', 'adventure', 'mine', 'minar', 'robar', 'rob', 'pay', 'transfer', 'top', 'lb', 'gremio'];
module.exports = handler;