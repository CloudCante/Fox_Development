// DateRange.jsx
import React, { memo, useMemo } from 'react';
import { Box, FormHelperText, IconButton } from '@mui/material';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { normalizeDate, } from '../../utils/dateUtils';

export const DateRange = memo(function DateRange({
  startDate,
  setStartDate,
  normalizeStart = normalizeDate.start,
  startLabel = "Start Date",
  endDate,
  setEndDate,
  normalizeEnd = normalizeDate.end,
  endLabel = "End Date",
  format = "yyyy-MM-dd",
  maxDate,
  minDate,
  disabled = false,
  error,
  helperText,
  required = false,
  sx = {},
  inline=false
}) {
  // Memoize maxDate to avoid creating new Date on every render
  const defaultMaxDate = useMemo(() => new Date(), []);
  const effectiveMaxDate = maxDate ?? defaultMaxDate;
  
  // Determine if this is a range picker
  const isRangePicker = Boolean(setEndDate);
  
  // Safe normalization wrapper
  const safeNormalizeStart = (date) => {
    if (!date) return null;
    return typeof normalizeStart === 'function' ? normalizeStart(date) : date;
  };
  
  const safeNormalizeEnd = (date) => {
    if (!date) return null;
    return typeof normalizeEnd === 'function' ? normalizeEnd(date) : date;
  };


  if (inline) {
    return (
      <Box sx={{ display: 'flex', gap: 1, ...sx }}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(safeNormalizeStart(date))}
          selectsStart={isRangePicker}
          startDate={startDate}
          endDate={endDate}
          placeholderText={`Select ${startLabel.toLowerCase()}`}
          dateFormat={format}
          isClearable
          maxDate={effectiveMaxDate}
          minDate={minDate}
          disabled={disabled}
          aria-label={startLabel}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
          slotProps={{
            popper: {
              placement: 'bottom-start',
              modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
              sx: { zIndex: (theme) => theme.zIndex.modal + 1 },
            },
            textField: { fullWidth: true },
          }}
        />
        {isRangePicker && (
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(safeNormalizeEnd(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={effectiveMaxDate}
            placeholderText={`Select ${endLabel.toLowerCase()}`}
            dateFormat={format}
            isClearable
            disabled={disabled}
            aria-label={endLabel}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
          />
        )}
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ...sx }}>
      {/* Start Date */}
      <Box>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(safeNormalizeStart(date))}
          selectsStart={isRangePicker}
          startDate={startDate}
          endDate={endDate}
          placeholderText={`Select ${startLabel.toLowerCase()}`}
          dateFormat={format}
          isClearable
          maxDate={effectiveMaxDate}
          minDate={minDate}
          disabled={disabled}
          aria-label={startLabel}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
        />
      </Box>

      {/* End Date - only render if it's a range picker */}
      {isRangePicker && (
        <Box>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(safeNormalizeEnd(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={effectiveMaxDate}
            placeholderText={`Select ${endLabel.toLowerCase()}`}
            dateFormat={format}
            isClearable
            disabled={disabled}
            aria-label={endLabel}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
          />
        </Box>
      )}

      {/* Error or Helper Text */}
      {error && (
        <FormHelperText id="daterange-error" error>
          {error}
        </FormHelperText>
      )}
      {!error && helperText && (
        <FormHelperText id="daterange-helper">
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

DateRange.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  normalizeStart: PropTypes.func,
  startLabel: PropTypes.string,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func,
  normalizeEnd: PropTypes.func,
  endLabel: PropTypes.string,
  format: PropTypes.string,
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  sx: PropTypes.object
};

export default DateRange;