import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card,
  CardActionArea,
  Grid,
  Container,
  Paper
} from '@mui/material';
import { 
  Assessment as QualityIcon, 
  MonitorHeart as TestEngineerIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleQualityClick = () => {
    // Go to the original Quality Dashboard
    navigate('/quality-dashboard');
  };

  const handleTestEngineerClick = () => {
    navigate('/fixture-dash');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: 300,
                width: 300,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4
                }
              }}
              onClick={handleQualityClick}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <QualityIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                  Quality Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  KPI Reports & Analytics
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: 300,
                width: 300,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4
                }
              }}
              onClick={handleTestEngineerClick}
            >
              <CardActionArea
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <TestEngineerIcon sx={{ fontSize: 80, color: '#388e3c', mb: 2 }} />
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                  Test Engineer Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Real-time Equipment Monitoring
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
