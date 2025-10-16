// React Core
import React, { useEffect, useState, useCallback } from 'react';
// Material UI Components
import { Box, Stack, Paper, Typography, CircularProgress, Button, TextField } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Page Components
import { Header } from '../../pagecomp/Header.jsx';
import { DateRange } from '../../pagecomp/DateRange.jsx';
import { paperStyle } from '../../theme/themes.js';
import { toUTCDateString } from '../../../utils/dateUtils.js';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes

export const QueryPage = () => {
    
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14);
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));
  
    const [output,setOutput] = useState("Query Output will go here.");

    const [optionals,setOptionals] = useState({
        one:'',
        two:'',
        three:'',
        four:''
    })

    const handleOptChange = (e) =>{
        const {name, value} = e.target;
        setOptionals((prev) => ({...prev, [name]:value}))
    };

    const [query, setQuery] = useState('');

    const handleSubmit=()=>{
        if (!query) return;

        let builtQuery = query

        if(optionals.one){
            const formatted = optionals.one
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `'${s.replace(/'/g, "")}'`)
                .join(',');
            builtQuery = builtQuery.replace(/\{n1\}/g,formatted);
        }
        if(optionals.two){
            const formatted = optionals.two
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `'${s.replace(/'/g, "")}'`)
                .join(',');
            builtQuery = builtQuery.replace(/\{n2\}/g,formatted);
        }
        if(optionals.three){
            const formatted = optionals.three
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `'${s.replace(/'/g, "")}'`)
                .join(',');
            builtQuery = builtQuery.replace(/\{n3\}/g,formatted);
        }
        if(optionals.four){
            const formatted = optionals.four
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map(s => `'${s.replace(/'/g, "")}'`)
                .join(',');
            builtQuery = builtQuery.replace(/\{n4\}/g,formatted);
        }

        builtQuery = builtQuery.replace(/\{start\}/g,startDate.toISOString().slice(0,10));
        builtQuery = builtQuery.replace(/\{end\}/g,endDate.toISOString().slice(0,10));

        handleQuery(builtQuery);
    };

    const handleQuery = (q) => {
        // placeholder
        setOutput(q);
        console.log(q);
    }

    const handleExport = () =>{
        // placeholder
        return;
    };

    return (
        <Box p={1}>
            <Header title="Query Page" subTitle="Query the database to your heart's desire" />
            <Box>
                <Stack direction="row">
                    <TextField
                        name = "one"
                        label="Input 1"
                        placeholder='Optional input 1 {n1}'
                        value={optionals.one}
                        onChange={handleOptChange}
                        size='small'
                    />
                    <TextField
                        name = "two"
                        label="Input 2"
                        placeholder='Optional input 2 {n2}'
                        value={optionals.two}
                        onChange={handleOptChange}
                        size='small'
                    />
                    <TextField
                        name = "three"
                        label="Input 3"
                        placeholder='Optional input 3 {n3}'
                        value={optionals.three}
                        onChange={handleOptChange}
                        size='small'
                    />
                    <TextField
                        name="four"
                        label="Input 4"
                        placeholder='Optional input 4 {n4}'
                        value={optionals.four}
                        onChange={handleOptChange}
                        size='small'
                    />
                    <DateRange
                        startDate={startDate}
                        setStartDate={setStartDate}
                        normalizeStart={normalizeStart}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        normalizeEnd={normalizeEnd}
                        inline={true}
                        />
                </Stack>
            </Box>
            <Box>
                <TextField
                    label="Input Query Here"
                    value={query}
                    rows={6}
                    multiline
                    fullWidth
                    onChange={(e)=>{setQuery(e.target.value)}}
                />
                <Button
                    onClick ={handleSubmit}
                    variant='contained'
                >
                    Submit  
                </Button>
            </Box>
            <Box>
                <Paper sx={paperStyle}>
                    <Typography>
                        {output}
                    </Typography>
                </Paper>
                <Button
                    onClick ={handleExport}
                    variant='contained'
                >
                    Export   
                </Button>
            </Box>
        </Box>
    );
};

export default QueryPage;