import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Box, Typography, Button, Divider, FormControl, InputLabel, Select, MenuItem, Fade, Paper, LinearProgress } from '@mui/material';
import Papa from 'papaparse';
import { Header } from '../pagecomp/Header.jsx';
import { BoxChart } from '../charts/BoxChart.js';
import { ViolinChart } from '../charts/ViolinChart.js';
import { gridStyle, buttonStyle } from '../theme/themes.js';
import { importQuery } from '../../utils/queryUtils.js';
import { stationBuckets } from '../../data/dataTables';
import * as d3 from 'd3';
import { exportSecureCSV } from '../../utils/exportUtils.js';
import { data } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) console.error('REACT_APP_API_BASE is not set');

// Helper function to chunk array into smaller arrays
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const StationCycleTime = () => {
  const [rawData, setRawData] = useState([]);
  const fileInputRef = useRef(null);
  const [useBuckets, setUseBuckets] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [selectedMode, setSelectedMode] = useState('Workstations');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const modeOptions = ['Workstations','Buckets','Lifetime'];

  const boxChartRef = useRef(null);
  const violinChartRef = useRef(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStatus('Parsing CSV...');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async results => {
        const sns = results.data.map(r => r.sn).filter(Boolean);
        if (!sns.length) {
          console.warn('No SNs found in CSV');
          setIsLoading(false);
          return;
        }

        console.log(`Processing ${sns.length} SNs in chunks of 500`);
        setLoadingStatus(`Processing ${sns.length} SNs in chunks...`);
        
        // Chunk SNs into groups of 500
        const chunks = chunkArray(sns, 500);
        const allResults = [];
        
        try {
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            setLoadingStatus(`Processing chunk ${i + 1} of ${chunks.length} (${chunk.length} SNs)`);
            setLoadingProgress(((i) / chunks.length) * 100);
            
            try {
              const chunkData = await importQuery(
                API_BASE, 
                '/api/workstationRoutes/station-times', 
                {}, 
                'POST', 
                { sns: chunk }
              );
              
              // Add chunk data to results
              if (Array.isArray(chunkData)) {
                allResults.push(...chunkData);
              }
              
              console.log(`Chunk ${i + 1} completed: ${chunkData?.length || 0} records`);
              
              // Add small delay between requests to be nice to the server
              if (i < chunks.length - 1) {
                await delay(100); // 100ms delay
              }
              
            } catch (chunkError) {
              console.error(`Error processing chunk ${i + 1}:`, chunkError);
              // Continue with other chunks even if one fails
            }
          }
          
          setLoadingStatus('Combining results...');
          setLoadingProgress(100);
          
          console.log(`Total records retrieved: ${allResults.length}`);
          setRawData(allResults);
          
        } catch (err) {
          console.error('Overall fetch error:', err);
        } finally {
          setIsLoading(false);
          setLoadingProgress(0);
          setLoadingStatus('');
        }
      },
      error: err => {
        console.error('CSV parsing error:', err);
        setIsLoading(false);
      }
    });
    e.target.value = null;
  }, []);

  // Build lookup from stationBuckets[0]
  const stationBucketLookup = useMemo(() => {
    const lookup = {};
    const bucketsObj = stationBuckets || {};
    Object.entries(bucketsObj).forEach(([bucket, stations]) => {
      stations.forEach(st => lookup[st] = bucket);
    });
    return lookup;
  }, []);

  // bucketData: array of objects matching rawData schema
  const bucketData = useMemo(() => {
    const combinedData = Object.values(
    rawData
      .map(r => {
        let tempBucket = stationBucketLookup[r.workstation_name] || 'Unbucketed';

        // Apply lifetime logic
        if (selectedMode === 'Lifetime') {
          tempBucket = tempBucket === 'shipping' ? tempBucket : 'Lifetime';
        }

        return {
          ...r,
          workstation_name: tempBucket
        };
      })
      .reduce((acc, item) => {
        const cKey = `${item.sn}-${item.workstation_name}`;
        if (!acc[cKey]) {
          acc[cKey] = {
            sn: item.sn,
            workstation_name: item.workstation_name,
            total_time: 0
          };
        }
        acc[cKey].total_time += item.total_time;
        return acc;
      }, {})
  );

    return combinedData;
  }, [rawData, stationBucketLookup, selectedMode]);

  const data = selectedMode === 'Workstations' ? rawData : bucketData;

  const filterOptions = useMemo(
    () => [...new Set(data.map(r => r.workstation_name).filter(Boolean))],
    [data]
  );

  const filteredData = useMemo(() => {
    if (!selectedFilter) return [];
    return data.filter(r => r.workstation_name === selectedFilter)
               .map(r => r.total_time)
               .filter(v => v != null);
  }, [data, selectedFilter]);

    const {stats} = useMemo(()=>{
        if(!filteredData.length) return{}
        const s = filteredData.slice().sort(d3.ascending);
        const stats = [
            {label : 'Minimum', value : Number(d3.min(s)).toFixed(2)},
            {label : 'Q1', value : Number(d3.quantile(s, 0.25)).toFixed(2)},
            {label : 'Median', value : Number(d3.quantile(s, 0.5)).toFixed(2)},
            {label : 'Q3', value : Number(d3.quantile(s, 0.75)).toFixed(2)},
            {label : 'Maximum', value : Number(d3.max(s)).toFixed(2)},
            {label : 'IQR', value : Number(d3.quantile(s, 0.75)).toFixed(2)-Number(d3.quantile(s, 0.25)).toFixed(2)},
            {label : 'Mean', value : Number(d3.mean(s)).toFixed(2)},
            {count: s.length, label : 'Count', value : s.length}
        ]
        return {stats}
  },[filteredData]);

  const exportSelection=(selection,filename)=>{
    const exportData = data
        .filter(item => selection
            .includes(item.total_time))
        .map(item => structuredClone(item));
    console.log("export",exportData)
    try {
        const rows = [];
        exportData.forEach((row) => {
            rows.push([row[`sn`],row[`workstation_name`],row['total_time']
            //, row['fail_time']
            ]);
        });
        const headers = [
        'Serial Number',
        'Station Name',
        'Total Time (Hours)'
        ];
        // Use secure export function
        exportSecureCSV(rows, headers, `${filename}.csv`);
    } 
    catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
    };
  }  

  const handleExportSVG = (svgNode, filename, lowerBound, upperBound, data) => {
    if (!svgNode) return;
    console.log("filename:", filename);
    console.log("Minimum value:", lowerBound);
    console.log("Maximum value:", upperBound);

    // this will now reference the passed-in data
    const limitedData = data.filter(v => v >= lowerBound && v <= upperBound);
    console.log("limited:", limitedData);
    const fullName = `${filename}_${Number(lowerBound).toFixed(0)}_${Number(upperBound).toFixed(0)}`
    exportSelection(limitedData,fullName);
  };

  return (
    <Box>
      <Header title="Station Cycle Time" subTitle="Charting station cycle times" />
      <Box>
        <FormControl sx={{ minWidth: 200 }} disabled={!filterOptions.length || isLoading}>
          <InputLabel>Filter</InputLabel>
          <Select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)}>
            {filterOptions.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <Button sx={buttonStyle} onClick={handleImportClick} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Import CSV'}
        </Button>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        
        <FormControl sx={{ minWidth: 200 }} disabled={isLoading}>
          <InputLabel>Mode</InputLabel>
          <Select value={selectedMode} onChange={
            (e) => {
              setSelectedFilter('');
              setSelectedMode(e.target.value)
            }
            }>
            {modeOptions.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      
      {/* Loading Progress */}
      {isLoading && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            {loadingStatus}
          </Typography>
          <LinearProgress variant="determinate" value={loadingProgress} />
        </Box>
      )}
      
      <Divider />
      {!data.length && !isLoading ? (
        <Typography>No data available</Typography>
      ) : selectedFilter ? (
        <>
        <Fade in={true}>
          <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Station Details (Hours)- {selectedFilter}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {stats.map(({ label, value }) => (
                    <Typography key={label} variant="body2">
                    <strong>{label}:</strong> {value}
                    </Typography>
                ))}
            </Box>
          </Paper>
        </Fade>
        <Box sx={gridStyle}>
          <BoxChart 
          ref = {boxChartRef}
          data = {filteredData} 
          width = {600} height = {400} 
          axisLabel = "Cycle Time in Hours"
          onExport = {(node,lb,ub)=>handleExportSVG((node),`${selectedFilter}-box`,lb,ub,filteredData)}/>
          <ViolinChart 
          ref = {violinChartRef}
          data={filteredData} 
          width={600} height={400} 
          isHorizontal = {true}
          onExport={(node, lb, ub) => 
            handleExportSVG(node, `${selectedFilter}-violin`, lb, ub, filteredData)
          }/>
        </Box>
        </>
      ) : !isLoading ? (
        <Typography>Select a filter to view charts</Typography>
      ) : null}
    </Box>
  );
};

export default StationCycleTime;