// Global Variable Toolbar for Dashboard
import React,{useEffect} from 'react';
import { Box, Button, Paper } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { paperStyle, buttonStyle } from '../../theme/themes.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

export function TestWidget({ widgetId }) {
    
    const { state, dispatch } = useGlobalSettings();
    const { 
        // Global variables
     } = state;
    if (!state) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
    }    
    if (!widgetId) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
    }    
    const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};

    // Initialize widget settings if they don't exist
    useEffect(() => {
        if (!state.widgetSettings || !state.widgetSettings[widgetId]) {
            dispatch({
                type: 'UPDATE_WIDGET_SETTINGS',
                widgetId,
                settings: {}
            });
        }
    }, [widgetId, state.widgetSettings, dispatch]);
    
    // Local Variables
    // const [testStationData, setTestStationData] = useState([]);
    // const [loading, setLoading] = useState(true);

    // Use persisted values or defaults
    // const model = widgetSettings.model || '';
    // const key = widgetSettings.key || '';
    const loaded = widgetSettings.loaded || false;

    // Helper function to update widget settings
    const updateWidgetSettings = (updates) => {
        dispatch({
            type: 'UPDATE_WIDGET_SETTINGS',
            widgetId,
            settings: { ...widgetSettings, ...updates }
        });
    };

    useEffect(() => {
        if (!loaded) return;
        // any data fetching and proccessing
    }, [ loaded, widgetId]);

    const handleLoad = () => {
        // Set Persistant Values
        updateWidgetSettings({ loaded: true });
    };

    if (!loaded) {
        return (
            <Paper sx={paperStyle}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Button sx={buttonStyle} onClick={handleLoad}>
                        Load Widget Persistant values here
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={paperStyle}>
            <Box sx={{ textAlign: 'center', py: 8 }} >
                <Header title="This is a test Widget" subTitle={` Widget: ${widgetId}`}/>
            </Box>
        </Paper>
    );
}
