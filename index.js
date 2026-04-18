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
const peepPics = [
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%201.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%202.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/main/lil%20pep%203.jpg",
    "https://raw.githubusercontent.com/Sebastiaannnmm/mis-imagenes/f37d092d0043e8a7128da59f7bd6e4c94a8ead0e/lil%20pep%206.jpg"
];

const insultosMortal = ["idiota", "imbecil", "hdp", "puta", "mierda", "pendejo", "gonorrea", "malparido"];

const fasesRPG = [
    { nivel: 0, rango: "ojos de océano", item: "ninguno", bono: 0 },
    { nivel: 1, rango: "imitador barato", item: "2 pastillas oscuras", bono: 50 }
];

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
    const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason } = await import("@whiskeysockets/baileys");
    const { state, saveCreds } = await useMultiFileAuthState("./sessions");
    
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) 
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        printQRInTerminal: false // Forzamos a que no use QR si queremos código
    });

    // --- LÓGICA DE CÓDIGO DE 8 DÍGITOS ---
    if (!sock.authState.creds.registered) {
        console.log(chalk.red.bold("\n✦ el abismo pide tu número ."));
        let numero = await question(chalk.cyan("✦ escribe tu número con código de país (ej: 52449...) :\n> "));
        numero = numero.replace(/[^0-9]/g, '');
        
        if (numero.length < 10) {
            console.log(chalk.red("✦ número inválido . reinicia el bot ."));
            process.exit();
        }

        try {
            let code = await sock.requestPairingCode(numero);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.white.bgRed.bold(`\n TU CÓDIGO DE VINCULACIÓN ES : `) + chalk.black.bgWhite.bold(` ${code} `));
            console.log(chalk.green("✦ ponlo en tu whatsapp ahora mismo .\n"));
        } catch (error) {
            console.log(chalk.red("✦ error al pedir el código . prueba de nuevo en 5 minutos ."));
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === "open") {
            console.log(chalk.green.bold("\n✦ billie online - la pesadilla ha comenzado ✦\n"));
        }
        if (connection === "close") {
            let reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log(chalk.yellow("✦ conexión perdida , reintentando . . ."));
                startBot();
            } else {
                console.log(chalk.red("✦ sesión cerrada . borra la carpeta sessions y reinicia ."));
            }
        }
    });

    // --- MANEJO DE MENSAJES ---
    sock.ev.on("messages.upsert", async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            const chatId = msg.key.remoteJid;
            const messageText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "");
            const lowerText = messageText.toLowerCase().trim();

            if (lowerText.startsWith(".")) {
                const command = lowerText.slice(1).split(" ")[0];
                if (command === "ping") {
                    await sock.sendMessage(chatId, { text: "✦ estoy viva . . ." });
                }
            }
        } catch (e) { console.error(e); }
    });
}

startBot();
