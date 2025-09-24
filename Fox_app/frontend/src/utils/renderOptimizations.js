/**
 * A collection of utilities to help optimize React component rendering
 * 
 * These hooks and functions address common performance bottlenecks
 * in React applications, particularly related to unnecessary renders
 * and expensive DOM operations.
 */

import { useRef, useEffect } from 'react';

/**
 * Custom hook to log components that are re-rendering too frequently
 * 
 * Adding this to suspected problematic components helps identify
 * render loops and unnecessary updates during development.
 */
export function useRenderLogger(componentName, deps = []) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Component ${componentName} rendered ${renderCount.current} times`);
  }, [componentName, ...deps]);
}

/**
 * Custom hook that identifies expensive renders and logs them to console
 * 
 * Helps find performance bottlenecks by measuring actual render time
 * and reporting when it exceeds a specified threshold.
 */
export function usePerformanceTracker(componentName, threshold = 10) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > threshold) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}

/**
 * Creates a throttled version of a function
 * 
 * Limits how often a function can be called, which is perfect for
 * scroll events, resize handlers, and other frequent browser events.
 */
export function throttle(func, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Creates a debounced version of a function
 * 
 * Ensures a function won't be called until a certain amount of time
 * has passed without it being called again. Great for search inputs,
 * window resize events, and API calls.
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
} 