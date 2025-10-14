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
import { Typography, Box } from '@mui/material';

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

const PChart = ({ 
  data = [], 
  title = "P-Chart", 
  subtitle = "",
  yAxisLabel = "Proportion",
  chartType = "proportion",
  station = "",
  model = "",
  week = ""
}) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for {station} station
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select different week, model, or station to view P-Chart data
        </Typography>
      </Box>
    );
  }

  const labels = data.map(point => {
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  });

  const defectRatePoints = data.map(point => point.defectRate);
  const uclPoints = data.map(point => point.ucl * 100);
  const lclPoints = data.map(point => point.lcl * 100);
  const centerLinePoints = data.map(point => point.centerLine * 100);
  
  const pointColors = data.map(point => point.inControl ? '#1976d2' : '#d32f2f');
  const pointBorderColors = data.map(point => point.inControl ? '#1976d2' : '#d32f2f');

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Daily Defect Rate',
        data: defectRatePoints,
        borderColor: '#1976d2',
        backgroundColor: pointColors,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointBorderColors,
        pointRadius: 6,
        pointBorderWidth: 2,
        fill: false,
        tension: 0,
        showLine: false, 
      },
      {
        label: 'Upper Control Limit (UCL)',
        data: uclPoints,
        borderColor: '#ff9800',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Center Line (p̄)',
        data: centerLinePoints,
        borderColor: '#4caf50',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: 'Lower Control Limit (LCL)',
        data: lclPoints,
        borderColor: '#ff9800',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const point = data[dataIndex];
            
            return [
              `Sample Size: ${point.sampleSize} parts`,
              `Defects: ${point.defects}`,
              `UCL: ${(point.ucl * 100).toFixed(2)}%`,
              `LCL: ${(point.lcl * 100).toFixed(2)}%`,
              `Status: ${point.inControl ? 'In Control' : 'OUT OF CONTROL'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Production Day'
        },
        grid: {
          display: true,
          color: '#f0f0f0'
        }
      },
      y: {
        title: {
          display: true,
          text: yAxisLabel
        },
        beginAtZero: true,
        max: Math.max(...uclPoints) * 1.1, // Add 10% padding above UCL
        grid: {
          display: true,
          color: '#f0f0f0'
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ height: 400, mt: 2 }}>
        <Line data={chartData} options={options} />
      </Box>
      
      {/* Statistical Notes */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>P-Chart Statistics:</strong> {data.length} data point{data.length !== 1 ? 's' : ''} • 
          Control limits vary by sample size • 
          Red points indicate out-of-control conditions • 
          3-sigma control limits (99.7% confidence)
        </Typography>
      </Box>
    </Box>
  );
};

export default PChart; 