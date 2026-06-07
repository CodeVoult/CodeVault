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

// NUEVA RUTA: Exclusiva para que tu interfaz web (view.html) lea el código limpio
app.get("/web/raw/:id", (req, res) => {
    const code = scripts[req.params.id];

    if (!code) {
        return res.status(404).send("Not Found");
    }

    // Devuelve siempre el script Lua limpio para tu editor
    res.setHeader('Content-Type', 'text/plain');
    return res.send(code);
});

// Mantiene la protección original intacta para el resto del mundo
app.get("/raw/:id", (req, res) => {
    const code = scripts[req.params.id];

    if (!code) {
        return res.status(404).send("Not Found");
    }

    const userAgent = req.headers['user-agent'] || '';

    const esExecutor = userAgent.includes('Roblox') || 
                       userAgent.includes('Protocol') || 
                       userAgent.includes('Executor') ||
                       userAgent === '';

    if (esExecutor) {
        res.setHeader('Content-Type', 'text/plain');
        return res.send(code);
    } else {
        return res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeVault — Protected Script</title>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: #000000;
            color: #fff;
            font-family: 'JetBrains Mono', monospace;
            height: 100vh;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        canvas {
            position: fixed;
            inset: 0;
            z-index: 0;
        }

        .card {
            position: relative;
            z-index: 10;
            background: rgba(8, 8, 8, 0.85);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 18px;
            padding: 52px 44px;
            max-width: 460px;
            width: 92%;
            text-align: center;
            backdrop-filter: blur(18px);
            box-shadow:
                0 0 0 1px rgba(255,255,255,0.04) inset,
                0 60px 120px rgba(0,0,0,0.95),
                0 0 80px rgba(255,255,255,0.02);
            animation: cardIn 1s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
            from { opacity: 0; transform: translateY(30px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .badge {
            font-size: 10px;
            letter-spacing: 0.2em;
            color: rgba(255,255,255,0.35);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 30px;
            display: inline-block;
            padding: 6px 16px;
            margin-bottom: 30px;
            animation: fadeUp 1s 0.2s both;
        }

        h1 {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 58px;
            letter-spacing: 2px;
            line-height: 1;
            margin-bottom: 18px;
            color: #ffffff;
            animation: fadeUp 1s 0.3s both;
        }

        h1 span {
            color: rgba(255,255,255,0.2);
        }

        p {
            color: rgba(255,255,255,0.45);
            font-size: 12.5px;
            line-height: 1.85;
            margin-bottom: 30px;
            font-family: 'JetBrains Mono', monospace;
            animation: fadeUp 1s 0.4s both;
        }

        .info-box {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 16px 18px;
            font-size: 11.5px;
            color: rgba(255,255,255,0.3);
            text-align: left;
            line-height: 2;
            margin-bottom: 34px;
            animation: fadeUp 1s 0.5s both;
        }

        .info-box .val {
            color: rgba(255,255,255,0.75);
            font-weight: 700;
        }

        .btn {
            display: block;
            width: 100%;
            padding: 16px;
            background: #ffffff;
            color: #000000;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.08em;
            border-radius: 10px;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
            animation: fadeUp 1s 0.6s both;
        }

        .btn:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 20px 40px rgba(255,255,255,0.12);
            background: #f0f0f0;
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>

<canvas id="c"></canvas>

<div class="card">
    <div class="badge">CODEVAULT SECURITY</div>
    <h1>Code<span>Vault</span></h1>
    <p>Este script se encuentra protegido bajo el entorno de CodeVault. El acceso web al código plano está deshabilitado para evitar su filtración.</p>

    <div class="info-box">
        &gt; STATUS: <span class="val">CÓDIGO PROTEGIDO</span><br>
        &gt; El ejecutor interpretará este enlace de manera correcta.
    </div>

    <a href="https://leeh10.github.io/CodeVault/index.html" class="btn">
        ¿Quieres subir tus propios scripts? Dale aquí
    </a>
</div>

<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let W, H, nodes = [];
const COUNT = 90;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}

class Node {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.5 + 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
    }
}

resize();
for (let i = 0; i < COUNT; i++) nodes.push(new Node());
window.addEventListener('resize', resize);

const MAX_DIST = 150;

function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < nodes.length; i++) {
        nodes[i].update();
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < MAX_DIST) {
                const alpha = (1 - dist / MAX_DIST) * 0.18;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }

    for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

draw();
</script>
</body>
</html>
        `);
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running");
});
