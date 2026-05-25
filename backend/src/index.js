require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:5000';

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
    console.log(`Prueba la base de datos: http://localhost:${PORT}/api/alumnos`);
});

// Job programado: analizar cada 24 horas
setInterval(async () => {
    try {
        await fetch(`${ANALYTICS_URL}/analizar`, { method: 'POST' });
        console.log('✅ Análisis predictivo ejecutado automáticamente');
    } catch (error) {
        console.error('❌ Error en análisis automático:', error.message);
    }
}, 24 * 60 * 60 * 1000);