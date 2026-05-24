import React, { useState } from 'react';
import { registrarAsistencia } from '../api';

const BASE_URL = 'https://edutrack-backend-2ycx.onrender.com';
const estadoEmoji = { presente: '✅', ausente: '❌', tarde: '⏰' };
const estadoColor = { presente: 'var(--success)', ausente: 'var(--danger)', tarde: 'var(--warning)' };
const estadoBg    = { presente: 'var(--success-bg)', ausente: 'var(--danger-bg)', tarde: 'var(--warning-bg)' };

function Asistencia({ alumnos, usuario }) {
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [asistencia, setAsistencia] = useState({ estado: 'presente', observacion: '' });
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [asistenciaExistente, setAsistenciaExistente] = useState(null);
    const [confirmando, setConfirmando] = useState(false);
    const [verificando, setVerificando] = useState(false);

    const handleChangeAlumno = async (e) => {
        const alumno_id = e.target.value;
        setSelectedAlumno(alumno_id);
        setAsistenciaExistente(null);
        setConfirmando(false);
        setMensaje({ texto: '', tipo: '' });
        if (!alumno_id) return;

        setVerificando(true);
        const hoy = new Date().toISOString().split('T')[0];
        try {
            const res = await fetch(`${BASE_URL}/api/asistencias/verificar?alumno_id=${alumno_id}&fecha=${hoy}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.existe) {
                setAsistenciaExistente(data.asistencia);
                setAsistencia({ estado: data.asistencia.estado, observacion: data.asistencia.observacion || '' });
            } else {
                setAsistencia({ estado: 'presente', observacion: '' });
            }
        } catch (error) {
            console.error('Error al verificar asistencia:', error);
        } finally {
            setVerificando(false);
        }
    };

    const handleChange = (e) => {
        setAsistencia({ ...asistencia, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlumno) {
            setMensaje({ texto: 'Selecciona un alumno', tipo: 'danger' });
            return;
        }
        if (asistenciaExistente && !confirmando) {
            setConfirmando(true);
            return;
        }

        setSaving(true);
        setConfirmando(false);
        try {
            const hoy = new Date().toISOString().split('T')[0];
            const resultado = await registrarAsistencia({
                alumno_id: selectedAlumno,
                fecha: hoy,
                estado: asistencia.estado,
                observacion: asistencia.observacion,
                registrado_por: usuario?.id
            });
            setMensaje({
                texto: resultado.actualizado ? 'Asistencia actualizada correctamente' : 'Asistencia registrada correctamente',
                tipo: 'success'
            });
            setSelectedAlumno('');
            setAsistencia({ estado: 'presente', observacion: '' });
            setAsistenciaExistente(null);
        } catch (error) {
            setMensaje({ texto: 'Error al registrar asistencia', tipo: 'danger' });
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
        }
    };

    const alumnoNombre = alumnos.find(a => a.id === selectedAlumno);

    const RadioEstado = ({ valor }) => (
        <label style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: 'var(--radius-sm)',
            border: `2px solid ${asistencia.estado === valor ? estadoColor[valor] : 'var(--gray-200)'}`,
            background: asistencia.estado === valor ? estadoBg[valor] : 'var(--white)',
            cursor: 'pointer', transition: 'var(--transition)', flex: 1,
            justifyContent: 'center', fontWeight: asistencia.estado === valor ? '600' : '400',
            color: asistencia.estado === valor ? estadoColor[valor] : 'var(--gray-700)'
        }}>
            <input type="radio" name="estado" value={valor} checked={asistencia.estado === valor} onChange={handleChange} style={{ display: 'none' }} />
            {estadoEmoji[valor]} {valor.charAt(0).toUpperCase() + valor.slice(1)}
        </label>
    );

    return (
        <div>
            <div className="page-header">
                <h2>📝 Registrar Asistencia</h2>
                <p>Marca la asistencia diaria de los alumnos al ingreso del colegio.</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>

                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`} style={{ marginBottom: '20px' }}>
                        {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
                    </div>
                )}

                {/* Confirmación */}
                {confirmando && asistenciaExistente && alumnoNombre && (
                    <div style={{
                        background: 'var(--warning-bg)', border: '1px solid var(--warning-light)',
                        borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px'
                    }} className="fade-in">
                        <p style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--warning)' }}>
                            ⚠️ {alumnoNombre.nombre} {alumnoNombre.apellido} ya tiene asistencia hoy:
                            {' '}{estadoEmoji[asistenciaExistente.estado]} <strong>{asistenciaExistente.estado}</strong>
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '12px' }}>
                            ¿Deseas modificarla a {estadoEmoji[asistencia.estado]} <strong>{asistencia.estado}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-success" onClick={handleSubmit}>✓ Sí, modificar</button>
                            <button className="btn btn-ghost" onClick={() => setConfirmando(false)}>Cancelar</button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Selector alumno */}
                    <div className="form-group">
                        <label>Alumno</label>
                        <select className="select" value={selectedAlumno} onChange={handleChangeAlumno} required>
                            <option value="">Selecciona un alumno...</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} {alumno.apellido} — {alumno.grado}° {alumno.seccion}
                                </option>
                            ))}
                        </select>
                        {verificando && (
                            <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                                🔍 Verificando asistencia...
                            </p>
                        )}
                    </div>

                    {/* Indicador existente */}
                    {asistenciaExistente && !confirmando && (
                        <div className="alert alert-warning fade-in" style={{ marginBottom: '16px' }}>
                            {estadoEmoji[asistenciaExistente.estado]} Ya registrado hoy como <strong>{asistenciaExistente.estado}</strong> — puedes modificarlo abajo
                        </div>
                    )}

                    {/* Estado con radio buttons visuales */}
                    <div className="form-group">
                        <label>Estado</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <RadioEstado valor="presente" />
                            <RadioEstado valor="ausente" />
                            <RadioEstado valor="tarde" />
                        </div>
                    </div>

                    {/* Observación */}
                    <div className="form-group">
                        <label>Observación <span style={{ color: 'var(--gray-500)', fontWeight: '400' }}>(opcional)</span></label>
                        <input
                            className="input"
                            type="text"
                            name="observacion"
                            placeholder="Ej: llegó sin uniforme, salió temprano..."
                            value={asistencia.observacion}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn ${asistenciaExistente ? 'btn-warning' : 'btn-primary'}`}
                        disabled={saving || confirmando}
                        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    >
                        {saving ? '⏳ Guardando...' : asistenciaExistente ? '✏️ Modificar Asistencia' : '📝 Registrar Asistencia'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Asistencia;