/**
 * Component memoization factory to easily optimize React components
 * 
 * This utility provides multiple strategies for memoizing components
 * based on their specific update patterns and performance needs.
 */

import React from 'react';

/**
 * Creates a memoized component with optional custom comparison
 * 
 * This is the foundation for all other memoization utilities.
 * It applies React.memo with custom options and sets appropriate
 * display names for debugging.
 */
export function createMemoComponent(Component, displayName = '', compareProps = null) {
  const MemoizedComponent = React.memo(Component, compareProps);
  
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  } else if (Component.displayName || Component.name) {
    MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  }
  
  return MemoizedComponent;
}

/**
 * Creates a pure component that only accepts primitive props
 * 
 * Optimized for components that only need to respond to simple
 * prop changes (strings, numbers, booleans) and can safely ignore
 * object and function prop changes.
 */
export function createPrimitiveComponent(Component) {
  // This comparison function only checks primitive props (strings, numbers, booleans)
  const primitivePropsCompare = (prevProps, nextProps) => {
    const keys = Object.keys({ ...prevProps, ...nextProps });
    
    return keys.every(key => {
      const prevValue = prevProps[key];
      const nextValue = nextProps[key];
      
      // Skip function and object comparisons - they would cause re-renders
      if (
        typeof prevValue === 'function' ||
        typeof nextValue === 'function' ||
        (typeof prevValue === 'object' && prevValue !== null) ||
        (typeof nextValue === 'object' && nextValue !== null)
      ) {
        return true;
      }
      
      return prevValue === nextValue;
    });
  };
  
  return createMemoComponent(
    Component,
    Component.displayName || Component.name ? `Pure(${Component.displayName || Component.name})` : '',
    primitivePropsCompare
  );
}

/**
 * Creates a component that ignores all prop changes
 * 
 * Perfect for components that render once and never need to update,
 * such as static UI elements, headers, footers, or layout components.
 */
export function createStaticComponent(Component) {
  return createMemoComponent(
    Component,
    Component.displayName || Component.name ? `Static(${Component.displayName || Component.name})` : '',
    () => true // Always return true to prevent updates
  );
}

/**
 * Creates a component factory that allows for easy switching between
 * different optimization strategies
 * 
 * This provides a unified API for applying different memoization 
 * strategies to components based on their specific needs.
 */
export function optimizationFactory(Component) {
  return {
    // Standard memo with default equality check
    memo: () => createMemoComponent(Component),
    
    // Memo with custom equality check
    withCustomCompare: (compareFunc) => createMemoComponent(Component, '', compareFunc),
    
    // Only compare primitive props
    primitiveProps: () => createPrimitiveComponent(Component),
    
    // Never update based on props
    static: () => createStaticComponent(Component),
    
    // Debug version that logs all prop changes
    debug: () => {
      // Only use in development
      if (process.env.NODE_ENV !== 'development') {
        return createMemoComponent(Component);
      }
      
      const debugCompare = (prevProps, nextProps) => {
        console.group(`Debug(${Component.displayName || Component.name || 'Component'}) Props Check`);
        
        const allKeys = new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
        let hasChanged = false;
        
        allKeys.forEach(key => {
          if (prevProps[key] !== nextProps[key]) {
            hasChanged = true;
            console.log(`Prop '${key}' changed:`, { 
              from: prevProps[key], 
              to: nextProps[key] 
            });
          }
        });
        
        if (hasChanged) {
          console.log('Component will re-render');
        } else {
          console.log('Component will NOT re-render');
        }
        
        console.groupEnd();
        return !hasChanged;
      };
      
      return createMemoComponent(Component, `Debug(${Component.displayName || Component.name || 'Component'})`, debugCompare);
    }
  };
} 