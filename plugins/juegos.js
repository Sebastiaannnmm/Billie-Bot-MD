const fs = require('fs');

const handler = async (msg, { conn, args, command, usedPrefix }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const dbPath = './database/peep_rpg.json';

  let rpgData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf-8")) : {};
  if (!rpgData[chatId] || !rpgData[chatId][sender]) return conn.sendMessage(chatId, { text: "✦ regístrate o habla un poco antes de apostar ." });

  const user = rpgData[chatId][sender];
  
  if (['slot', 'ruleta'].includes(command)) {
      if (!args[0] || isNaN(args[0])) return conn.sendMessage(chatId, { text: `✦ dime cuántas lágrimas vas a apostar . ejemplo: ${usedPrefix}${command} 100` }, { quoted: msg });
      
      const apuesta = parseInt(args[0]);
      if (apuesta <= 0) return conn.sendMessage(chatId, { text: "✦ no seas estúpido , apuesta algo real ." }, { quoted: msg });
      if (apuesta < 10) return conn.sendMessage(chatId, { text: "✦ mínimo 10 lágrimas . no seas miserable ." }, { quoted: msg });
      if (user.lagrimas < apuesta) return conn.sendMessage(chatId, { text: "✦ no tienes suficientes lágrimas . pobre diablo ." }, { quoted: msg });

      if (command === 'slot') {
          const frutas = ["♱", "☠", "🕷", "🩸"];
          const a = frutas[Math.floor(Math.random() * frutas.length)];
          const b = frutas[Math.floor(Math.random() * frutas.length)];
          const c = frutas[Math.floor(Math.random() * frutas.length)];
          
          let resText = `╭━━━━ ⟡ 𝐬𝐥𝐨𝐭 ⟡ ━━━━\n┃\n┃  [ ${a} | ${b} | ${c} ]\n┃\n`;
          
          if (a === b && b === c) {
            const ganancia = apuesta * 5;
            user.lagrimas += ganancia;
            resText += `┃ ✦ maldita suerte . ganaste ${ganancia} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
          } else if (a === b || b === c || a === c) {
            const ganancia = Math.floor(apuesta * 1.5);
            user.lagrimas += ganancia - apuesta;
            resText += `┃ ✦ te salvaste a medias . recuperas ${ganancia} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
          } else {
            user.lagrimas -= apuesta;
            resText += `┃ ✦ perdiste ${apuesta} lágrimas . me encanta verte sufrir .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
          }
          await conn.sendMessage(chatId, { text: resText.toLowerCase() }, { quoted: msg });
      }

      if (command === 'ruleta') {
          const win = Math.random() < 0.45;
          let rulText = `╭━━━━ ⟡ 𝐫𝐮𝐥𝐞𝐭𝐚 𝐫𝐮𝐬𝐚 ⟡ ━━━━\n┃ ✦ apretaste el gatillo ...\n┃\n`;
          if (win) {
            user.lagrimas += apuesta;
            rulText += `┃ ✦ click . te salvaste . ganaste ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
          } else {
            user.lagrimas -= apuesta;
            rulText += `┃ ✦ bang . volaste tu cabeza y perdiste ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
          }
          await conn.sendMessage(chatId, { text: rulText.toLowerCase() }, { quoted: msg });
      }
      fs.writeFileSync(dbPath, JSON.stringify(rpgData, null, 2));
      return;
  }

  if (command === 'moneda' || command === 'coinflip') {
      if (!args[0] || !args[1] || isNaN(args[1])) return conn.sendMessage(chatId, { text: `✦ usa : ${usedPrefix}moneda [calavera/corona] [apuesta]` }, { quoted: msg });
      let eleccion = args[0].toLowerCase();
      if (!["calavera", "corona"].includes(eleccion)) return conn.sendMessage(chatId, { text: "✦ solo puedes elegir 'calavera' o 'corona' ." }, { quoted: msg });
      
      const apuesta = parseInt(args[1]);
      if (apuesta < 10 || user.lagrimas < apuesta) return conn.sendMessage(chatId, { text: "✦ apuesta inválida o eres muy pobre ." }, { quoted: msg });

      const resultado = Math.random() > 0.5 ? "calavera" : "corona";
      let msgMoneda = `╭━━━━ ⟡ 𝐦𝐨𝐧𝐞𝐝𝐚 ⟡ ━━━━\n┃ ✦ lanzaste la moneda al aire ...\n┃ ✦ cayó : ${resultado}\n┃\n`;
      
      if (eleccion === resultado) {
          user.lagrimas += apuesta;
          msgMoneda += `┃ ✦ adivinaste . ganaste ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
      } else {
          user.lagrimas -= apuesta;
          msgMoneda += `┃ ✦ equivocación fatal . perdiste ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
      }
      await conn.sendMessage(chatId, { text: msgMoneda }, { quoted: msg });
      fs.writeFileSync(dbPath, JSON.stringify(rpgData, null, 2));
  }

  if (command === 'ppt' || command === 'jugar') {
      if (!args[0] || !args[1] || isNaN(args[1])) return conn.sendMessage(chatId, { text: `✦ usa : ${usedPrefix}ppt [navaja/soga/veneno] [apuesta]` }, { quoted: msg });
      let userPick = args[0].toLowerCase();
      if (!["navaja", "soga", "veneno"].includes(userPick)) return conn.sendMessage(chatId, { text: "✦ elige: navaja , soga o veneno ." }, { quoted: msg });
      
      const apuesta = parseInt(args[1]);
      if (apuesta < 10 || user.lagrimas < apuesta) return conn.sendMessage(chatId, { text: "✦ apuesta inválida o fondos insuficientes ." }, { quoted: msg });

      const opciones = ["navaja", "soga", "veneno"];
      const botPick = opciones[Math.floor(Math.random() * opciones.length)];
      
      let msgPpt = `╭━━━━ ⟡ 𝐣𝐮𝐞𝐠𝐨 𝐦𝐨𝐫𝐭𝐚𝐥 ⟡ ━━━━\n┃ ✦ elegiste : ${userPick}\n┃ ✦ yo elegí : ${botPick}\n┃\n`;
      
      if (userPick === botPick) {
          msgPpt += `┃ ✦ empate . los dos vivimos para sufrir otro día .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
      } else if (
          (userPick === "navaja" && botPick === "soga") || 
          (userPick === "soga" && botPick === "veneno") || 
          (userPick === "veneno" && botPick === "navaja")
      ) {
          user.lagrimas += apuesta;
          msgPpt += `┃ ✦ me ganaste esta vez . te llevas ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
      } else {
          user.lagrimas -= apuesta;
          msgPpt += `┃ ✦ te destrocé . perdiste ${apuesta} lágrimas .\n╰━━━━━━━━━━━━━━━━━━━━━━━`;
      }
      await conn.sendMessage(chatId, { text: msgPpt }, { quoted: msg });
      fs.writeFileSync(dbPath, JSON.stringify(rpgData, null, 2));
  }
};

handler.command = ['slot', 'ruleta', 'moneda', 'coinflip', 'ppt', 'jugar'];
module.exports = handler;