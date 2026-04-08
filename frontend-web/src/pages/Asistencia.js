import React, { useState } from 'react';
import { registrarAsistencia } from '../api';

function Asistencia({ alumnos, usuario }) {
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [asistencia, setAsistencia] = useState({ estado: 'presente', observacion: '' });
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        setAsistencia({ ...asistencia, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlumno) {
            setMensaje('❌ Selecciona un alumno');
            return;
        }
        setSaving(true);
        try {
            const hoy = new Date().toISOString().split('T')[0];
            await registrarAsistencia({
                alumno_id: selectedAlumno,
                fecha: hoy,
                estado: asistencia.estado,
                observacion: asistencia.observacion,
                registrado_por: usuario?.id
            });
            setMensaje('✅ Asistencia registrada correctamente');
            setSelectedAlumno('');
            setAsistencia({ estado: 'presente', observacion: '' });
        } catch (error) {
            setMensaje('❌ Error al registrar asistencia');
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>📝 Registrar Asistencia</h2>

                {mensaje && (
                    <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '10px', backgroundColor: mensaje.includes('✅') ? '#e8f5e9' : '#ffebee' }}>
                        {mensaje}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <select
                            value={selectedAlumno}
                            onChange={(e) => setSelectedAlumno(e.target.value)}
                            required
                            style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="">Selecciona un alumno</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} {alumno.apellido} - {alumno.grado}° {alumno.seccion}
                                </option>
                            ))}
                        </select>
                    </div>

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
                        disabled={saving}
                        style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer' }}
                    >
                        {saving ? 'Registrando...' : 'Registrar Asistencia'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Asistencia;