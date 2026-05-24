import React, { useState } from 'react';

function Alumnos({ alumnos, onAlumnoCreado }) {
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        grado: '',
        seccion: '',
        telefono_padre: ''
    });
    const [saving, setSaving] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [busqueda, setBusqueda] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('https://edutrack-backend-2ycx.onrender.com/api/alumnos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                const texto = data.errores ? data.errores.join(' · ') : (data.error || 'Error al registrar alumno');
                setMensaje({ texto, tipo: 'danger' });
                return;
            }

            setMensaje({ texto: 'Alumno registrado correctamente', tipo: 'success' });
            setForm({ nombre: '', apellido: '', grado: '', seccion: '', telefono_padre: '' });
            onAlumnoCreado(data);
        } catch (error) {
            setMensaje({ texto: 'Error de conexión con el servidor', tipo: 'danger' });
        } finally {
            setSaving(false);
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
        }
    };

    const alumnosFiltrados = alumnos.filter(a =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        `${a.grado}° ${a.seccion}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <h2>👥 Gestión de Alumnos</h2>
                <p>Registra y consulta la lista de alumnos del colegio.</p>
            </div>

            {/* Formulario */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gray-900)', marginBottom: '16px' }}>
                    ➕ Agregar Nuevo Alumno
                </h3>

                {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo}`} style={{ marginBottom: '16px' }}>
                        {mensaje.tipo === 'success' ? '✅' : '❌'} {mensaje.texto}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Nombre</label>
                            <input className="input" type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Apellido</label>
                            <input className="input" type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Grado</label>
                            <select className="select" name="grado" value={form.grado} onChange={handleChange} required>
                                <option value="">Seleccionar</option>
                                <option value="1">1° Primaria</option>
                                <option value="2">2° Primaria</option>
                                <option value="3">3° Primaria</option>
                                <option value="4">4° Primaria</option>
                                <option value="5">5° Primaria</option>
                                <option value="6">6° Primaria</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Sección</label>
                            <select className="select" name="seccion" value={form.seccion} onChange={handleChange} required>
                                <option value="">Seleccionar</option>
                                <option value="A">Sección A</option>
                                <option value="B">Sección B</option>
                                <option value="C">Sección C</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Teléfono del Padre</label>
                            <input className="input" type="tel" name="telefono_padre" placeholder="+51 999 999 999" value={form.telefono_padre || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success" disabled={saving}>
                        {saving ? '⏳ Guardando...' : '💾 Guardar Alumno'}
                    </button>
                </form>
            </div>

            {/* Lista */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gray-900)' }}>
                        📋 Lista de Alumnos <span className="badge badge-primary" style={{ marginLeft: '8px' }}>{alumnos.length}</span>
                    </h3>
                    <input
                        className="input"
                        type="text"
                        placeholder="🔍 Buscar alumno..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ width: '220px' }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre completo</th>
                                <th>Grado</th>
                                <th>Sección</th>
                                <th>Teléfono del Padre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '32px' }}>
                                        {busqueda ? 'No se encontraron alumnos con ese criterio' : 'No hay alumnos registrados'}
                                    </td>
                                </tr>
                            ) : (
                                alumnosFiltrados.map(alumno => (
                                    <tr key={alumno.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px',
                                                    background: 'var(--primary-bg)',
                                                    borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '13px', fontWeight: '700', color: 'var(--primary)'
                                                }}>
                                                    {alumno.nombre.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{alumno.nombre} {alumno.apellido}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-primary">{alumno.grado}° Primaria</span></td>
                                        <td><span className="badge badge-purple">Sección {alumno.seccion}</span></td>
                                        <td style={{ color: alumno.telefono_padre ? 'var(--gray-700)' : 'var(--gray-300)' }}>
                                            {alumno.telefono_padre || '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Alumnos;