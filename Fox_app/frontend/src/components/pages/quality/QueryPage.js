// React Core
import React, { useEffect, useState, useCallback } from 'react';
// Material UI Components
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Custom Charts
import { ParetoChart } from '../../charts/ParetoChart.js';
// Page Components
import { Header } from '../../pagecomp/Header.jsx';
import { DateRange } from '../../pagecomp/DateRange.jsx';
// Utilities and Helpers
import { dataCache } from '../../../utils/cacheUtils.js';
import { gridStyle } from '../../theme/themes.js';
import { fetchErrorQuery } from '../../../utils/queryUtils.js';
import { getInitialStartDate, normalizeDate } from '../../../utils/dateUtils.js';
import { NumberRange } from '../../pagecomp/NumberRange.jsx'

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
  

  return (
    <Box p={1}>
      <Header title="Query Page" subTitle="Query the database to your heart's desire" />
      
    </Box>
  );
};

export default QueryPage;