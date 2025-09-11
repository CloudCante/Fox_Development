// SnFnDataTable.jsx
import React, { memo } from 'react';
import { Box, Paper } from '@mui/material';
import { truncateText,sanitizeText } from '../../../utils/textUtils';
import { tableStyle } from '../../theme/themes';

export function SnFnDataTable({ 
  paginatedData, 
  maxErrorCodes, 
  codeDescMap, 
  onRowClick, 
  groupByWorkstation, 
  style }) {
  return (
    <Box sx={tableStyle}>
      {paginatedData.map(station => (
        <Paper key={station[0]} sx={{ p:2 }}>
          <table>
            <thead>
                <tr
                    title={`${groupByWorkstation ? 'Fixture' : 'Workstation'}: "${station[0][1]}" — ${(station?.length ?? 0) - 1} unique error codes`}>
                    <th style={style}>{groupByWorkstation ? 'Workstation' : 'Fixture'} {station[0][0]}</th>
                    <th style={style}>Count of Error Codes</th>
                </tr>
            </thead>
            <tbody>
              {station.slice(1, maxErrorCodes + 1).map(([code, count, snList]) => {
                const codeKey = station[0][0] + code;
                const desc = truncateText(sanitizeText(codeDescMap.get(codeKey) ?? "NAN"), 75);

                return (
                    <tr
                    key={code}
                    onClick={() => onRowClick([station, [code, count, snList]])}
                    title={`Error ${code} — ${desc}`}
                    >
                    <td style={style}>{code}</td>
                    <td style={style}>{count}</td>
                    </tr>
                );
                })}
            </tbody>
          </table>
        </Paper>
      ))}
    </Box>
  );
}

export default memo(SnFnDataTable, (prev, next) =>
  // shallow compare only props you care about
  prev.paginatedData === next.paginatedData &&
  prev.maxErrorCodes === next.maxErrorCodes
);
