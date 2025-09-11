import React, { useState, useEffect, useMemo, useCallback, useRef, startTransition } from 'react';
import { debounceHeavy, batchUpdates } from '../../utils/performanceUtils';
import { 
  Box, Container, Typography, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress
} from '@mui/material';
import { Header } from '../pagecomp/Header';
import { ThroughputBarChart } from '../charts/ThroughputBarChart';
import { useTheme } from '@mui/material/styles';
import { useThrottledHandlers } from '../hooks/throughput/useThrottledHandlers';
import { useDebounce } from '../hooks/throughput/useDebounceHook';
import { useApi } from '../hooks/throughput/useApi';
import { useStyles } from '../hooks/throughput/useStyles';
import { useDataProcessing } from '../hooks/throughput/useDataProcessing';
import { useThroughputData } from '../hooks/throughput/useThroughputData';
import { useDateFormatter } from '../hooks/throughput/useDateFormatter';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) console.error('REACT_APP_API_BASE environment variable is not set!');

const CONSTANTS = {
  THROTTLE_DELAY: 50,
  DEBOUNCE_DELAY: 100,
  HARDCODED_STATIONS: {
    sxm4: ['VI2', 'ASSY2', 'FI', 'FQC'],
    sxm5: ['BBD', 'ASSY2', 'FI', 'FQC'],
    sxm6: ['BBD', 'ASSY2', 'FI', 'FQC']
  }
};

