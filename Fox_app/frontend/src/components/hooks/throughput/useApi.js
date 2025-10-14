import { useCallback, useRef } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE;

/**
 * Custom hook for secure API calls with abort functionality
 * @returns {Function} secureApiCall function
 */
export const useApi = () => {
  const abortControllerRef = useRef(null);

  const secureApiCall = useCallback(async (url) => {
    if (!url || typeof url !== 'string' || !url.startsWith(API_BASE)) {
      throw new Error('Invalid API URL');
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') return null;
      throw error;
    }
  }, []);

  // Cleanup function to abort pending requests
  const cleanup = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { secureApiCall, cleanup };
};
