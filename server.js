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

// --- MOTOR DE OFUSCACIÓN MILITAR CODEVAULT V14 (QUANTUM FEEDBACK PIPELINE) ---
function quantumObfuscate(code) {
    const primaryKey = crypto.randomInt(35, 220);
    const feedbackSeed = crypto.randomInt(13, 89);
    
    const codeBuffer = Buffer.from(code, 'utf8');
    const encodedArray = [];
    
    let lastByte = feedbackSeed;
    for (let i = 0; i < codeBuffer.length; i++) {
        // Cifrado encadenado: Cada byte depende del resultado anterior para romper dumps lineales
        let obfuscated = codeBuffer[i] ^ primaryKey;
        obfuscated = (obfuscated ^ lastByte) % 256;
        encodedArray.push(obfuscated);
        lastByte = obfuscated;
    }

    // Convertir el array cifrado en un formato estructurado no lineal para Luau
    const tableChunks = [];
    const chunkSize = Math.ceil(encodedArray.length / 4);
    
    for (let i = 0; i < 4; i++) {
        const start = i * chunkSize;
        const chunk = encodedArray.slice(start, start + chunkSize);
        tableChunks.push(chunk.map(b => b.toString(16).padStart(2, '0')).join(''));
    }

    const randomVar = () => `_0xQ_${crypto.randomBytes(4).toString('hex')}`;
    
    const vStream = randomVar();
    const vKey = randomVar();
    const vSeed = randomVar();
    const vDecrypter = randomVar();
    const vEnv = randomVar();
    const vTrap = randomVar();

    // Generación de Honey-Tokens: Señuelos de simulación densos para confundir escáneres estáticos
    let decoyData = "";
    for(let i = 0; i < 10; i++) {
        const fakeHex = crypto.randomBytes(6).toString('hex');
        decoyData += `local _0xDecoy_${fakeHex} = {${crypto.randomInt(1, 255)}, ${crypto.randomInt(1, 255)}, ${crypto.randomInt(1, 255)}};\n`;
    }

    const formatMath = (num) => {
        const factor = crypto.randomInt(3, 9);
        const offset = crypto.randomInt(50, 200);
        return `(((${num} * ${factor}) + ${offset} - ${offset}) / ${factor})`;
    };

    return {
        blocks: [tableChunks[2], tableChunks[0], tableChunks[3], tableChunks[1]], // Distribución cruzada
        k1: formatMath(primaryKey),
        k2: formatMath(feedbackSeed),
        vars: { vStream, vKey, vSeed, vDecrypter, vEnv, vTrap },
        decoys: decoyData
    };
}

