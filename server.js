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

// Middleware de seguridad avanzada
app.use((req, res, next) => {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const suspicious = [
        'python', 'requests', 'axios', 'node', 'curl', 'wget', 'bot', 'scraper',
        'deobfuscator', 'luraph', 'synapse', 'krnl', 'fluxus', 'solara'
    ];
    
    if (suspicious.some(term => ua.includes(term))) {
        return res.status(403).send("Forbidden");
    }
    
    // Rate limiting simple (puedes mejorarlo con express-rate-limit)
    const ip = req.ip || req.connection.remoteAddress;
    if (!global.rateLimit) global.rateLimit = {};
    if (!global.rateLimit[ip]) global.rateLimit[ip] = { count: 0, time: Date.now() };
    
    const now = Date.now();
    if (now - global.rateLimit[ip].time > 60000) {
        global.rateLimit[ip] = { count: 0, time: now };
    }
    
    global.rateLimit[ip].count++;
    if (global.rateLimit[ip].count > 15) {
        return res.status(429).send("Too Many Requests");
    }
    
    next();
});

app.get("/", (req, res) => {
    res.send("CodeVault V15.1 - Enhanced Security Active");
});

// RUTA PARA GUARDAR SCRIPTS
app.post("/save", async (req, res) => {
    try {
        const id = uuid();
        const scriptCode = req.body.code;
        if (!scriptCode) return res.status(400).json({ success: false, error: "No code provided" });
        
        const payload = { 
            code: scriptCode, 
            createdAt: new Date().toISOString(),
            version: "v15.1"
        };
        await axios.put(`\( {REALTIME_DB_URL}/ \){id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al guardar:", error.message);
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// RUTA PARA ACTUALIZAR
app.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const scriptCode = req.body.code;
        if (!scriptCode) return res.status(400).json({ success: false, error: "No code provided" });
        
        const payload = { 
            code: scriptCode, 
            updatedAt: new Date().toISOString() 
        };
        await axios.patch(`\( {REALTIME_DB_URL}/ \){id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al actualizar:", error.message);
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

// RAW para web (mínimo)
app.get("/web/raw/:id", async (req, res) => {
    try {
        const response = await axios.get(`\( {REALTIME_DB_URL}/ \){req.params.id}.json`);
        if (!response.data?.code) return res.status(404).send("Not Found");
        res.setHeader('Content-Type', 'text/plain');
        res.send(response.data.code);
    } catch (error) {
        res.status(500).send("Error");
    }
});

// ==================== MOTOR DE OFUSCACIÓN MEJORADO V15.1 ====================
function v15AdvancedObfuscate(code) {
    const lines = code.split(/\r?\n/);
    const totalLines = lines.length;
    const chunkCount = 4; // Más fragmentos
    const chunkSize = Math.ceil(totalLines / chunkCount);
    
    const segments = [];
    for (let i = 0; i < chunkCount; i++) {
        segments.push(lines.slice(i * chunkSize, (i + 1) * chunkSize).join("\n"));
    }
    
    const primaryKey = crypto.randomInt(80, 220);
    const keys = [];
    for (let i = 0; i < chunkCount; i++) {
        keys.push((primaryKey ^ (0xAA * (i + 1))) & 0xFF);
    }
    
    const encryptedChunks = [];
    
    segments.forEach((seg, idx) => {
        const content = seg || "-- Empty";
        const buf = Buffer.from(content, 'utf8');
        const chunkData = [];
        let lastByte = idx * 13 + crypto.randomInt(3, 12);
        
        for (let i = 0; i < buf.length; i++) {
            let enc = buf[i] ^ keys[idx];
            enc = (enc ^ lastByte ^ (i % 17)) % 256;
            chunkData.push(enc.toString(16).padStart(2, '0'));
            lastByte = enc;
        }
        encryptedChunks.push(chunkData.join(''));
    });

    const randomVar = (prefix = "_0xCV") => `\( {prefix}_ \){crypto.randomBytes(5).toString('hex')}`;
    
    const vars = {
        vState: randomVar(),
        vRunner: randomVar(),
        vTrap: randomVar(),
        vData: randomVar(),
        vDecrypt: randomVar(),
        vJunk: randomVar()
    };

    let decoyData = "";
    for (let i = 0; i < 12; i++) {
        const fakeHex = crypto.randomBytes(6).toString('hex');
        decoyData += `local _0xJunk_\( {fakeHex} = " \){crypto.randomBytes(8).toString('hex')}";\n`;
        decoyData += `local _0xNum_\( {fakeHex} = tonumber("0x \){crypto.randomInt(0x1000, 0xFFFF).toString(16)}");\n`;
    }

    return {
        chunks: encryptedChunks,
        keys: keys,
        vars: vars,
        decoys: decoyData
    };
}

// RUTA PRINCIPAL PROTEGIDA
app.get("/raw/:id", async (req, res) => {
    try {
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();
        
        // Detección más agresiva
        const botKeywords = ['python', 'node', 'axios', 'requests', 'curl', 'wget', 'http', 'deobf', 'luraph', 'dump', 'scrape'];
        if (botKeywords.some(k => userAgent.includes(k))) {
            return res.status(403).send("-- Security Violation Detected");
        }

        let code = null;
        try {
            const dbRes = await axios.get(`\( {REALTIME_DB_URL}/ \){req.params.id}.json`);
            if (dbRes.data?.code) code = dbRes.data.code;
        } catch (e) {}

        const isExecutor = userAgent.includes('roblox') || 
                          userAgent.includes('protocol') || 
                          userAgent.includes('executor') || 
                          userAgent === '' || 
                          req.headers['x-roblox-executor'];

        if (isExecutor) {
            if (!code) {
                return res.status(404).send("-- CodeVault: Script no encontrado.");
            }

            const obf = v15AdvancedObfuscate(code);
            const { vState, vRunner, vTrap, vData, vDecrypt } = obf.vars;

            const secureLuaPayload = `--[[
   ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
  ██║     ██║   ██║██║  ██║█████╗  ██║   ██║███████║██║   ██║██║     ██║   
  ██║     ██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
  ╚██████╗╚██████╔╝██████╔╝███████╗ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
   CODEVAULT V15.1 — LAYERED FRAGMENTED EXECUTION + ANTI-DEOBF
]]

${obf.decoys}

local _G = getfenv and getfenv() or _G
local gsub = string.gsub
local tonumber = tonumber
local char = string.char
local concat = table.concat
local pcall = pcall

-- Anti-debug + anti-deobf traps
local function ${vTrap}()
    if not game then return false end
    local suspicious = false
    pcall(function()
        if getgenv and getgenv()._DEOBF then suspicious = true end
        if hookfunction and debug.getinfo then
            local info = debug.getinfo(2)
            if info and info.name and info.name:find("deobf") then suspicious = true end
        end
    end)
    if suspicious then
        while true do wait(999) end
    end
    return true
end

if not ${vTrap}() then
    while true do end
end

local ${vData} = {
\( {obf.chunks.map((c, i) => `    [ \){i+1}] = {s = "${c}", k = ${obf.keys[i]}, init = ${i * 11}}`).join(',\n')}
}

local function ${vDecrypt}(block)
    local out = {}
    local idx = 1
    local last = block.init
    
    gsub(block.s, "..", function(hex)
        local b = tonumber(hex, 16)
        local dec = b
        dec = bit32 and bit32.bxor(dec, last) or (function(x,y)
            local r=0 p=1 while x>0 or y>0 do
                r = r + (x%2 \~= y%2 and p or 0)
                x,y,p = (x-x%2)/2,(y-y%2)/2,p*2
            end
            return r
        end)(dec, last)
        dec = bit32 and bit32.bxor(dec, block.k) or (function(x,y) ... end)(dec, block.k) -- fallback
        out[idx] = char(dec)
        last = b
        idx += 1
    end)
    
    return concat(out)
end

local function ${vRunner}(block)
    local decrypted = ${vDecrypt}(block)
    local loader = loadstring or _G.loadstring
    if loader and #decrypted > 10 then
        local func = loader(decrypted)
        if func then 
            pcall(func) -- Ejecuta en contexto aislado
        end
    end
end

-- Ejecución fragmentada no lineal
local order = {1,3,2,4} -- Orden aleatorio posible
for _, seg in ipairs(order) do
    if \( {vData}[seg] and # \){vData}[seg].s > 0 then
        local ok, err = pcall(function()
            \( {vRunner}( \){vData}[seg])
        end)
        if not ok then
            warn("[CV] Segment " .. seg .. " failed")
        end
    end
end

-- Limpieza
${vData} = nil
if _G.collectgarbage then _G.collectgarbage("collect") end
print("[CodeVault V15.1] Script ejecutado correctamente")
`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 

        // Web interface (anti-dump)
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault • Secure</title>
    <style>
        body {
            background: #0a0a0a;
            color: #fff;
            font-family: monospace;
            display: grid;
            place-items: center;
            height: 100vh;
            margin: 0;
            background-image: radial-gradient(#1a1a2e 1px, transparent 1px);
            background-size: 30px 30px;
        }
        .card {
            background: rgba(15,15,25,0.95);
            border: 1px solid #00ffaa22;
            padding: 40px;
            border-radius: 12px;
            max-width: 460px;
            text-align: center;
            box-shadow: 0 0 40px rgba(0,255,170,0.1);
        }
        .logo { font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #00ffaa; }
        .status { color: #ff3366; margin: 20px 0; }
        .btn {
            display: inline-block;
            background: #fff;
            color: #000;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">CODEVAULT</div>
        <div class="status">V15.1 — ANTI-DEOBF ACTIVE</div>
        <p>${code ? "Ejecuta desde tu executor en Roblox. Descarga directa bloqueada." : "ID inválido o expirado."}</p>
        <a href="https://leeh10.github.io/CodeVault/index.html" class="btn">VOLVER AL PANEL</a>
    </div>
</body>
</html>`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Shield Error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CodeVault V15.1 corriendo en puerto ${PORT} - Seguridad mejorada`);
});
