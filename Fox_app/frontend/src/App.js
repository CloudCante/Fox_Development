import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { DashboardThemeProvider } from './components/theme/ThemeContext';
import { SideDrawer } from './components/navigation/SideDrawer';
import { AppHeader } from './components/navigation/AppHeader';
<<<<<<< HEAD
import { Dashboard } from './components/dashboard/Dashboard';
import PackingPage from './components/pages/PackingPage';
import PerformancePage from './components/pages/PerformancePage';
import TestStationPerformancePage from './components/pages/TestStationPerformancePage'
import ThroughputPage from './components/pages/ThroughputPage';
import SNFNPage from './components/pages/SNFNPage';
import PackingCharts from './components/pages/PackingCharts';
import UploadPage from './components/pages/uploadPage';
import StationHourlySummaryPage from './components/pages/StationHourlySummaryPage';
import StationCycleTime from './components/pages/CycleTime';
import MostRecentFail from './components/pages/MostRecentFail';
import ParetoPage from './components/pages/ParetoPage';
import ByErrorCode from './components/pages/ByErrorCode';
import JsonToCsv from './components/pages/JsonToCSV';
import DidTheyFail from './components/pages/DidTheyFail';
import FixtureDash from './components/pages/FixtureDash';
import FixtureDetails from './components/pages/FixtureDetails';
import FixtureInventory from './components/pages/FixtureInventory';
=======
// Page Components
import { Dashboard } from './components/pages/Dashboard';
import Home from './components/pages/Home';
// Quality Pages
import PackingPage from './components/pages/quality/PackingPage';
import PerformancePage from './components/pages/quality/performance/PerformancePage';
import TestStationPerformancePage from './components/pages/quality/TestStationPerformancePage';
import ThroughputPage from './components/pages/quality/performance/ThroughputPage';
import SNFNPage from './components/pages/quality/stationReports/SNFNPage';
import PackingCharts from './components/pages/quality/PackingCharts';
import UploadPage from './components/pages/dev/uploadPage';
import StationHourlySummaryPage from './components/pages/quality/stationReports/StationHourlySummaryPage';
import ParetoPage from './components/pages/quality/ParetoPage';
import QueryPage from './components/pages/quality/QueryPage';
// Test Engineer Pages
import FixtureDash from './components/pages/te/FixtureDash';
import FixtureDetails from './components/pages/te/FixtureDetails';
import FixtureInventory from './components/pages/te/FixtureInventory';
// Dev Pages
import StationCycleTime from './components/pages/dev/CycleTime';
import MostRecentFail from './components/pages/dev/MostRecentFail';
import ByErrorCode from './components/pages/dev/ByErrorCode';
import JsonToCsv from './components/pages/dev/JsonToCSV';
import DidTheyFail from './components/pages/dev/DidTheyFail';

>>>>>>> origin/main
import { SimplePerformanceMonitor } from './components/debug/SimplePerformanceMonitor';
import { isLowEndDevice, LightweightBackdrop } from './utils/muiOptimizations';
import './components/theme/theme.css';
import { GlobalSettingsProvider } from './data/GlobalSettingsContext';

const MainContent = React.memo(({ children }) => {
  const mainContentStyle = useMemo(() => ({ 
    flexGrow: 1, 
    p: 3, 
    minHeight: '100vh', 
    paddingTop: '64px',
    backgroundColor: 'background.default'
  }), []);

  return (
    <Box component="main" sx={mainContentStyle}>
      {children}
    </Box>
  );
});

const AppRoutes = React.memo(() => (
<<<<<<< HEAD
   <GlobalSettingsProvider>
    <Routes>
      <Route path="/" element={<Dashboard />} />
=======
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Home />} />
>>>>>>> origin/main
      <Route path="/packing" element={<PackingPage />} />
      <Route path="/performance" element={<PerformancePage />} />
      <Route path="/throughput" element={<ThroughputPage />} />
      <Route path="/snfn" element={<SNFNPage />} />
      <Route path="/packing-charts" element={<PackingCharts />} />
      <Route path="/station-hourly-summary" element={<StationHourlySummaryPage />} />
      <Route path="/cycle-time" element={<StationCycleTime />} />
      <Route path="/most-recent-fail" element={<MostRecentFail />} />
      <Route path="/pareto" element={<ParetoPage />} />
      <Route path="/station-performance" element={<TestStationPerformancePage/>}/>
      <Route path="/by-error" element={<ByErrorCode/>}/>
      <Route path="/json-to-csv" element={<JsonToCsv/>}/>
      <Route path="/did-they-fail" element={<DidTheyFail/>}/>
      <Route path="/fixture-dash" element={<FixtureDash/>}/>
      <Route path="/fixture-details" element={<FixtureDetails/>}/>
      <Route path="/fixture-inventory" element={<FixtureInventory/>}/>
<<<<<<< HEAD
=======
      <Route path="/query-page" element={<QueryPage/>}/>
>>>>>>> origin/main
      {process.env.NODE_ENV === 'development' && (
        <Route path="/dev/upload" element={<UploadPage />} />
      )}
    </Routes>
<<<<<<< HEAD
  </GlobalSettingsProvider>
=======
>>>>>>> origin/main
));

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
  }, []);

  const handlersRef = useRef({
    toggleDrawer: () => setDrawerOpen(prev => !prev),
    closeDrawer: () => setDrawerOpen(false)
  });

  const backdrop = useMemo(() => {
    if (isLowEnd && drawerOpen) {
      return <LightweightBackdrop open={drawerOpen} onClose={handlersRef.current.closeDrawer} />;
    }
    return null;
  }, [drawerOpen, isLowEnd]);

  return (
<<<<<<< HEAD
=======
    <GlobalSettingsProvider>
>>>>>>> origin/main
    <DashboardThemeProvider>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppHeader onMenuClick={handlersRef.current.toggleDrawer} />
        {backdrop}
        <SideDrawer 
          open={drawerOpen} 
          onClose={handlersRef.current.closeDrawer} 
        />
        <MainContent>
          <AppRoutes />
        </MainContent>
        <SimplePerformanceMonitor />
      </Box>
    </DashboardThemeProvider>
<<<<<<< HEAD
=======
    </GlobalSettingsProvider>
>>>>>>> origin/main
  );
}

export default App; 