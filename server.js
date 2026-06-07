const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const scripts = {};

app.get("/", (req, res) => {
    res.send("API funcionando");
});

app.post("/save", (req, res) => {
    const id = uuid();
    scripts[id] = req.body.code;
    res.json({
        success: true,
        id
    });
});

app.get("/raw/:id", (req, res) => {
    const code = scripts[req.params.id];

    if (!code) {
        return res.status(404).send("Not Found");
    }

    // Identificamos quién está solicitando el link
    const userAgent = req.headers['user-agent'] || '';

    // Filtro inteligente para detectar exploits de Roblox
    const esExecutor = userAgent.includes('Roblox') || 
                       userAgent.includes('Protocol') || 
                       userAgent.includes('Executor') ||
                       userAgent === '';

    if (esExecutor) {
        // Ejecutor de Roblox: Código Lua plano e instantáneo
        res.setHeader('Content-Type', 'text/plain');
        return res.send(code);
    } else {
        // Navegador Humano: Pasarela Premium Black con Partículas
        return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CodeVault — Protected Script</title>
                <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
                <style>
                    /* Reset y configuración del fondo negro absoluto */
                    body {
                        background: #050505;
                        color: #ffffff;
                        font-family: 'Space Grotesk', sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        overflow: hidden;
                        position: relative;
                    }

                    /* Efecto de partículas flotantes (Fondo Animado) */
                    .particles {
                        position: absolute;
                        inset: 0;
                        z-index: 1;
                        pointer-events: none;
                        background-image: 
                            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.02) 1px, transparent 1px),
                            radial-gradient(circle at 75% 15%, rgba(255,255,255,0.015) 2px, transparent 2px),
                            radial-gradient(circle at 40% 70%, rgba(255,255,255,0.02) 1.5px, transparent 1px),
                            radial-gradient(circle at 85% 80%, rgba(255,255,255,0.03) 1px, transparent 1px);
                        background-size: 200px 200px;
                        animation: floatBg 20s linear infinite;
                    }

                    @keyframes floatBg {
                        0% { background-position: 0 0; }
                        100% { background-position: 200px 200px; }
                    }

                    /* Rejilla fina Cyberpunk */
                    body::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background-image: linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px);
                        background-size: 25px 25px;
                        z-index: 1;
                    }

                    /* Contenedor principal Premium Black */
                    .gateway-card {
                        background: #0b0b0b;
                        border: 1px solid #161616;
                        padding: 45px 35px;
                        border-radius: 16px;
                        text-align: center;
                        max-width: 420px;
                        width: 90%;
                        z-index: 2;
                        box-shadow: 0 30px 70px rgba(0,0,0,0.85);
                    }

                    /* Etiqueta superior minimalista */
                    .badge {
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid #1c1c1c;
                        padding: 6px 14px;
                        border-radius: 6px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 11px;
                        color: #777777;
                        display: inline-block;
                        margin-bottom: 24px;
                        letter-spacing: 0.08em;
                    }

                    h1 {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 32px;
                        font-weight: 700;
                        margin: 0 0 14px 0;
                        letter-spacing: -1.5px;
                    }
                    h1 span { color: #3a3a3a; }

                    p {
                        color: #888888;
                        font-size: 14px;
                        line-height: 1.6;
                        margin: 0 0 28px 0;
                    }

                    /* Caja de estado estilo terminal oscura */
                    .info-box {
                        background: #070707;
                        border: 1px solid #121212;
                        border-radius: 8px;
                        padding: 16px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 12px;
                        color: #555;
                        text-align: left;
                        line-height: 1.6;
                        margin-bottom: 32px;
                    }
                    .info-box span {
                        color: #ffffff;
                        font-weight: 700;
                    }

                    /* Botón Premium Call-to-Action */
                    .btn-cta {
                        background: #ffffff;
                        color: #050505;
                        border: none;
                        padding: 14px 20px;
                        font-weight: 600;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 13.5px;
                        transition: all 0.2s ease;
                        width: 100%;
                        display: inline-block;
                        text-decoration: none;
                        box-sizing: border-box;
                    }
                    .btn-cta:hover {
                        background: #e5e5e5;
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(255,255,255,0.08);
                    }
                </style>
            </head>
            <body>
                <!-- Capa animada de partículas -->
                <div class="particles"></div>

                <div class="gateway-card">
                    <div class="badge">CODEVAULT SECURITY</div>
                    <h1>Code<span>Vault</span></h1>
                    <p>Este script se encuentra protegido legítimamente bajo el entorno de CodeVault. El acceso web al código plano está deshabilitado para evitar su filtración.</p>
                    
                    <div class="info-box">
                        > STATUS: <span>CÓDIGO PROTEGIDO</span><br>
                        > El ejecutor interpretará este enlace de manera correcta.
                    </div>

                    <!-- Enlace directo a tu index principal de GitHub Pages -->
                    <a href="https://leeh10.github.io/CodeVault/index.html" class="btn-cta">
                        ¿Quieres subir tus propios scripts? Dale aquí
                    </a>
                </div>
            </body>
            </html>
        `);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running");
});