const ThroughputPage = () => {
  const [selectedWeek, setSelectedWeek] = useState('');
  const [useHardcodedTPY, setUseHardcodedTPY] = useState(true);
  const [sortBy, setSortBy] = useState('volume');
  const [showRepairStations, setShowRepairStations] = useState(false);
  const [processingState, setProcessingState] = useState({
    useHardcodedTPY: true,
    sortBy: 'volume',
    showRepairStations: false,
    isProcessing: false
  });

  const lastToggleTime = useRef(0);
  const lastRepairToggleTime = useRef(0);

  // Use custom hooks
  const { formatWeekDateRange } = useDateFormatter();
  const { availableWeeks, loading, error, throughputData } = useThroughputData(selectedWeek, formatWeekDateRange);
  const styles = useStyles(processingState.isProcessing);
  const { processModelData } = useDataProcessing({
    showRepairStations: processingState.showRepairStations,
    sortBy: processingState.sortBy
  });
  const { createThrottledHandler } = useThrottledHandlers(CONSTANTS.THROTTLE_DELAY);

  const debouncedProcessing = useDebounce((newState) => {
    setProcessingState(prev => ({ ...prev, ...newState, isProcessing: false }));
  }, CONSTANTS.DEBOUNCE_DELAY);

  const processedStationData = useMemo(() => {
    if (!throughputData?.weeklyThroughputYield?.modelSpecific) {
      return { sxm4: [], sxm5: [], sxm6: [], tpyData: {} };
    }
    
    const { modelSpecific } = throughputData.weeklyThroughputYield;
    const tpySource = processingState.useHardcodedTPY ? 'hardcoded' : 'dynamic';
    
    return {
      sxm4: processModelData(modelSpecific['Tesla SXM4']),
      sxm5: processModelData(modelSpecific['Tesla SXM5']),
      sxm6: processModelData(modelSpecific['SXM6']),
      tpyData: throughputData.weeklyTPY?.[tpySource] || {}
    };
  }, [throughputData, processModelData, processingState.useHardcodedTPY]);

  const tableStationData = useMemo(() => {
    if (!processingState.useHardcodedTPY) {
      return { sxm4: processedStationData.sxm4, sxm5: processedStationData.sxm5, sxm6: processedStationData.sxm6 };
    }
    
    return {
      sxm4: processedStationData.sxm4.filter(s => CONSTANTS.HARDCODED_STATIONS.sxm4.includes(s.station)),
      sxm5: processedStationData.sxm5.filter(s => CONSTANTS.HARDCODED_STATIONS.sxm5.includes(s.station)),
      sxm6: processedStationData.sxm6.filter(s => CONSTANTS.HARDCODED_STATIONS.sxm6.includes(s.station))
    };
  }, [processedStationData, processingState.useHardcodedTPY]);

  // Event handlers
  const handleWeekChange = useCallback((event) => {
    const value = event.target.value;
    if (typeof value === 'string' && value.trim()) {
      setSelectedWeek(value.trim());
    }
  }, []);

  const handleTPYModeChange = useCallback(createThrottledHandler((event) => {
    const newValue = Boolean(event.target.checked);
    setUseHardcodedTPY(newValue);
    setProcessingState(prev => ({ ...prev, isProcessing: true }));
    startTransition(() => debouncedProcessing({ useHardcodedTPY: newValue }));
  }, lastToggleTime), [createThrottledHandler, debouncedProcessing]);

  const handleSortChange = useCallback((event) => {
    const newValue = String(event.target.value);
    const validSortOptions = ['volume', 'failureRate', 'impactScore', 'alphabetical'];
    
    if (validSortOptions.includes(newValue)) {
      setSortBy(newValue);
      setProcessingState(prev => ({ ...prev, isProcessing: true }));
      startTransition(() => debouncedProcessing({ sortBy: newValue }));
    }
  }, [debouncedProcessing]);

  const handleRepairStationsChange = useCallback(createThrottledHandler((event) => {
    const newValue = Boolean(event.target.checked);
    setShowRepairStations(newValue);
    setProcessingState(prev => ({ ...prev, isProcessing: true }));
    startTransition(() => debouncedProcessing({ showRepairStations: newValue }));
  }, lastRepairToggleTime), [createThrottledHandler, debouncedProcessing]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={styles.loadingContainer}>
          <CircularProgress size={24} />
          <Typography variant="h6" color="text.secondary">Loading throughput data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={styles.errorContainer}>
          <Typography variant="h6" color="error">Error loading data</Typography>
          <Typography variant="body2" color="text.secondary">{error}</Typography>
        </Box>
      </Container>
    );
  }
 // console.log(processedStationData);
  // Main Page Component
  return (
    <Container maxWidth="xl">
      <Header 
        title="Throughput Yield Analysis" 
        subTitle="Station efficiency analysis and bottleneck identification for production optimization."
      />
      <Divider sx={{ mb: 4 }} />

      {/* Controls */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <FormControl fullWidth>
              <InputLabel>Week</InputLabel>
              <Select value={selectedWeek} label="Week" onChange={handleWeekChange} disabled={!availableWeeks.length}>
                {availableWeeks.map((week) => (
                  <MenuItem key={week.id} value={week.id}>
                    {week.id} ({week.dateRange})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedWeek && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                {availableWeeks.find(w => w.id === selectedWeek)?.dateRange}
              </Typography>
            )}
          </Grid>

          <Grid size = {{xs:12, sm:6, md:3}}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
                <MenuItem value="volume">Volume (Parts Processed)</MenuItem>
                <MenuItem value="failureRate">Failure Rate</MenuItem>
                <MenuItem value="impactScore">Impact Score</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <FastSwitch
              checked={useHardcodedTPY}
              onChange={handleTPYModeChange}
              label={useHardcodedTPY ? "Focused TPY" : "Complete TPY"}
              color="primary"
            />
            <Typography variant="caption" display="block" color="text.secondary">
              {useHardcodedTPY ? "4 Key Stations" : "All Stations"}
              {processingState.isProcessing && " • Processing..."}
            </Typography>
          </Grid>

          <Grid size = {{xs:12, sm:6, md:3}}>
            <FastSwitch
              checked={showRepairStations}
              onChange={handleRepairStationsChange}
              label="Show Repair Stations"
              color="secondary"
            />
          </Grid>
        </Grid>
      </Box>

      {/* TPY Summary Cards */}
      {throughputData && (
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            {['SXM4', 'SXM5', 'SXM6'].map((model, index) => (
              <Grid size = {{xs:12, md:4}} key={model}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {model === 'SXM6' ? 'SXM6' : `Tesla ${model}`} TPY
                    </Typography>
                    <Typography 
                      variant="h3" 
                      color={index === 0 ? "error.main" : index === 1 ? "success.main" : "info.main"}
                    >
                      {processedStationData.tpyData[model]?.tpy?.toFixed(1) || '--'}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {useHardcodedTPY ? 'Focused Analysis' : 'Complete Analysis'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Model Sections */}
      {throughputData ? (
        <>
          {[
            { key: 'sxm4', title: 'Tesla SXM4', modelName: 'SXM4' },
            { key: 'sxm5', title: 'Tesla SXM5', modelName: 'SXM5' },
            { key: 'sxm6', title: 'SXM6', modelName: 'SXM6' }
          ].map(({ key, title, modelName }) => (
            <Box key={key} sx={{ mb: 8 }}>
              <MemoizedChart 
                data={processedStationData[key]}
                title={`${title} - Station Throughput`}
                containerStyles={styles.chartContainer}
                processingStyles={styles.processing}
              />
              <MemoizedTable 
                data={tableStationData[key]}
                title={`${title} Station Details`}
                modelName={modelName}
                useHardcodedTPY={useHardcodedTPY}
                processingStyles={styles.processing}
              />
            </Box>
          ))}
        </>
      ) : (
        <Box sx={styles.container}>
          <Typography variant="h6" color="text.secondary">No throughput data available</Typography>
          <Typography variant="body2" color="text.secondary">Select a week to view station throughput analysis</Typography>
        </Box>
      )}
    </Container>
  );
};

// Reusable components (these can also be moved to separate files)
const MemoizedChart = React.memo(({ data, title, containerStyles, processingStyles }) => (
  <Card elevation={3} sx={{ mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title} ({data.length} stations)
      </Typography>
      <Box sx={{...containerStyles, ...processingStyles}}>
        <ThroughputBarChart data={data} />
      </Box>
    </CardContent>
  </Card>
));

const MemoizedTable = React.memo(({ data, title, modelName, useHardcodedTPY, processingStyles }) => (
  <Card elevation={3}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label={`${data.length} stations${useHardcodedTPY ? ' (TPY calc)' : ''}`} size="small" />
      </Box>
      <TableContainer component={Paper} variant="outlined" sx={processingStyles}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Station</TableCell>
              <TableCell align="right">Fail</TableCell>
              <TableCell align="right">Pass</TableCell>
              <TableCell align="right">Grand Total</TableCell>
              <TableCell align="right">Yield</TableCell>
              <TableCell align="right">Fail%</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((station) => (
              <TableRow key={station.station}>
                <TableCell component="th" scope="row">{station.station}</TableCell>
                <TableCell align="right">{station.failedParts.toLocaleString()}</TableCell>
                <TableCell align="right">{station.passedParts.toLocaleString()}</TableCell>
                <TableCell align="right">{station.totalParts.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Box sx={{ color: station.failureRate < 5 ? 'success.main' : station.failureRate < 10 ? 'warning.main' : 'error.main' }}>
                    {(100 - station.failureRate).toFixed(1)}%
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ color: station.failureRate > 10 ? 'error.main' : station.failureRate > 5 ? 'warning.main' : 'success.main' }}>
                    {station.failureRate}%
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
));

// FastSwitch component (can also be moved to separate file)
const FastSwitch = React.memo(({ checked, onChange, label, color = 'primary' }) => {
  const theme = useTheme();
  
  const switchStyles = useMemo(() => ({
    container: {
      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
      userSelect: 'none', padding: '4px', borderRadius: '4px',
      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
    },
    switch: {
      position: 'relative', width: '44px', height: '24px', borderRadius: '12px',
      backgroundColor: checked ? 
        (color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main) : 
        theme.palette.grey[400],
      transition: 'background-color 0.2s ease', border: 'none', cursor: 'pointer', outline: 'none',
      '&:focus': { boxShadow: `0 0 0 2px ${theme.palette.primary.main}40` }
    },
    thumb: {
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%',
      transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    label: { fontSize: '14px', fontWeight: 500, color: theme.palette.text.primary }
  }), [checked, color, theme]);

  const handleClick = useCallback((e) => {
    const syntheticEvent = {
      ...e, preventDefault: () => e.preventDefault(), stopPropagation: () => e.stopPropagation(),
      target: { ...e.target, checked: !checked }
    };
    onChange(syntheticEvent);
  }, [checked, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick(e);
    }
  }, [handleClick]);

  return (
    <div style={switchStyles.container} onClick={handleClick} onKeyDown={handleKeyDown}
         tabIndex={0} role="switch" aria-checked={checked} aria-label={label}>
      <div style={switchStyles.switch}>
        <div style={switchStyles.thumb} />
      </div>
      <span style={switchStyles.label}>{label}</span>
    </div>
  );
});

MemoizedChart.displayName = 'MemoizedChart';
MemoizedTable.displayName = 'MemoizedTable';
FastSwitch.displayName = 'FastSwitch';

export default React.memo(ThroughputPage);