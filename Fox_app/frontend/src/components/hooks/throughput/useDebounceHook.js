import { useRef, useCallback } from 'react';
import { debounceHeavy, batchUpdates } from '../../../utils/performanceUtils.js';

/**
 * Custom hook for debouncing heavy operations
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
export const useDebounce = (callback, delay = 100) => {
  const debouncedFn = useRef(
    debounceHeavy((newState) => {
      batchUpdates(() => callback(newState));
    }, delay)
  ).current;

  return useCallback((data) => {
    debouncedFn(data);
  }, [debouncedFn]);
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/main
