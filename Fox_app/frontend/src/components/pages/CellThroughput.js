// CellThroughput.js
import { useEffect, useState, useMemo} from 'react';
import {
  Box, Paper, Typography, Modal, Pagination, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, TextField, Button, Menu,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '@mui/material';
import { exportSecureCSV, jsonExport } from '../../utils/exportUtils';
import { importQuery } from '../../utils/queryUtils';
import { sanitizeText } from '../../utils/textUtils.js';
import { MultiMenu } from '../pagecomp/MultiMenu.jsx';
import { MultiFilter } from '../pagecomp/MultiFilter.jsx';
import { DataTable } from '../pagecomp/snfn/DataTable.jsx';
import { useCallback } from 'react';

// Check for environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const CellThroughput = () => {
    return(
        <Box>
            {/* Page Header */}
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                Cell Throuhput Reports 
                </Typography>
                <Typography variant="body1" color="text.secondary">
                Daily Cell Aggregates
                </Typography>
            </Box>

        </Box>
    );
}
export default CellThroughput;