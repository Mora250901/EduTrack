import React from 'react';
import { atenderAlerta } from '../api';

function Alertas({ alertas, onAlertaAtendida }) {
    const handleAtender = async (id) => {
        try {
            await atenderAlerta(id);
            onAlertaAtendida(id);
        } catch (error) {
            console.error('Error al atender alerta:', error);
        }
    };

    const colorNivel = (nivel) => {
        if (nivel === 'alto') return '#f44336';
        if (nivel === 'medio') return '#ff9800';
        return '#4CAF50';
    };

    return (
        <div>
            <h2>⚠️ Alertas Pendientes</h2>

            {alertas.length === 0 ? (
                <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <p>✅ No hay alertas pendientes</p>
                </div>
            ) : (
                alertas.map(alerta => (
                    <div
                        key={alerta.id}
                        style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: `4px solid ${colorNivel(alerta.nivel)}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <strong>{alerta.alumnos?.nombre} {alerta.alumnos?.apellido}</strong>
                                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                                    {alerta.alumnos?.grado}° {alerta.alumnos?.seccion}
                                </span>
                                <span style={{ marginLeft: '10px', fontSize: '12px', backgroundColor: colorNivel(alerta.nivel), color: 'white', padding: '2px 8px', borderRadius: '12px' }}>
                                    {alerta.nivel}
                                </span>
                                <p style={{ margin: '8px 0 4px', fontSize: '14px' }}>{alerta.mensaje}</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                                    {new Date(alerta.fecha_creacion).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleAtender(alerta.id)}
                                style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                ✓ Atendida
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default Alertas;