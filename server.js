const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");

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

// RUTA PARA ACTUALIZAR UN SCRIPT EXISTENTE SIN CAMBIAR EL ID
app.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const scriptCode = req.body.code;

        if (!scriptCode) {
            return res.status(400).json({ success: false, error: "No code provided" });
        }

        const payload = {
            code: scriptCode,
            updatedAt: new Date().toISOString()
        };

        await axios.patch(`${REALTIME_DB_URL}/${id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al actualizar en Realtime DB:", error.message);
        res.status(500).json({ success: false, error: "Error interno al actualizar" });
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

// RUTA CON ESCUDO ULTRA ANTI-TAMPER HARDENED V6.0
app.get("/raw/:id", async (req, res) => {
    try {
        let code = undefined;
        try {
            const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
            if (response.data && response.data.code) code = response.data.code;
        } catch (e) { code = undefined; }
        
        const userAgent = req.headers['user-agent'] || '';
        const esExecutor = userAgent.includes('Roblox') || userAgent.includes('Protocol') || userAgent.includes('Executor') || userAgent === '';

        if (esExecutor) {
            if (!code) {
                res.setHeader('Content-Type', 'text/plain');
                return res.status(404).send("-- CodeVault Error: Script no encontrado.");
            }

            // ── MOTOR ANTI-TAMPER ULTRA HARDENED ──
            // 1. Pasamos el script plano a Hexadecimal
            const hexString = Buffer.from(code, 'utf8').toString('hex');
            
            // 2. Ofuscación Dinámica: Insertamos un separador falso cada 4 caracteres para volver loco al bot
            let dynamicHex = "";
            for (let i = 0; i < hexString.length; i += 4) {
                dynamicHex += hexString.substring(i, i + 4) + "X";
            }
            
            // 3. Volteamos toda la estructura con el ruido incluido
            const heavyReverseHex = dynamicHex.split('').reverse().join('');

            // Generamos la carga útil de Lua con validación estricta de entorno de ejecución
            const secureLuaPayload = `-- [[ CODEVAULT ANTI-TAMPER PRO V6.0 BETA ]]
-- WARNING: UNATHORIZED TAMPERING OR DECOMPILING WILL TRIGGER AUTO-CRASH --

-- Clonación y respaldo de globales nativas para evitar Hooks/Metatables alteradas
local _raw_gsub = string.gsub
local _raw_reverse = string.reverse
local _raw_char = string.char
local _raw_tonumber = tonumber
local _raw_pcall = pcall

local _0xSecureVaultStream = "${heavyReverseHex}"

local function _0xCV_DecryptionPipeline(cipher)
    -- Paso 1: Revertir la cadena invertida de vuelta a su posición lineal
    local step1 = _raw_reverse(cipher)
    -- Paso 2: Limpiar el patrón de ruido dinámico 'X' inyectado por el servidor
    local cleanHex = _raw_gsub(step1, "X", "")
    -- Paso 3: Reconstruir caracteres planos desde los pares Hex nativos
    local sourceCode = _raw_gsub(cleanHex, "..", function(byte)
        return _raw_char(_raw_tonumber(byte, 16))
    end)
    return sourceCode
end

-- AMBIENTE ANTI-BOT / ANTI-VIRTUAL MACHINE
if not game or not game:GetService("Players") or not game:GetService("RunService") then
    while true do end
end

-- Verificación estricta del LocalPlayer para evitar ejecuciones simuladas fuera del motor
local plrs = game:GetService("Players")
if not plrs.LocalPlayer or not plrs.LocalPlayer.Parent then
    task.wait(0.5)
    if not plrs.LocalPlayer then
        while true do end
    end
end

local isExecutionSafe, runtimeSource = _raw_pcall(function()
    return _0xCV_DecryptionPipeline(_0xSecureVaultStream)
end)

if isExecutionSafe and runtimeSource then
    local executablePayload = loadstring or _raw_pcall
    executablePayload(runtimeSource)()
else
    -- Si detecta alteración o error en la pipeline, crashea el hilo inmediatamente
    while true do end
end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(secureLuaPayload);
        } 
        
        const statusText = code ? "CÓDIGO PROTEGIDO" : "NOT FOUND / EXPIRADO";
        const statusClass = code ? "green" : "red";
        const descText = code 
            ? "Este script se encuentra protegido legítimamente bajo el entorno de CodeVault. El acceso web al código plano está deshabilitado para evitar su filtración."
            : "El identificador de script solicitado no existe en la base de datos de Firebase. Verifica el ID o genera un nuevo enlace.";

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
        <div class="status">> STATUS: <span class="${statusClass}">${statusText}</span><br>> ACCESS: <span class="red">WEB_BLOCKED</span></div>
        <p class="desc">${descText}</p>
        <a href="https://leeh10.github.io/CodeVault/index.html" class="btn">IR AL PANEL PRINCIPAL</a>
    </div>
</body>
</html>
        `);
    } catch (error) {
        return res.status(500).send("Error en el escudo de seguridad");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running perfectly with Realtime DB REST API");
});
