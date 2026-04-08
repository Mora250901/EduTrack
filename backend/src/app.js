const express = require('express');
const cors = require('cors');
 
const authRoutes          = require('./routes/auth');
const alumnosRoutes       = require('./routes/alumnos');
const asistenciasRoutes   = require('./routes/asistencias');
const alertasRoutes       = require('./routes/alertas');
const casosRoutes         = require('./routes/casos');
const seguimientosRoutes  = require('./routes/seguimientos');
const notificacionesRoutes = require('./routes/notificaciones');
 
const app = express();
 
// Middlewares
app.use(cors());
app.use(express.json());
 
// Rutas de salud
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de EduTrack' });
});
 
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'EduTrack API funcionando correctamente'
    });
});
 
// Rutas de la API
app.use('/api', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/casos', casosRoutes);
app.use('/api/seguimientos', seguimientosRoutes);
app.use('/api/notificar', notificacionesRoutes);
 
module.exports = app;