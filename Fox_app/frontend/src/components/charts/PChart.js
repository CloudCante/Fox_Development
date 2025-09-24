import React, { useState } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Header } from '../pagecomp/Header';
import { useTheme } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend
);
const PChart = ({  data = [], title = "P-Chart", subtitle = "",
  station = "", model = "", week = ""
}) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const theme = useTheme();
  // Early return for no data
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Header
          title={`No data available for ${station} station`}
          subTitle="Select different week, model, or station to view P-Chart data"
          titleVariant="h6"
          subTitleVariant="body2"
          titleColor="text.secondary"
        />
      </Box>
    );
  }

  // Calculate P-chart statistics
  const calculatePChartStats = (data) => {
    const totalDefects = data.reduce((sum, day) => sum + day.fails, 0);
    const totalSamples = data.reduce((sum, day) => sum + (day.fails + day.passes), 0);
    const P = totalDefects / totalSamples;
    const Q = 1 - P;
    const N_bar = totalSamples / data.length;
    
    return {
      P,
      UCL: P + (3 * Math.sqrt((P * Q) / N_bar)),
      LCL: Math.max(0, P - (3 * Math.sqrt((P * Q) / N_bar))), // LCL cannot be negative
      hasNegativeLCL: P - (3 * Math.sqrt((P * Q) / N_bar)) < 0
    };
  };

  const stats = calculatePChartStats(data);

  // Process daily points
  const processedData = data.map(point => {
    const totalSample = point.fails + point.passes;
    const dailyP = point.fails / totalSample;
    
    return {
      date: point.date,
      proportion: dailyP,
      isOutOfControl: dailyP > stats.UCL || dailyP < stats.LCL,
      sampleSize: totalSample,
      defects: point.fails
    };
  });

  // Check for runs (7+ points above/below centerline)
  let runCount = 0;
  let lastPosition = null;
  processedData.forEach((point, index) => {
    const currentPosition = point.proportion > stats.P;
    if (lastPosition === currentPosition) {
      runCount++;
      if (runCount >= 7) {
        // Mark points in the run as out of control
        for (let i = index - 6; i <= index; i++) {
          processedData[i].isOutOfControl = true;
        }
      }
    } else {
      runCount = 1;
    }
    lastPosition = currentPosition;
  });

  // Format data for chart
  const labels = processedData.map(point => {
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  });

  const chartData = {
    labels: labels,
    datasets: [
      { label: 'Daily Proportion',
        data: processedData.map(point => point.proportion * 100),
        borderColor: '#1976d2',
        backgroundColor: processedData.map(point => 
          point.isOutOfControl ? '#d32f2f' : '#1976d2'
        ),
        pointRadius: 6,
        pointBorderWidth: 2,
        fill: false,
        tension: 0,
        showLine: true,
      },
      { label: 'UCL',
        data: Array(labels.length).fill(stats.UCL * 100),
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      { label: 'CL (p̄)',
        data: Array(labels.length).fill(stats.P * 100),
        borderColor: '#4caf50',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      { label: 'LCL',
        data: Array(labels.length).fill(stats.LCL * 100),
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
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
          color: theme.palette.text.secondary,
          usePointStyle: true,
          padding: 20
        },
        color: theme.palette.text.secondary,
      },
      title: {
        display: false
      },
      tooltip: {
        enabled: false // Disable hover tooltips, we'll use click instead
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Production Day',
          color: theme.palette.text.primary
        },
        grid: {
          display: true,
          color: '#f0f0f0'
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      y: {
        title: {
          display: true,
          text: 'Defect Rate (%)',
          color: theme.palette.text.primary
        },
        beginAtZero: true,
        max: Math.max(stats.UCL * 100, ...processedData.map(p => p.proportion * 100)) * 1.1,
        grid: {
          display: true,
          color: '#f0f0f0'
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value) {
            return value.toFixed(1) + '%';
          },
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const dataIndex = elements[0].index;
        const point = processedData[dataIndex];
        
        setSelectedPoint({
          date: point.date,
          proportion: point.proportion,
          sampleSize: point.sampleSize,
          defects: point.defects,
          isOutOfControl: point.isOutOfControl,
          ucl: stats.UCL,
          lcl: stats.LCL
        });
      } else {
        setSelectedPoint(null);
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const outOfControlCount = processedData.filter(p => p.isOutOfControl).length;
  const selectedPointRows = [
    { label: 'Daily Proportion', value: `${(selectedPoint?.proportion * 100).toFixed(2)}%` },
    { label: 'Sample Size',      value: `${selectedPoint?.sampleSize} parts`       },
    { label: 'Defects',          value: selectedPoint?.defects                   },
    { label: 'UCL',              value: `${(selectedPoint?.ucl * 100).toFixed(2)}%` },
    { label: 'LCL',              value: `${(selectedPoint?.lcl * 100).toFixed(2)}%` },
    {
      label: 'Status',
      value: selectedPoint?.isOutOfControl ? 'OUT OF CONTROL' : 'In Control',
      sx: {
        color: selectedPoint?.isOutOfControl ? 'error.main' : 'success.main',
        fontWeight: 'bold'
      }
    }
  ];

  return (
    <Box>
      {stats.hasNegativeLCL && (
        <Box sx={{ 
          bgcolor: 'warning.light', 
          p: 1, 
          borderRadius: 1, 
          mb: 2 
        }}>
          <Typography variant="body2" color="warning.dark">
            ⚠️ The Lower Control Limit calculation resulted in negative values and has been adjusted to zero.
          </Typography>
        </Box>
      )}

      <Box 
        sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2, 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 1
      }}>
        <Typography variant="body2">
          <strong>Average Defect Rate:</strong> {(stats.P * 100).toFixed(2)}%
        </Typography>
        <Typography variant="body2">
          <strong>Out of Control Points:</strong> {outOfControlCount}/{processedData.length}
        </Typography>
      </Box>


      <Header
        title={title}
        subTitle={subtitle}
        titleVariant="h6"
        subTitleVariant="body2"
      />
      
      <Box sx={{ height: 400, mt: 2 }}>
        <Line data={chartData} options={options} />
      </Box>

      {/* Click-to-view Point Details */}
      {selectedPoint && (
        <Fade in={true}>
          <Paper sx={{ mt: 2, p: 2, bgcolor: selectedPoint.isOutOfControl ? 'error.light' : 'info.light', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Point Details - {new Date(selectedPoint.date).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {selectedPointRows.map(({ label, value, sx }) => (
                <Typography variant="body2" key={label} sx={sx}>
                  <strong>{label}:</strong> {value}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Fade>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>P-Chart Statistics:</strong> {processedData.length} data points • 
          Control limits based on overall proportion • 
          Red points indicate out-of-control conditions • 
          3-sigma control limits (99.7% confidence)
        </Typography>
      </Box>
    </Box>
  );
};

export default PChart;