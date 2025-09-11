import { useCallback } from 'react';

const MIN_VOLUME_FILTER = 10;

/**
 * Custom hook for processing model data with filtering and sorting
 * @param {Object} options - Configuration options
 * @param {boolean} options.showRepairStations - Whether to include repair stations
 * @param {string} options.sortBy - Sort criteria
 * @returns {Function} processModelData function
 */
export const useDataProcessing = ({ showRepairStations = false, sortBy = 'volume' } = {}) => {
  const processModelData = useCallback((modelData) => {
    if (!modelData || typeof modelData !== 'object') return [];
    
    let stations = Object.entries(modelData)
      .map(([stationName, data]) => {
        const totalParts = Math.max(0, Number(data.totalParts) || 0);
        const failedParts = Math.max(0, Number(data.failedParts) || 0);
        const passedParts = Math.max(0, Number(data.passedParts) || 0);
        const throughputYield = Math.max(0, Math.min(100, Number(data.throughputYield) || 0));
        
        return {
          station: String(stationName).trim(),
          totalParts,
          failedParts,
          passedParts,
          failureRate: totalParts > 0 ? parseFloat(((failedParts / totalParts) * 100).toFixed(2)) : 0,
          throughputYield: parseFloat(throughputYield.toFixed(2)),
          impactScore: parseFloat((totalParts * (failedParts / Math.max(totalParts, 1))).toFixed(1))
        };
      })
      .filter(station => 
        station.totalParts >= MIN_VOLUME_FILTER && station.station.length > 0
      );
    
    if (!showRepairStations) {
      stations = stations.filter(station => 
        !station.station.toUpperCase().includes('REPAIR') && 
        !station.station.toUpperCase().includes('DEBUG')
      );
    }
    
    const sortMap = {
      volume: (a, b) => b.totalParts - a.totalParts,
      failureRate: (a, b) => b.failureRate - a.failureRate,
      impactScore: (a, b) => b.impactScore - a.impactScore,
      alphabetical: (a, b) => a.station.localeCompare(b.station)
    };
    
    return stations.sort(sortMap[sortBy] || sortMap.volume);
  }, [showRepairStations, sortBy]);

  return { processModelData };
};