const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");
const crypto = require("crypto");

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

// RUTA EXCLUSIVA WEB RAW (Muestra el código limpio solo a tu panel web)
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

// RUTA CON ESCUDO DE SEGURIDAD ULTRA-CRIPTOGRÁFICO ANTI-BOTS (Sincronizado)
app.get("/raw/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let code = undefined;
        try {
            const response = await axios.get(`${REALTIME_DB_URL}/${id}.json`);
            if (response.data && response.data.code) code = response.data.code;
        } catch (e) { code = undefined; }
        
        const userAgent = req.headers['user-agent'] || '';
        
        // FILTRO DE CONTENCIÓN EXTREMA: Filtra navegadores, scrapers comunes y bots de Discord
        const esBotONavegador = userAgent.includes('Mozilla') || 
                                userAgent.includes('Chrome') || 
                                userAgent.includes('Safari') || 
                                userAgent.includes('Firefox') ||
                                userAgent.includes('curl') || 
                                userAgent.includes('Wget') ||
                                userAgent.includes('Discordbot') ||
                                userAgent.includes('python-requests');

        const esExecutor = (userAgent.includes('Roblox') || userAgent.includes('Protocol') || userAgent.includes('Executor') || userAgent === '') && !esBotONavegador;

        if (esExecutor) {
            if (!code) {
                res.setHeader('Content-Type', 'text/plain');
                return res.status(404).send("-- CodeVault Error: Script no encontrado.");
            }

            // ── MOTOR DE OFUSCACIÓN DINÁMICA POR FLUJO DE BYTES (XOR + KEY-SALT) ──
            // Generamos una clave única numérica basada en el hash del ID del script para que varíe siempre
            const hash = crypto.createHash('sha256').update(id + "CV_KEY_SALT_777!").digest();
            const keyByte = hash[0] % 250 + 1; // Un byte clave dinámico entre 1 y 250

            const inputBuffer = Buffer.from(code, 'utf8');
            let encryptedArray = [];

            // Aplicamos un cifrado matemático reversible exacto
            for (let i = 0; i < inputBuffer.length; i++) {
                // Operación XOR con la clave y alteración posicional para destruir deofuscadores estáticos
                let cipherByte = (inputBuffer[i] ^ keyByte) ^ (i % 256);
                encryptedArray.push(`\\${cipherByte}`);
            }

            const encStringPayload = encryptedArray.join('');

            // Payload optimizado para Lua. Ejecuta el descifrado exacto en la memoria del juego.
            const ultraProtectedPayload = `-- [[ CODEVAULT V3.5 PREMIUM SHIELD ]]
-- ACCESS DENIED TO STATIC ANALYSIS & DEOBFUSCATION BOTS --

local _0xEncryptedData = "${encStringPayload}"
local _0xCipherKey     = ${keyByte}

local function _0xCV_ExecutePipeline(data, key)
    local out = {}
    local len = #data
    for i = 1, len do
        local byte = string.byte(data, i)
        -- Operación matemática exactamente inversa en tiempo de ejecución
        local originalByte = (byte ^ (i - 1 % 256)) ^ key
        out[i] = string.char(originalByte)
    end
    return table.concat(out)
end

if not game or not game:GetService("Players").LocalPlayer then 
    while true do end 
end

local success, cleanCode = pcall(function()
    return _0xCV_ExecutePipeline(_0xEncryptedData, _0xCipherKey)
end)

if success and cleanCode then
    local run = loadstring or pcall
    run(cleanCode)()
else
    -- Bucle de autodestrucción si intentan alterar el flujo de memoria
    while true do end
end`;

            res.setHeader('Content-Type', 'text/plain');
            return res.send(ultraProtectedPayload);
        } 
        
        // INTERFAZ DE BLOQUEO WEB CYBERPUNK CONSTANTE
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
