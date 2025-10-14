import React, { useMemo, useRef, useEffect } from 'react';
import { IconButton } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useDashboardTheme } from './ThemeContext';
import { applyThemeColors } from './themes';

// Pre-render icons to avoid recreation on each render
// This significantly reduces SVG creation and DOM manipulation
const DarkIcon = <DarkModeIcon />;
const LightIcon = <LightModeIcon />;

export const ThemeToggle = React.memo(() => {
    const { isDarkMode, toggleTheme } = useDashboardTheme();
    const buttonRef = useRef(null);
    const lastToggleTime = useRef(0);
    
    // Memoize the style object to prevent recreation on renders
    const buttonStyle = useMemo(() => ({ 
        color: 'white',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    }), []);

    // Use pre-rendered icons based on current theme
    const icon = isDarkMode ? LightIcon : DarkIcon;
    
    // Handle the theme toggle with optimized performance
    const handleToggle = (e) => {
        e.preventDefault();
        
        // Throttle toggles to prevent rapid switching
        const now = Date.now();
        if (now - lastToggleTime.current < 300) {
            return;
        }
        lastToggleTime.current = now;
        
        // Apply visual feedback immediately (before state updates)
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
        
        // Give immediate visual feedback 
        if (buttonRef.current) {
            // Add a ripple effect manually
            const ripple = document.createElement('span');
            ripple.className = 'theme-toggle-ripple';
            ripple.style.cssText = `
                position: absolute;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 100%;
                height: 100%;
                opacity: 0;
                transform: scale(0);
                animation: theme-toggle-ripple 0.4s ease-out;
            `;
            
            buttonRef.current.appendChild(ripple);
            
            // Clean up ripple after animation
            setTimeout(() => {
                if (buttonRef.current?.contains(ripple)) {
                    buttonRef.current.removeChild(ripple);
                }
            }, 400);
        }
        
        // Actually toggle the theme state
        toggleTheme();
    };
    
    // Add ripple animation style
    useEffect(() => {
        if (!document.getElementById('theme-toggle-animation')) {
            const style = document.createElement('style');
            style.id = 'theme-toggle-animation';
            style.textContent = `
                @keyframes theme-toggle-ripple {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

    return (
        <IconButton 
            ref={buttonRef}
            onClick={handleToggle} 
            sx={buttonStyle}
            disableTouchRipple
            disableRipple
            aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
        >
            {icon}
        </IconButton>
    );
}, (prevProps, nextProps) => {
    // No props, so always return true to prevent unnecessary re-renders
    // This component should only re-render when the theme context changes
    return true;
}); 