// RUTA PRINCIPAL CON SISTEMA ABSOLUTE ISOLATION V14 + NUEVO DISEÑO CYBERPUNK 2.0
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

            const obf = quantumObfuscate(code);
            const { vStream, vKey, vSeed, vDecrypter, vEnv, vTrap } = obf.vars;

            const secureLuaPayload = `--[[
   ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
  ██║     ██║   ██║██║  ██║█████╗  ██║   ██║███████║██║   ██║██║     ██║   
  ██║     ██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
  ╚██████╗╚██████╔╝██████╔╝███████╗ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
   
   [ PREMIUM MILITARY SHIELD V14.0 — BRANDING: CODEVAULT QUANTUM ]
   [ METATABLE ISOLATION LAYER — CIPHER FEEDBACK PIPELINE ACTIVE ]
]]

${obf.decoys}

-- Congelación precoz y aislamiento del entorno de ejecución de Luau
local _g = getfenv and getfenv() or _G
local _s_reverse = string.reverse
local _s_gsub = string.gsub
local _s_tonumber = tonumber
local _s_char = string.char
local _t_concat = table.concat
local _pcall = pcall
local _bxor = (bit32 and bit32.bxor)

-- Mecanismo de detección anti-análisis estático y ganchos proxy
local function ${vTrap}()
    if not game or not game.IsA then return false end
    
    local targetLoad = loadstring
    if not targetLoad then return true end
    
    local suspicious = false
    _pcall(function()
        local strRepresentation = tostring(targetLoad)
        if strRepresentation:match("custom") or strRepresentation:match("hook") or strRepresentation:match("proxy") then
            suspicious = true
        end
    end)
    
    if suspicious then return false end
    
    local success, _ = _pcall(function() return game:GetService("UserInputService") end)
    return success
end

if not ${vTrap}() then
    while true do
        -- Consumo masivo de cálculo infinitesimal si se detecta un bot emulador
        local _ = math.sin(1) * math.cos(1)
    end
end

-- Re-estructuración ordenada de bloques hexadecimales desde memoria flash
local _bA = "${obf.blocks[0]}"
local _bB = "${obf.blocks[1]}"
local _bC = "${obf.blocks[2]}"
local _bD = "${obf.blocks[3]}"

local ${vStream} = _bB .. _bD .. _bA .. _bC
local ${vKey} = ${obf.k1}
local ${vSeed} = ${obf.k2}

local function ${vDecrypter}(stream, k1, seed)
    local outputBytes = {}
    local index = 1
    local lastByte = seed
    
    _s_gsub(stream, "..", function(hexChar)
        local rawByte = _s_tonumber(hexChar, 16)
        
        -- Descifrado simétrico encadenado por retroalimentación cuántica
        local intermediate = rawByte
        if _bxor then
            intermediate = _bxor(intermediate, lastByte)
            intermediate = _bxor(intermediate, k1)
        else
            -- Implementación manual de compuerta lógica XOR para entornos Luau restringidos
            local function manualXOR(a, b)
                local p, c = 1, 0
                while a > 0 or b > 0 do
                    local ra, rb = a % 2, b % 2
                    if ra ~= rb then c = c + p end
                    a, b, p = (a - ra) / 2, (b - rb) / 2, p * 2
                end
                return c
            end
            intermediate = manualXOR(intermediate, lastByte)
            intermediate = manualXOR(intermediate, k1)
        end
        
        outputBytes[index] = _s_char(intermediate)
        lastByte = rawByte
        index = index + 1
    end)
    
    return _t_concat(outputBytes)
end

local isIntegritySecure, transparentCode = _pcall(function()
    return ${vDecrypter}(${vStream}, ${vKey}, ${vSeed})
end)

if isIntegritySecure and transparentCode and #transparentCode > 0 then
    local engine = loadstring or _g.loadstring
    if engine then
        engine(transparentCode)()
    else
        error("[CODEVAULT]: Vital engine component failure.")
    }
    
    -- Destrucción atómica instantánea de trazas en el recolector de basura de Luau
    transparentCode = nil
    ${vStream} = nil
    
    if _g.collectgarbage then
        _g.collectgarbage("collect")
    end
else
    warn("[CODEVAULT]: Structural integrity violation detected.")
end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 
        
        // --- INTERFAZ DE BLOQUEO WEB CYBERPUNK 2.0 (ULTRA-GLOW LUXURY STYLE) ---
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault — Secure Core</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            background-color: #030303; 
            color: #ffffff; 
            font-family: 'SF Pro Display', '-apple-system', 'Segoe UI', monospace; 
            display: grid; 
            place-items: center; 
            height: 100vh; 
            margin: 0;
            background-image: radial-gradient(circle at 50% 50%, #0a0e17 0%, #020202 100%);
        }
        .card { 
            width: 92%; 
            max-width: 440px; 
            background: rgba(5, 5, 8, 0.95); 
            border: 1px solid rgba(255, 255, 255, 0.04); 
            padding: 35px; 
            border-radius: 16px; 
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 110, 255, 0.02);
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, ${code ? '#00ffaa' : '#ff3366'}, transparent);
        }
        .brand-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 25px;
        }
        .logo-text { 
            font-size: 28px; 
            font-weight: 900; 
            letter-spacing: 5px; 
            color: #ffffff;
            text-shadow: 0 0 20px rgba(255,255,255,0.1);
            font-family: monospace;
        }
        .logo-sub { 
            font-size: 9px; 
            color: #444854; 
            letter-spacing: 6px; 
            margin-top: 6px;
            font-weight: 700;
        }
        .status-box { 
            padding: 14px 18px; 
            background: rgba(255,255,255,0.01); 
            border: 1px solid rgba(255,255,255,0.03);
            border-left: 4px solid ${code ? '#00ffaa' : '#ff3366'}; 
            font-size: 11px; 
            font-family: monospace;
            border-radius: 8px;
            margin-bottom: 22px;
            line-height: 1.7;
        }
        .green { color: #00ffaa; text-shadow: 0 0 10px rgba(0,255,170,0.3); } 
        .red { color: #ff3366; text-shadow: 0 0 10px rgba(255,51,102,0.3); }
        .info-desc { 
            font-size: 12.5px; 
            color: #8a8f9e; 
            line-height: 1.6; 
            margin-bottom: 30px; 
            text-align: center;
            font-weight: 400;
        }
        .btn-action { 
            display: block; 
            background: #ffffff; 
            color: #000000; 
            text-align: center; 
            padding: 14px; 
            text-decoration: none; 
            font-size: 11px; 
            font-weight: 800; 
            letter-spacing: 2px; 
            border-radius: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(255,255,255,0.05);
        }
        .btn-action:hover {
            background: #efefef;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="brand-container">
            <div class="logo-text">CODEVAULT</div>
            <div class="logo-sub">ABSOLUTE PROTECTION SECURE</div>
        </div>
        <div class="status-box">
            <span style="color: #444854;">&gt; CORE_STATUS:</span> <span class="${code ? 'green' : 'red'}">${code ? "ENCRYPTED_ONLINE" : "NULL_NOT_FOUND"}</span><br>
            <span style="color: #444854;">&gt; NET_ACCESS:</span> <span class="red">EXTERNAL_WEB_DENIED</span>
        </div>
        <p class="info-desc">
            ${code ? "La descarga directa por navegador web está restringida para mitigar dumper remotos. Ejecuta el script directamente desde tu cargador en el juego." : "El identificador proporcionado no coincide con ningún buffer activo en nuestra base de datos."}
        </p>
        <a href="https://leeh10.github.io/CodeVault/index.html" class="btn-action">ACCEDER AL PANEL</a>
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
    console.log("Server running perfectly with Realtime DB REST API and V14 Protection");
});
