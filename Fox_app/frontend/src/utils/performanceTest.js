/**
 * Script to run performance tests on React components
 * 
 * Usage:
 * Import this file and call measureComponentPerformance() with a component to test
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

/**
 * Measures rendering performance of a component with various props
 * 
 * @param {React.Component} Component - Component to test
 * @param {Array<object>} propSets - Array of prop objects to test with
 * @param {object} options - Test configuration options
 * @returns {object} - Performance results
 */
export function measureComponentPerformance(Component, propSets = [{}], options = {}) {
  const {
    iterations = 5,
    warmupIterations = 2,
    container = document.createElement('div'),
    componentName = Component.displayName || Component.name || 'UnknownComponent'
  } = options;
  
  // Add container to DOM temporarily (required for rendering)
  if (!document.body.contains(container)) {
    document.body.appendChild(container);
  }
  
  console.group(`🧪 Performance Test: ${componentName}`);
  
  const results = [];
  
  // Test each set of props
  for (let i = 0; i < propSets.length; i++) {
    const props = propSets[i];
    console.log(`📊 Testing prop set #${i + 1}:`, props);
    
    // Warmup iterations (to prime JIT compiler)
    for (let j = 0; j < warmupIterations; j++) {
      render(<Component {...props} />, container);
      unmountComponentAtNode(container);
    }
    
    // Timed iterations
    const timings = [];
    
    for (let j = 0; j < iterations; j++) {
      const start = performance.now();
      render(<Component {...props} />, container);
      const renderTime = performance.now() - start;
      
      const updateStart = performance.now();
      render(<Component {...props} key={j} />, container);
      const updateTime = performance.now() - updateStart;
      
      timings.push({ renderTime, updateTime });
      unmountComponentAtNode(container);
    }
    
    // Calculate statistics
    const renderTimes = timings.map(t => t.renderTime);
    const updateTimes = timings.map(t => t.updateTime);
    
    const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length;
    const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const maxUpdateTime = Math.max(...updateTimes);
    
    // Report results
    console.log(`✅ Results for prop set #${i + 1}:`);
    console.log(`  Initial render: avg=${avgRenderTime.toFixed(2)}ms, max=${maxRenderTime.toFixed(2)}ms`);
    console.log(`  Re-render: avg=${avgUpdateTime.toFixed(2)}ms, max=${maxUpdateTime.toFixed(2)}ms`);
    
    // Provide performance assessment
    if (avgRenderTime > 16 || avgUpdateTime > 16) {
      console.warn(`⚠️ Performance may be problematic (>16ms rendering time)`);
    }
    
    results.push({
      props,
      avgRenderTime,
      avgUpdateTime,
      maxRenderTime,
      maxUpdateTime,
      renderTimes,
      updateTimes
    });
  }
  
  // Clean up
  if (document.body.contains(container)) {
    document.body.removeChild(container);
  }
  
  console.groupEnd();
  return results;
}

/**
 * Finds the slowest components in a component tree
 * 
 * @param {React.Component} RootComponent - The root component to test
 * @param {object} props - Props to pass to the root component
 * @returns {Array<object>} - Sorted array of component performance data
 */
export function findSlowComponents(RootComponent, props = {}) {
  // Create container for measurements
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  // Component render times
  const componentTimes = new Map();
  
  // Monkey patch React's createElement to measure component render times
  const originalCreateElement = React.createElement;
  React.createElement = function(type, props, ...children) {
    if (typeof type === 'function') {
      const componentName = type.displayName || type.name || 'AnonymousComponent';
      const wrappedComponent = function(props) {
        const start = performance.now();
        const result = type(props);
        const end = performance.now();
        
        const renderTime = end - start;
        
        if (!componentTimes.has(componentName)) {
          componentTimes.set(componentName, []);
        }
        componentTimes.get(componentName).push(renderTime);
        
        return result;
      };
      
      wrappedComponent.displayName = `Measured(${componentName})`;
      return originalCreateElement(wrappedComponent, props, ...children);
    }
    
    return originalCreateElement(type, props, ...children);
  };
  
  // Render the component tree
  render(<RootComponent {...props} />, container);
  
  // Restore original createElement
  React.createElement = originalCreateElement;
  
  // Clean up
  unmountComponentAtNode(container);
  document.body.removeChild(container);
  
  // Process results
  const results = Array.from(componentTimes.entries()).map(([name, times]) => {
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / times.length;
    const maxTime = Math.max(...times);
    const renderCount = times.length;
    
    return {
      name,
      avgTime,
      maxTime,
      totalTime,
      renderCount,
      times
    };
  });
  
  // Sort by total time (most impactful first)
  results.sort((a, b) => b.totalTime - a.totalTime);
  
  return results;
}

/**
 * Creates a performance report for the console
 * 
 * @param {Array<object>} results - Performance test results
 */
export function logPerformanceReport(results) {
  console.group('🔍 Performance Report');
  
  console.log('Top 5 slowest components by total render time:');
  results.slice(0, 5).forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}:`);
    console.log(`   Total: ${result.totalTime.toFixed(2)}ms, Avg: ${result.avgTime.toFixed(2)}ms, Count: ${result.renderCount}`);
  });
  
  const problemComponents = results.filter(r => r.avgTime > 5);
  if (problemComponents.length > 0) {
    console.warn('⚠️ Components with high average render time (>5ms):');
    problemComponents.forEach(result => {
      console.warn(`   ${result.name}: ${result.avgTime.toFixed(2)}ms average`);
    });
  }
  
  const highRenderCountComponents = results.filter(r => r.renderCount > 5);
  if (highRenderCountComponents.length > 0) {
    console.warn('⚠️ Components that render frequently (>5 times):');
    highRenderCountComponents.forEach(result => {
      console.warn(`   ${result.name}: ${result.renderCount} renders`);
    });
  }
  
  console.groupEnd();
} 