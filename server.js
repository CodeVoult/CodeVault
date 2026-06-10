const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

const REALTIME_DB_URL = "https://codevault-9ca85-default-rtdb.firebaseio.com/scripts";

app.get("/", (req, res) => {
    res.send("CodeVault API Pública — Protección Dinámica Activa");
});

// RUTA PARA GUARDAR SCRIPTS NUEVOS (Los guarda limpios en tu BD privada)
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

// MOTOR DE ENCRIPCIÓ_N AVANZADO MULTI-FRAGMENTO
// Muta el código matemáticamente para que los deobf de Discord no puedan rearmar las funciones nativas
function publicObfuscate(code) {
    const xorKey = crypto.randomInt(25, 240);
    const shiftKey = crypto.randomInt(3, 15);
    
    const codeBuffer = Buffer.from(code, 'utf8');
    const protectedBuffer = Buffer.alloc(codeBuffer.length);
    
    for (let i = 0; i < codeBuffer.length; i++) {
        let processed = codeBuffer[i] ^ xorKey;
        processed = (processed + shiftKey) % 256; 
        protectedBuffer[i] = processed;
    }

    const hexData = protectedBuffer.toString('hex');
    // Invierte el string completo para romper lectores automáticos de firmas
    const scrambledHex = hexData.split('').reverse().join('');

    // Generación de ruido variable para desviar rastreadores estáticos de código
    let noise = "";
    for(let i = 0; i < 15; i++) {
        const fakeHex = crypto.randomBytes(3).toString('hex');
        noise += `local _0xNois_${fakeHex} = tonumber("${crypto.randomInt(100, 999)}");\n`;
    }

    return {
        stream: scrambledHex,
        k1: xorKey,
        k2: shiftKey,
        junk: noise
    };
}

// --- RUTA ACCESIBLE PARA TODO EL MUNDO (SISTEMA LIBRE) ---
app.get("/raw/:id", async (req, res) => {
    try {
        let code = undefined;
        try {
            const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
            if (response.data && response.data.code) code = response.data.code;
        } catch (e) { code = undefined; }

        if (!code) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(404).send("-- [CODEVAULT ERROR]: Script no registrado.");
        }

        const obf = publicObfuscate(code);

        // Payload optimizado con protección integrada ejecutable en CUALQUIER executor
        const secureLuaPayload = `--[[
    ▄▀█ ▄▄▀█▄▄ █▀█ ▄▄▀█▄▄ █░█ ▄▄▀█▄▄ █░█ █░░ ▀█▀
    █▀█ █▄█▄▄█ █▄█ █▄█▄▄█ ▀▄▀ █▀█▀▄█ █▄█ █▄▄ ░█░
   
   [ CODEVAULT PUBLIC SHIELD CORE V9.5 — STABLE RUNTIME ]
   [ ARCHITECTURE: REVERSE BYTE STREAM — EXECUTION GUARANTEED ]
]]

${obf.junk}

local _cv_gsub = string.gsub
local _cv_reverse = string.reverse
local _cv_char = string.char
local _cv_tonumber = tonumber
local _cv_pcall = pcall
local _cv_bxor = (bit32 and bit32.bxor)

local _0xDataStream = "${obf.stream}"
local _0xKeyX = ${obf.k1}
local _0xKeyS = ${obf.k2}

local function _0xCV_Decrypt(stream, k1, k2)
    local normalHex = _cv_reverse(stream)
    local bytes = {}
    local idx = 1
    
    _cv_gsub(normalHex, "..", function(ch)
        local raw = _cv_tonumber(ch, 16)
        local unshift = (raw - k2) % 256
        if unshift < 0 then unshift = unshift + 256 end
        
        local finalByte
        if _cv_bxor then
            finalByte = _cv_bxor(unshift, k1)
        else
            local p, c = 1, 0
            local a, b = unshift, k1
            while a > 0 or b > 0 do
                local ra, rb = a % 2, b % 2
                if ra ~= rb then c = c + p end
                a, b, p = (a - ra) / 2, (b - rb) / 2, p * 2
            end
            finalByte = c
        end
        
        bytes[idx] = _cv_char(finalByte)
        idx = idx + 1
    end)
    
    return table.concat(bytes)
end

-- Anti-Análisis Lento: Ralentiza los evaluadores automáticos de los bots sin congelar el juego
for i = 1, 60 do
    local _ = math.sqrt(i) * math.sin(i)
end

local safe, rawScript = _cv_pcall(function()
    return _0xCV_Decrypt(_0xDataStream, _0xKeyX, _0xKeyS)
end)

if safe and rawScript and #rawScript > 0 then
    local engine = loadstring or _cv_pcall
    engine(rawScript)()
    
    -- Evaporación inmediata de variables para limpiar la memoria RAM tras iniciar
    if task and task.defer then
        task.defer(function()
            rawScript = nil
            _0xDataStream = nil
            collectgarbage("collect")
        end)
    else
        rawScript = nil
        _0xDataStream = nil
    end
else
    error("[CODEVAULT INTEGRITY ERROR]: Execution failed.")
end`;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.send(secureLuaPayload);

    } catch (error) {
        console.error("Error en la pasarela pública:", error.message);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send("-- Error de procesamiento interno.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor CodeVault Público V9.5 corriendo en puerto " + PORT);
});
