import React, { useState } from 'react';
import { crearAlumno } from '../api';

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
            const nuevoAlumno = await crearAlumno(form);
            setMensaje('✅ Alumno registrado correctamente');
            setForm({ nombre: '', apellido: '', grado: '', seccion: '', telefono_padre: '' });
            onAlumnoCreado(nuevoAlumno);
        } catch (error) {
            setMensaje('❌ Error al registrar alumno');
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje(''), 3000);
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
                    <input type="text" name="grado" placeholder="Grado (ej: 3)" value={form.grado} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <input type="text" name="seccion" placeholder="Sección (ej: A)" value={form.seccion} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
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