/**
 * Performance analysis utilities to help developers identify bottlenecks
 */

// Enable in development mode only
const isDev = process.env.NODE_ENV === 'development';

/**
 * Measures how long a function takes to execute and logs results
 * @param {Function} fn - Function to measure
 * @param {string} name - Name of the function for logging
 * @returns {any} - Result of the function execution
 */
export function measureExecutionTime(fn, name = 'Anonymous Function') {
  if (!isDev) return fn();
  
  console.log(`⏱️ Executing ${name}...`);
  const start = performance.now();
  try {
    const result = fn();
    const end = performance.now();
    console.log(`✅ ${name} completed in ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Attaches performance monitoring to React components
 * @param {React.Component} Component - Component to monitor
 * @param {string} name - Name of the component
 * @returns {React.Component} - Wrapped component with monitoring
 */
export function withPerformanceMonitoring(Component, name = Component.displayName || Component.name) {
  if (!isDev) return Component;
  
  // Set display name for DevTools
  const MonitoredComponent = (props) => {
    console.log(`🔄 Rendering ${name}...`);
    const start = performance.now();
    
    // Track prop changes
    const propsKeys = Object.keys(props);
    if (propsKeys.length > 0) {
      console.log(`📊 ${name} props:`, propsKeys.join(', '));
    }
    
    const result = <Component {...props} />;
    
    // We need to use setTimeout because the actual render happens after this function returns
    setTimeout(() => {
      const end = performance.now();
      console.log(`🏁 ${name} rendered in ${(end - start).toFixed(2)}ms`);
    }, 0);
    
    return result;
  };
  
  MonitoredComponent.displayName = `Monitored(${name})`;
  return MonitoredComponent;
}

/**
 * Identifies which props are causing re-renders
 * @param {object} prevProps - Previous props object
 * @param {object} nextProps - Next props object
 * @param {string} componentName - Component name for logging
 * @returns {boolean} - Whether props are equal (for use in shouldComponentUpdate or React.memo)
 */
export function logPropChanges(prevProps, nextProps, componentName) {
  if (!isDev) return false;
  
  let hasChanged = false;
  const changedProps = [];
  
  // Compare each prop
  const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
  
  allKeys.forEach(key => {
    if (prevProps[key] !== nextProps[key]) {
      hasChanged = true;
      changedProps.push(key);
      
      // Log the actual values that changed
      console.log(`🔍 ${componentName} prop '${key}' changed:`, {
        from: prevProps[key],
        to: nextProps[key]
      });
    }
  });
  
  if (hasChanged) {
    console.log(`⚠️ ${componentName} will re-render due to changes in: ${changedProps.join(', ')}`);
  }
  
  return !hasChanged; // Return true if props are equal (to prevent re-render)
}

/**
 * Analyze a React component tree for potential performance issues
 * @param {object} componentTree - Component hierarchy object
 */
export function analyzeComponentTree(componentTree) {
  if (!isDev) return;
  
  console.group('🔍 Component Tree Analysis');
  
  // Recursively analyze the tree
  const analyze = (node, depth = 0) => {
    const indent = '  '.repeat(depth);
    
    console.log(`${indent}📊 ${node.name || 'Anonymous'}`);
    
    // Check for common issues
    if (node.renderCount > 5) {
      console.warn(`${indent}⚠️ High render count: ${node.renderCount}`);
    }
    
    if (node.renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`${indent}⚠️ Slow render time: ${node.renderTime.toFixed(2)}ms`);
    }
    
    // Check children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => analyze(child, depth + 1));
    }
  };
  
  analyze(componentTree);
  
  console.groupEnd();
} 