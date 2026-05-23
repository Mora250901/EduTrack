const BASE_URL = 'https://edutrack-backend-2ycx.onrender.com';
 
// Helper para headers con token
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});
 
// ==================== ALUMNOS ====================
 
export const getAlumnos = () =>
    fetch(`${BASE_URL}/api/alumnos`, { headers: authHeaders() }).then(res => res.json());
 
export const crearAlumno = (alumno) =>
    fetch(`${BASE_URL}/api/alumnos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(alumno)
    }).then(res => res.json());
 
// ==================== ASISTENCIAS ====================
 
export const getAsistencias = () =>
    fetch(`${BASE_URL}/api/asistencias`, { headers: authHeaders() }).then(res => res.json());
 
export const registrarAsistencia = (asistencia) =>
    fetch(`${BASE_URL}/api/asistencias`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(asistencia)
    }).then(res => res.json());
 
export const getReporteAsistencia = (fecha) =>
    fetch(`${BASE_URL}/api/asistencias/reporte?fecha=${fecha}`, { headers: authHeaders() }).then(res => res.json());
 
export const getEstadisticasAsistencia = () =>
    fetch(`${BASE_URL}/api/asistencias/estadisticas`, { headers: authHeaders() }).then(res => res.json());
 
// ==================== ALERTAS ====================
 
export const getAlertasPendientes = () =>
    fetch(`${BASE_URL}/api/alertas/pendientes`, { headers: authHeaders() }).then(res => res.json());
 
export const crearAlerta = (alerta) =>
    fetch(`${BASE_URL}/api/alertas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(alerta)
    }).then(res => res.json());
 
export const atenderAlerta = (id) =>
    fetch(`${BASE_URL}/api/alertas/${id}/atender`, {
        method: 'PUT',
        headers: authHeaders()
    }).then(res => res.json());
 
// ==================== CASOS ====================
 
export const getCasos = () =>
    fetch(`${BASE_URL}/api/casos`, { headers: authHeaders() }).then(res => res.json());
 
export const crearCaso = (caso) =>
    fetch(`${BASE_URL}/api/casos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(caso)
    }).then(res => res.json());
 
export const cerrarCaso = (id) =>
    fetch(`${BASE_URL}/api/casos/${id}/cerrar`, {
        method: 'PUT',
        headers: authHeaders()
    }).then(res => res.json());
 
// ==================== SEGUIMIENTOS ====================
 
export const getSeguimientosPorCaso = (caso_id) =>
    fetch(`${BASE_URL}/api/seguimientos/caso/${caso_id}`, { headers: authHeaders() }).then(res => res.json());
 
export const crearSeguimiento = (seguimiento) =>
    fetch(`${BASE_URL}/api/seguimientos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(seguimiento)
    }).then(res => res.json());
 
// ==================== AUTENTICACIÓN ====================
 
export const login = (email, password) =>
    fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    }).then(res => res.json());
 
// ==================== NOTIFICACIONES ====================
 
export const notificarPadre = (alumno_id, mensaje) =>
    fetch(`${BASE_URL}/api/notificar/padre`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ alumno_id, mensaje })
    }).then(res => res.json());