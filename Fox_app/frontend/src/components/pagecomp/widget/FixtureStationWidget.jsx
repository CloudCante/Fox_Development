// Widget for Fixture Reports
// ------------------------------------------------------------
// Imports
<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> origin/main
import { Paper, Box } from '@mui/material';
// Style Guides
import { paperStyle } from '../../theme/themes.js';
// Chart Comps
import { FixtureFailParetoChart } from '../../charts/FixtureFailParetoChart.js';
// Utils
import { fetchFixtureQuery } from '../../../utils/queryUtils.js';
// Global Settings
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';

// ------------------------------------------------------------
// Environment / constants
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

// ------------------------------------------------------------
// Component
export function FixtureStationWidget({ widgetId }) {
  // ----- Global settings & guards
  const { state, dispatch } = useGlobalSettings();
  const { startDate, endDate } = state;

  // Early return if global state or widgetId isn’t ready
  if (!state) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
  }
  if (!widgetId) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
  }
<<<<<<< HEAD
  // ----- Widget settings pulled from global state
  const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};

  // ----------------------------------------------------------
  // Bootstrap: ensure settings object exists for this widget
  useEffect(() => {
    if (!state.widgetSettings || !state.widgetSettings[widgetId]) {
      dispatch({
        type: 'UPDATE_WIDGET_SETTINGS',
        widgetId,
        settings: {}
      });
    }
  }, [widgetId, state.widgetSettings, dispatch]);
  // ----------------------------------------------------------
=======

  // ----------------------------------------------------------
>>>>>>> origin/main
  // Local state (data + loading flag)
  const [fixtureData, setFixtureData] = useState([]);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  const latestReqId = useRef(0);

  // ----------------------------------------------------------
  // Derived values from widget settings (persisted selections)
  const loaded = widgetSettings.loaded || false; 
  // Placeholder for if widget needs to accept variables in the future

  // ----------------------------------------------------------
  // Helper: update current widget's settings (merge)
  const updateWidgetSettings = (updates) => {
    dispatch({
      type: 'UPDATE_WIDGET_SETTINGS',
      widgetId,
      settings: { ...widgetSettings, ...updates }
    });
  };
=======
>>>>>>> origin/main
  // ----------------------------------------------------------
  // Data fetching: query fixtures for the current date range
  useEffect(() => {
    // Polling loop with safety guard to avoid state updates after unmount
<<<<<<< HEAD
    let isMounted = true;
    const reqId = ++latestReqId.current;
=======
    let isActive = true;
>>>>>>> origin/main

    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchFixtureQuery({
          startDate,
          endDate,
          key: 'fixtures',
          setDataCache: data => {
<<<<<<< HEAD
            if (isMounted && latestReqId.current === reqId) setFixtureData(data);
          },
          API_BASE,
          API_Route: '/api/functional-testing/fixture-performance?'
        });
      } catch (err) {
        console.error('Error fetching data', err);
        if (isMounted&& latestReqId.current === reqId) setFixtureData([]);
      } finally {
        if (isMounted&& latestReqId.current === reqId) setLoading(false);
=======
            if (isActive) setFixtureData(data);
          },
          API_BASE,
          API_Route: '/api/v1/functional-testing/fixture-performance?'
        });
      } catch (err) {
        console.error('Error fetching data', err);
        if (isActive) setFixtureData([]);
      } finally {
        if (isActive) setLoading(false);
>>>>>>> origin/main
      }
    };

    fetchData();                         // initial fetch
    const intervalId = setInterval(fetchData, 300000); // refresh every 5 min

    return () => {
<<<<<<< HEAD
      isMounted = false;
=======
      isActive = false;
>>>>>>> origin/main
      clearInterval(intervalId);
    };
  }, [startDate, endDate]);

  // ----------------------------------------------------------
  // Render: pareto chart of fixture performance
  return (
    <FixtureFailParetoChart
      label="Fixture Performance"
      data={fixtureData}
      loading={loading}
    />
  );
}
