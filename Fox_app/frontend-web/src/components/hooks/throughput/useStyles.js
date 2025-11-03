import { useMemo } from 'react';

/**
 * Custom hook for generating consistent styles based on processing state
 * @param {boolean} isProcessing - Whether the component is in processing state
 * @returns {Object} Style objects for different components
 */
export const useStyles = (isProcessing = false) => {
  return useMemo(() => ({
    container: { 
      textAlign: 'center', 
      py: 8 
    },
    chartContainer: { 
      height: 500, 
      mt: 2 
    },
    processing: {
      opacity: isProcessing ? 0.7 : 1,
      transition: 'opacity 0.2s ease-in-out',
      pointerEvents: isProcessing ? 'none' : 'auto',
      contain: 'layout style paint',
      willChange: isProcessing ? 'opacity' : 'auto'
    },
    errorContainer: { 
      textAlign: 'center', 
      py: 4, 
      color: 'error.main' 
    },
    loadingContainer: { 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      py: 8, 
      gap: 2 
    }
  }), [isProcessing]);
};
