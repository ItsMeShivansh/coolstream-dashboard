import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './AnalyticsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsChart({ data }) {
  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Feels Like (°C)',
        data: data.feelsLikeHistory,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        yAxisID: 'y',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Fan Speed (RPM)',
        data: data.rpmHistory,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y1',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 13,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Real-Time Performance Analytics',
        font: {
          size: 16,
          weight: '700'
        },
        padding: 20,
        color: '#1e3c72'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
          font: {
            weight: '600'
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#ef4444',
          font: {
            weight: '600'
          }
        },
        ticks: {
          color: '#ef4444'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Fan Speed (RPM)',
          color: '#3b82f6',
          font: {
            weight: '600'
          }
        },
        ticks: {
          color: '#3b82f6'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="analytics-chart card">
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="chart-insights">
        <div className="insight-item">
          <span className="insight-icon">📈</span>
          <div>
            <div className="insight-label">Average RPM</div>
            <div className="insight-value">
              {data.rpmHistory.length > 0 
                ? Math.round(data.rpmHistory.reduce((a, b) => a + b, 0) / data.rpmHistory.length)
                : 0
              } RPM
            </div>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-icon">🌡️</span>
          <div>
            <div className="insight-label">Avg Feels Like</div>
            <div className="insight-value">
              {data.feelsLikeHistory.length > 0
                ? (data.feelsLikeHistory.reduce((a, b) => a + b, 0) / data.feelsLikeHistory.length).toFixed(1)
                : 0
              }°C
            </div>
          </div>
        </div>

        <div className="insight-item">
          <span className="insight-icon">⚡</span>
          <div>
            <div className="insight-label">Data Points</div>
            <div className="insight-value">{data.timestamps.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsChart;
