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

// MOTOR DE ENCRIPCIÓ_N AVANZADO MULTI-FRAGMENTO
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
    const scrambledHex = hexData.split('').reverse().join('');

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

// --- RUTA PRINCIPAL DINÁMICA: EVALÚA SI VIENE DE LUA O DEL NAVEGADOR WEB ---
app.get("/raw/:id", async (req, res) => {
    try {
        let code = undefined;
        try {
            const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
            if (response.data && response.data.code) code = response.data.code;
        } catch (e) { code = undefined; }

        const userAgent = req.headers['user-agent'] || '';
        
        // Verificamos si la petición proviene estrictamente del entorno de ejecución del juego
        const esExecutor = userAgent.includes('Roblox') || userAgent.includes('Protocol') || userAgent.includes('Executor') || userAgent === '';

        // FLUJO LUA (Para todo el mundo en el juego)
        if (esExecutor) {
            if (!code) {
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                return res.status(404).send("-- [CODEVAULT ERROR]: Script no registrado.");
            }

            const obf = publicObfuscate(code);

            const secureLuaPayload = `--[[
    ▄▀█ ▄▄▀█▄▄ █▀█ ▄▄▀█▄▄ █░█ ▄▄▀█▄▄ █░█ █░░ ▀█▀
    █▀█ █▄█▄▄█ █▄█ █▄█▄▄█ ▀▄▀ █▀█▀▄█ █▄█ █▄▄ ░█░
   
   [ CODEVAULT PUBLIC SHIELD CORE V9.5 — STABLE RUNTIME ]
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

for i = 1, 60 do
    local _ = math.sqrt(i) * math.sin(i)
end

local safe, rawScript = _cv_pcall(function()
    return _0xCV_Decrypt(_0xDataStream, _0xKeyX, _0xKeyS)
end)

if safe and rawScript and #rawScript > 0 then
    local engine = loadstring or _cv_pcall
    engine(rawScript)()
    
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
        }

        // --- INTERFAZ DE VISTA WEB (Para cuando abren el link de un script en el navegador) ---
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault — Secure Frame</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            background-color: #020203; 
            color: #ffffff; 
            font-family: monospace; 
            display: grid; 
            place-items: center; 
            height: 100vh; 
            margin: 0;
            background-image: radial-gradient(circle at 50% 50%, #090d16 0%, #010102 100%);
        }
        .card { 
            width: 92%; 
            max-width: 440px; 
            background: rgba(4, 4, 6, 0.96); 
            border: 1px solid rgba(255, 255, 255, 0.03); 
            padding: 35px; 
            border-radius: 12px; 
            box-shadow: 0 40px 80px rgba(0, 0, 0, 0.9);
            text-align: center;
            position: relative;
        }
        .card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, #ff2a5f, transparent);
        }
        .title { font-size: 26px; font-weight: 900; letter-spacing: 5px; color: #ffffff; }
        .subtitle { font-size: 9px; color: #3e424e; letter-spacing: 5px; margin-top: 5px; font-weight: bold; }
        .status-box { 
            padding: 12px 16px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.02);
            border-left: 4px solid ${code ? '#ff2a5f' : '#dd3333'}; font-size: 11px; text-align: left; margin: 25px 0; line-height: 1.6;
        }
        .highlight { color: #ff2a5f; text-shadow: 0 0 10px rgba(255,42,95,0.3); }
        .red { color: #dd3333; }
        .desc { font-size: 12px; color: #7c818e; line-height: 1.6; margin-bottom: 25px; }
        .btn-link { 
            display: block; background: #ffffff; color: #000000; text-align: center; padding: 13px; 
            text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 2px; border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">CODEVAULT</div>
        <div class="subtitle">SECURITY GATEWAY</div>
        <div class="status-box">
            &gt; CONTENT: <span class="highlight">${code ? "PROTEGIDO EN CORES" : "NOT FOUND"}</span><br>
            &gt; BROWSER_ACCESS: <span class="red">BLOCKED_BY_POLICY</span>
        </div>
        <p class="desc">
            ${code ? "El código plano de este script se encuentra encapsulado. El acceso directo vía web está restringido para prevenir fugas y rastreos de código." : "El identificador de recurso especificado no existe en la base de datos."}
        </p>
        <a href="https://leeh10.github.io/CodeVault/index.html" class="btn-link">IR AL PANEL PRINCIPAL</a>
    </div>
</body>
</html>
        `);

    } catch (error) {
        res.setHeader('Content-Type', 'text/plain');
        return res.status(500).send("Security Gateway Error");
    }
});

// --- INTERFAZ PRINCIPAL DEL PANEL WEB CYBERPUNK (GLOW LUXURY STYLE) ---
app.get("/panel", (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault — Public Monitor</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            background-color: #030304; 
            color: #ffffff; 
            font-family: monospace; 
            display: grid; 
            place-items: center; 
            height: 100vh; 
            margin: 0;
            background-image: radial-gradient(circle at 50% 50%, #090e18 0%, #020203 100%);
        }
        .card { 
            width: 92%; 
            max-width: 440px; 
            background: rgba(5, 5, 8, 0.97); 
            border: 1px solid rgba(255, 255, 255, 0.04); 
            padding: 40px 35px; 
            border-radius: 16px; 
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.85);
            text-align: center;
            position: relative;
        }
        .card::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, #00ffaa, transparent);
        }
        .logo-text { font-size: 28px; font-weight: 900; letter-spacing: 5px; color: #ffffff; }
        .logo-sub { font-size: 9px; color: #444854; letter-spacing: 5px; margin-top: 6px; font-weight: bold; }
        .status-box { 
            padding: 14px 18px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03);
            border-left: 4px solid #00ffaa; font-size: 11px; text-align: left; margin: 25px 0; line-height: 1.7;
        }
        .green { color: #00ffaa; text-shadow: 0 0 10px rgba(0,255,170,0.3); } 
        .desc { font-size: 12.5px; color: #8a8f9e; line-height: 1.6; margin-bottom: 30px; }
        .btn-action { 
            display: block; background: #ffffff; color: #000000; text-align: center; padding: 14px; 
            text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 2px; border-radius: 8px;
            box-shadow: 0 4px 15px rgba(255,255,255,0.05);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-text">CODEVAULT</div>
        <div class="logo-sub">GLOBAL SYSTEM GATEWAY</div>
        <div class="status-box">
            &gt; ENGINE_STATUS: <span class="green">PUBLIC_ROUTING_ONLINE</span><br>
            &gt; DISTRIBUTION: <span class="green">HYBRID_OBFUSCATION_V9.5</span>
        </div>
        <p class="desc">
            Servicio global activo. Los scripts solicitados desde entornos Lua se distribuyen en flujos cifrados estables listos para su ejecución masiva.
        </p>
        <div class="btn-action">SISTEMA OPERATIVO</div>
    </div>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor completo con interfaces HTML corriendo en el puerto " + PORT);
});
