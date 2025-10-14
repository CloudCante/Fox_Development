// components/snfn/SnFnToolbar.jsx
import { MultiMenu } from '../MultiMenu.jsx';
import { MultiFilter } from '../MultiFilter.jsx';
import { DateRange } from '../DateRange.jsx'
import { NumberRange } from '../NumberRange.jsx';
import { Box, Button } from '@mui/material';
import { toolbarStyle } from '../../theme/themes.js';


export function SnFnToolbar({
  itemsPerPage, setItemsPer, maxErrorCodes, setMaxErrors,
  sortMenuOpen, sortMenuClose, openExport, closeExport, clearFilters,
  exportCooldown, exportAnchor, exportOptions, sortAnchorEl, sortOptions,
  startDate, endDate, setStartDate, setEndDate,
  normalizeStart, normalizeEnd,
  filters, // your MultiFilter config
}) {
  return (
    <Box sx={toolbarStyle} >
      <DateRange
          startDate={startDate}
          setStartDate={setStartDate}
          normalizeStart={normalizeStart}
          endDate={endDate}
          setEndDate={setEndDate}
          normalizeEnd={normalizeEnd}
        />
      <MultiFilter filters={filters} limit={0} searchThreshold={10} />
      <NumberRange defaultNumber={itemsPerPage} setNumber={setItemsPer} label="# Tables" />
      <NumberRange defaultNumber={maxErrorCodes} setNumber={setMaxErrors} label="# Errors" />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={sortMenuOpen} variant="contained" size='small'>Sort Option</Button>
        <Button onClick={clearFilters} variant="contained" size='small'>Reset Filters</Button>
        <Button onClick={openExport} variant="contained" size='small' disabled={exportCooldown}>Export</Button>
        <MultiMenu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={closeExport}
            buttonData={exportOptions}
            aria-label="Export options"
        />
        <MultiMenu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={sortMenuClose}
            buttonData={sortOptions}
            aria-label="Sort options"
        />
      </Box>
    </Box>
  );
}
