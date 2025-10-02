// React Core
import React, { useMemo, useState, useCallback } from 'react';
// Material UI Components
import { Box, Card, CardActionArea, Grid, InputLabel, Typography, Button, Tabs, Tab, List, ListItem, ListItemText, Checkbox, IconButton } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';

// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { useNavigate } from 'react-router-dom';
import { useGlobalSettings } from '../../data/GlobalSettingsContext.js';
import{
  Assessment as QualityIcon, 
  MonitorHeart as TestEngineerIcon
} from '@mui/icons-material';

export const Home = () => {
    const { state, dispatch } = useGlobalSettings();
    const { currentMode } = state;
    const navigate = useNavigate();

    const handleCurrentModeChange = (mode) => {
        dispatch({ type: 'SET_MODE', mode });
    }

    const handleButtonClick = (mode) => {
        handleCurrentModeChange(mode);
        navigate('/dashboard');
    }

    return (
        <Box>
            <Header title="Foxconn Home" subtitle="Select Dashboard Mode" />
            <Typography variant="body1" sx={{ mb: 4, ml: 2 }}>
                Choose which dashboard to access. Current mode: <strong>{currentMode}</strong>
            </Typography>
            <Grid container spacing={3} justifyContent="center">
                <Grid >
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
                    onClick={handleButtonClick.bind(null, 'Quality')}
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

                <Grid >
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
                    onClick={handleButtonClick.bind(null, 'TE')}
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
                {process.env.NODE_ENV === 'development' && (
                    <Button variant="outlined" onClick={() => handleButtonClick('Dev')}>
                        Developer Dashboard
                    </Button>
                )}  
            </Grid> 
        </Box>
    );
};

export default Home;