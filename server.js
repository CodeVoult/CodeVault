const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const crypto = require("crypto"); // Para generar llaves aleatorias

const app = express();
app.use(cors());
app.use(express.json());

const REALTIME_DB_URL = "https://codevault-9ca85-default-rtdb.firebaseio.com/scripts";

// --- MOTOR DE OFUSCACIÓN AVANZADA ---
function ultraObfuscate(code) {
    // 1. Generar una llave aleatoria para esta sesión
    const secretKey = crypto.randomBytes(8).toString('hex');
    
    // 2. Cifrado XOR simple pero efectivo
    let xorCoded = "";
    for (let i = 0; i < code.length; i++) {
        xorCoded += String.fromCharCode(code.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length));
    }

    // 3. Convertir a Base64 para evitar caracteres extraños y luego invertir
    const base64 = Buffer.from(xorCoded).toString('base64');
    const scrambled = base64.split('').reverse().join('');

    // 4. Inyectar basura (Junk Data) para confundir bots de análisis
    const junk = crypto.randomBytes(16).toString('hex');
    return { data: scrambled, key: secretKey, junk: junk };
}

// ... (Tus rutas /save y /update se mantienen igual)

app.get("/raw/:id", async (req, res) => {
    try {
        const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
        if (!response || !response.data) return res.status(404).send("Invalid ID");

        const code = response.data.code;
        const userAgent = req.headers['user-agent'] || '';
        const esExecutor = userAgent.includes('Roblox') || userAgent.includes('Executor') || userAgent === '';

        if (esExecutor) {
            const obfuscated = ultraObfuscate(code);

            // Payload de LUA con protección de ambiente y marca de agua profesional
            const secureLuaPayload = `
--[[
    █▀▀ █▀█ █▀▄ █▀▀ █░█ ▄▀█ █░█ █░░ ▀█▀
    █▄▄ █▄█ █▄▀ ██▄ ▀▄▀ █▀█ █▄█ █▄▄ ░█░
    SECURITY SYSTEM V7.0 - PROTECTED BY CODEVAULT
    UNAUTHORIZED ACCESS WILL TERMINATE EXECUTION
]]

local _v = {
    ["s"] = "${obfuscated.data}",
    ["k"] = "${obfuscated.key}",
    ["j"] = "${obfuscated.junk}"
}

local _raw = {
    ["b"] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    ["char"] = string.char,
    ["byte"] = string.byte,
    ["sub"] = string.sub,
    ["rev"] = string.reverse
}

-- Decodificador Base64 Interno (Hardened)
local function _db64(data)
    local b = _raw.b
    data = _raw.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r, f = '', (b:find(x) - 1)
        for i = 6, 1, -1 do r = r .. (f % 2^i - f % 2^(i - 1) > 0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d%d%d%d%d%d', function(x)
        return _raw.char(tonumber(x, 2))
    end))
end

local function _vaultPipeline(stream, key)
    -- Paso 1: Reversa y Limpieza
    local _s = _raw.rev(stream)
    local _decoded = _db64(_s)
    
    -- Paso 2: Des-XOR dinámico
    local _output = ""
    for i = 1, #_decoded do
        local _char = _raw.byte(_decoded, i)
        local _k = _raw.byte(key, (i - 1) % #key + 1)
        _output = _output .. _raw.char(_raw.bxor(_char, _k))
    end
    return _output
end

-- ANTI-TAMPER: Verificación de Integridad de Globales
if (not bit32 or not getfenv) then while true do end end

local _0xStatus, _0xSource = pcall(function()
    return _vaultPipeline(_v.s, _v.k)
end)

if _0xStatus and _0xSource then
    local _exec = loadstring(_0xSource)
    if _exec then
        _exec()
    else
        warn("[CODEVAULT]: Integrity breach detected.")
    end
else
    while true do end
end
`.trim();

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        }

        // --- VISTA WEB (BLOQUEADA) ---
        return res.send(\`
            <html>
                <body style="background:#050505; color:red; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh;">
                    <div style="border:1px solid red; padding:20px; text-align:center;">
                        <h1>CODEVAULT V7 ENCRYPTED</h1>
                        <p>Solo los ejecutores autorizados pueden procesar este flujo.</p>
                        <p style="color:#555; font-size:10px;">ID: ${req.params.id}</p>
                    </div>
                </body>
            </html>
        \`);
    } catch (error) {
        res.status(500).send("Security Shield Error");
    }
});
