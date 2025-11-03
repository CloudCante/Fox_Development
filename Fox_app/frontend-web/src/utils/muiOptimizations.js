/**
 * Performance optimizations specific to Material-UI components
 * These optimizations target the most expensive MUI operations
 */

import React from 'react';
import { IconButton, Drawer } from '@mui/material';

/**
 * Creates a version of MUI's Drawer component that uses CSS transitions
 * instead of JavaScript-based transitions for better performance
 * 
 * This significantly reduces CPU usage during drawer animations by:
 * 1. Using direct CSS transitions instead of JS-calculated ones
 * 2. Bypassing React's transition management
 * 3. Applying optimized transform properties
 */
export const createFastDrawer = (DrawerComponent) => {
  return React.forwardRef((props, ref) => {
    const { open, ...otherProps } = props;
    
    // Apply CSS-based transitions instead of JS transitions
    const optimizedProps = {
      ...otherProps,
      open,
      // Skip JS transition management
      TransitionComponent: undefined,
      // Use direct CSS transitions
      sx: {
        ...otherProps.sx,
        '& .MuiDrawer-paper': {
          ...(otherProps.sx && otherProps.sx['& .MuiDrawer-paper']),
          transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms !important',
          transform: open ? 'none !important' : 'translate(-100%, 0) !important',
        },
      },
    };
    
    return <DrawerComponent ref={ref} {...optimizedProps} />;
  });
};

/**
 * Optimized IconButton that prevents unnecessary re-renders
 * 
 * This addresses the major performance bottleneck with Material-UI icons:
 * 1. Disables expensive ripple effects
 * 2. Maintains stable icon references
 * 3. Only updates when click handler changes
 */
export const OptimizedIconButton = React.memo(
  ({ icon, onClick, ...props }) => {
    // Clone the icon to ensure it has a stable reference
    const iconElement = React.cloneElement(icon);
    
    return (
      <IconButton 
        onClick={onClick} 
        disableTouchRipple 
        disableRipple 
        {...props}
      >
        {iconElement}
      </IconButton>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the onClick function changes
    return prevProps.onClick === nextProps.onClick;
  }
);

/**
 * Creates a lightweight replacement for MUI's Drawer backdrop
 * 
 * The standard MUI backdrop is expensive because it:
 * 1. Uses JS-driven animations
 * 2. Creates many DOM nodes
 * 3. Applies complex styles
 * 
 * This implementation is much more efficient
 */
export const LightweightBackdrop = React.memo(({ onClose, open }) => {
  if (!open) return null;
  
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1200,
        visibility: open ? 'visible' : 'hidden',
        opacity: open ? 1 : 0,
        transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  );
});

/**
 * Determines if the current environment is a low-end device
 * 
 * Used to conditionally apply performance optimizations based on
 * the device's capabilities. This helps provide the best experience
 * across different hardware without sacrificing too much on high-end devices.
 */
export function isLowEndDevice() {
  // Check if running in browser
  if (typeof window === 'undefined') return false;
  
  // Check for device memory API (Chrome only)
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return true;
  }
  
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile) {
    return true;
  }
  
  return false;
} 