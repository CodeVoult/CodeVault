const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");

const app = express();

app.use(cors());

app.use(express.json({
    limit: "100mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "100mb"
}));

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

// --- MOTOR DE OFUSCACIÓN MILITAR CODEVAULT V12 (MUTILACIÓN DE BUFFER + VIRTUALIZACIÓN) ---
function militaryObfuscate(code) {
    const xorKey = crypto.randomInt(25, 225);
    const shiftKey = crypto.randomInt(7, 17);
    
    const codeBuffer = Buffer.from(code, 'utf8');
    const protectedBuffer = Buffer.alloc(codeBuffer.length);
    
    for (let i = 0; i < codeBuffer.length; i++) {
        let processed = codeBuffer[i] ^ xorKey;
        processed = (processed + shiftKey) % 256; 
        protectedBuffer[i] = processed;
    }

    const hexData = protectedBuffer.toString('hex');
    const scrambledHex = hexData.split('').reverse().join('');

    // --- SEGMENTACIÓN Y DESORDENAMIENTO DE CADENA (MÉTODO SPEEDDRAW) ---
    const size = Math.ceil(scrambledHex.length / 4);
    const p1 = scrambledHex.substring(0, size) || "0";
    const p2 = scrambledHex.substring(size, size * 2) || "0";
    const p3 = scrambledHex.substring(size * 2, size * 3) || "0";
    const p4 = scrambledHex.substring(size * 3) || "0";

    // Generador de identificadores polimórficos aleatorios
    const randomVar = () => `_0xCV_${crypto.randomBytes(4).toString('hex')}`;
    
    const vStream = randomVar();
    const vXor = randomVar();
    const vShift = randomVar();
    const vPipeline = randomVar();
    const vDict = randomVar(); 
    const vCheck = randomVar();

    let junkCode = "";
    for(let i = 0; i < 15; i++) {
        const fakeHex = crypto.randomBytes(4).toString('hex');
        junkCode += `local _0xErr_${fakeHex} = function() return "${crypto.randomBytes(5).toString('base64')}" end;\n`;
    }

    // Ofuscación polinómica de valores de control
    const obfNumber = (num) => {
        const multiplier = crypto.randomInt(4, 8);
        const adder = crypto.randomInt(60, 400);
        return `(((${num} * ${multiplier}) + ${adder} - ${adder}) / ${multiplier})`;
    };

    return {
        parts: [p3, p1, p4, p2], // Se envían cruzados desde el backend
        xorValue: obfNumber(xorKey),
        shiftValue: obfNumber(shiftKey),
        names: { vStream, vXor, vShift, vPipeline, vDict, vCheck },
        junk: junkCode
    };
}

// RUTA PRINCIPAL CON PARSEO ANTI-SANDBOX INTEGRADO Y CIERRES COMPLETOS
app.get("/raw/:id", async (req, res) => {
    try {
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
            const { vStream, vXor, vShift, vPipeline, vDict, vCheck } = obf.names;

            const secureLuaPayload = `--[[
    ▄▀█ ▄▄▀█▄▄ █▀█ ▄▄▀█▄▄ █░█ ▄▄▀█▄▄ █░█ █░░ ▀█▀
    █▀█ █▄█▄▄█ █▄█ █▄█▄▄█ ▀▄▀ █▀█▀▄█ █▄█ █▄▄ ░█░
   
   [ PREMIUM MILITARY SHIELD V12.0 — BRANDING: CODEVAULT ]
   [ IMMORTAL LAYER: ANTI-EMULATION PIPELINE & BUFFER MUTILATION ]
]]

${obf.junk}

-- Diccionario virtualizado aleatorio para ocultar llamadas nativas
local ${vDict} = {
    [1] = string.reverse,
    [2] = string.gsub,
    [3] = tonumber,
    [4] = string.char,
    [5] = table.concat,
    [6] = pcall,
    [7] = (bit32 and bit32.bxor)
}

-- Trampa Anti-Emulación Avanzada (Invalida herramientas tipo .l3)
local function ${vCheck}()
    local valid = true
    if not game or not game.IsA then valid = false end
    
    local success, _ = ${vDict}[6](function()
        return game:GetService("UserInputService")
    end)
    if not success then valid = false end
    return valid
end

if not ${vCheck}() then
    while true do 
        local _ = math.sin(1)
    end
end

-- Captura de segmentos corruptos desordenados
local _pA = "${obf.parts[0]}"
local _pB = "${obf.parts[1]}"
local _pC = "${obf.parts[2]}"
local _pD = "${obf.parts[3]}"

-- Reensamblado matemático de la cadena en el orden correcto en tiempo de ejecución
local ${vStream} = _pB .. _pD .. _pA .. _pC

local ${vXor} = ${obf.xorValue}
local ${vShift} = ${obf.shiftValue}

local function ${vPipeline}(stream, k1, k2)
    local normalHex = ${vDict}[1](stream)
    local cleanBytes = {}
    local index = 1
    
    ${vDict}[2](normalHex, "..", function(byte)
        local rawByte = ${vDict}[3](byte, 16)
        local unshifted = (rawByte - k2) % 256
        if unshifted < 0 then unshifted = unshifted + 256 end
        
        local decryptedByte
        if ${vDict}[7] then
            decryptedByte = ${vDict}[7](unshifted, k1)
        else
            local p, c = 1, 0
            local a, b = unshifted, k1
            while a > 0 or b > 0 do
                local ra, rb = a % 2, b % 2
                if ra ~= rb then c = c + p end
                a, b, p = (a - ra) / 2, (b - rb) / 2, p * 2
            end
            decryptedByte = c
        end
        
        cleanBytes[index] = ${vDict}[4](decryptedByte)
        index = index + 1
    end)
    
    return ${vDict}[5](cleanBytes)
end

local isExecutionSafe, runtimeScript = ${vDict}[6](function()
    return ${vPipeline}(${vStream}, ${vXor}, ${vShift})
end)

if isExecutionSafe and runtimeScript and #runtimeScript > 0 then
    local run = loadstring or ${vDict}[6]
    if loadstring then
        loadstring(runtimeScript)()
    else
        run(runtimeScript)()
    end
    
    if task and task.defer then
        task.defer(function()
            runtimeScript = string.rep("\\0", #runtimeScript)
            runtimeScript = nil
            collectgarbage("collect")
        end)
    else
        runtimeScript = nil
    end
else
    warn("[CODEVAULT]: Integrity breach detected.")
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
        console.error("Error en escudo:", error.message);
        return res.status(500).send("Security Shield Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running perfectly with Realtime DB REST API and V12 Protection");
});
