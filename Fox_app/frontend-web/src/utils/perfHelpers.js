/**
 * Performance helpers for the Quality Dashboard
 * 
 * Import this file in your component to enhance it with performance monitoring
 * and gain access to performance utilities.
 * 
 * Usage in components:
 * ```
 * import { trackComponent, trackFunction } from '../utils/perfHelpers';
 * 
 * // Wrap your component with performance tracking
 * const MyComponent = trackComponent(({ data }) => {
 *   // Your component code here
 * });
 * 
 * // Or track specific functions
 * const loadData = trackFunction(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * }, 'loadData');
 * ```
 */

import { useRenderLogger, usePerformanceTracker, throttle, debounce } from './renderOptimizations';
import { measureExecutionTime, withPerformanceMonitoring, logPropChanges } from './performanceAnalyzer';
import { 
  measureComponentPerformance, 
  findSlowComponents, 
  logPerformanceReport 
} from './performanceTest';

// Only enable in development mode
const isDev = process.env.NODE_ENV === 'development';

/**
 * Wraps a component with performance monitoring
 * @param {React.Component} Component - Component to track
 * @param {string} name - Optional name override
 * @returns {React.Component} - Tracked component
 */
export function trackComponent(Component, name) {
  if (!isDev) return Component;
  return withPerformanceMonitoring(Component, name);
}

/**
 * Wraps a function with performance timing
 * @param {Function} fn - Function to track
 * @param {string} name - Function name for logging
 * @returns {Function} - Tracked function
 */
export function trackFunction(fn, name = 'Anonymous Function') {
  if (!isDev) return fn;
  
  return (...args) => {
    return measureExecutionTime(() => fn(...args), name);
  };
}

/**
 * Creates a custom equality function for React.memo
 * @param {string} componentName - Name of the component
 * @returns {Function} - Equality check function that logs changes
 */
export function createEqualityFn(componentName) {
  if (!isDev) {
    // In production, just do a shallow compare
    return (prevProps, nextProps) => {
      for (const key in prevProps) {
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }
      return true;
    };
  }
  
  // In development, log prop changes
  return (prevProps, nextProps) => {
    return logPropChanges(prevProps, nextProps, componentName);
  };
}

/**
 * Creates a development-only wrapper for React.memo
 * @param {React.Component} Component - Component to memoize
 * @param {string} name - Optional name override
 * @returns {React.Component} - Memoized component with debugging
 */
export function debugMemo(Component, name = Component.displayName || Component.name) {
  if (!isDev) {
    // In production, just use regular memo
    return React.memo(Component);
  }
  
  // In development, add prop change tracking
  return React.memo(
    trackComponent(Component, name),
    createEqualityFn(name)
  );
}

// Re-export everything for convenience
export {
  // From renderOptimizations
  useRenderLogger,
  usePerformanceTracker,
  throttle,
  debounce,
  
  // From performanceAnalyzer
  measureExecutionTime,
  withPerformanceMonitoring,
  logPropChanges,
  
  // From performanceTest
  measureComponentPerformance,
  findSlowComponents,
  logPerformanceReport
}; 