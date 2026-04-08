import React from 'react';
import GraficoAsistencia from '../components/GraficoAsistencia';

function Dashboard({ usuario, stats, alertas, asistenciasHoy, datosGrafico, onAtenderAlerta }) {
    return (
        <div>
            {/* DIRECTOR */}
            {usuario?.rol === 'director' && (
                <>
                    <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h2>📊 Panel de Dirección</h2>
                        <p>Bienvenido, {usuario.nombre}. Aquí tienes el resumen del día.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>👥 Total Alumnos</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.totalAlumnos}</p>
                        </div>
                        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>⚠️ Alertas Pendientes</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#f44336' }}>{stats.alertasPendientes}</p>
                        </div>
                        <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>✅ Presentes Hoy</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#4CAF50' }}>{stats.presentesHoy}</p>
                        </div>
                        <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>❌ Ausentes Hoy</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#f44336' }}>{stats.ausentesHoy}</p>
                        </div>
                    </div>

                    {datosGrafico.length > 0 && (
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                            <GraficoAsistencia data={datosGrafico} />
                        </div>
                    )}

                    {alertas.length > 0 && (
                        <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
                            <h3>⚠️ Alertas Recientes</h3>
                            {alertas.slice(0, 3).map(alerta => (
                                <div key={alerta.id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', marginBottom: '8px', borderLeft: '4px solid #ff9800' }}>
                                    <strong>{alerta.alumnos?.nombre} {alerta.alumnos?.apellido}</strong>
                                    <p style={{ margin: '4px 0', fontSize: '14px' }}>{alerta.mensaje}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* PSICÓLOGO */}
            {usuario?.rol === 'psicologo' && (
                <>
                    <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h2>🧠 Panel del Psicólogo</h2>
                        <p>Bienvenido, {usuario.nombre}. Revisa las alertas y casos activos.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>⚠️ Alertas Pendientes</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#f44336' }}>{stats.alertasPendientes}</p>
                        </div>
                        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', flex: 1, minWidth: '150px' }}>
                            <h3>👥 Total Alumnos</h3>
                            <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.totalAlumnos}</p>
                        </div>
                    </div>

                    {alertas.length > 0 && (
                        <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
                            <h3>⚠️ Alertas Pendientes</h3>
                            {alertas.map(alerta => (
                                <div key={alerta.id} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', marginBottom: '8px', borderLeft: `4px solid ${alerta.nivel === 'alto' ? '#f44336' : alerta.nivel === 'medio' ? '#ff9800' : '#4CAF50'}` }}>
                                    <strong>{alerta.alumnos?.nombre} {alerta.alumnos?.apellido}</strong>
                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>{alerta.alumnos?.grado}° {alerta.alumnos?.seccion}</span>
                                    <p style={{ margin: '4px 0', fontSize: '14px' }}>{alerta.mensaje}</p>
                                    <button
                                        onClick={() => onAtenderAlerta(alerta.id)}
                                        style={{ padding: '4px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Marcar como atendida
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* DOCENTE */}
            {usuario?.rol === 'docente' && (
                <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h2>📝 Panel del Docente</h2>
                    <p>Bienvenido, {usuario.nombre}. Registra la asistencia de tus alumnos.</p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '120px' }}>
                            <h4>✅ Presentes</h4>
                            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#4CAF50' }}>{stats.presentesHoy}</p>
                        </div>
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '120px' }}>
                            <h4>❌ Ausentes</h4>
                            <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#f44336' }}>{stats.ausentesHoy}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;