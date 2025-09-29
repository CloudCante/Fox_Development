// React Core
import React, { useMemo, useState, useCallback } from 'react';
// Material UI Components
import { Box, Modal, FormControl, Select, MenuItem, InputLabel, Typography, Button, Tabs, Tab, List, ListItem, ListItemText, Checkbox, IconButton } from '@mui/material';
import { DragIndicator, Delete } from '@mui/icons-material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';

// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx'
// Utilities and Helpers
import { Toolbar } from '../pagecomp/Toolbar.jsx';
import { WidgetManager } from '../pagecomp/WidgetManager.jsx'
import { buttonStyle, modalStyle } from '../theme/themes.js';
// Widgets
import { widgetList } from '../../data/widgetList.js';
import { getInitialStartDate, normalizeDate } from '../../utils/dateUtils.js'
import { useWeekNavigation } from '../hooks/packingCharts/useWeekNavigation.js';
import { GlobalSettingsContext, useGlobalSettings } from '../../data/GlobalSettingsContext.js';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const { state, dispatch } = useGlobalSettings();
    const { currentMode } = state;
    const navigate = useNavigate();

    const handleCurrentModeChange = (mode) => {
        dispatch({ type: 'SET_MODE', mode });
    }

    const handleButtonClick = (mode) => {
        handleCurrentModeChange(mode);
        navigate('/');
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Select Dashboard Mode</Typography>
            <Typography variant="body1" sx={{ mb: 4, ml: 2 }}>
                Choose a mode to customize your dashboard experience. Current mode: <strong>{currentMode}</strong>
            </Typography>
            <Box sx={{ height: 20 }} />
            <Button variant="contained" onClick={() => handleButtonClick('Quality')}>
                Quality Team Dashboard
            </Button>
            <Button variant="contained" onClick={() => handleButtonClick('TE')}>
                TE Team Dashboard
            </Button>
            {process.env.NODE_ENV === 'development' && (
            <Button variant="outlined" onClick={() => handleButtonClick('Dev')}>
                Developer Dashboard
            </Button>
            )}   
        </Box>
    );
};

export default Home;