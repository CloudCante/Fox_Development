// NumberRange.jsx
import React, { memo } from 'react';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

export const NumberRange = memo(function NumberRange({
  defaultNumber=5, setNumber,minNumber=1,maxNumber=100, label
}) {
  return (
    <TextField size='small' type='number' label={label}
      sx={{ minWidth: 50, maxWidth: 70 }}
      slotProps={{
          input: {min: minNumber, max:maxNumber },
          htmlInput: { min: minNumber, max: maxNumber},
      }} 
      defaultValue={defaultNumber} onChange={(e) => {
          const value = Number(e.target.value);
          if (!isNaN(value) && value > 0) {
          setNumber(value);
          }
      }}
    />
  );
});

NumberRange.propTypes = {
  defaultNumber: PropTypes.number,
  setNumber: PropTypes.func.isRequired,
  minNumber: PropTypes.number,
  maxNumber: PropTypes.number,
  label: PropTypes.string,
};

export default NumberRange;