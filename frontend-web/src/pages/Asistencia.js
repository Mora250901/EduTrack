import React, { useState } from 'react';
import { registrarAsistencia } from '../api';

const BASE_URL = 'https://edutrack-backend-2ycx.onrender.com';

const estadoEmoji = { presente: '✅', ausente: '❌', tarde: '⏰' };

function Asistencia({ alumnos, usuario }) {
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [asistencia, setAsistencia] = useState({ estado: 'presente', observacion: '' });
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [asistenciaExistente, setAsistenciaExistente] = useState(null);
    const [confirmando, setConfirmando] = useState(false);

    const handleChangeAlumno = async (e) => {
        const alumno_id = e.target.value;
        setSelectedAlumno(alumno_id);
        setAsistenciaExistente(null);
        setConfirmando(false);
        setMensaje('');

        if (!alumno_id) return;

        const hoy = new Date().toISOString().split('T')[0];
        try {
            const res = await fetch(`${BASE_URL}/api/asistencias/verificar?alumno_id=${alumno_id}&fecha=${hoy}`);
            const data = await res.json();
            if (data.existe) {
                setAsistenciaExistente(data.asistencia);
                setAsistencia({ estado: data.asistencia.estado, observacion: data.asistencia.observacion || '' });
            }
        } catch (error) {
            console.error('Error al verificar asistencia:', error);
        }
    };

    const handleChange = (e) => {
        setAsistencia({ ...asistencia, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlumno) {
            setMensaje('❌ Selecciona un alumno');
            return;
        }

        // Si ya existe asistencia y no ha confirmado aún, mostrar aviso
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

            if (resultado.actualizado) {
                setMensaje('✅ Asistencia actualizada correctamente');
            } else {
                setMensaje('✅ Asistencia registrada correctamente');
            }

            setSelectedAlumno('');
            setAsistencia({ estado: 'presente', observacion: '' });
            setAsistenciaExistente(null);
        } catch (error) {
            setMensaje('❌ Error al registrar asistencia');
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje(''), 4000);
        }
    };

    const alumnoNombre = alumnos.find(a => a.id === selectedAlumno);

    return (
        <div>
            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📝 Registrar Asistencia</h2>

                {mensaje && (
                    <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '10px', backgroundColor: mensaje.includes('✅') ? '#e8f5e9' : '#ffebee' }}>
                        {mensaje}
                    </div>
                )}

                {/* Aviso de confirmación */}
                {confirmando && asistenciaExistente && alumnoNombre && (
                    <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffcc02', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                        <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>
                            ⚠️ {alumnoNombre.nombre} {alumnoNombre.apellido} ya tiene asistencia registrada hoy:
                            {' '}{estadoEmoji[asistenciaExistente.estado]} <strong>{asistenciaExistente.estado}</strong>
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: '14px' }}>
                            ¿Deseas modificarla a {estadoEmoji[asistencia.estado]} <strong>{asistencia.estado}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleSubmit}
                                style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Sí, modificar
                            </button>
                            <button
                                onClick={() => setConfirmando(false)}
                                style={{ padding: '8px 16px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <select
                            value={selectedAlumno}
                            onChange={handleChangeAlumno}
                            required
                            style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Selecciona un alumno</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} {alumno.apellido} - {alumno.grado}° {alumno.seccion}
                                    {asistenciaExistente && alumno.id === selectedAlumno ? ' (ya registrado hoy)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Indicador de asistencia existente */}
                    {asistenciaExistente && (
                        <div style={{ backgroundColor: '#fff3e0', padding: '8px 12px', borderRadius: '4px', marginBottom: '10px', fontSize: '14px' }}>
                            {estadoEmoji[asistenciaExistente.estado]} Ya registrado hoy como <strong>{asistenciaExistente.estado}</strong> — puedes modificarlo abajo
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <label><input type="radio" name="estado" value="presente" checked={asistencia.estado === 'presente'} onChange={handleChange} /> ✅ Presente</label>
                        <label><input type="radio" name="estado" value="ausente" checked={asistencia.estado === 'ausente'} onChange={handleChange} /> ❌ Ausente</label>
                        <label><input type="radio" name="estado" value="tarde" checked={asistencia.estado === 'tarde'} onChange={handleChange} /> ⏰ Tarde</label>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            name="observacion"
                            placeholder="Observación (opcional)"
                            value={asistencia.observacion}
                            onChange={handleChange}
                            style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || confirmando}
                        style={{ padding: '8px 16px', backgroundColor: asistenciaExistente ? '#ff9800' : '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer' }}
                    >
                        {saving ? 'Guardando...' : asistenciaExistente ? '✏️ Modificar Asistencia' : '📝 Registrar Asistencia'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Asistencia;