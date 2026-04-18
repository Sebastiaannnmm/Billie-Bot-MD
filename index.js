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

                // ── « RPG: ECONOMÍA Y NIVELES » ──
                if (activos.rpg?.[chatId] && registrados[sender]) {
                    if (!rpgData[chatId]) rpgData[chatId] = {};
                    if (!rpgData[chatId][sender]) rpgData[chatId][sender] = { mg: 0, viaje: 0, rango: fasesRPG[0].rango, inventario: [], lagrimas: 0 };
                    
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

                        const msjNivel = `╭━━━━ ⟡ 𝐧𝐮𝐞𝐯𝐚 𝐩𝐞𝐬𝐚𝐝𝐢𝐥𝐥𝐚 ⟡ ━━━━\n┃\n┃ ✦ 𝐟𝐚𝐧𝐭𝐚𝐬𝐦𝐚 : @${sender.split("@")[0]}\n┃ ✦ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 : 𝐧𝐢𝐯𝐞𝐥 ${rpgData[chatId][sender].viaje}\n┃ ✦ 𝐟𝐚𝐬𝐞 : [ ${nuevaFase.rango} ]\n┃\n┃ ⎔ 𝐛𝐨𝐭𝐢𝐧 𝐨𝐛𝐭𝐞𝐧𝐢𝐝𝐨\n┃ ↳ +${nuevaFase.bono} lagrimas negras\n┃ ↳ 1 x ${nuevaFase.item}\n┃\n┃ ˗ˏˋ billie-bot- creator ban ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                        await sock.sendMessage(chatId, { text: msjNivel, mentions: [sender] });
                    }
                    fs.writeFileSync(`${databaseDir}/peep_rpg.json`, JSON.stringify(rpgData, null, 2));
                }
            }

            // ── « PROCESAMIENTO DE COMANDOS » ──
            if (!lowerText.startsWith(global.prefix)) return;

            const command = lowerText.slice(global.prefix.length).trim().split(" ")[0];
            const rawArgs = messageText.slice(global.prefix.length + command.length).trim();
            const argsArray = rawArgs.split(/\s+/);
            const cmdLower = command.toLowerCase();

            const registrados = JSON.parse(fs.readFileSync(`${databaseDir}/peep_usuarios.json`, "utf-8"));
            if (!registrados[sender] && !['reg', 'registrar'].includes(cmdLower)) {
                return sock.sendMessage(chatId, { text: `✦ no existes para mí . regístrate primero usando : ${global.prefix}reg nombre.edad` }, { quoted: msg });
            }
            
            const plugin = plugins.find(p => (Array.isArray(p.command) ? p.command : [p.command]).includes(cmdLower));
            if (plugin) return await plugin(msg, { conn: sock, text: rawArgs, args: argsArray, command: cmdLower, usedPrefix: global.prefix });

            switch (cmdLower) {
                case 'reg':
                case 'registrar': {
                    if (registrados[sender]) return sock.sendMessage(chatId, { text: "✦ ya eres parte de esta pesadilla ." });
                    const [nombre, edad] = rawArgs.split('.');
                    if (!nombre || !edad) return sock.sendMessage(chatId, { text: `✦ usa : ${global.prefix}reg nombre.edad` });
                    registrados[sender] = { nombre, edad: parseInt(edad), fecha: new Date().toLocaleString() };
                    fs.writeFileSync(`${databaseDir}/peep_usuarios.json`, JSON.stringify(registrados, null, 2));
                    return sock.sendMessage(chatId, { text: `╭━━━━ ⟡ 𝐛𝐢𝐥𝐥𝐢𝐞 𝐫𝐞𝐠 ⟡ ━━━━\n┃ ✦ 𝐧𝐨𝐦𝐛𝐫𝐞 : ${nombre}\n┃ ✦ 𝐞𝐝𝐚𝐝 : ${edad}\n┃\n┃ ˗ˏˋ billie-bot- creator ban ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase() });
                }

                case 'perfil':
                case 'me': {
                    const u = registrados[sender];
                    const r = (JSON.parse(fs.readFileSync(`${databaseDir}/peep_rpg.json`, "utf-8")))[chatId]?.[sender] || { viaje: 0, rango: "ojos de océano", lagrimas: 0, inventario: [] };
                    const perfilTexto = `╭━━━━ ⟡ 𝐛𝐢𝐥𝐥𝐢𝐞 𝐜𝐚𝐫𝐝 ⟡ ━━━━\n┃\n┃ ✦ 𝐧𝐨𝐦𝐛𝐫𝐞 : ${u.nombre}\n┃ ✦ 𝐞𝐝𝐚𝐝 : ${u.edad}\n┃ ✦ 𝐢𝐧𝐬𝐨𝐦𝐧𝐢𝐨 : 𝐧𝐢𝐯𝐞𝐥 ${r.viaje}\n┃ ✦ 𝐟𝐚𝐬𝐞 : [ ${r.rango} ]\n┃ ✦ 𝐥𝐚𝐠𝐫𝐢𝐦𝐚𝐬 : ${r.lagrimas}\n┃\n┃ ˗ˏˋ billie-bot- creator ban ˎˊ˗\n╰━━━━━━━━━━━━━━━━━━━━━━━`.toLowerCase();
                    const randomImg = peepPics[Math.floor(Math.random() * peepPics.length)];
                    return await sock.sendMessage(chatId, { image: { url: randomImg }, caption: perfilTexto, mentions: [sender] }, { quoted: msg });
                }

                case 'antilink':
                case 'antiinsultos':
                case 'rpg':
                case 'autochat': {
                    if (!isOwner(sender.split("@")[0])) return;
                    const modo = argsArray[0]?.toLowerCase();
                    if (!["on", "off"].includes(modo)) return sock.sendMessage(chatId, { text: "✦ usa on/off" });
                    const activos = JSON.parse(fs.readFileSync("./activos.json", "utf-8"));
                    if (!activos[cmdLower]) activos[cmdLower] = {};
                    modo === 'on' ? activos[cmdLower][chatId] = true : delete activos[cmdLower][chatId];
                    fs.writeFileSync("./activos.json", JSON.stringify(activos, null, 2));
                    return sock.sendMessage(chatId, { text: `✦ [ ${cmdLower} ] ${modo === 'on' ? 'activado' : 'desactivado'} .` });
                }
            }
        } catch (e) { console.error(e); }
    });

    sock.ev.on("connection.update", (u) => { 
        if (u.connection === "open") console.log(chalk.green.bold("✦ billie online ✦"));
        if (u.connection === "close") startBot(); 
    });
}
startBot();
