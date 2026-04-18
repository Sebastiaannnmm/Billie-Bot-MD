const fs = require("fs");
const pino = require("pino");
const chalk = require("chalk");
const axios = require("axios"); 
const fetch = require("node-fetch");
const FormData = require("form-data");
const path = require("path");
const { exec } = require("child_process");
const { isOwner } = require("./config");
const readline = require("readline");

// Intento de cargar libs extras
let writeExifImg, imageToWebp;
try {
    const libs = require('./libs/fuctions');
    writeExifImg = libs.writeExifImg;
    imageToWebp = libs.imageToWebp;
} catch (e) {
    console.log(chalk.red("✦ no se encontraron libs extras , usando nativo ."));
}

// ⟡ BASES DE DATOS ⟡
const databaseDir = "./database";
if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir);
["peep_warns.json", "peep_muted.json", "peep_rpg.json", "peep_usuarios.json", "guar.json", "activos.json", "activossubbots.json"].forEach(f => {
    const fp = f.includes("/") ? f : `${databaseDir}/${f}`;
    if (!fs.existsSync(fp) && !fs.existsSync(`./${f}`)) fs.writeFileSync(fs.existsSync(`./${f}`) ? `./${f}` : fp, "{}");
});

const grupoCache = new Map();
const cooldownAutoChat = new Map();

// ⟡ IMÁGENES LIL PEEP (PERFIL) ⟡
const peepPics = [
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%201.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%202.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%203.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/f37d092d0043e8a7128da59f7bd6e4c94a8ead0e/lil%20pep%206.jpg",
    "https://i.pinimg.com/736x/83/10/a5/8310a51c9fa5532de786d7e00e008a00.jpg",
    "https://i.pinimg.com/736x/a2/1d/1b/a21d1b9be38d1de170720b0805d7b561.jpg"
];

// ⟡ DICCIONARIO MORTAL (+300 INSULTOS) ⟡
const insultosMortal = ["idiota", "imbecil", "hdp", "puta", "mierda", "pendejo", "gonorrea", "malparido", "pirobo", "carechimba", "mamaguevo", "maldito", "estupido", "basura", "perra", "zorra", "maldita", "mamon", "culero", "verga", "pito", "gonorreita", "careverga", "triplehp", "bastardo", "sarnoso", "aborto", "cabron", "chinga", "maricon", "loca", "reputa", "hijo de perra", "hijo de puta", "malnacido", "pobre guevon", "careculo", "malparida", "gonorreon", "perro hp", "gonorriento", "caremonda", "monda", "care picha", "malpariditos", "gonorreas", "triple hp", "malparidos", "piroba", "zorras", "putitas", "pendejos", "gonorreitas", "hptas", "triple hpta", "baboso", "estupida", "pobre diablo", "animal", "bestia", "bruto", "tarado", "inutil", "mugre", "asqueroso", "desgraciado", "rata", "lacra", "escoria", "puerco", "cochino", "sucio", "infeliz", "bobolon", "bobo", "huevon", "guevon", "boludo", "pelotudo", "conchudo", "mamabicho", "mamapito", "mamapene", "chupapija", "chupaverga", "chupapito", "chupamonda", "tragaleche", "soplamoco", "arrodillado", "vendido", "lamebotas", "lambon", "sapo", "chismoso", "metido", "lameculo", "arrastrado", "pobreton", "muerto de hambre", "limosnero", "fracasado", "perdedor", "basura humana", "aborto", "engendro", "monstruo", "deforme", "horrible", "feo", "espantoso", "apestoso", "hediondo", "podrido", "enfermo", "psicopata", "loco", "demente", "retrasado", "mongolico", "zonzo", "menso", "soquete", "pavitonto", "pajuo", "guevonazo", "idiotazo", "estupidazo", "perrisima", "zorrisima", "malditasea", "puto", "mariconazo", "locota", "sidoso", "cancerigeno", "mierdero", "care mierda", "cara de mierda", "ojete", "cabronazo", "chingon", "pendejazo", "pendejito", "boludazo", "pelotudazo", "conchudazo", "hijueputa", "hijueputas", "hptas", "hpta", "gonorreas", "gonorriantazo", "pirobas", "pirobos", "pirobazos", "carechimbas", "carevergas", "caremondas", "malparidazos", "malnacidos", "malnacida", "malditos", "malditas", "perras", "putas", "zorras", "basuras", "escorias", "lacras", "ratas", "puercos", "cochinos", "sucios", "hediondos", "apestosos", "idiotas", "imbeciles", "estupidos", "tarados", "retrasados", "pobres", "muertos", "fantasmas", "bobos", "tontos", "huevones", "guevones", "boludos", "pelotudos", "conchudos", "culeros", "ojetes", "cabrones", "chingados", "pendejos", "mierdas", "vergas", "pitos", "pijas", "mondas", "chimbas"];

