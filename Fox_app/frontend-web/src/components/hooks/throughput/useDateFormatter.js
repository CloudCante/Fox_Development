import { useCallback } from 'react';

/**
 * Custom hook for formatting date ranges consistently
 * @returns {Function} formatWeekDateRange function
 */
export const useDateFormatter = () => {
  const formatWeekDateRange = useCallback((weekStart, weekEnd) => {
    if (!weekStart || !weekEnd) return '';
    try {
      const startDate = new Date(weekStart);
      const endDate = new Date(weekEnd);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Invalid date range';
      
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const startDay = startDate.getDate();
      const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
      const endDay = endDate.getDate();
      const year = startDate.getFullYear();
      
      return startMonth === endMonth 
        ? `${startMonth} ${startDay}-${endDay}, ${year}`
        : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    } catch {
      return 'Date formatting error';
    }
  }, []);

  return { formatWeekDateRange };
};
