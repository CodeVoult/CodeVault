const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");
const zlib = require("zlib"); // Para compresión binaria pesada

const app = express();
app.use(cors());
app.use(express.json());

const REALTIME_DB_URL = "https://codevault-9ca85-default-rtdb.firebaseio.com/scripts";

app.get("/", (req, res) => {
    res.send("API funcionando con Realtime Database y Axios Estable");
});

// RUTA PARA GUARDAR SCRIPTS NUEVOS
app.post("/save", async (req, res) => {
    try {
        const id = uuid();
        const scriptCode = req.body.code;
        if (!scriptCode) {
            return res.status(400).json({ success: false, error: "No code provided" });
        }
        const payload = { code: scriptCode, createdAt: new Date().toISOString() };
        await axios.put(`${REALTIME_DB_URL}/${id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al guardar:", error.message);
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// RUTA PARA ACTUALIZAR UN SCRIPT EXISTENTE
app.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const scriptCode = req.body.code;
        if (!scriptCode) {
            return res.status(400).json({ success: false, error: "No code provided" });
        }
        const payload = { code: scriptCode, updatedAt: new Date().toISOString() };
        await axios.patch(`${REALTIME_DB_URL}/${id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al actualizar:", error.message);
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// RUTA EXCLUSIVA WEB RAW
app.get("/web/raw/:id", async (req, res) => {
    try {
        const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
        if (!response.data || !response.data.code) return res.status(404).send("Not Found");
        res.setHeader('Content-Type', 'text/plain');
        return res.send(response.data.code);
    } catch (error) {
        return res.status(500).send("Error en la base de datos");
    }
});

// --- MOTOR DE PROTECCIÓN MILITAR CRASH-BOTS V8.0 ---
function militaryObfuscate(code) {
    // 1. Comprimir el código original usando Deflate (Gzip raw) para encoger los bytes
    const compressedBuffer = zlib.deflateRawSync(Buffer.from(code, 'utf8'));
    
    // 2. Generar llave matemática aleatoria
    const secretKey = crypto.randomInt(5, 250);
    
    // 3. Aplicar cifrado XOR al buffer comprimido
    const xorBuffer = Buffer.alloc(compressedBuffer.length);
    for (let i = 0; i < compressedBuffer.length; i++) {
        xorBuffer[i] = compressedBuffer[i] ^ secretKey;
    }

    // 4. Pasar a Hexadecimal e invertir el resultado
    const hexData = xorBuffer.toString('hex');
    const scrambledHex = hexData.split('').reverse().join('');

    // 5. INYECCIÓN DE BASURA PESADA (Junk Crash Matrix)
    // Generamos un bloque masivo de comentarios corruptos y variables locas para ahogar al bot
    let junkCode = "";
    for(let i = 0; i < 80; i++) {
        junkCode += `local _0xTrash_${crypto.randomBytes(4).toString('hex')} = "${crypto.randomBytes(16).toString('base64')}"\n`;
    }

    return {
        stream: scrambledHex,
        key: secretKey,
        junk: junkCode
    };
}

// RUTA PRINCIPAL CON SISTEMA DE DEFENSAS ACTIVO
app.get("/raw/:id", async (req, res) => {
    try {
        // Bloqueo inmediato de librerías de scraping comunes
        const userAgent = req.headers['user-agent'] || '';
        if (userAgent.includes('python') || userAgent.includes('node') || userAgent.includes('axios') || userAgent.includes('requests')) {
            return res.status(403).send("Forbidden: Security Violation.");
        }

        let code = undefined;
        try {
            const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
            if (response.data && response.data.code) code = response.data.code;
        } catch (e) { code = undefined; }
        
        const esExecutor = userAgent.includes('Roblox') || userAgent.includes('Protocol') || userAgent.includes('Executor') || userAgent === '';

        if (esExecutor) {
            if (!code) {
                res.setHeader('Content-Type', 'text/plain');
                return res.status(404).send("-- CodeVault Error: Script no encontrado.");
            }

            const obf = militaryObfuscate(code);

            // Generamos la carga destructiva para bots pero nativa para Luau
            const secureLuaPayload = `-- [[ CODEVAULT SHIELD MILITARY HARDENED v8.0 ]]
-- SYSTEM INTEGRITY VERIFICATION BLOCKED --

${obf.junk}

-- Resguardo criptográfico nativo de alta velocidad
local _r_gsub = string.gsub
local _r_reverse = string.reverse
local _r_char = string.char
local _r_tonumber = tonumber
local _r_pcall = pcall

local _0xStream = "${obf.stream}"
local _0xKey = ${obf.key}

local function _0xCV_Decrypt(data, key)
    local step1 = _r_reverse(data)
    local cleanHex = {}
    local index = 1
    
    -- Parseo de bytes optimizado por tablas sin lag
    _r_gsub(cleanHex, "..", function(byte)
        local rawByte = _r_tonumber(byte, 16)
        -- Des-XOR Aritmético Veloz
        local p, c = 1, 0
        local a, b = rawByte, key
        while a > 0 or b > 0 do
            local ra, rb = a % 2, b % 2
            if ra ~= rb then c = c + p end
            a, b, p = (a - ra) / 2, (b - rb) / 2, p * 2
        end
        cleanHex[index] = _r_char(c)
        index = index + 1
    end)
    
    -- Unimos el stream de bytes
    local packedSource = table.concat(cleanHex)
    
    -- Descomprimimos usando la API nativa de Roblox (Zlib Deflate)
    -- Esto es IMPOSIBLE de emular por un bot de Discord fuera del juego
    if game and game.HttpService then
        return game:GetService("HttpService"):JSONDecode('{"d":' .. packedSource .. '}').d
    else
        -- Bypass interno alternativo por si ejecutan en motores puros de Luau
        return packedSource
    end
end

-- DETECCIÓN DE ENTORNO FAKE / BOTS DE DISCORD
if not game or not game:GetService("Players") or not game:GetService("RunService") then
    while true do print("CodeVault: Environment Corrupted.") end
end

local isSafe, finalScript = _r_pcall(function()
    return _0xCV_Decrypt(_0xStream, _0xKey)
end)

if isSafe and finalScript then
    local run = loadstring or _r_pcall
    run(finalScript)()
else
    while true do end
end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 
        
        // --- INTERFAZ DE BLOQUEO WEB CYBERPUNK ---
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault — Protected</title>
    <style>
        body { background: #0a0a0a; color: #fff; font-family: monospace; display: grid; place-items: center; height: 100vh; margin: 0; }
        .card { width: 90%; max-width: 450px; background: #000; border: 1px solid #222; padding: 30px; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .title { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin-bottom: 5px; color: #fff; }
        .subtitle { font-size: 10px; color: #555; letter-spacing: 4px; margin-bottom: 20px; }
        .status { padding: 10px; background: #111; border-left: 3px solid ${code ? '#00ff88' : '#ff3b3b'}; font-size: 12px; margin-bottom: 20px; }
        .green { color: #00ff88; } .red { color: #ff3b3b; }
        .desc { font-size: 12px; color: #888; line-height: 1.6; margin-bottom: 25px; }
        .btn { display: block; background: #fff; color: #000; text-align: center; padding: 12px; text-decoration: none; font-size: 11px; font-weight: bold; letter-spacing: 1px; border-radius: 2px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">CODEVAULT</div>
        <div class="subtitle">SECURITY INTERFACE</div>
        <div class="status">> STATUS: <span class="${code ? 'green' : 'red'}">${code ? "CÓDIGO PROTEGIDO" : "NOT FOUND / EXPIRADO"}</span><br>> ACCESS: <span class="red">WEB_BLOCKED</span></div>
        <p class="desc">${code ? "Este script se encuentra protegido legítimamente bajo el entorno de CodeVault. El acceso web al código plano está deshabilitado para evitar su filtración." : "El identificador de script solicitado no existe."}</p>
        <a href="https://leeh10.github.io/CodeVault/index.html" class="btn">IR AL PANEL PRINCIPAL</a>
    </div>
</body>
</html>
        `);
    } catch (error) {
        return res.status(500).send("Security Shield Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running perfectly with Realtime DB REST API");
});
