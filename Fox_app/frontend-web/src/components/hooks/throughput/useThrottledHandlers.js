import { useCallback, useRef } from 'react';

const DEFAULT_THROTTLE_DELAY = 50;

/**
 * Custom hook for creating throttled event handlers
 * @param {number} defaultDelay - Default throttle delay in milliseconds
 * @returns {Function} createThrottledHandler function
 */
export const useThrottledHandlers = (defaultDelay = DEFAULT_THROTTLE_DELAY) => {
  const createThrottledHandler = useCallback((handler, delay = defaultDelay) => {
    const ref = useRef(0);
    
    return (event) => {
      event.preventDefault();
      const now = Date.now();
      if (now - ref.current < delay) return;
      ref.current = now;
      handler(event);
    };
  }, [defaultDelay]);

  return { createThrottledHandler };
};
