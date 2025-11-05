// src/components/charts/ViolinPlot.jsx
import React, { useRef, useEffect, useMemo, useState, useCallback, forwardRef } from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as d3 from 'd3';

/**
 * Kernel function for density estimation
 * Epanechnikov kernel is used here for smoothing
 */
function kernelEpanechnikov(bandwidth) {
  return v => {
    const x = v / bandwidth;
    return Math.abs(x) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;
  };
}

/**
 * Density estimator generator
 * Takes a kernel function and sample points, returns density estimator
 */
function kernelDensityEstimator(kernel, X) {
  return V => X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
}

/**
 * ViolinPlot component (called ViolinChart here)
 * Renders an interactive violin plot with zooming/panning
 */
export const ViolinChart = forwardRef(function ViolinChart({ 
  data = [], 
  width = 400, 
  height = 200, 
  isHorizontal = false, 
  color = '#69b3a2',
  margin = { top: 20, right: 20, bottom: 30, left: 40 }, 
  label = '' ,
  onExport,
},ref) {
  // Constants for setup
  const maxZoom = 10;
  const initialFocus = 0.1;

  // Refs for SVG rendering and scrollbar
  const svgRef = ref || useRef();
  const scrollbarRef = useRef();
  const theme = useTheme();

  // State for controlling view
  const [showFullScale, setShowFullScale] = useState(true);  // Toggle full vs zoom view
  const [scrollPosition, setScrollPosition] = useState(initialFocus); // Normalized [0,1], center default
  const [zoomLevel, setZoomLevel] = useState(1);             // Zoom multiplier (1 = no zoom)


  /**
   * Preprocess data using useMemo to avoid recomputation
   * - Removes invalid entries
   * - Computes quartiles, fences, min, max
   * - Handles zoom & scroll calculations
   * - Builds KDE density curve
   */
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter valid numeric values
    const validData = data.filter(d => typeof d === 'number' && isFinite(d)).sort(d3.ascending);
    if (validData.length === 0) return null;

    // Quartiles and fences (for outlier detection)
    const q1 = d3.quantile(validData, 0.25);
    const q3 = d3.quantile(validData, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    // Basic stats
    const fullMin = d3.min(validData);
    const fullMax = d3.max(validData);
    const hasOutliers = validData.some(v => v < lowerFence || v > upperFence);
    const fullRange = fullMax - fullMin;

    // Center of dataset
    const center = fullMin + fullRange * 0.5; 
    
    let viewMin, viewMax, currentZoom;
    
    if (showFullScale) {
      // Full range mode
      viewMin = fullMin;
      viewMax = fullMax;
      currentZoom = 1;
    } else {
      // Zoom mode
      currentZoom = Math.max(1, zoomLevel);
      const zoomedRange = fullRange / currentZoom;
      
      // Position the view window based on scroll position
      const viewCenter = fullMin + fullRange * scrollPosition;
      
      viewMin = Math.max(fullMin, viewCenter - zoomedRange / 2);
      viewMax = Math.min(fullMax, viewCenter + zoomedRange / 2);
      
      // Adjust if boundaries exceeded
      if (viewMax - viewMin < zoomedRange) {
        if (viewMin === fullMin) {
          viewMax = Math.min(fullMax, viewMin + zoomedRange);
        } else if (viewMax === fullMax) {
          viewMin = Math.max(fullMin, viewMax - zoomedRange);
        }
      }
    }

    // Kernel density estimation
    const bandwidth = Math.max(fullRange / 30, 0.01);
    const samplePoints = d3.range(fullMin - bandwidth, fullMax + bandwidth, fullRange / 200);
    const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), samplePoints);
    const fullDensity = kde(validData).filter(d => d[1] > 0);

    // Store max density for consistent scaling across views
    const globalMaxDensity = d3.max(fullDensity, d => d[1]) || 1;

    return { 
      data: validData, 
      fullMin, fullMax, viewMin, viewMax,
      density: fullDensity,
      globalMaxDensity,
      hasOutliers, q1, q3,
      fullRange, currentZoom, center
    };
  }, [data, showFullScale, scrollPosition, zoomLevel]);


  /**
   * Scroll handler:
   * - Normal scroll = pan
   * - Ctrl/Cmd + scroll = zoom
   */
  const handleScroll = useCallback((event) => {
    if (showFullScale || !processedData) return;
    event.preventDefault();
    
    if (event.ctrlKey || event.metaKey) {
      // Zoom
      const zoomDelta = event.deltaY > 0 ? 0.2 : -0.2;
      setZoomLevel(prev => Math.max(1, Math.min(maxZoom, prev + zoomDelta)));
    } else {
      // Pan
      const sensitivity = 0.02;
      const delta = event.deltaY > 0 ? sensitivity : -sensitivity;
      setScrollPosition(prev => Math.max(0, Math.min(1, prev + delta)));
    }
  }, [showFullScale, processedData]);

  /**
   * Mouse drag handler for scrollbar thumb
   */
  const handleScrollbarDrag = useCallback((event) => {
    if (showFullScale || !processedData) return;

    const rect = scrollbarRef.current.getBoundingClientRect();
    let position;
    
    if (isHorizontal) {
      position = (event.clientX - rect.left) / rect.width;
    } else {
      position = (event.clientY - rect.top) / rect.height;
    }
    
    setScrollPosition(Math.max(0, Math.min(1, position)));
  }, [showFullScale, processedData, isHorizontal]);

  /**
   * Main rendering effect:
   * - Sets up scales
   * - Draws violin shape, quartiles, median
   * - Adds clipping & event listeners
   */
  useEffect(() => {
    if (!processedData) return;

    // Prepare SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Slice density for current view
    const viewDensity = processedData.density.filter(d => 
      d[0] >= processedData.viewMin && d[0] <= processedData.viewMax
    );


    const maxDensity = processedData.globalMaxDensity/processedData.currentZoom

   const dataScale = isHorizontal?
    d3.scaleLinear()
        .domain([processedData.viewMin, processedData.viewMax])
        .range([0, w]):
    d3.scaleLinear()
        .domain([processedData.viewMin, processedData.viewMax])
        .range([h, 0]); 
        
    const densityScale = isHorizontal?
        d3.scaleLinear()
            .domain([0, maxDensity])
            .range([0, h / 2]):
        d3.scaleLinear()
            .domain([0, maxDensity])
            .range([0, w / 2]);

    const axisGenerator = isHorizontal ? d3.axisBottom(dataScale) : d3.axisLeft(dataScale);

    const violinArea = isHorizontal?
        d3.area()
            .y0(d => h/2 - densityScale(d[1]))
            .y1(d => h/2 + densityScale(d[1]))
            .x(d => dataScale(d[0]))
            .curve(d3.curveCatmullRom):
        d3.area()
            .x0(d => w/2 - densityScale(d[1]))
            .x1(d => w/2 + densityScale(d[1]))
            .y(d => dataScale(d[0]))
            .curve(d3.curveCatmullRom);

    if(isHorizontal){ // Horizontal Setup
        g.append('g')
            .attr('transform', `translate(0,${h})`)
            .call(axisGenerator);
        // Center axis line
        g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', h/2).attr('y2', h/2)
        .attr('stroke', theme.palette.text.primary)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.5);
        // Quartile markers
        [processedData.q1, processedData.q3].forEach(quartile => {
          if (quartile >= processedData.viewMin && quartile <= processedData.viewMax) {
              g.append('line')
              .attr('x1', dataScale(quartile)).attr('x2', dataScale(quartile))
              .attr('y1', h/2 - h/6).attr('y2', h/2 + h/6)
              .attr('stroke', theme.palette.text.primary)
              .attr('stroke-width', 1)
              .attr('opacity', 0.7);
          }
        });
        // Median marker
        const median = d3.median(processedData.data);
        if (median !== undefined && median >= processedData.viewMin && median <= processedData.viewMax) {
          g.append('line')
              .attr('x1', dataScale(median)).attr('x2', dataScale(median))
              .attr('y1', h/2 - h/4).attr('y2', h/2 + h/4)
              .attr('stroke', theme.palette.text.primary)
              .attr('stroke-width', 2);
        }
    } else { // Vertical Setup
        g.append('g').call(axisGenerator);
        // Center axis line
        g.append('line')
        .attr('x1', w/2).attr('x2', w/2)
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', theme.palette.text.primary)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.5);
        // Quartile markers
        [processedData.q1, processedData.q3].forEach(quartile => {
          if (quartile >= processedData.viewMin && quartile <= processedData.viewMax) {
              g.append('line')
              .attr('x1', w/2 - w/6).attr('x2', w/2 + w/6)
              .attr('y1', dataScale(quartile)).attr('y2', dataScale(quartile))
              .attr('stroke', theme.palette.text.primary)
              .attr('stroke-width', 1)
              .attr('opacity', 0.7);
          }
        });
        // Median marker
        const median = d3.median(processedData.data);
        if (median !== undefined && median >= processedData.viewMin && median <= processedData.viewMax) {
          g.append('line')
              .attr('x1', w/2 - w/4).attr('x2', w/2 + w/4)
              .attr('y1', dataScale(median)).attr('y2', dataScale(median))
              .attr('stroke', theme.palette.text.primary)
              .attr('stroke-width', 2);
        }
    }



    // Draw violin with clipping
    if (viewDensity.length > 0) {
      const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
      g.append('defs')
        .append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', w)
        .attr('height', h);

      g.append('path')
        .datum(viewDensity)
        .attr('d', violinArea)
        .attr('fill', color)
        .attr('fill-opacity', 0.7)
        .attr('stroke', theme.palette.text.primary)
        .attr('stroke-width', 1)
        .attr('clip-path', `url(#${clipId})`);
    }

    // Attach scroll listener
    const svgElement = svgRef.current;
    svgElement.addEventListener('wheel', handleScroll, { passive: false });
    
    return () => {
      svgElement.removeEventListener('wheel', handleScroll);
    };

  }, [processedData, width, height, margin, isHorizontal, color, showFullScale, theme, handleScroll]);

  // Reset scroll & zoom whenever scale mode changes
  useEffect(() => {
    setScrollPosition(initialFocus);
    if (processedData) {
          // Calculate default zoom based on IQR
          const iqrRange = processedData.q3 - processedData.q1;
          const fullRange = processedData.fullRange;

          // Ensure we don’t divide by zero or set zoom too extreme
          let defaultZoom = fullRange / Math.max(iqrRange, 0.0001);

          // Clamp zoom level to reasonable bounds (same bounds as your scroll handler)
          defaultZoom = Math.max(1, Math.min(maxZoom, defaultZoom));

          setZoomLevel(defaultZoom);
        } else {
          setZoomLevel(2); // Start at 2x when entering zoom mode
        };
  }, [showFullScale]);

  // Handle empty data
  if (!processedData) {
    return (
      <Box style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
        {label && <Typography style={{ margin: '0 0 16px 0' }}>{label}</Typography>}
        <Typography>No valid data to display</Typography>
      </Box>
    );
  }

  // Scrollbar dimensions
  const scrollbarSize = 12;
  const scrollbarLength = isHorizontal ? width - margin.left - margin.right : height - margin.top - margin.bottom;
  
  // Thumb size proportional to zoom level
  const viewRatio = (processedData.viewMax - processedData.viewMin) / processedData.fullRange;
  const thumbSize = Math.max(20, scrollbarLength * viewRatio);
  
  // compute how much of the data you can pan over
  const visibleRange = processedData.viewMax - processedData.viewMin;
  const panRange     = processedData.fullRange - visibleRange;

  // normalized pan position [0…1]
  const viewStart = panRange > 0
    ? (processedData.viewMin - processedData.fullMin) / panRange
    : 0;

  // thumb pos now covers full track
  const thumbPosition = viewStart * (scrollbarLength - thumbSize);

  const upperBound = showFullScale ? processedData.viewMax : processedData.viewMax;
  const lowerBound = showFullScale ? processedData.viewMin : processedData.viewMin;

  return (
    <Box style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
      {label && <Typography style={{ margin: '0 0 16px 0' }}>{label}</Typography>}

      {/* Controls shown if outliers detected (zoom mode useful) */}
      {processedData.hasOutliers && (
        <Box style={{ marginBottom: 8 }}>
          {onExport &&(
            <Button 
              size="small"
              variant="outlined"
              onClick={() => onExport(svgRef.current,lowerBound,upperBound)}
              sx={{ marginRight: 1 }}
            >
              Export
            </Button>
          )}
          <Button 
            size="small"
            variant="outlined"
            onClick={() => setShowFullScale(prev => !prev)}
            sx={{ marginRight: 1 }}
          >
            {showFullScale ? "Enable zoom mode" : "Show full scale"}
          </Button>
          
          {!showFullScale && (
            <>
              <Button
              size="small"
              onClick={()=>{setZoomLevel(z=>Math.min(maxZoom,Math.max(1,z*1.2)))}}
              sx={{marginRight:1}}>
                ➕
              </Button>
              <Button
              size="small"
              onClick={()=>{setZoomLevel(z=>Math.min(maxZoom,Math.max(1,z/1.2)))}}
              sx={{marginRight:1}}>
                ➖
              </Button>
              <Button 
                size="small"
                variant="outlined"
                onClick={() => {
                  setScrollPosition(initialFocus); 
                  if (processedData) {
                    const iqrRange = processedData.q3 - processedData.q1;
                    const fullRange = processedData.fullRange;
                    let defaultZoom = fullRange / Math.max(iqrRange, 0.0001);
                    defaultZoom = Math.max(1, Math.min(maxZoom, defaultZoom));
                    setZoomLevel(defaultZoom);
                  } else { setZoomLevel(2)}
                }}
                sx={{ marginRight: 1 }}
              >
                Reset view
              </Button>
            </>
          )}
        </Box>
      )}

      {/* SVG and scrollbar */}
      <Box style={{ position: 'relative', display: 'inline-block' }}>
        <svg ref={svgRef} />
        
        {/* Scrollbar (only in zoom mode) */}
        {!showFullScale && (
          <Box
            ref={scrollbarRef}
            onMouseDown={(e) => {
              // Capture mouse drag for thumb
              const handleMouseMove = (event) => handleScrollbarDrag(event);
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
              handleScrollbarDrag(e);
            }}
            style={{
              position: 'absolute',
              cursor: 'pointer',
              backgroundColor: theme.palette.grey[300],
              borderRadius: scrollbarSize / 2,
              ...(isHorizontal ? {
                left: margin.left,
                bottom: 0,
                width: scrollbarLength,
                height: scrollbarSize,
              } : {
                right: 0,
                top: margin.top,
                width: scrollbarSize,
                height: scrollbarLength,
              })
            }}
          >
            <Box style={{
              position: 'absolute',
              backgroundColor: theme.palette.primary.main,
              borderRadius: scrollbarSize / 2,
              ...(isHorizontal ? {
                left: thumbPosition,
                top: 1,
                width: thumbSize,
                height: scrollbarSize - 2,
              } : {
                left: 1,
                top: thumbPosition,
                width: scrollbarSize - 2,
                height: thumbSize,
              })
            }} />
          </Box>
        )}
      </Box>
      
      {/* Helper text when zoom mode is active */}
      {!showFullScale && (
        <Typography variant="caption" style={{ display: 'block', marginTop: 8 }}>
          Scroll to pan • Ctrl/Cmd + Scroll to zoom • Zoom: {processedData.currentZoom.toFixed(1)}x<br />
          Viewing: {processedData.viewMin.toFixed(2)} to {processedData.viewMax.toFixed(2)}
        </Typography>
      )}
    </Box>
  );
}
)