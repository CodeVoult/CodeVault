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

const rateLimit = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const window = 60000;
    const limit = 10;
    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, []);
    }
    const timestamps = rateLimit.get(ip).filter(t => now - t < window);
    if (timestamps.length >= limit) {
        return false;
    }
    timestamps.push(now);
    rateLimit.set(ip, timestamps);
    return true;
}

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

// --- MOTOR DE OFUSCACIÓN AVANZADA CODEVAULT V15 ORIGINAL (REPARACIÓN DE LÓGICA) ---
function v15DynamicObfuscate(code) {
    // Dividir de forma inteligente por líneas completas para no romper comandos de Luau
    const lines = code.split(/\r?\n/);
    const totalLines = lines.length;
    const chunkSize = Math.ceil(totalLines / 3);
    
    const segments = [
        lines.slice(0, chunkSize).join("\n"),
        lines.slice(chunkSize, chunkSize * 2).join("\n"),
        lines.slice(chunkSize * 2).join("\n")
    ];
    
    const primaryKey = crypto.randomInt(50, 200);
    const keys = [primaryKey, primaryKey ^ 0xAA, primaryKey ^ 0x55];
    const encryptedChunks = [];

    segments.forEach((seg, idx) => {
        const content = seg || "-- Empty Segment";
        const buf = Buffer.from(content, 'utf8');
        const chunkData = [];
        // REPARACIÓN CRÍTICA: Cada bloque arranca su encadenamiento matemático en 0 de forma independiente
        let lastByte = 0; 
        for (let i = 0; i < buf.length; i++) {
            let enc = buf[i] ^ keys[idx];
            enc = (enc ^ lastByte) % 256;
            chunkData.push(enc.toString(16).padStart(2, '0'));
            lastByte = enc;
        }
        encryptedChunks.push(chunkData.join(''));
    });

    const randomVar = () => `_0xV15_${crypto.randomBytes(4).toString('hex')}`;
    const vState = randomVar();
    const vRunner = randomVar();
    const vTrap = randomVar();
    const vData = randomVar();

    let decoyData = "";
    for(let i = 0; i < 8; i++) {
        const fakeHex = crypto.randomBytes(4).toString('hex');
        decoyData += `local _0xNoise_${fakeHex} = tonumber("${crypto.randomInt(1000, 9999)}", 16);\n`;
    }

    return {
        chunks: encryptedChunks,
        keys: keys,
        vars: { vState, vRunner, vTrap, vData },
        decoys: decoyData
    };
}

// RUTA PRINCIPAL CON SISTEMA DE PROTECCIÓN CAPA V15 GARANTIZADA Y TOTALMENTE EJECUTABLE
app.get("/raw/:id", async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress;
        if (!checkRateLimit(clientIp)) {
            return res.status(429).send("Too many requests.");
        }

        const userAgent = req.headers['user-agent'] || '';
        if (/python|node|axios|requests|curl|wget|java|php|scrapy|perl|ruby|go|httpclient/i.test(userAgent)) {
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

            const obf = v15DynamicObfuscate(code);
            const { vState, vRunner, vTrap, vData } = obf.vars;

            const c0 = obf.chunks[0] || "";
            const c1 = obf.chunks[1] || "";
            const c2 = obf.chunks[2] || "";

            const secureLuaPayload = `--[[
   ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
  ██║     ██║   ██║██║  ██║█████╗  ██║   ██║███████║██║   ██║██║     ██║   
  ██║     ██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
  ╚██████╗╚██████╔╝██████╔╝███████╗ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
   
   [ PREMIUM SECURITY SHIELD V15.0 — BRANDING: CODEVAULT SYSTEM ]
   [ STATE MACHINE ARCHITECTURE — FRAGMENTED EXECUTION PIPELINE ACTIVE ]
]]

${obf.decoys}

local _g = getfenv and getfenv() or _G
local _s_gsub = string.gsub
local _s_tonumber = tonumber
local _s_char = string.char
local _t_concat = table.concat
local _pcall = pcall
local _bxor = (bit32 and bit32.bxor)

local function ${vTrap}()
    if not game or not game.GetService then return false end
    local targetLoad = loadstring
    if not targetLoad then return false end
    local loadStr = tostring(targetLoad)
    if loadStr:match("custom") or loadStr:match("hook") or loadStr:match("proxy") or loadStr:match("wrapper") then
        return false
    end
    if debug and debug.getinfo then
        local info = _pcall(debug.getinfo, targetLoad)
        if not (info and type(info) == "table" and (info.what == "C" or info.what == "Lua")) then
            return false
        end
    end
    local executorGlobals = {"syn", "krnl", "script_context", "secure_load"}
    for _, name in ipairs(executorGlobals) do
        if _g[name] ~= nil then return false end
    end
    local success, uis = _pcall(function() return game:GetService("UserInputService") end)
    if not success or not uis then return false end
    return true
end

if not ${vTrap}() then
    while true do
        local x = 0
        for i = 1, 100000 do x = x + i end
    end
end

-- CORRECCIÓN: Los tres vectores de inicialización quedan en init = 0 para emparejar con el cifrado de Node
local ${vData} = {
    [1] = { s = "${c0}", k = ${obf.keys[0]}, init = 0 },
    [2] = { s = "${c1}", k = ${obf.keys[1]}, init = 0 },
    [3] = { s = "${c2}", k = ${obf.keys[2]}, init = 0 }
}

local function ${vRunner}(block)
    local out = {}
    local idx = 1
    local last = block.init
    
    _s_gsub(block.s, "..", function(h)
        local b = _s_tonumber(h, 16)
        local inter = b
        if _bxor then
            inter = _bxor(inter, last)
            inter = _bxor(inter, block.k)
        else
            local function mXOR(x, y)
                local p, c = 1, 0
                while x > 0 or y > 0 do
                    local rx, ry = x % 2, y % 2
                    if rx ~= ry then c = c + p end
                    x, y, p = (x - rx) / 2, (y - ry) / 2, p * 2
                end
                return c
            end
            inter = mXOR(inter, last)
            inter = mXOR(inter, block.k)
        end
        out[idx] = _s_char(inter)
        last = b
        idx = idx + 1
    end)
    
    local codeStr = _t_concat(out)
    local engine = loadstring or _g.loadstring
    if engine and #codeStr > 0 then
        return engine(codeStr)
    else
        error("[CODEVAULT]: Execution segment missing.")
    end
end

-- Máquina de estados fragmentada
local ${vState} = 1
while ${vState} <= 3 do
    if ${vData}[${vState}] and #${vData}[${vState}].s > 0 then
        local success, segmentFunc = _pcall(function()
            return ${vRunner}(${vData}[${vState}])
        end)
        
        if success and segmentFunc then
            -- Se ejecuta de forma aislada en memoria. El bot deobf se queda sin nada que interceptar.
            segmentFunc()
        else
            warn("[CODEVAULT]: Segment integrity verification failed.")
            break
        end
    end
    ${vState} = ${vState} + 1
end

${vData} = nil
if _g.collectgarbage then _g.collectgarbage("collect") end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 
        
        // --- INTERFAZ DE BLOQUEO WEB CYBERPUNK 2.0 (ULTRA-GLOW LUXURY STYLE CORREGIDA) ---
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
    console.log("Server running perfectly with Realtime DB REST API and V15 Protection");
});
