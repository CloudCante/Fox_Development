// MultiFilter.jsx
import React, { memo, useMemo, useRef, useCallback } from 'react';
import {
  Box, FormControl, InputLabel, Select, OutlinedInput,
  MenuItem, Checkbox, ListItemText, TextField
} from '@mui/material';
import { VariableSizeList as List } from 'react-window';
import { sanitizeText } from '../../utils/textUtils';

/**
 * props.filters: Array of
 *   {
 *     id, label, allOptions, selectedOptions,
 *     onChange, searchValue, onSearchChange
 *   }
 * props.limit: hide filters with too few options
 * props.searchThreshold: only show search+virtualization when > this
 */
export const MultiFilter = memo(({ filters = [], limit = 0, searchThreshold = 50 }) => {
  const visible = useMemo(
    () => filters.filter(f => f.allOptions.length > limit),
    [filters, limit]
  );
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {visible.map(f => (
        <FilterSelect key={f.id} filter={f} threshold={searchThreshold} />
      ))}
    </Box>
  );
});

const ROW_HEIGHT = 30; // adjust to match your theme.spacing

const FilterSelect = memo(({ filter, threshold }) => {
  const {
    label, allOptions, selectedOptions,
    onChange, searchValue, onSearchChange
  } = filter;

  const filtered = useMemo(() => {
    if (!searchValue) return allOptions;
    const q = sanitizeText(searchValue).toLowerCase();
    return allOptions.filter(opt => opt.toLowerCase().includes(q));
  }, [allOptions, searchValue]);

  const listRef = useRef();

  // If your rows vary in height, implement itemSizeCallback:
  const getItemSize = useCallback(() => ROW_HEIGHT, []);

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedOptions}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        renderValue={vals => vals.join(', ')}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 300, width: 240 } },
          disableAutoFocusItem: true,
        }}
      >
        {/* search box */}
        {allOptions.length > threshold && (
          <MenuItem disableRipple disableTouchRipple>
            <TextField
              fullWidth
              size="small"
              variant="standard"
              placeholder={`Search ${label}…`}
              value={searchValue}
              onChange={onSearchChange}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              autoFocus
            />
          </MenuItem>
        )}

        {/* clear all */}
        <MenuItem value="__CLEAR__">
          <em>Clear All</em>
        </MenuItem>

        {/* either a big virtual list or a small static map */}
        {filtered.length > threshold ? (
          <Box sx={{ px: 1, pt: 1 }}>
            <List
              height={Math.min(filtered.length, 6) * ROW_HEIGHT}
              width="100%"
              itemCount={filtered.length}
              itemSize={getItemSize}
              ref={listRef}
            >
              {({ index, style }) => {
                const opt = filtered[index];
                return (
                  <MenuItem
                    key={opt}
                    value={opt}
                    style={style}
                    onClick={e => {
                      // synthesize the Select onChange event
                      const newValue = selectedOptions.includes(opt)
                        ? selectedOptions.filter(x => x !== opt)
                        : [...selectedOptions, opt];
                      onChange({ target: { value: newValue } });
                    }}
                  >
                    <Checkbox checked={selectedOptions.includes(opt)} />
                    <ListItemText primary={opt} />
                  </MenuItem>
                );
              }}
            </List>
          </Box>
        ) : (
          filtered.map(opt => (
            <MenuItem key={opt} value={opt}>
              <Checkbox checked={selectedOptions.includes(opt)} />
              <ListItemText primary={opt} />
            </MenuItem>
          ))
        )}

        {/* no results */}
        {filtered.length === 0 && searchValue && (
          <MenuItem disabled>
            <em>No options found</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
});

export default MultiFilter;
