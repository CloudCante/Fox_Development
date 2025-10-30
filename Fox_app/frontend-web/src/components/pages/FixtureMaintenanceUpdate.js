import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Container, Grid, MenuItem, TextField } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE;

const FixtureMaintenanceUpdate = () => {
    // State variables for page data
    const [data, setData] = useState([]);
    const [pageError, setPageError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    // Set fixture_id to be the default sort column
    const [sorting, setSorting] = useState([{ id: 'fixture_id', desc: false }]);

    // State variables for form data
    const [eventType, setEventType] = useState("");
    const [eventTypeError, setEventTypeError] = useState(false); 
    const [eventTypeHelperText, setEventTypeHelperText] = useState("");
    const [startDateTime, setStartDateTime] = useState(dayjs());
    const [endDateTime, setEndDateTime] = useState(dayjs());
    const [occurance, setOccurance] = useState("");
    const [occuranceError, setOccuranceError] = useState(false); 
    const [occuranceHelperText, setOccuranceHelperText] = useState("");
    const [comments, setComments] = useState("");
    const [isCompleted, setIsCompleted] = useState("false");
    const [creator, setCreator] = useState("Admin");
    const [createTime, setCreateTime] = useState(dayjs()); 

    // Hook to get and initial data from the backend
    useEffect(() => {
        // Get all events from event_maintenance table 
        axios.get(`${API_BASE}/api/fixtureMaintenance/getWithFixtureId`)
             .then(response => setData(response.data))
             .catch(error => console.error('Error fetching items:', error));
    }, [data]);

    // Hook to update the list of rows selected
    useMemo(() => {
        const selectedIds = Object.keys(rowSelection).filter(primary_key => rowSelection[primary_key]);
    }, [rowSelection]);    

    // Function to Put/update an event by id
    const handleUpdate = async () => {
        let errorFound = false;
        setPageError(null);

        // Validate input fields for any errors
        if (Object.keys(rowSelection).length == 0) {
            setPageError({error: "No events were was selected, event(s) not updated."});
            errorFound = true;
        }
        if (eventType.length == 0) {
            setEventTypeError(true);
            setEventTypeHelperText("Please select an event type");
            errorFound = true;
        }
        if (occurance.length == 0) {
            setOccuranceError(true);
            setOccuranceHelperText("Please select an occurance");
            errorFound = true;
        }
        // Return if any errors are found
        if (errorFound) return;

        for (const event_id in rowSelection){
            setLoading(true);
            try {
                const data = {
                    // Data to send
                    event_type: `${eventType}`,
                    start_date_time: `${startDateTime}`,
                    end_date_time: `${endDateTime}`,
                    occurance: `${occurance}`,
                    comments: `${comments}`,
                    is_completed: `${isCompleted}`,
                    creator: `${creator}`,
                    create_date: `${createTime}`
                };
                // Send put request to putMaintenance with event id
                const response = await axios.put(`${API_BASE}/api/fixtureMaintenance/putMaintenance/${event_id}`, data);
                setData(response.data);
            } catch (err) {
                const msg = `An error occurred, the event with fixture_id ${event_id} was not updated.`
                setPageError({error: msg});
            } finally {                
                setLoading(false);                          
            }
        }
    };

    const handleDelete = async () => {
        let errorFound = false;
        setPageError(null);

        // Validate input fields for any errors
        if (Object.keys(rowSelection).length == 0) {
            setPageError({error: "No events were was selected, nothing to delete."});
            errorFound = true;
            return;
        }

        setLoading(true);
        for (const event_id in rowSelection){
            
            try {
                const response = await axios.delete(`${API_BASE}/api/fixtureMaintenance/deleteMaintenance/${event_id}`);
                setData(response.data)                
            } catch (err) {
                const msg = `Event with id: ${event_id} was not found, nothing to delete.`
                setPageError({error: msg});
            } 
        }
        table.resetRowSelection();
        setLoading(false);

    };

    const columns = useMemo(
    () => [
        {
            accessorKey: 'primary_key',
            header: 'Event Id',
        },        
        {
            accessorKey: 'fixture_id',
            header: 'Fixture Id',
        },
        {
            accessorKey: 'event_type',
            header: 'Event Type',
        },    
        {
            accessorKey: 'start_date_time',
            header: 'start_date_time',
        },      
        {
            accessorKey: 'end_date_time',
            header: 'end_date_time',
        },     
        {
            accessorKey: 'occurance',
            header: 'occurance',
            filterFn: 'equals',
            filterSelectOptions: ['Daily', 'Monthly', 'Quarterly', 'Once'],
            filterVariant: 'select',
        },
        {
            accessorKey: 'comments',
            header: 'Comments',
        },  
    ],
    [],
    );    

    const table = useMaterialReactTable({
        columns,
        data,
        columnFilterDisplayMode: 'popover',
        enableRowSelection: true,
        autoResetPageIndex: false,
        getRowId: (row) => row.primary_key,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        state: { rowSelection, sorting },
        muiTableHeadCellProps: {
            sx: theme => ({
                    background: 'rgba(125, 131, 139, 0.47)',
                    color: theme.palette.text.primary,
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
        {
            value: 'Once',
            label: 'Once',
        },                              
    ]

    return (
        <Container maxWidth="xl">
            <Box>
                <Header
                title="Update Fixture Maintenance"
                subTitle={`Edit fixture maintenance events`}
                />
            </Box>
            <Box
                component="form"
                sx={{ '& .MuiTextField-root': { m: 1 } }}
                noValidate
                autoComplete="off"
            >
                <div>
                    {pageError && <Alert 
                                    sx = {{m: 1, minWidth: '30ch'}}
                                    variant="outlined" 
                                    severity="error" 
                                    onClose={() => {setPageError(null)}}
                                >
                                    Error: {pageError.error}
                                </Alert>
                    }  
                    <TextField
                        id="fixture-event-type"
                        sx = {{m: 1, minWidth: '30ch'}}
                        select
                        label="Select Event Type"
                        error={eventTypeError}
                        helperText={eventTypeHelperText}
                        value={eventType}
                        onChange={(newValue) => { setEventType(newValue.target.value); 
                                                  setEventTypeError(false); 
                                                  setEventTypeHelperText("");
                                                }
                                }
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
                        disablePast
                        minutesStep={15}
                        value={startDateTime}                         
                        onChange={(newValue) => setStartDateTime(newValue)}
                    />
                    <DateTimePicker
                        label="Event End Date & Time"
                        sx = {{m: 1, minWidth: '30ch'}}                       
                        disablePast
                        minutesStep={15}
                        value={endDateTime} 
                        onChange={(newValue) => setEndDateTime(newValue)}
                    />
                    <TextField
                        id="event-occurance"
                        sx = {{minWidth: '30ch'}}
                        select
                        label="Select Occurance"
                        error={occuranceError}
                        helperText={occuranceHelperText}
                        value={occurance}
                        onChange={(newValue) => { setOccurance(newValue.target.value); 
                                                  setOccuranceError(false); 
                                                  setOccuranceHelperText("");
                                                }
                                }
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
                        rows={2}
                        sx={{ minWidth: '94ch'}}
                        label="Add comments here"
                        value={comments}
                        onChange={(newValue) => setComments(newValue.target.value)}                   
                    >
                    </TextField>
                </div>    
                <Grid>
                    <Link to="/fixture-maintenance">
                        <Button variant="contained" 
                                sx={{m: 1}}                    
                        >
                            Create new event
                        </Button>
                    </Link>                    
                    <Button variant="contained" 
                            sx={{m: 1}}
                            onClick={() => handleUpdate()} 
                            disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update'}
                    </Button>                                 
                    <Button variant="contained" 
                            sx={{m: 1}}
                            onClick={() => handleDelete()}
                            disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Grid>          
            </Box>

            <MaterialReactTable  table={table} />
        
        </Container>
    );
};

export default FixtureMaintenanceUpdate;
