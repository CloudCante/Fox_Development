import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

const API_BASE = process.env.REACT_APP_API_BASE;

const CONSTANTS = {
  MODEL_KEYS: { SXM4: 'Tesla SXM4', SXM5: 'Tesla SXM5', SXM6: 'SXM6' }
};

/**
 * Custom hook for fetching and managing throughput data
 * @param {string} selectedWeek - The selected week ID
 * @param {Function} formatWeekDateRange - Function to format date ranges
 * @returns {Object} Throughput data state and functions
 */
export const useThroughputData = (selectedWeek, formatWeekDateRange) => {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [throughputData, setThroughputData] = useState(null);
  
  const { secureApiCall, cleanup } = useApi();

  const fetchThroughputData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
<<<<<<< HEAD
      const weeksUrl = `${API_BASE}/api/tpy/weekly?startWeek=1900-W01&endWeek=2100-W99`;
=======
      const weeksUrl = `${API_BASE}/api/v1/tpy/weekly?startWeek=1900-W01&endWeek=2100-W99`;
>>>>>>> origin/main
      const allWeeksData = await secureApiCall(weeksUrl);
      
      if (!allWeeksData?.length) {
        setAvailableWeeks([]);
        setThroughputData(null);
        return;
      }

      const sortedWeeks = allWeeksData.sort((a, b) => b.weekId.localeCompare(a.weekId));
      const weeksWithDates = sortedWeeks.map(week => ({
        id: String(week.weekId),
        weekStart: week.weekStart,
        weekEnd: week.weekEnd,
        dateRange: formatWeekDateRange(week.weekStart, week.weekEnd)
      }));
      
      setAvailableWeeks(weeksWithDates);
      
      const mostRecentWeekId = weeksWithDates[0].id;
      const currentSelectedWeek = selectedWeek || mostRecentWeekId;
      
      if (!currentSelectedWeek) { setThroughputData(null); return; }

<<<<<<< HEAD
      const weeklyUrl = `${API_BASE}/api/tpy/weekly?startWeek=${encodeURIComponent(currentSelectedWeek)}&endWeek=${encodeURIComponent(currentSelectedWeek)}`;
=======
      const weeklyUrl = `${API_BASE}/api/v1/tpy/weekly?startWeek=${encodeURIComponent(currentSelectedWeek)}&endWeek=${encodeURIComponent(currentSelectedWeek)}`;
>>>>>>> origin/main
      const weeklyData = await secureApiCall(weeklyUrl);
      
      if (!weeklyData?.length) { setThroughputData(null); return; }

      const weekData = weeklyData.find(week => week.weekId === currentSelectedWeek);
      if (!weekData) { setThroughputData(null); return; }

      const startDate = new Date(weekData.weekStart).toISOString().split('T')[0];
      const endDate = new Date(weekData.weekEnd).toISOString().split('T')[0];
      
<<<<<<< HEAD
      const dailyUrl = `${API_BASE}/api/tpy/daily?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
=======
      const dailyUrl = `${API_BASE}/api/v1/tpy/daily?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
>>>>>>> origin/main
      const dailyData = await secureApiCall(dailyUrl);

      const aggregatedStations = {
        [CONSTANTS.MODEL_KEYS.SXM4]: {},
        [CONSTANTS.MODEL_KEYS.SXM5]: {},
        [CONSTANTS.MODEL_KEYS.SXM6]: {}
      };

      if (dailyData?.length) {
        dailyData.forEach(dayData => {
          if (dayData?.stations && typeof dayData.stations === 'object') {
            Object.entries(CONSTANTS.MODEL_KEYS).forEach(([, modelKey]) => {
              if (dayData.stations[modelKey]) {
                Object.entries(dayData.stations[modelKey]).forEach(([stationName, stationData]) => {
                  if (!aggregatedStations[modelKey][stationName]) {
                    aggregatedStations[modelKey][stationName] = {
                      totalParts: 0, passedParts: 0, failedParts: 0, throughputYield: 0
                    };
                  }
                  
                  const station = aggregatedStations[modelKey][stationName];
                  station.totalParts += Number(stationData.totalParts) || 0;
                  station.passedParts += Number(stationData.passedParts) || 0;
                  station.failedParts += Number(stationData.failedParts) || 0;
                });
              }
            });
          }
        });

        Object.values(aggregatedStations).forEach(modelStations => {
          Object.values(modelStations).forEach(stationData => {
            if (stationData.totalParts > 0) {
              stationData.throughputYield = (stationData.passedParts / stationData.totalParts) * 100;
            }
          });
        });
      }

      setThroughputData({
        weekId: weekData.weekId,
        weekStart: weekData.weekStart,
        weekEnd: weekData.weekEnd,
        weeklyTPY: {
          hardcoded: {
            SXM4: { tpy: parseFloat(weekData.sxm4HardcodedTPY || 0), stations: weekData.hardcoded_stations || {} },
            SXM5: { tpy: parseFloat(weekData.sxm5HardcodedTPY || 0), stations: weekData.hardcoded_stations || {} },
            SXM6: { tpy: parseFloat(weekData.sxm6HardcodedTPY || 0), stations: weekData.hardcoded_stations || {} }
          },
          dynamic: {
            SXM4: { tpy: parseFloat(weekData.sxm4DynamicTPY || 0), stations: weekData.dynamic_stations || {}, stationCount: weekData.dynamic_station_count || 0 },
            SXM5: { tpy: parseFloat(weekData.sxm5DynamicTPY || 0), stations: weekData.dynamic_stations || {}, stationCount: weekData.dynamic_station_count || 0 },
            SXM6: { tpy: parseFloat(weekData.sxm6DynamicTPY || 0), stations: weekData.dynamic_stations || {}, stationCount: weekData.dynamic_station_count || 0 }
          }
        },
        weeklyThroughputYield: { modelSpecific: aggregatedStations },
        summary: weekData.summary
      });

    } catch (error) {
      console.error('Error fetching throughput data:', error);
      setError(error.message || 'Failed to fetch throughput data');
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, secureApiCall, formatWeekDateRange]);

  useEffect(() => {
    fetchThroughputData();
  }, [fetchThroughputData]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    availableWeeks,
    loading,
    error,
    throughputData,
    fetchThroughputData
  };
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/main