// ⟡ NIVELES, ECONOMÍA Y RECOMPENSAS RPG ⟡
const fasesRPG = [
    { nivel: 0, rango: "ojos de océano", item: "ninguno", bono: 0 },
    { nivel: 1, rango: "imitador barato", item: "2 pastillas oscuras", bono: 50 },
    { nivel: 2, rango: "dolor de estómago", item: "1 cuchillo oxidado", bono: 150 },
    { nivel: 3, rango: "corona de espinas", item: "3 arañas viuda negra", bono: 300 },
    { nivel: 4, rango: "chica buena al infierno", item: "1 boleto al abismo", bono: 500 },
    { nivel: 5, rango: "enterrador de amigos", item: "1 pala con sangre", bono: 800 },
    { nivel: 6, rango: "adicto a la xanny", item: "5 pastillas blancas", bono: 1200 },
    { nivel: 7, rango: "ilomilo perdido", item: "1 mapa sin salida", bono: 1800 },
    { nivel: 8, rango: "no hay tiempo para morir", item: "1 reloj roto", bono: 2500 },
    { nivel: 9, rango: "mi futuro incierto", item: "1 espejo roto", bono: 3500 },
    { nivel: 10, rango: "acuerdo confidencial (NDA)", item: "1 contrato maldito", bono: 5000 },
    { nivel: 11, rango: "fiebre dorada", item: "1 corona de oro fundido", bono: 7000 },
    { nivel: 12, rango: "más feliz que nunca", item: "1 sonrisa falsa", bono: 10000 },
    { nivel: 13, rango: "oxitocina venenosa", item: "2 jeringas usadas", bono: 15000 },
    { nivel: 14, rango: "fantasía oscura", item: "1 diario de pesadillas", bono: 25000 },
    { nivel: 15, rango: "chico malo (bad guy)", item: "1 alma robada", bono: 50000 },
    { nivel: 16, rango: "dios del vacío", item: "el control total", bono: 100000 }
];

// ─── CARGADOR DE PLUGINS INTEGRADO ───
function loadPlugins() {
    const pluginsArr = [];
    const pluginDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginDir)) return pluginsArr;
    const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
          delete require.cache[require.resolve(path.join(pluginDir, file))]; 
          const plugin = require(path.join(pluginDir, file));
          if (plugin && plugin.command) pluginsArr.push(plugin);
        } catch (e) { }
    }
    return pluginsArr;
}

let plugins = loadPlugins();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

