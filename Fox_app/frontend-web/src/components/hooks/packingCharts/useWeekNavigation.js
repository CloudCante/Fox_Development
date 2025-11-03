import { useState } from 'react';
import { format, parseISO, addWeeks, startOfISOWeek, endOfISOWeek } from 'date-fns';

export const useWeekNavigation = (initialDate = new Date()) => {
  const [currentISOWeekStart, setCurrentISOWeekStart] = useState(
    format(startOfISOWeek(initialDate), 'yyyy-MM-dd')
  );

  const handlePrevWeek = () => 
    setCurrentISOWeekStart(prev => format(addWeeks(parseISO(prev), -1), 'yyyy-MM-dd'));

  const handleNextWeek = () => 
    setCurrentISOWeekStart(prev => format(addWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));

  const weekRange = currentISOWeekStart ? {
    start: parseISO(currentISOWeekStart),
    end: endOfISOWeek(parseISO(currentISOWeekStart)),
    label: `${format(parseISO(currentISOWeekStart), 'MMM d, yyyy')} - 
            ${format(endOfISOWeek(parseISO(currentISOWeekStart)), 'MMM d, yyyy')}`
  } : null;

  return { currentISOWeekStart, handlePrevWeek, handleNextWeek, weekRange };
};