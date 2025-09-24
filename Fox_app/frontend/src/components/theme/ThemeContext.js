import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { lightTheme, darkTheme, applyThemeColors } from './themes';

// Create the context with default values
const DashboardThemeContext = createContext({
    isDarkMode: false,
    toggleTheme: () => {},
});

// Create the provider component
export const DashboardThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Optimized toggle function that doesn't cause complete re-renders
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prevMode => !prevMode);
    }, []);
    
    // Apply CSS variables directly to the document for efficient theme switching
    useEffect(() => {
        // Apply the theme colors to CSS variables
        applyThemeColors(isDarkMode);
        
        // Set data-theme attribute for potential CSS selectors
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        
        // Apply body background for immediate visual feedback
        document.body.style.backgroundColor = isDarkMode ? 
            darkTheme.palette.background.default : 
            lightTheme.palette.background.default;
        document.body.style.color = isDarkMode ? '#ffffff' : '#000000';
        
        // Add transition for smooth visual changes
        if (!document.getElementById('theme-transition-style')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'theme-transition-style';
            styleEl.textContent = `
                body, div, header, nav, main, footer, section, aside {
                    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s !important;
                }
            `;
            document.head.appendChild(styleEl);
        }
    }, [isDarkMode]);
    
    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        isDarkMode,
        toggleTheme
    }), [isDarkMode, toggleTheme]);

    // Use the appropriate MUI theme object based on dark mode state
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <DashboardThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </DashboardThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useDashboardTheme = () => useContext(DashboardThemeContext); 