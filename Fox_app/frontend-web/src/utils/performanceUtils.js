/**
 * Performance Utility Functions
 * 
 * Reusable performance optimization utilities for the Quality Dashboard
 */

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * Simple throttle for event handlers (simpler version for basic use cases)
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds (default 300ms)
 * @returns {Function} Throttled function
 */
export const simpleThrottle = (func, delay = 300) => {
  let lastCall = 0;
  
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
};

/**
 * Debounce function to delay function execution until after a period of inactivity
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Enhanced debounce for heavy processing with idle callback
 * Uses requestIdleCallback when available for better performance
 */
export const debounceHeavy = (func, delay) => {
  let timeoutId;
  let lastArgs;
  
  return (...args) => {
    lastArgs = args;
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      if (window.requestIdleCallback) {
        // Use idle callback for heavy processing when browser is idle
        window.requestIdleCallback(() => func(...lastArgs), { timeout: delay * 2 });
      } else {
        // Fallback for browsers without requestIdleCallback
        func(...lastArgs);
      }
    }, delay);
  };
};

/**
 * Batch multiple state updates using requestAnimationFrame
 */
export const batchUpdates = (() => {
  let pending = false;
  let callbacks = [];
  
  return (callback) => {
    callbacks.push(callback);
    
    if (!pending) {
      pending = true;
      requestAnimationFrame(() => {
        const toExecute = [...callbacks];
        callbacks = [];
        pending = false;
        
        toExecute.forEach(cb => cb());
      });
    }
  };
})();

/**
 * Intersection Observer for lazy rendering of expensive components
 */
export const createLazyRenderer = (threshold = 0.1) => {
  const observerMap = new Map();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const callback = observerMap.get(entry.target);
      if (callback) {
        callback(entry.isIntersecting);
      }
    });
  }, { threshold });
  
  return {
    observe: (element, callback) => {
      observerMap.set(element, callback);
      observer.observe(element);
    },
    unobserve: (element) => {
      observerMap.delete(element);
      observer.unobserve(element);
    }
  };
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measure execution time of a function
   * @param {Function} func - Function to measure
   * @param {string} label - Label for the measurement
   * @returns {*} Function result
   */
  measureTime: (func, label = 'Function') => {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${label} took ${(end - start).toFixed(2)} milliseconds`);
    return result;
  },

  /**
   * Mark performance timing for debugging
   * @param {string} label - Label for the mark
   */
  mark: (label) => {
    if (performance.mark) {
      performance.mark(label);
    }
  },

  /**
   * Measure time between two marks
   * @param {string} startMark - Start mark label
   * @param {string} endMark - End mark label
   * @param {string} measureName - Name for the measurement
   */
  measure: (startMark, endMark, measureName) => {
    if (performance.measure) {
      performance.measure(measureName, startMark, endMark);
    }
  }
};

/**
 * Common style object creators to prevent recreation
 */
export const createMemoizedStyles = {
  /**
   * Create memoized container styles
   * @param {Object} overrides - Style overrides
   * @returns {Object} Memoized style object
   */
  container: (overrides = {}) => ({
    textAlign: 'center',
    py: 8,
    ...overrides
  }),

  /**
   * Create memoized card content styles
   * @param {Object} overrides - Style overrides
   * @returns {Object} Memoized style object
   */
  cardContent: (overrides = {}) => ({
    p: 3,
    ...overrides
  }),

  /**
   * Create memoized chart container styles
   * @param {number} height - Chart height
   * @param {Object} overrides - Style overrides
   * @returns {Object} Memoized style object
   */
  chartContainer: (height = 500, overrides = {}) => ({
    height,
    mt: 2,
    ...overrides
  })
}; 