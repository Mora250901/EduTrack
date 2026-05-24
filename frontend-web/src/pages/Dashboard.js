import React from 'react';
import GraficoAsistencia from '../components/GraficoAsistencia';

function StatCard({ emoji, label, value, color, bg }) {
    return (
        <div className="stat-card" style={{ borderTop: `4px solid ${color}`, flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{emoji}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
        </div>
    );
}

function AlertaItem({ alerta, onAtender }) {
    const colorNivel = alerta.nivel === 'alto' ? 'var(--danger)' : alerta.nivel === 'medio' ? 'var(--warning)' : 'var(--success)';
    const bgNivel = alerta.nivel === 'alto' ? 'var(--danger-bg)' : alerta.nivel === 'medio' ? 'var(--warning-bg)' : 'var(--success-bg)';

    return (
        <div className="fade-in" style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '10px',
            borderLeft: `4px solid ${colorNivel}`,
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--gray-900)', fontSize: '14px' }}>
                        {alerta.alumnos?.nombre} {alerta.alumnos?.apellido}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                        {alerta.alumnos?.grado}° {alerta.alumnos?.seccion}
                    </span>
                    <span className="badge" style={{ background: bgNivel, color: colorNivel }}>
                        {alerta.nivel}
                    </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--gray-700)', margin: 0 }}>{alerta.mensaje}</p>
            </div>
            {onAtender && (
                <button
                    className="btn btn-success"
                    onClick={() => onAtender(alerta.id)}
                    style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                    ✓ Atendida
                </button>
            )}
        </div>
    );
}

function Dashboard({ usuario, stats, alertas, asistenciasHoy, datosGrafico, onAtenderAlerta }) {
    return (
        <div>
            {/* ==================== DIRECTOR ==================== */}
            {usuario?.rol === 'director' && (
                <>
                    <div className="page-header">
                        <h2>📊 Panel de Dirección</h2>
                        <p>Bienvenido, {usuario.nombre}. Aquí tienes el resumen del día.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <StatCard emoji="👥" label="Total Alumnos"      value={stats.totalAlumnos}      color="var(--primary)"  />
                        <StatCard emoji="⚠️" label="Alertas Pendientes" value={stats.alertasPendientes} color="var(--warning)"  />
                        <StatCard emoji="✅" label="Presentes Hoy"      value={stats.presentesHoy}      color="var(--success)"  />
                        <StatCard emoji="❌" label="Ausentes Hoy"       value={stats.ausentesHoy}       color="var(--danger)"   />
                    </div>

                    {datosGrafico.length > 0 && (
                        <div className="card" style={{ marginBottom: '24px' }}>
                            <GraficoAsistencia data={datosGrafico} />
                        </div>
                    )}

                    {alertas.length > 0 && (
                        <div className="card">
                            <h3 style={{ marginBottom: '16px', color: 'var(--gray-900)', fontSize: '15px', fontWeight: '600' }}>
                                ⚠️ Alertas Recientes
                            </h3>
                            {alertas.slice(0, 3).map(alerta => (
                                <AlertaItem key={alerta.id} alerta={alerta} />
                            ))}
                        </div>
                    )}

                    {alertas.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-500)' }}>
                            <p style={{ fontSize: '32px', marginBottom: '8px' }}>✅</p>
                            <p>No hay alertas pendientes</p>
                        </div>
                    )}
                </>
            )}

            {/* ==================== PSICÓLOGO ==================== */}
            {usuario?.rol === 'psicologo' && (
                <>
                    <div className="page-header">
                        <h2>🧠 Panel del Psicólogo</h2>
                        <p>Bienvenido, {usuario.nombre}. Revisa las alertas y casos activos.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <StatCard emoji="⚠️" label="Alertas Pendientes" value={stats.alertasPendientes} color="var(--warning)" />
                        <StatCard emoji="👥" label="Total Alumnos"      value={stats.totalAlumnos}      color="var(--primary)" />
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '16px', color: 'var(--gray-900)', fontSize: '15px', fontWeight: '600' }}>
                            ⚠️ Alertas Pendientes
                        </h3>
                        {alertas.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--gray-500)' }}>
                                <p style={{ fontSize: '28px', marginBottom: '8px' }}>✅</p>
                                <p>No hay alertas pendientes</p>
                            </div>
                        ) : (
                            alertas.map(alerta => (
                                <AlertaItem key={alerta.id} alerta={alerta} onAtender={onAtenderAlerta} />
                            ))
                        )}
                    </div>
                </>
            )}

            {/* ==================== DOCENTE ==================== */}
            {usuario?.rol === 'docente' && (
                <>
                    <div className="page-header">
                        <h2>📝 Panel del Docente</h2>
                        <p>Bienvenido, {usuario.nombre}. Registra la asistencia de tus alumnos.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <StatCard emoji="✅" label="Presentes Hoy" value={stats.presentesHoy} color="var(--success)" />
                        <StatCard emoji="❌" label="Ausentes Hoy"  value={stats.ausentesHoy}  color="var(--danger)"  />
                        <StatCard emoji="⏰" label="Tarde Hoy"
                            value={asistenciasHoy.filter(a => a.estado === 'tarde').length}
                            color="var(--warning)"
                        />
                        <StatCard emoji="👥" label="Total Alumnos" value={stats.totalAlumnos} color="var(--primary)" />
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;