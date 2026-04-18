const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

// ⟡ AUTO-INSTALADOR DE DEPENDENCIAS (MAGIA NEGRA) ⟡
let webpmux;
try {
    webpmux = require('node-webpmux');
} catch (e) {
    console.log("✦ instalando inyector de nombres para stickers... no toques nada.");
    execSync('npm install node-webpmux');
    webpmux = require('node-webpmux');
}

const handler = async (msg, { conn, command, usedPrefix }) => {
    const chatId = msg.key.remoteJid;
    
    try {
        const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        const imageMsg = isQuoted?.imageMessage || msg.message?.imageMessage || isQuoted?.viewOnceMessageV2?.message?.imageMessage || msg.message?.viewOnceMessageV2?.message?.imageMessage;
        const videoMsg = isQuoted?.videoMessage || msg.message?.videoMessage;
        
        const mediaNode = imageMsg || videoMsg;
        const type = imageMsg ? 'image' : (videoMsg ? 'video' : null);

        if (!mediaNode || !type) {
            return conn.sendMessage(chatId, { text: `✦ ¿y la imagen ? responde a una foto o video corto usando : ${usedPrefix}${command} , idiota .` }, { quoted: msg });
        }

        await conn.sendMessage(chatId, { react: { text: "✦", key: msg.key } });

        // Descargar usando la función global de tu index
        const buffer = await global.downloadMedia(mediaNode, type);

        // Preparar el terreno
        const tmpDir = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const isAnimated = type === 'video';
        const ext = isAnimated ? 'mp4' : 'jpg';
        const inputName = path.join(tmpDir, `temp_stk_${Date.now()}.${ext}`);
        const outputName = path.join(tmpDir, `temp_stk_${Date.now()}.webp`);

        fs.writeFileSync(inputName, buffer);

        // FFMPEG rápido y estable
        const ffmpegCommand = isAnimated 
            ? `ffmpeg -i "${inputName}" -vcodec libwebp -filter:v fps=fps=15 -lossless 0 -loop 0 -preset default -an -vsync 0 -s 512:512 "${outputName}"`
            : `ffmpeg -i "${inputName}" -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 "${outputName}"`;

        exec(ffmpegCommand, async (err) => {
            if (!err) {
                // ⟡ INYECTANDO EL NOMBRE CON NODE-WEBPMUX ⟡
                try {
                    const img = new webpmux.Image();
                    await img.load(outputName);
                    
                    const packname = "billie-bot";
                    const author = "ban que rico estas";
                    const json = { 
                        "sticker-pack-id": "billie-bot-id", 
                        "sticker-pack-name": packname, 
                        "sticker-pack-publisher": author, 
                        "emojis": ["✦"] 
                    };
                    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
                    const exif = Buffer.concat([exifAttr, jsonBuff]);
                    exif.writeUIntLE(jsonBuff.length, 14, 4);

                    img.exif = exif;
                    await img.save(outputName);
                } catch (exifError) {
                    console.error("Error inyectando EXIF:", exifError);
                }

                // Enviar sticker final
                await conn.sendMessage(chatId, { sticker: fs.readFileSync(outputName) }, { quoted: msg });
            } else {
                console.error("Error FFMPEG:", err);
                await conn.sendMessage(chatId, { text: "✦ la basura que enviaste rompió mi sistema . ffmpeg no pudo procesarlo ." }, { quoted: msg });
            }
            
            // Limpieza total
            if (fs.existsSync(inputName)) fs.unlinkSync(inputName);
            if (fs.existsSync(outputName)) fs.unlinkSync(outputName);
        });

    } catch (error) {
        console.error("error fatal en crear_sticker.js:", error);
        conn.sendMessage(chatId, { text: `✦ error en el vacío . mi sistema colapsó .` }, { quoted: msg });
    }
};

handler.command = ['s', 'sticker', 'stiker'];
module.exports = handler;