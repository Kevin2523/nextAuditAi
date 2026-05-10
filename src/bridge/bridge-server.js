const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let latestAlert = null;

// Endpoint for n8n to send alerts
app.post('/n8n-webhook', (req, res) => {
    const { dispositivo, mensaje, severidad, timestamp } = req.body;
    
    if (!dispositivo || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (dispositivo, mensaje)' });
    }

    latestAlert = {
        dispositivo,
        mensaje,
        severidad: severidad || 'info',
        timestamp: timestamp || new Date().toISOString()
    };

    console.log('Alerta recibida de n8n:', latestAlert);
    res.status(200).json({ message: 'Alerta recibida correctamente' });
});

// Endpoint for frontend to fetch latest alert
app.get('/get-alert', (req, res) => {
    if (!latestAlert) {
        return res.status(204).send(); // No Content
    }

    const alertToSend = latestAlert;
    latestAlert = null; // Clear after sending

    res.status(200).json(alertToSend);
});

app.listen(port, () => {
    console.log(`Servidor puente de NextAudit corriendo en http://localhost:${port}`);
});
