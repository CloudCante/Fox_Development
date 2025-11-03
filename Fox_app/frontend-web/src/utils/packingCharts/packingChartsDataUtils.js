export const processPackingData = (data, selectedModels, partToModel) => {
  const dateMap = {};
  Object.entries(data).forEach(([part, dateObj]) => {
    const model = partToModel[part];
    if (!model || !selectedModels.includes(model)) return;
    
    Object.entries(dateObj).forEach(([dateStr, count]) => {
      const [month, day, year] = dateStr.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      dateMap[isoDate] = (dateMap[isoDate] || 0) + count;
    });
  });
  return dateMap;
};