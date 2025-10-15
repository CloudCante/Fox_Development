// React Core
import React, { useRef, useState, useCallback } from 'react';
// Material UI Components
import { Box, Stack, Paper, Typography, Button, TextField } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
import Papa from 'papaparse';
// Page Components
import { Header } from '../../pagecomp/Header.jsx';
import { DateRange } from '../../pagecomp/DateRange.jsx';
import { paperStyle, buttonStyle } from '../../theme/themes.js';

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
    
    const fileInputRef = useRef(null);

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

    
    const handleImportClick = () => fileInputRef.current?.click();

    const handleImport = useCallback(async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: results => {
                const data = results.data;

                if (!data.length) {
                    console.warn('No data found in CSV');
                    return;
                }

                // Extract first four columns from each row
                const col1 = data.map(row => Object.values(row)[0]).filter(Boolean).join(',');
                const col2 = data.map(row => Object.values(row)[1]).filter(Boolean).join(',');
                const col3 = data.map(row => Object.values(row)[2]).filter(Boolean).join(',');
                const col4 = data.map(row => Object.values(row)[3]).filter(Boolean).join(',');

                setOptionals((prev) => ({...prev, ['one']:col1}));
                setOptionals((prev) => ({...prev, ['two']:col2}));
                setOptionals((prev) => ({...prev, ['three']:col3}));
                setOptionals((prev) => ({...prev, ['four']:col4}));

                // You can now use col1–col4 however you need
            },
            error: err => console.error(err)
        });

        e.target.value = null;
    }, []);

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
                    <Button sx={buttonStyle} size = 'small' onClick={handleImportClick}>Import</Button>
                        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
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
                    <Typography
                        sx ={{
                            whiteSpace:'pre-wrap',
                            wordBreak:'break-word',
                            overflowWrap:'break-word',
                        }}
                    >
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