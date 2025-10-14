// Enhanced WidgetManager with reset functionality
import React, { useState, Component, useEffect, useMemo } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh'; // or your preferred icon
import { Header } from '../pagecomp/Header.jsx'
import { gridStyle } from '../theme/themes.js';
import { GlobalSettingsContext, useGlobalSettings } from '../../data/GlobalSettingsContext.js';
import { useTheme } from '@emotion/react';

const API_BASE = process.env.REACT_APP_API_BASE;

// Error Boundary to catch widget rendering errors
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Widget Error:', error, errorInfo, 'Widget ID:', this.props.widgetId);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Typography color="error">
                    Widget Error: {this.state.error?.message || 'Unknown error'}
                </Typography>
            );
        }

        return this.props.children;
    }
}

export function WidgetManager({
    widgets = []
}) {
    const { state, dispatch } = useGlobalSettings();
    const { startDate, endDate } = state;

    const theme = useTheme();

    const handleResetWidget = (widgetId) => {
        dispatch({
            type: 'UPDATE_WIDGET_SETTINGS',
            widgetId,
            settings: { loaded: false } // Reset to unloaded state
        });
    };

    if (!Array.isArray(widgets) || widgets.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Header
                    title="Add Widget to Dashboard"
                    subTitle="Choose a Widget first, then select from available parameters for that Widget"
                    titleVariant="h6"
                    subTitleVariant="body2"
                    titleColor="text.secondary"
                />
            </Box>
        )
    }
        
    return (
        <Box sx={gridStyle}>
            {widgets.map(({ id, Widget }, index) => {             
                return (
                    <Box 
                        key={id} 
                        sx={{ 
                            position: 'relative',
                            '& > *': { // Target the direct child (the widget)
                                position: 'relative'
                            }
                        }}
                    >
                        {/* Widget content */}
                        {Widget ? (
                            <ErrorBoundary widgetId={id}>
                                <Widget widgetId={id}/>
                            </ErrorBoundary>
                        ) : (
                            <Typography>Widget component missing for id: {id}</Typography>
                        )}

                        {/* Reset button overlay - positioned over the widget */}
                        <IconButton
                            onClick={() => handleResetWidget(id)}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 1001,
                                backgroundColor: theme.palette.background.default,
                                color: theme.palette.background.paper,
                                width: 32,
                                height: 32,
                                opacity: 0.7,
                                transition: 'opacity 0.2s ease-in-out',
                                '&:hover': {
                                    opacity: 1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    color: 'white'
                                }
                            }}
                            size="small"
                            title="Reset Widget"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )
            })}
        </Box>
    );
}