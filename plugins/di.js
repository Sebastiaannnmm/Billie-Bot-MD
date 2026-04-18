const axios = require('axios');
const googleTTS = require('google-tts-api');

const handler = async (msg, { conn, text }) => {
    const chatId = msg.key.remoteJid;
    if (!text) return; // Ni respondemos si no hay texto para no perder tiempo

    try {
        // Generar URL de Google (esto es instantáneo)
        const url = googleTTS.getAudioUrl(text, {
            lang: 'es',
            slow: false,
            host: 'https://translate.google.com',
        });

        // Descargar directamente a la memoria RAM (Buffer)
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer', // ⟡ MAGIA : No guarda archivos, usa la RAM
        });

        const audioBuffer = Buffer.from(response.data);

        // Enviar de inmediato
        await conn.sendMessage(chatId, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg', 
            ptt: false 
        }, { quoted: msg });

    } catch (error) {
        console.error("Error en TTS rápido:", error);
    }
};

handler.command = ['di', 'habla', 'say'];
module.exports = handler;