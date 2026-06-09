const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");
const axios = require("axios");

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

// Control de flujo para evitar saturación
const rateLimit = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const window = 60000;
    const limit = 15;
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

// RUTA PARA GUARDAR SCRIPTS NUEVOS (Cumple estrictamente la regla de Firebase)
app.post("/save", async (req, res) => {
    try {
        const id = uuid();
        const scriptCode = req.body.code;
        if (!scriptCode) {
            return res.status(400).json({ success: false, error: "No code provided" });
        }
        // Enviamos el payload estructurado para validar correctamente en la BD
        const payload = { code: scriptCode };
        await axios.put(`${REALTIME_DB_URL}/${id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al guardar:", error.message);
        res.status(500).json({ success: false, error: "Error interno al guardar" });
    }
});

// RUTA PARA ACTUALIZAR SCRIPTS
app.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const scriptCode = req.body.code;
        if (!scriptCode) {
            return res.status(400).json({ success: false, error: "No code provided" });
        }
        const payload = { code: scriptCode };
        await axios.patch(`${REALTIME_DB_URL}/${id}.json`, payload);
        res.json({ success: true, id });
    } catch (error) {
        console.error("Error al actualizar:", error.message);
        res.status(500).json({ success: false, error: "Error interno al actualizar" });
    }
});

// RUTA RAW SECUNDARIA (LECTURA EN TEXTO PLANO LIMPIO)
app.get("/web/raw/:id", async (req, res) => {
    try {
        const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
        if (!response.data || !response.data.code) return res.status(404).send("Not Found");
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(response.data.code.replace(/\r/g, ""));
    } catch (error) {
        return res.status(500).send("Error en la base de datos");
    }
});

// --- RUTA PRINCIPAL CON DESVÍO DE TRÁFICO INTELIGENTE ---
app.get("/raw/:id", async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress;
        
        if (!checkRateLimit(clientIp)) {
            return res.status(429).send("-- Bloqueo por exceso de peticiones.");
        }

        const userAgent = req.headers['user-agent'] || '';

        // Detector de Bots automatizados
        const esBot = /python|node|axios|requests|curl|wget|java|php|scrapy|perl|ruby|go|httpclient/i.test(userAgent);
        
        // Entorno del juego
        const esEntornoCorrecto = userAgent.includes('Roblox') || userAgent.includes('Protocol') || userAgent.includes('Executor') || userAgent === '';

        // --- EL DESVÍO (Filtro Honeypot) ---
        if (esBot || !esEntornoCorrecto) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.send(`--[[
  [ CODEVAULT SECURE CORE SHIELD ]
  [ STATUS: DISCONNECTED / UNAUTHORIZED ENVIRONMENT ]
]]
while true do 
    print("Esperando verificación de firma remota...")
    task.wait(10)
end`);
        }

        // --- FLUJO LEGÍTIMO: Trae el código intacto desde Firebase ---
        const response = await axios.get(`${REALTIME_DB_URL}/${req.params.id}.json`);
        
        if (!response.data || !response.data.code) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.status(404).send("-- CodeVault Error: ID no registrada o vacía.");
        }

        // Limpieza de caracteres invisibles del formato de texto
        const scriptLimpio = response.data.code.replace(/\r/g, "");

        // Headers optimizados para que loadstring lea el stream de texto al instante
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        return res.send(scriptLimpio);

    } catch (error) {
        console.error("Error en el Core de desvío:", error.message);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(500).send("-- Error de conexión interna.");
    }
});

// INTERFAZ CYBERPUNK DE CONTROL
app.get("/panel", (req, res) => {
    res.send(`
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
            font-family: monospace; 
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
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8);
            text-align: center;
        }
        .logo-text { font-size: 26px; font-weight: 900; letter-spacing: 4px; color: #ffffff; }
        .status-box { 
            padding: 12px; 
            background: rgba(255,255,255,0.01); 
            border-left: 4px solid #00ffaa; 
            font-size: 11px; 
            text-align: left;
            margin: 20px 0;
        }
        .green { color: #00ffaa; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-text">CODEVAULT</div>
        <div class="status-box">
            &gt; CORE: <span class="green">DESVIO_HONEYPOT_ONLINE</span><br>
            &gt; RULES: <span class="green">SINTAXIS_FIREBASE_OK</span>
        </div>
        <p style="font-size: 12px; color: #8a8f9e;">Filtros activos. Los scripts nuevos se procesarán en texto plano puro.</p>
    </div>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor CodeVault corriendo de forma excelente en el puerto " + PORT);
});