async function startBot() {
    const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, downloadContentFromMessage } = await import("@whiskeysockets/baileys");
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");
    
    global.downloadMedia = async (node, type) => {
        const stream = await downloadContentFromMessage(node, type);
        let buf = Buffer.alloc(0);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        return buf;
    };

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) 
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        generateHighQualityLinkPreview: true
    });

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            console.log(chalk.red.bold("\n✦ el qr ya no sirve . el abismo pide código ."));
            let numero = await question(chalk.cyan("✦ escribe tu número con código de país (ej: 57321...) :\n> "));
            numero = numero.replace(/[^0-9]/g, '');
            let code = await sock.requestPairingCode(numero);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.green.bold(`\n✦ TU CÓDIGO ES : ${code} \n✦ ponlo en whatsapp y no me hagas perder el tiempo .\n`));
        }, 3000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chatId = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const isGroup = chatId.endsWith("@g.us");
            const messageText = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "");
            const lowerText = messageText.toLowerCase().trim();

            const configFilePath = "./config.json";
            global.prefix = fs.existsSync(configFilePath) ? (JSON.parse(fs.readFileSync(configFilePath, "utf-8")).prefix || ".") : ".";

            sock.sendImageAsSticker = async (jid, buffPath, quoted, options = {}) => {
                let buff = Buffer.isBuffer(buffPath) ? buffPath : fs.existsSync(buffPath) ? fs.readFileSync(buffPath) : Buffer.alloc(0);
                let buffer;
                if (options && (options.packname || options.author) && writeExifImg) { 
                    buffer = await writeExifImg(buff, options); 
                } else if (imageToWebp) { 
                    buffer = await imageToWebp(buff); 
                } else {
                    buffer = buff; 
                }
                await sock.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted: quoted ? quoted : msg });
                return buffer;
            };

            if (isGroup) {
                let groupMetadata;
                if (grupoCache.has(chatId) && (Date.now() - grupoCache.get(chatId).lastUpdate < 60000)) {
                    groupMetadata = grupoCache.get(chatId).metadata;
                } else {
                    groupMetadata = await sock.groupMetadata(chatId);
                    grupoCache.set(chatId, { metadata: groupMetadata, lastUpdate: Date.now() });
                }

                const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
                const muted = fs.existsSync(`${databaseDir}/peep_muted.json`) ? JSON.parse(fs.readFileSync(`${databaseDir}/peep_muted.json`, "utf-8")) : {};
                const rpgData = fs.existsSync(`${databaseDir}/peep_rpg.json`) ? JSON.parse(fs.readFileSync(`${databaseDir}/peep_rpg.json`, "utf-8")) : {};
                const registrados = fs.existsSync(`${databaseDir}/peep_usuarios.json`) ? JSON.parse(fs.readFileSync(`${databaseDir}/peep_usuarios.json`, "utf-8")) : {};
                
                const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                const isAdmin = admins.includes(sender);
                const isBotOwner = isOwner(sender.split("@")[0]);

                if (muted[chatId]?.[sender] && !isAdmin && !isBotOwner) return await sock.sendMessage(chatId, { delete: msg.key });

                // ── « ANTI-LINK » ──
                if (activos.antilink?.[chatId] && (lowerText.includes("chat.whatsapp.com") || lowerText.includes("http")) && !isAdmin && !isBotOwner) {
                    await sock.sendMessage(chatId, { delete: msg.key });
                    await sock.sendMessage(chatId, { text: "✦ soy el chico malo . tu link me importa una mierda , vete de aquí ." });
                    return await sock.groupParticipantsUpdate(chatId, [sender], "remove");
                }

                // ── « ANTI-INSULTOS » ──
                if (activos.antiinsultos?.[chatId] && insultosMortal.some(word => new RegExp('\\b' + word + '\\b', 'i').test(lowerText)) && !isAdmin && !isBotOwner) {
                    await sock.sendMessage(chatId, { delete: msg.key });
                    let warns = JSON.parse(fs.readFileSync(`${databaseDir}/peep_warns.json`, "utf-8"));
                    if (!warns[chatId]) warns[chatId] = {};
                    warns[chatId][sender] = (warns[chatId][sender] || 0) + 1;
                    if (warns[chatId][sender] >= 3) {
                        await sock.sendMessage(chatId, { text: `✦ @${sender.split("@")[0]} entierren a este imbécil . estás fuera .`, mentions: [sender] });
                        await sock.groupParticipantsUpdate(chatId, [sender], "remove");
                        delete warns[chatId][sender];
                    } else {
                        await sock.sendMessage(chatId, { text: `✦ @${sender.split("@")[0]} lávate esa boca asquerosa . aviso : ${warns[chatId][sender]}/3`, mentions: [sender] });
                    }
                    fs.writeFileSync(`${databaseDir}/peep_warns.json`, JSON.stringify(warns, null, 2));
                    return;
                }

                // ── « RPG: ECONOMÍA Y NIVELES (PROGRESIVO) » ──
                if (activos.rpg?.[chatId] && registrados[sender]) {
                    if (!rpgData[chatId]) rpgData[chatId] = {};
                    if (!rpgData[chatId][sender]) rpgData[chatId][sender] = { mg: 0, viaje: 0, rango: fasesRPG[0].rango, inventario: [], lagrimas: 0 };
                    if (rpgData[chatId][sender].lagrimas === undefined) rpgData[chatId][sender].lagrimas = 0;

                    rpgData[chatId][sender].mg += 1;
                    
                    let limiteNivel = 10 + (rpgData[chatId][sender].viaje * 15);

                    if (rpgData[chatId][sender].mg >= limiteNivel) {
                        rpgData[chatId][sender].viaje += 1;
                        rpgData[chatId][sender].mg = 0;
                        const nuevaFase = fasesRPG.find(f => f.nivel === rpgData[chatId][sender].viaje) || fasesRPG[fasesRPG.length - 1];
                        
                        rpgData[chatId][sender].rango = nuevaFase.rango;
                        rpgData[chatId][sender].lagrimas += nuevaFase.bono;
                        if (!rpgData[chatId][sender].inventario) rpgData[chatId][sender].inventario = [];
                        if (nuevaFase.item !== "ninguno") rpgData[chatId][sender].inventario.push(nuevaFase.item);

                        let proximoLimite = 10 + (rpgData[chatId][sender].viaje * 15);

                        const msjNivel = `╭━━━━ ⟡ 𝐧𝐮𝐞𝐯𝐚 𝐩𝐞𝐬𝐚𝐝𝐢𝐥𝐥𝐚 ⟡ ━━━━
┃
┃ ✦ 𝐟𝐚𝐧𝐭𝐚𝐬𝐦𝐚 : @${sender.split("@")[0]}
┃ ✦ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 : 𝐧𝐢𝐯𝐞𝐥 ${rpgData[chatId][sender].viaje}
┃ ✦ 𝐟𝐚𝐬𝐞 : [ ${nuevaFase.rango} ]
┃
┃ ⎔ 𝐛𝐨𝐭𝐢𝐧 𝐨𝐛𝐭𝐞𝐧𝐢𝐝𝐨
┃ ↳ +${nuevaFase.bono} lagrimas negras
┃ ↳ 1 x ${nuevaFase.item}
┃
┃ ⎔ 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 : ${rpgData[chatId][sender].lagrimas} lagrimas
┃ ✦ 𝐩𝐫𝐨𝐱𝐢𝐦𝐨 𝐧𝐢𝐯𝐞𝐥 : en ${proximoLimite} mensajes
┃
┃ ˗ˏˋ you should see me in a crown ˎˊ˗
╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                        await sock.sendMessage(chatId, { text: msjNivel, mentions: [sender] });
                    }
                    fs.writeFileSync(`${databaseDir}/peep_rpg.json`, JSON.stringify(rpgData, null, 2));
                }

                // ── « AUTO-CHAT SARCÁSTICO » ──
                if (activos.autochat?.[chatId] && !lowerText.startsWith(global.prefix)) {
                    const billieChat = { 
                        "hola": ["¿vienes a mi fiesta o a mi funeral?", "estoy ocupada ignorando a idiotas.", "no te acerques.", "hola... ¿puedes verme?"], 
                        "ola": ["el océano está frío... y tú eres un imbécil.", "ola... sin h como tu cerebro vacío.", "¿te perdiste?"], 
                        "xd": ["¿te ríes de la tragedia?", "mírate, qué patético.", "risa falsa de mierda."], 
                        "adios": ["lárgate , ya me das asco.", "adiós... no vuelvas.", "una salida dramática."],
                        "wey": ["no soy tu wey , no somos nada.", "wey... ¿oíste cómo se pudre tu alma?", "deja de llamarme así , estúpido."],
                        "weon": ["eres un eco insignificante flotando.", "cierra la boca , weón de mierda.", "todos somos el mismo weon flotando."],
                        "boludo": ["el mundo está lleno de boludos , y tú eres el rey.", "qué aburrimiento das.", "che... bajá un cambio."],
                        "bro": ["bro... ¿tienes una pala para enterrarte?", "no somos hermanos , no me toques.", "no me digas bro , asqueroso."],
                        "vaina": ["qué vaina la vida... ojalá se acabe pronto.", "deja esa vaina , das pena.", "solo te va a romper más."],
                        "zzz": ["duerme... y ojalá no despiertes nunca.", "insomnio... mi único amigo , tú solo estorbas.", "cuando nos dormimos, ¿a dónde vamos?"],
                        "te amo": ["no lo hagas... te haré sufrir y escribiré una canción sobre tu fracaso.", "soy adorable , ¿verdad? , pero tú eres basura.", "qué asco me das."],
                        "bot": ["llámame billie , pedazo de mierda.", "¿qué quieres ahora , estúpido?", "soy un error en tu patética vida."],
                        "que haces": ["mirando cómo pierdes el tiempo.", "esperando que dejes de hablar.", "nada que te interese , chismoso."],
                        "quien eres": ["soy el chico malo.", "tu peor pesadilla con corona.", "el fantasma que te joderá el sueño."],
                        "jajaja": ["tu risa me da ganas de vomitar.", "¿de qué te ríes , payaso?", "qué divertido... (ojalá te mueras)."],
                        "fino": ["elegancia y oscuridad , algo que tú no tienes.", "fino como el cuchillo que te cortará.", "pura estética."],
                        "pana": ["no soy tu pana , búscate una vida.", "los panas son los primeros en traicionar , idiota.", "no te equivoques conmigo."]
                    };
                    
                    const tiempoCooldown = 10000;
                    if (!cooldownAutoChat.has(chatId) || (Date.now() - cooldownAutoChat.get(chatId) >= tiempoCooldown)) {
                        for (let key in billieChat) { 
                            if (new RegExp('\\b' + key + '\\b', 'i').test(lowerText)) { 
                                const resList = billieChat[key]; 
                                cooldownAutoChat.set(chatId, Date.now());
                                setTimeout(async () => { await sock.sendMessage(chatId, { text: `✦ ${resList[Math.floor(Math.random() * resList.length)].toLowerCase()}` }, { quoted: msg }); }, 1500); 
                                break; 
                            } 
                        }
                    }
                }
            }

            // ── « EJECUCIÓN DEL NÚCLEO Y PLUGINS » ──
            if (lowerText.startsWith(global.prefix) || true) { // Se añade || true para que siempre evalue handlers

                // ⟡ ALARMA PARA HANDLER.ALL (AFK Y MONITOREO) ⟡
                for (let name in plugins) {
                    let plugin = plugins[name];
                    if (plugin.all && typeof plugin.all === 'function') {
                        try {
                            await plugin.all.call(sock, msg);
                        } catch (e) {
                            console.error("error en handler.all:", e);
                        }
                    }
                }

                if (!lowerText.startsWith(global.prefix)) return; // Si no es prefijo, no sigue a comandos

                const command = lowerText.slice(global.prefix.length).trim().split(" ")[0];
                const rawArgs = messageText.slice(global.prefix.length + command.length).trim();
                const argsArray = rawArgs.split(/\s+/);
                const cmdLower = command.toLowerCase();

                // FILTRO DE REGISTRO
                const registrados = fs.existsSync(`${databaseDir}/peep_usuarios.json`) ? JSON.parse(fs.readFileSync(`${databaseDir}/peep_usuarios.json`, "utf-8")) : {};
                if (!registrados[sender] && cmdLower !== 'reg' && cmdLower !== 'registrar') {
                    return sock.sendMessage(chatId, { text: `✦ no existes para mí . regístrate primero usando : ${global.prefix}reg nombre.edad\n✦ o piérdete en el vacío .` }, { quoted: msg });
                }
                
                const plugin = plugins.find(p => {
                    const cmds = Array.isArray(p.command) ? p.command : [p.command];
                    return cmds.includes(cmdLower);
                });

                if (plugin) {
                    try {
                        return await plugin(msg, { conn: sock, text: rawArgs, args: argsArray, command: cmdLower, usedPrefix: global.prefix });
                    } catch (e) {
                        console.error(`Error en plugin ${command}:`, e);
                        return sock.sendMessage(chatId, { text: "✦ un error más en tu vida ." }, { quoted: msg });
                    }
                }

                // COMANDOS NATIVOS
                switch (cmdLower) {
                    case 'reg':
                    case 'registrar': {
                        if (registrados[sender]) return sock.sendMessage(chatId, { text: "✦ ya eres parte de esta pesadilla ." });
                        const [nombre, edad] = rawArgs.split('.');
                        if (!nombre || !edad) return sock.sendMessage(chatId, { text: `✦ usa : ${global.prefix}reg nombre.edad` });
                        registrados[sender] = { nombre, edad: parseInt(edad), fecha: new Date().toLocaleString() };
                        fs.writeFileSync(`${databaseDir}/peep_usuarios.json`, JSON.stringify(registrados, null, 2));
                        const msgReg = `╭━━━━ ⟡ 𝐛𝐢𝐥𝐥𝐢𝐞 𝐫𝐞𝐠 ⟡ ━━━━\n┃ ✦ 𝐧𝐨𝐦𝐛𝐫𝐞 : ${nombre}\n┃ ✦ 𝐞𝐝𝐚𝐝 : ${edad}\n┃\n┃ ˗ˏˋ no me sonrías , perra ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                        return sock.sendMessage(chatId, { text: msgReg });
                    }

                    case 'perfil':
                    case 'me': {
                        const rpgData = fs.existsSync(`${databaseDir}/peep_rpg.json`) ? JSON.parse(fs.readFileSync(`${databaseDir}/peep_rpg.json`, "utf-8")) : {};
                        const u = registrados[sender];
                        const r = rpgData[chatId]?.[sender] || { mg: 0, viaje: 0, rango: "ojos de océano", inventario: [], lagrimas: 0 };
                        
                        const vNum = parseInt(r.viaje) || 0;
                        const lagrimasNum = parseInt(r.lagrimas) || 0;
                        const invTexto = r.inventario && r.inventario.length > 0 ? r.inventario.slice(-2).join(" , ") : "nada";
                        
                        const perfilTexto = `╭━━━━ ⟡ 𝐛𝐢𝐥𝐥𝐢𝐞 𝐜𝐚𝐫𝐝 ⟡ ━━━━\n┃\n┃ ✦ 𝐧𝐨𝐦𝐛𝐫𝐞 : ${u.nombre}\n┃ ✦ 𝐞𝐝𝐚𝐝 : ${u.edad}\n┃ ✦ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 : 𝐧𝐢𝐯𝐞𝐥 ${vNum}\n┃ ✦ 𝐟𝐚𝐬𝐞 : [ ${r.rango} ]\n┃ ✦ 𝐥𝐚𝐠𝐫𝐢𝐦𝐚𝐬 : ${lagrimasNum}\n┃\n┃ ⎔ 𝐮𝐥𝐭𝐢𝐦𝐨𝐬 𝐢𝐭𝐞𝐦𝐬 :\n┃ ↳ ${invTexto}\n┃\n┃ ˗ˏˋ ban ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                        const randomImg = peepPics[Math.floor(Math.random() * peepPics.length)];
                        try {
                            const res = await axios.get(randomImg, { responseType: 'arraybuffer' });
                            return await sock.sendMessage(chatId, { image: Buffer.from(res.data), caption: perfilTexto, mentions: [sender] }, { quoted: msg });
                        } catch (e) {
                            return await sock.sendMessage(chatId, { text: perfilTexto, mentions: [sender] }, { quoted: msg });
                        }
                    }

                    // ── « INTERRUPTORES BLINDADOS » ──
                    case 'antilink':
                    case 'antiinsultos':
                    case 'rpg':
                    case 'nsfw':
                    case 'modoadmins':
                    case 'autochat':
                    case 'juegos': {
                        if (!chatId.endsWith("@g.us")) return sock.sendMessage(chatId, { text: "✦ esto solo funciona en grupos , idiota ." }, { quoted: msg });
                        
                        const groupMetadata = await sock.groupMetadata(chatId);
                        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                        const botOwner = isOwner(sender.split("@")[0]);
                        
                        if (!admins.includes(sender) && !botOwner) {
                            return sock.sendMessage(chatId, { text: "✦ no tienes autoridad aquí . solo admins o mi creador ." }, { quoted: msg });
                        }
                        
                        const modo = argsArray[0]?.toLowerCase();
                        if (!["on", "off"].includes(modo)) {
                            return sock.sendMessage(chatId, { text: `✦ escribe bien . usa : ${global.prefix}${cmdLower} on/off` }, { quoted: msg });
                        }
                        
                        const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
                        if (!activos[cmdLower]) activos[cmdLower] = {};
                        
                        if (modo === 'on') activos[cmdLower][chatId] = true;
                        else delete activos[cmdLower][chatId];
                        
                        fs.writeFileSync("./activos.json", JSON.stringify(activos, null, 2));
                        return await sock.sendMessage(chatId, { text: `✦ [ ${cmdLower} ] ha sido ${modo === 'on' ? 'activado' : 'desactivado'} . haz tu desastre .` }, { quoted: msg });
                    }

                    case 'modoprivado': {
                        const botOwner = isOwner(sender.split("@")[0]);
                        if (!botOwner) return sock.sendMessage(chatId, { text: "✦ no tienes autoridad . solo mi creador ." }, { quoted: msg });
                        
                        const modo = argsArray[0]?.toLowerCase();
                        if (!["on", "off"].includes(modo)) return sock.sendMessage(chatId, { text: `✦ escribe bien . usa : ${global.prefix}${cmdLower} on/off` }, { quoted: msg });
                        
                        const activos = fs.existsSync("./activos.json") ? JSON.parse(fs.readFileSync("./activos.json", "utf-8")) : {};
                        activos.modoPrivado = (modo === 'on');
                        fs.writeFileSync("./activos.json", JSON.stringify(activos, null, 2));
                        return await sock.sendMessage(chatId, { text: `✦ modo privado ${modo === 'on' ? 'activado' : 'desactivado'} . i'm the bad guy .` }, { quoted: msg });
                    }

                    case 'menuaudio': {
                        try {
                            await sock.sendMessage(chatId, { react: { text: "✦", key: msg.key } });
                            if (!fs.existsSync("./guar.json")) return sock.sendMessage(chatId, { text: "✦ no tienes nada guardado . puro vacío ." }, { quoted: msg });
                            const guarData = JSON.parse(fs.readFileSync("./guar.json", "utf-8"));
                            let claves = Object.keys(guarData);
                            let listaMensaje = `╭━━━━ ⟡ 𝐦𝐮𝐥𝐭𝐢𝐦𝐞𝐝𝐢𝐚 ⟡ ━━━━\n┃\n┃ ✦ 𝐮𝐬𝐚 : ${global.prefix}g <clave>\n┃\n┃ ⎔ 𝐜𝐥𝐚𝐯𝐞𝐬 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞𝐬 :\n`;
                            if (claves.length === 0) { listaMensaje += "┃ ↳ nada guardado . \n"; } else { claves.forEach((clave, index) => { listaMensaje += `┃ ↳ ${index + 1}. ${clave}\n`; }); }
                            listaMensaje += `┃\n┡━━━━ ⟡ 𝐭𝐨𝐨𝐥𝐬 ⟡ ━━━━\n┃ ✦ ${global.prefix}guar — guardar\n┃ ✦ ${global.prefix}g — recuperar\n┃ ✦ ${global.prefix}kill — borrar\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                            await sock.sendMessage(chatId, { image: { url: peepPics[0] }, caption: listaMensaje }, { quoted: msg });
                        } catch (error) { console.error(error); }
                        break;
                    }

                    case 'whatmusic': {
                        const qMusic = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                        if (!qMusic || (!qMusic.audioMessage && !qMusic.videoMessage)) return sock.sendMessage(chatId, { text: "✦ responde a un audio o video ." });
                        await sock.sendMessage(chatId, { react: { text: '✦', key: msg.key } });
                        try {
                            const type = qMusic.audioMessage ? 'audio' : 'video';
                            const stream = await downloadContentFromMessage(qMusic[type + 'Message'], type);
                            let buf = Buffer.alloc(0);
                            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                            const inputPath = path.join(__dirname, 'tmp', `${Date.now()}.mp3`);
                            if(!fs.existsSync(path.join(__dirname, 'tmp'))) fs.mkdirSync(path.join(__dirname, 'tmp'));
                            fs.writeFileSync(inputPath, buf);
                            const form = new FormData();
                            form.append('file', fs.createReadStream(inputPath));
                            const up = await axios.post('https://cdn.russellxz.click/upload.php', form, { headers: form.getHeaders() });
                            const res = await axios.get(`https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(up.data.url)}&apikey=russellxz`);
                            const { title, artist } = res.data.data;
                            await sock.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐦𝐮𝐬𝐢𝐜 ⟡ ━━━━\n┃ ✦ 𝐭𝐢𝐭𝐮𝐥𝐨 : ${title.toLowerCase()}\n┃ ✦ 𝐚𝐫𝐭𝐢𝐬𝐭𝐚 : ${artist.toLowerCase()}\n╰━━━━━━━━━━━━━━━━━━━━━━━` }, { quoted: msg });
                            fs.unlinkSync(inputPath);
                        } catch (err) { console.error(err); }
                        break;
                    }

                    case 'tourl': {
                        const qMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                        if (!qMsg) return sock.sendMessage(chatId, { text: "✦ responde a un archivo multimedia ." }, { quoted: msg });
                        await sock.sendMessage(chatId, { react: { text: "✦", key: msg.key } });
                        try {
                            let type = qMsg.imageMessage ? 'image' : qMsg.videoMessage ? 'video' : qMsg.stickerMessage ? 'sticker' : qMsg.audioMessage ? 'audio' : null;
                            if (!type) return;
                            const stream = await downloadContentFromMessage(qMsg[type + 'Message'] || qMsg, type);
                            let buf = Buffer.alloc(0);
                            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                            const inputPath = path.join(__dirname, 'tmp', `${Date.now()}.${type === 'video' ? 'mp4' : type === 'audio' ? 'mp3' : 'jpg'}`);
                            if(!fs.existsSync(path.join(__dirname, 'tmp'))) fs.mkdirSync(path.join(__dirname, 'tmp'));
                            fs.writeFileSync(inputPath, buf);
                            const form = new FormData();
                            form.append('file', fs.createReadStream(inputPath));
                            const res = await axios.post('https://cdn.russellxz.click/upload.php', form, { headers: form.getHeaders() });
                            await sock.sendMessage(chatId, { text: `✦ enlace : ${res.data.url}` }, { quoted: msg });
                            fs.unlinkSync(inputPath);
                        } catch (err) { console.error(err); }
                        break;
                    }

                    case 'tovideo': {
                        const quotedStk = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
                        if (!quotedStk) return sock.sendMessage(chatId, { text: "✦ responde a un sticker , inútil ." }, { quoted: msg });
                        await sock.sendMessage(chatId, { react: { text: "✦", key: msg.key } });
                        try {
                            const stream = await downloadContentFromMessage(quotedStk, 'sticker');
                            let buf = Buffer.alloc(0);
                            for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                            const inputPath = path.join(__dirname, 'tmp', `${Date.now()}.webp`);
                            if(!fs.existsSync(path.join(__dirname, 'tmp'))) fs.mkdirSync(path.join(__dirname, 'tmp'));
                            fs.writeFileSync(inputPath, buf);
                            const form = new FormData();
                            form.append("file", fs.createReadStream(inputPath));
                            const upload = await axios.post("https://cdn.russellxz.click/upload.php", form, { headers: form.getHeaders() });
                            const conv = await axios.get(`https://api.neoxr.eu/api/webp2mp4?url=${encodeURIComponent(upload.data.url)}&apikey=russellxz`);
                            await sock.sendMessage(chatId, { video: { url: conv.data.data.url }, caption: '✦ sticker convertido . déjame en paz .' }, { quoted: msg });
                            fs.unlinkSync(inputPath);
                        } catch (e) { console.error(e); }
                        break;
                    }

                    case 'kick': {
                        if (!chatId.endsWith("@g.us")) return;
                        const groupMetadata = await sock.groupMetadata(chatId);
                        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                        if (!admins.includes(sender) && !isOwner(sender.split("@")[0])) return;
                        let target = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                        if (!target) return sock.sendMessage(chatId, { text: "✦ menciona a alguien para enviarlo al vacío ." });
                        await sock.groupParticipantsUpdate(chatId, [target], "remove");
                        await sock.sendMessage(chatId, { text: "✦ bury a friend . estás fuera ." });
                        break;
                    }

                    case 'tag': {
                        if (!chatId.endsWith("@g.us")) return;
                        const groupMetadata = await sock.groupMetadata(chatId);
                        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                        if (!admins.includes(sender) && !isOwner(sender.split("@")[0])) return;
                        const mentions = groupMetadata.participants.map(p => p.id);
                        const textToTag = rawArgs || "✦ despertando fantasmas...";
                        await sock.sendMessage(chatId, { text: textToTag.toLowerCase(), mentions }, { quoted: msg });
                        break;
                    }

                    case 'carga': {
                        if (!isOwner(sender.split("@")[0])) return;
                        exec('git pull', async (error, stdout) => {
                            if (stdout.includes("Already up to date")) return sock.sendMessage(chatId, { text: "✦ ya está actualizado , no molestes ." });
                            await sock.sendMessage(chatId, { text: "✦ reiniciando el infierno ..." });
                            setTimeout(() => process.exit(1), 3000);
                        });
                        break;
                    }

                    case 'menufree': { break; }
                    case 'sorteo': { break; }

                    default: {
                        const billieFails = [
                            "✦ ese comando no existe en mi cabeza . deja de inventar .",
                            "✦ escribes basura que ni mi sistema reconoce .",
                            "✦ qué idiota , ese comando ni existe .",
                            "✦ comando inválido . igual que tú ."
                        ];
                        const randomFail = billieFails[Math.floor(Math.random() * billieFails.length)];
                        await sock.sendMessage(chatId, { text: randomFail }, { quoted: msg });
                        break;
                    }
                }
            }
        } catch (e) { console.error("error en index:", e); }
    });

    sock.ev.on("connection.update", (u) => { 
        if (u.connection === "open") console.log(chalk.green.bold("✦ billie online ✦"));
        if (u.connection === "close") startBot(); 
    });
}
startBot();