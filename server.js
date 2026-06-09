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

// --- MOTOR DE OFUSCACIÓN MILITAR CODEVAULT V13 (FRAGMENTACIÓN MUTILADA + VIRTUALIZACIÓN PRECOZ) ---
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

    // Fragmentación en 4 piezas desordenadas
    const size = Math.ceil(scrambledHex.length / 4);
    const p1 = scrambledHex.substring(0, size) || "0";
    const p2 = scrambledHex.substring(size, size * 2) || "0";
    const p3 = scrambledHex.substring(size * 2, size * 3) || "0";
    const p4 = scrambledHex.substring(size * 3) || "0";

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

    const obfNumber = (num) => {
        const multiplier = crypto.randomInt(4, 8);
        const adder = crypto.randomInt(60, 400);
        return `(((${num} * ${multiplier}) + ${adder} - ${adder}) / ${multiplier})`;
    };

    return {
        parts: [p3, p1, p4, p2],
        xorValue: obfNumber(xorKey),
        shiftValue: obfNumber(shiftKey),
        names: { vStream, vXor, vShift, vPipeline, vDict, vCheck },
        junk: junkCode
    };
}

// RUTA PRINCIPAL CON SISTEMA ABSOLUTE ISOLATION V13 + NUEVO DISEÑO CYBERPUNK
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
   ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
  ██║     ██║   ██║██║  ██║█████╗  ██║   ██║███████║██║   ██║██║     ██║   
  ██║     ██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
  ╚██████╗╚██████╔╝██████╔╝███████╗ ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
   
   [ PREMIUM MILITARY SHIELD V13.0 — BRANDING: CODEVAULT SYSTEM ]
   [ ABSOLUTE ISOLATION LAYER — PRIMAL PIPELINE & ANTI-HOOKS ACTIVE ]
]]

${obf.junk}

-- Aislamiento precoz de nativos para romper hooks en entornos simulados
local _g = getfenv and getfenv() or _G
local _r_reverse = string.reverse
local _r_gsub = string.gsub
local _r_tonumber = tonumber
local _r_char = string.char
local _r_concat = table.concat
local _r_pcall = pcall
local _r_bxor = (bit32 and bit32.bxor)
local _r_sub = string.sub

-- Verificación de integridad del entorno contra capturas de loadstring/task
local function ${vCheck}()
    if not game or not game.IsA then return false end
    
    -- Anti-Hook de loadstring elemental
    local testLoad = loadstring
    if not testLoad then return true end
    
    local isHooked = false
    _r_pcall(function()
        if tostring(testLoad):match("custom") or tostring(testLoad):match("hook") then
            isHooked = true
        end
    end)
    if isHooked then return false end

    -- Verificación de sanidad del ServiceProvider
    local ok, _ = _r_pcall(function() return game:GetService("UserInputService") end)
    return ok
end

if not ${vCheck}() then
    while true do 
        -- Congelación inmediata si detecta manipulación en hooks nativos
        local _ = math.cos(1) * math.sin(1)
    end
end

-- Bloques fragmentados protegidos
local _pA = "${obf.parts[0]}"
local _pB = "${obf.parts[1]}"
local _pC = "${obf.parts[2]}"
local _pD = "${obf.parts[3]}"

-- Reensamblado dinámico entrelazado
local ${vStream} = _pB .. _pD .. _pA .. _pC
local ${vXor} = ${obf.xorValue}
local ${vShift} = ${obf.shiftValue}

local function ${vPipeline}(str, k1, k2)
    local revStr = _r_reverse(str)
    local outBytes = {}
    local ptr = 1
    
    _r_gsub(revStr, "..", function(ch)
        local b16 = _r_tonumber(ch, 16)
        local unshifted = (b16 - k2) % 256
        if unshifted < 0 then unshifted = unshifted + 256 end
        
        local finalByte
        if _r_bxor then
            finalByte = _r_bxor(unshifted, k1)
        else
            local p, c = 1, 0
            local a, b = unshifted, k1
            while a > 0 or b > 0 do
                local ra, rb = a % 2, b % 2
                if ra ~= rb then c = c + p end
                a, b, p = (a - ra) / 2, (b - rb) / 2, p * 2
            end
            finalByte = c
        end
        
        outBytes[ptr] = _r_char(finalByte)
        ptr = ptr + 1
    end)
    
    return _r_concat(outBytes)
end

local safeRun, internalScript = _r_pcall(function()
    return ${vPipeline}(${vStream}, ${vXor}, ${vShift})
end)

if safeRun and internalScript and #internalScript > 0 then
    -- Ejecución directa aislada
    local executionTarget = loadstring or _g.loadstring
    if executionTarget then
        executionTarget(internalScript)()
    else
        error("[CODEVAULT]: Execution engine missing.")
    end
    
    -- Limpieza atómica total de memoria para frustrar dumps tardíos
    internalScript = nil
    ${vStream} = nil
    _g.runtimeScript = nil
    
    if _g.collectgarbage then
        _g.collectgarbage("collect")
    end
else
    warn("[CODEVAULT]: Integrity breach detected.")
end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 
        
        // --- NUEVA INTERFAZ DE BLOQUEO WEB CYBERPUNK 2.0 (ULTRA-GLOW LUXURY STYLE) ---
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
    console.log("Server running perfectly with Realtime DB REST API and V13 Protection");
});
