import React from 'react';
import { atenderAlerta } from '../api';

const nivelConfig = {
    alto:  { color: 'var(--danger)',  bg: 'var(--danger-bg)',  emoji: '🔴' },
    medio: { color: 'var(--warning)', bg: 'var(--warning-bg)', emoji: '🟡' },
    bajo:  { color: 'var(--success)', bg: 'var(--success-bg)', emoji: '🟢' },
};

function Alertas({ alertas, onAlertaAtendida }) {
    const handleAtender = async (id) => {
        try {
            await atenderAlerta(id);
            onAlertaAtendida(id);
        } catch (error) {
            console.error('Error al atender alerta:', error);
        }
    };

    const altas  = alertas.filter(a => a.nivel === 'alto');
    const medias = alertas.filter(a => a.nivel === 'medio');
    const bajas  = alertas.filter(a => a.nivel === 'bajo');
    const orden  = [...altas, ...medias, ...bajas];

    return (
        <div>
            <div className="page-header">
                <h2>⚠️ Alertas Pendientes</h2>
                <p>Gestiona las alertas de bienestar estudiantil por orden de prioridad.</p>
            </div>

            {/* Resumen */}
            {alertas.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Alta prioridad',  count: altas.length,  color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
                        { label: 'Media prioridad', count: medias.length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                        { label: 'Baja prioridad',  count: bajas.length,  color: 'var(--success)', bg: 'var(--success-bg)' },
                    ].map(item => (
                        <div key={item.label} style={{
                            background: item.bg, borderRadius: 'var(--radius-md)',
                            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.6rem', fontWeight: '700', color: item.color }}>{item.count}</span>
                            <span style={{ fontSize: '13px', color: item.color, fontWeight: '500' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {alertas.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>✅</p>
                    <p style={{ color: 'var(--success)', fontWeight: '600', fontSize: '16px' }}>No hay alertas pendientes</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px' }}>Todos los casos están atendidos</p>
                </div>
            ) : (
                orden.map(alerta => {
                    const cfg = nivelConfig[alerta.nivel] || nivelConfig.bajo;
                    return (
                        <div key={alerta.id} className="fade-in" style={{
                            background: 'var(--white)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px',
                            marginBottom: '12px',
                            borderLeft: `4px solid ${cfg.color}`,
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'var(--transition)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <strong style={{ color: 'var(--gray-900)', fontSize: '15px' }}>
                                        {alerta.alumnos?.nombre} {alerta.alumnos?.apellido}
                                    </strong>
                                    <span className="badge badge-primary">
                                        {alerta.alumnos?.grado}° {alerta.alumnos?.seccion}
                                    </span>
                                    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
                                        {cfg.emoji} {alerta.nivel}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                                        {alerta.tipo}
                                    </span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--gray-700)', margin: '0 0 6px' }}>
                                    {alerta.mensaje}
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--gray-500)', margin: 0 }}>
                                    🕐 {new Date(alerta.fecha_creacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button
                                className="btn btn-success"
                                onClick={() => handleAtender(alerta.id)}
                                style={{ whiteSpace: 'nowrap', fontSize: '13px' }}
                            >
                                ✓ Atendida
                            </button>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Alertas;