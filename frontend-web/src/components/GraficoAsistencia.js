import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function GraficoAsistencia({ data }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Asistencia por Grado',
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Porcentaje (%)'
                }
            }
        }
    };

    const chartData = {
        labels: data.map(item => `${item.grado}° ${item.seccion}`),
        datasets: [
            {
                label: 'Presentes (%)',
                data: data.map(item => item.porcentajePresente),
                backgroundColor: 'rgba(76, 175, 80, 0.6)',
                borderColor: '#4CAF50',
                borderWidth: 1,
                borderRadius: 8
            },
            {
                label: 'Ausentes (%)',
                data: data.map(item => item.porcentajeAusente),
                backgroundColor: 'rgba(244, 67, 54, 0.6)',
                borderColor: '#f44336',
                borderWidth: 1,
                borderRadius: 8
            },
            {
                label: 'Tarde (%)',
                data: data.map(item => item.porcentajeTarde),
                backgroundColor: 'rgba(255, 152, 0, 0.6)',
                borderColor: '#ff9800',
                borderWidth: 1,
                borderRadius: 8
            }
        ]
    };

    return (
        <div style={{ height: '400px', marginTop: '20px' }}>
            <Bar options={options} data={chartData} />
        </div>
    );
}