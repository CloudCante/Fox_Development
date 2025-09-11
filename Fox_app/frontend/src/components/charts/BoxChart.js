import React, { useRef, useEffect, useMemo, useState, forwardRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const BoxChart = forwardRef(function BoxChart({
  data = [],
  width = 400,
  height = 120,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  isVertical = false,
  color = '#1976d2',
  label,
  axisLabel,
  ticks = 5,
  onExport,
},ref) {
  const svgRef = ref || useRef();
  const theme = useTheme();
  const [showBreak, setShowBreak] = useState(false);

  // Quartiles & stats
  const { q1, median, q3, min, max, iqr, mean } = useMemo(() => {
    if (!data.length) return {};
    const s = data.slice().sort(d3.ascending);
    const q1 = d3.quantile(s, 0.25);
    const median = d3.quantile(s, 0.5);
    const q3 = d3.quantile(s, 0.75);
    const iqr = q3 - q1;
    return { q1, median, q3, min: d3.min(s), max: d3.max(s), iqr, mean: d3.mean(s) };
  }, [data]);

  const toolTip = `Min: ${Number(min).toFixed(2)}\n
  Q1 : ${Number(q1).toFixed(2)}\n
  Med: ${Number(median).toFixed(2)}\n
  Q3 : ${Number(q3).toFixed(2)}\n
  Max: ${Number(max).toFixed(2)}\n
  Mean: ${Number(mean).toFixed(2)}`

  const [innerWidth, innerHeight] = useMemo(() => [
    width - margin.left - margin.right,
    height - margin.top - margin.bottom
  ], [width, height, margin]);

  // Detect outlier distortion
  const needsBreak = useMemo(() => {
    if (!iqr) return false;
    return max > q3 + 2 * iqr || min < q1 - 2 * iqr;
  }, [min, max, q1, q3, iqr]);

  // Adjusted scale domain
  const domain = useMemo(() => {
    if (!min || !max) return null;
    if (needsBreak && showBreak) {
      return [Math.max(min, q1 - 2 * iqr), Math.min(max, q3 + 2 * iqr)];
    }
    return [min, max];
  }, [min, max, q1, q3, iqr, needsBreak, showBreak]);

  const x = useMemo(() => {
    if (!domain) return null;
    return d3.scaleLinear()
      .domain(domain)
      .range(isVertical ? [0, innerHeight] : [0, innerWidth]);
  }, [domain, isVertical, innerWidth, innerHeight]);

  useEffect(() => {
    if (!x) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Whiskers
    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 : x(Math.max(min, domain[0])) )
      .attr('x2', isVertical ? innerWidth / 2 : x(q1))
      .attr('y1', isVertical ? x(Math.max(min, domain[0])) : innerHeight / 2)
      .attr('y2', isVertical ? x(q1) : innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 : x(q3))
      .attr('x2', isVertical ? innerWidth / 2 : x(Math.min(max, domain[1])) )
      .attr('y1', isVertical ? x(q3) : innerHeight / 2)
      .attr('y2', isVertical ? x(Math.min(max, domain[1])) : innerHeight / 2)
      .attr('stroke', theme.palette.text.primary);

    // Box
    g.append('rect')
      .attr('x', isVertical ? innerWidth / 2 - 20 : x(q1))
      .attr('y', isVertical ? x(q1) : innerHeight / 2 - 20)
      .attr('width', isVertical ? 40 : x(q3) - x(q1))
      .attr('height', isVertical ? x(q3) - x(q1) : 40)
      .attr('fill', color)
      .attr('opacity', 0.7)
      .attr('stroke', theme.palette.text.primary);

    // Median line
    g.append('line')
      .attr('x1', isVertical ? innerWidth / 2 - 20 : x(median))
      .attr('x2', isVertical ? innerWidth / 2 + 20 : x(median))
      .attr('y1', isVertical ? x(median) : innerHeight / 2 - 20)
      .attr('y2', isVertical ? x(median) : innerHeight / 2 + 20)
      .attr('stroke', theme.palette.text.primary);

    // Caps
    [Math.max(min, domain[0]), Math.min(max, domain[1])].forEach(d => {
      g.append('line')
        .attr('x1', isVertical ? innerWidth / 2 - 10 : x(d))
        .attr('x2', isVertical ? innerWidth / 2 + 10 : x(d))
        .attr('y1', isVertical ? x(d) : innerHeight / 2 - 10)
        .attr('y2', isVertical ? x(d) : innerHeight / 2 + 10)
        .attr('stroke', theme.palette.text.primary);
    });

    // Axis
    isVertical
      ? g.append('g')
          .attr('transform', `translate(0,0)`)
          .call(d3.axisLeft(x).ticks(ticks).tickFormat(d => d.toFixed(2)))
      : g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x).ticks(ticks).tickFormat(d => d.toFixed(2)));

    if(axisLabel){
      g.append('text')
        .attr('transform',isVertical?'rotate(-90)':'rotate(0)')
        .attr('x',isVertical?-innerHeight/2:innerWidth/2)
        .attr('y',isVertical?-margin.left +15:innerHeight+margin.bottom )
        .attr('text-anchor','middle')
        .attr('fill',theme.palette.text.primary)
        .text(axisLabel);
    }

    // Axis break indicator
    if (needsBreak && showBreak) {
      const breakPos = isVertical ? innerHeight : innerWidth;
      g.append('text')
        .attr('x', isVertical ? innerWidth / 2 + 15 : breakPos - 10)
        .attr('y', isVertical ? 10 : innerHeight + 15)
        .attr('fill', theme.palette.error.main)
        .text('⧓'); // break marker
    }

  }, [data, width, height, margin, x, needsBreak, showBreak]);

  if(!data || data.length === 0) {
    return(
          <Box style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
            {label && <Typography style={{ margin: '0 0 16px 0' }}>{label}</Typography>}
            <Typography>No valid data to display</Typography>
          </Box>
    );
  }

  const upperBound = showBreak && domain ? domain[1] : max;
  const lowerBound = showBreak && domain ? domain[0] : min;

  return (
    <Box style={{ padding: 16, border: '1px solid #ccc', borderRadius: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" gutterBottom color={theme.palette.text.primary}>
          {label}
        </Typography>
        <Box>
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
          {needsBreak && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowBreak(prev => !prev)}
            >
              {showBreak ? 'Show All' : 'Clamp Outliers'}
            </Button>
          )}
        </Box>
      </Box>
      <Tooltip title={toolTip}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ background: theme.palette.background.paper }}
        />
      </Tooltip>
    </Box>
  );
})
