import React, { useState } from 'react';
import {} from '../api';

function Alumnos({ alumnos, onAlumnoCreado }) {
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        grado: '',
        seccion: '',
        telefono_padre: ''
    });
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/alumnos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errores) {
                    setMensaje('❌ ' + data.errores.join(' · '));
                } else {
                    setMensaje('❌ ' + (data.error || 'Error al registrar alumno'));
                }
                return;
            }

            setMensaje('✅ Alumno registrado correctamente');
            setForm({ nombre: '', apellido: '', grado: '', seccion: '', telefono_padre: '' });
            onAlumnoCreado(data);
        } catch (error) {
            setMensaje('❌ Error de conexión con el servidor');
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje(''), 4000);
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2>➕ Agregar Nuevo Alumno</h2>
                {mensaje && (
                    <div style={{ padding: '10px', borderRadius: '4px', marginBottom: '10px', backgroundColor: mensaje.includes('✅') ? '#e8f5e9' : '#ffebee' }}>
                        {mensaje}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <select name="grado" value={form.grado} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Grado</option>
                        <option value="1">1° Primaria</option>
                        <option value="2">2° Primaria</option>
                        <option value="3">3° Primaria</option>
                        <option value="4">4° Primaria</option>
                        <option value="5">5° Primaria</option>
                        <option value="6">6° Primaria</option>
                    </select>
                    <select name="seccion" value={form.seccion} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Sección</option>
                        <option value="A">Sección A</option>
                        <option value="B">Sección B</option>
                        <option value="C">Sección C</option>
                    </select>
                    <input type="tel" name="telefono_padre" placeholder="Teléfono del padre (WhatsApp)" value={form.telefono_padre || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button type="submit" disabled={saving} style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer' }}>
                        {saving ? 'Guardando...' : 'Guardar Alumno'}
                    </button>
                </form>
            </div>

            <h2>📋 Lista de Alumnos</h2>
            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead style={{ backgroundColor: '#f0f0f0' }}>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Grado</th>
                        <th>Sección</th>
                        <th>Teléfono del Padre</th>
                    </tr>
                </thead>
                <tbody>
                    {alumnos.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No hay alumnos registrados</td></tr>
                    ) : (
                        alumnos.map(alumno => (
                            <tr key={alumno.id}>
                                <td>{alumno.nombre}</td>
                                <td>{alumno.apellido}</td>
                                <td>{alumno.grado}</td>
                                <td>{alumno.seccion}</td>
                                <td>{alumno.telefono_padre}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Alumnos;