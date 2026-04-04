const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba (para verificar que el servidor funciona)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'EduTrack API funcionando correctamente' 
    });
});

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenido a la API de EduTrack' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
});