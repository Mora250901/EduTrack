require('dotenv').config();
const app = require('./app');
 
const PORT = process.env.PORT || 3000;
 
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Prueba la ruta: http://localhost:${PORT}/health`);
    console.log(`Prueba la base de datos: http://localhost:${PORT}/api/alumnos`);
});