// src/utils/packingDataUtils.js

// src/utils/packingDataUtils.js
export function rollupWeekendCounts(rawData) {
  // Helper to format Date d → "M/D/YYYY"
  function fmt(d) {
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
  }

  // Helper to adjust weekend dates to Friday
  function adjustWeekend(dateStr) {
    const [mo, da, yr] = dateStr.split('/');
    const d = new Date(Date.UTC(+yr, +mo - 1, +da));
    const dow = d.getUTCDay();
    
    if (dow === 6) d.setUTCDate(d.getUTCDate() - 1);      // Saturday → Friday
    else if (dow === 0) d.setUTCDate(d.getUTCDate() - 2); // Sunday → Friday
    
    return fmt(d);
  }

  const processedData = {};
  const seen = new Set();
  const allDates = [];

  // Process each model group
  Object.entries(rawData).forEach(([modelName, modelData]) => {
    const parts = modelData.parts || {};
    const processedParts = {};

    // Process each part's data
    Object.entries(parts).forEach(([partNumber, dateData]) => {
      const adjustedData = {};

      // Process each date for this part
      Object.entries(dateData).forEach(([date, count]) => {
        const adjustedDate = adjustWeekend(date);
        adjustedData[adjustedDate] = (adjustedData[adjustedDate] || 0) + count;

        if (!seen.has(adjustedDate)) {
          seen.add(adjustedDate);
          allDates.push(adjustedDate);
        }
      });

      processedParts[partNumber] = adjustedData;
    });

    // Create the model group entry
    processedData[modelName] = {
      groupLabel: modelData.groupLabel || modelName,
      totalLabel: modelData.totalLabel || `${modelName} Total`,
      parts: processedParts
    };
  });

  // Sort dates chronologically
  allDates.sort((a, b) => {
    const [am, ad, ay] = a.split('/');
    const [bm, bd, by] = b.split('/');
    return Date.UTC(+ay, +am - 1, +ad) - Date.UTC(+by, +bm - 1, +bd);
  });

  return { rolledUp: processedData, sortedDates: allDates };
}
