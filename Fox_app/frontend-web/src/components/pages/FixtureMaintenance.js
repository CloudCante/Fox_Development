import React, { useEffect, useState, useMemo } from 'react';
import { Box, Button, Container, Grid, MenuItem, TextField } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import axios from 'axios';

const FixtureDetails = () => {
    const [dateTimeStartValue, setDateTimeStartValue] = useState(dayjs());
    const [dateTimeEndValue, setDateTimeEndValue] = useState(dayjs());
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/fixtures')
            .then(response => setData(response.data))
            .catch(error => console.error('Error fetching items:', error));
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/api/deleteFixture/${id}`)
            .then(() => setData(fixtures.filter(item => item.id !== id)))
            .catch(error => console.error('Error deleting item:', error));
    };

const columns = useMemo(
  () => [
      {
        accessorKey: 'fixture_id',
        header: 'Name',
      },
      {
        accessorKey: 'rack',
        header: 'Rack',
        filterVariant: 'range-slider',
      },    
     {
        accessorKey: 'fixture_sn',
        header: 'SN',
      },      
      {
        accessorKey: 'tester_type',
        header: 'Tester Type',
      },     
      {
        accessorKey: 'test_type',
        header: 'RMA Type',
        filterFn: 'equals',
        filterSelectOptions: ['Refurbish', 'Sort'],
        filterVariant: 'select',
      },     
  ],
  [],
);    

  const table = useMaterialReactTable({
    columns,
    data,
    columnFilterDisplayMode: 'popover',
    enableRowSelection: true,
    muiTableHeadCellProps: {
        sx: theme => ({
                background: 'rgba(9, 87, 189, 0.47)',
                color: theme.palette.text.primary,
        })
    },
    muiTableBodyCellProps: {
        sx: theme => ({
                color: theme.palette.text.primary,
                borderColor: 'rgba(173, 168, 168, 1)',
        })
    },
  });
    
    const fixtureEventTypes = [
        {
            value: 'Scheduled Maintenance',
            label: 'Scheduled Maintenance',
        },
        {
            value: 'Emergency Maintenance',
            label: 'Emergency Maintenance',
        },
        {
            value: 'Unknown Outage',
            label: 'Unknown Outage',
        },               
    ]
        const fixtureEventOccurance = [
        {
            value: 'Daily',
            label: 'Daily',
        },
        {
            value: 'Monthly',
            label: 'Monthly',
        },
        {
            value: 'Quarterly',
            label: 'Quarterly',
        },  
        {
            value: 'Yearly',
            label: 'Yearly',
        },                      
    ]

    return (
        <Container maxWidth="xl">
            <Box>
                <Header
                title="Fixture Maintenance"
                subTitle={`Schedule and execute fixture maintenance events`}
                />
            </Box>
            <Box
                component="form"
                sx={{ '& .MuiTextField-root': { m: 1 } }}
                noValidate
                autoComplete="off"
            >
                <div>
                    <TextField
                        id="fixture-event-type"
                        sx = {{m: 1, minWidth: '30ch'}}
                        select
                        label="Select Event Type"
                        defaultValue="Scheduled Maintenance"
                    >
                        {fixtureEventTypes.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>                    
                </div>
                <div>
                    <DateTimePicker
                        label="Event Start Date & Time"
                        sx = {{m: 1, minWidth: '30ch'}}
                        value={dateTimeStartValue}
                        onChange={(newValue) => setDateTimeStartValue(newValue)}
                        disablePast
                        minutesStep={15}
                    />
                    <DateTimePicker
                        label="Event End Date & Time"
                        sx = {{m: 1, minWidth: '30ch'}}
                        value={dateTimeEndValue}
                        onChange={(newValue) => setDateTimeEndValue(newValue)}
                        disablePast
                        minutesStep={15}
                    />
                    <TextField
                        id="event-occurance"
                        sx = {{minWidth: '30ch'}}
                        select
                        label="Select Occurance"
                        defaultValue="Monthly"
                    >
                        {fixtureEventOccurance.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>                                        
                </div>
                <div>
                    <TextField
                        id="fixture-comments"
                        multiline
                        rows={4}
                        sx={{ minWidth: '94ch'}}
                        label="Add comments here"                       
                    >
                    </TextField>
                </div>    
                <Grid>
                    <Button variant="contained" sx={{m: 1}}>Create</Button>
                    <Button variant="contained" sx={{m: 1}}>Update</Button>
                    <Button variant="contained" sx={{m: 1}}>Delete</Button>
                </Grid>          
            </Box>

            <MaterialReactTable  table={table} />
        
        </Container>
    );
};

export default FixtureDetails;
