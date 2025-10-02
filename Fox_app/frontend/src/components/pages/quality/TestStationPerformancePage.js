// React Core
import React, { useEffect, useState, useRef } from 'react';
// Material UI Components
import { Box} from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Custom Charts
import { TestStationChart } from '../../charts/TestStationChart.js';
import { FixtureFailParetoChart } from '../../charts/FixtureFailParetoChart.js';
//import { ParetoChart } from '../charts/ParetoChart';
// Page Components
import { Header } from '../../pagecomp/Header.jsx';
import { DateRange } from '../../pagecomp/DateRange.jsx';
// Utilities and Helpers
import { dataCache } from '../../../utils/cacheUtils.js';
import { gridStyle } from '../../theme/themes.js';
import { fetchFixtureQuery, fetchWorkstationQuery } from '../../../utils/queryUtils.js';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes

export const TestStationPerformancePage = () => {
  const [testStationDataSXM4, setTestStationDataSXM4] = useState([]);
  const [testStationDataSXM5, setTestStationDataSXM5] = useState([]);
  const [testStationDataSXM6, setTestStationDataSXM6] = useState([]);
  const [topFixturesData, setTopFixturesData] = useState([]);
  //const [failStationsData, setFailStationsData] = useState([]);
  //const [defectCodesData, setDefectCodesData] = useState([]);
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setLoading(true);

    const fetchModelData = ({ value, key, setter }) =>
      fetchWorkstationQuery({
        parameters: [{ id: 'model', value: value }],
        startDate,
        endDate,
        key,
        setDataCache: setter,
        API_BASE,
        API_Route: '/api/functional-testing/station-performance?'
      });

    const fetchSXM5 = () => fetchModelData({value:'Tesla SXM5',key:'sxm5',setter: setTestStationDataSXM5});
    const fetchSXM4 = () => fetchModelData({value:'Tesla SXM4',key:'sxm4',setter: setTestStationDataSXM4});
    const fetchSXM6 = () => fetchModelData({value:'SXM6',key:'sxm6',setter: setTestStationDataSXM6});

    const fetchFixtures = () => 
      fetchFixtureQuery({
        startDate,
        endDate,
        key: 'fixtures',
        setDataCache: setTopFixturesData,
        API_BASE,
        API_Route: '/api/functional-testing/fixture-performance?'
      });

    // const fetchFailStations = () => {
    //   const params = new URLSearchParams();
    //   if (startDate) {
    //     const utcStartDate = new Date(startDate);
    //     utcStartDate.setUTCHours(0, 0, 0, 0);
    //     params.append('startDate', utcStartDate.toISOString());
    //   }
    //   if (endDate) {
    //     const utcEndDate = new Date(endDate);
    //     utcEndDate.setUTCHours(23, 59, 59, 999);
    //     params.append('endDate', utcEndDate.toISOString());
    //   }

    //   const cacheKey = `failStations_${params.toString()}`;

    //   const cachedData = dataCache.get(cacheKey);
    //   if (cachedData) {
    //     setFailStationsData(cachedData);
    //     return Promise.resolve(cachedData);
    //   }

    //   return fetch(`${API_BASE}/api/defect-records/fail-stations?${params.toString()}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setFailStationsData(data);
    //       dataCache.set(cacheKey, data);
    //       return data;
    //     })
    //     .catch(() => {
    //       setFailStationsData([]);
    //       return [];
    //     });
    // };

    // const fetchDefectCodes = () => {
    //   const params = new URLSearchParams();
    //   if (startDate) {
    //     const utcStartDate = new Date(startDate);
    //     utcStartDate.setUTCHours(0, 0, 0, 0);
    //     params.append('startDate', utcStartDate.toISOString());
    //   }
    //   if (endDate) {
    //     const utcEndDate = new Date(endDate);
    //     utcEndDate.setUTCHours(23, 59, 59, 999);
    //     params.append('endDate', utcEndDate.toISOString());
    //   }

    //   const cacheKey = `defectCodes_${params.toString()}`;

    //   const cachedData = dataCache.get(cacheKey);
    //   if (cachedData) {
    //     setDefectCodesData(cachedData);
    //     return Promise.resolve(cachedData);
    //   }

    //   return fetch(`${API_BASE}/api/defect-records/defect-codes?${params.toString()}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setDefectCodesData(data);
    //       dataCache.set(cacheKey, data);
    //       return data;
    //     })
    //     .catch(() => {
    //       setDefectCodesData([]);
    //       return [];
    //     });
    // };

    Promise.all([fetchSXM4(), fetchSXM5(), fetchSXM6(), fetchFixtures()])
      .then(() => setLoading(false)) 
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false); 
      });

    const interval = setInterval(() => {
      dataCache.clear();

      Promise.all([fetchSXM4(), fetchSXM5(), fetchSXM6, fetchFixtures()])
        .catch(error => console.error("Error refreshing dashboard data:", error));
    }, refreshInterval);

    return () => clearInterval(interval); 
  }, [startDate, endDate]);

  return (
    <Box p={1}>
      <Header title="Test Station Performance Charts" />
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <DateRange
          startDate={startDate}
          setStartDate={setStartDate}
          normalizeStart={normalizeStart}
          endDate={endDate}
          setEndDate={setEndDate}
          normalizeEnd={normalizeEnd}
          inline= {true}
        />
      </div>
      <Box sx={gridStyle}>
        <TestStationChart 
          label={"SXM4 Test Station Performance"}
          data={testStationDataSXM4} 
          loading={loading}/>
        <TestStationChart 
          label="SXM5 Test Station Performance"
          data={testStationDataSXM5}
          loading={loading} />
        <TestStationChart 
          label="SXM6 Test Station Performance"
          data={testStationDataSXM6}
          loading={loading} />
        <FixtureFailParetoChart 
          label={"Fixture Performance"}
          data={topFixturesData}
          loading={loading} />
        {/* <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              Defect Fail Stations
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={failStationsData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              Most Common Defects
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={defectCodesData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper> */}
      </Box>
    </Box>
  );
};
export default TestStationPerformancePage;