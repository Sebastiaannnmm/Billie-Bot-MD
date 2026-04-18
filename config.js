const fs = require("fs");
const chalk = require("chalk");

// 📂 Ruta del archivo de configuración (Persistencia de prefijo)
const configFilePath = "./config.json";

// 🔹 Si `config.json` no existe, crearlo con el prefijo por defecto
if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify({ prefix: "." }, null, 2));
}

// 🔹 Leer configuración desde `config.json`
const config = JSON.parse(fs.readFileSync(configFilePath, "utf-8"));

// 🔥 IDENTIDAD LIL PEEP
global.botname = "♱ LIL PEEP BOT ♱"; 
global.peepImg = "https://cdn.russellxz.click/a4d709b4.jpeg";

// 🔥 Prefijo global desde archivo de configuración
global.prefix = config.prefix || ".";

// Lista de Owners (Toda tu lista intacta)
global.owner = [
    ["15167096032", "Owner", true],
    ["115724051816605"],
    ["595975740803"],
    ["595986172767"],
    ["507660673766"],
    ["50768888457"],
    ["584125778026"],
    ["5492266613038"],
    ["5841235520"],
    ["573242402359"],
    ["5217294888993"],
    ["5214437863111"],
    ["51906662557"],
    ["50582340051"],
    ["5217441298510"],
    ["5491155983299"],
    ["5493795319022"],
    ["5217821153974"],
    ["584163393168"],
    ["16475584916"],
    ["5216865268215"],
    ["5215639850287"],
    ["15167096032"],
    ["525639850287"],
    ["573117767495"] // Tu número actual
];

// ✅ Lista de prefijos permitidos
global.allowedPrefixes = [
    ".", "!", "#", "?", "-", "+", "*", "~", "$", "&", "%", "=", "🔥", "💀", "✅", "🥰",
    "💎", "🐱", "🐶", "🌟", "🎃", "🌸", "🪼", "🍑", "🛠️", "📌", "⚡", "🚀", "👀", "💡", "💣", "💯", "😎", "☠️", "👾"
];

global.modoPrivado = false; 

// 🔍 Función para verificar si un usuario es Owner (Mejorada para evitar errores)
global.isOwner = (user) => {
    if (!user) return false;
    const number = user.split('@')[0].replace(/[^0-9]/g, ""); 
    return global.owner.some(owner => owner[0] === number);
};

// ⚙️ Función para cambiar el prefijo
global.setPrefix = (newPrefix) => {
    if (global.allowedPrefixes.includes(newPrefix)) {
        global.prefix = newPrefix;
        config.prefix = newPrefix; 
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2)); 
        console.log(chalk.green(`✅ Prefijo cambiado a: ${chalk.yellow.bold(newPrefix)}`));
    }
};

// Listas de Verdad y Reto
global.verdad = ["¿Alguna vez te ha gustado alguien?", "¿Qué es lo más loco que has hecho por amor?"];
global.reto = ["Comer 2 cucharadas de arroz", "Envía una captura de tu historial de búsqueda"];

global.ch = {
    ch1: '120363266665814365@newsletter', 
    ch2: '120363301598733462@newsletter', 
};

// Exportamos todo correctamente
module.exports = { 
    isOwner: global.isOwner, 
    setPrefix: global.setPrefix, 
    allowedPrefixes: global.allowedPrefixes,
    owner: global.owner
};
