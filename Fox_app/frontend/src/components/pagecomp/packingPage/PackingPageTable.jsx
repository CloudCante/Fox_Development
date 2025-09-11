// PackingPageTable.jsx
import React, { memo, useMemo } from 'react';
import { Box, FormHelperText, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { headerStyle as baseHeaderStyle, divStyle, headerStyleTwo as baseHeaderStyleTwo, 
  spacerStyle, dataTextStyle as baseDataTextStyle, dataTotalStyle as baseDateTotalStyle
} from '../../theme/themes';

// Fixed width styles for consistent column sizing
const columnStyles = {
  firstColumn: {
    minWidth: '200px',
    maxWidth: '200px',
    width: '200px',
  },
  dateColumn: {
    minWidth: '120px',
    maxWidth: '120px',
    width: '120px',
  }
};

const headerStyle = {
  ...baseHeaderStyle,
  ...columnStyles.dateColumn,
};

const firstColumnHeaderStyle = {
  ...baseHeaderStyle,
  ...columnStyles.firstColumn,
};

const dataTextStyle = {
  ...baseDataTextStyle,
  ...columnStyles.dateColumn,
};

const firstColumnDataStyle = {
  ...baseDataTextStyle,
  ...columnStyles.firstColumn,
};

const dataTotalStyle = {
  ...baseDateTotalStyle,
  ...columnStyles.dateColumn,
};

const headerStyleTwo = {
  ...baseHeaderStyleTwo,
  ...columnStyles.firstColumn,
};
import { useTheme } from '@emotion/react';
import { green } from '@mui/material/colors';

export const PackingPageTable = memo(function PackingPageTable({
  header,
  headerTwo,
  dates,
  partLabel,
  handleOnClick,
  partsMap,
  packingData,
  copied,
  dailyTotals,
  isTotal = false,
  isSort = false,
  spacer = false
}) {
    const theme = useTheme();

  return (
    <table
      role="grid"
      aria-label={header ? `${header} packing table` : "Packing table"}
      style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}
    >
      <tbody>
        {/* Tesla SXM4 Section Header */}
        <tr>
          <td style={{
            ...firstColumnHeaderStyle,
            position: 'sticky',
            left: 0,
            zIndex: 10,
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
          }}>
            {header}
          </td>
          {dates.map(date => (
            <td key={date} style={headerStyle}>
              <div style={divStyle}>
                <span>{date}</span>
                <Tooltip title={copied.group === partLabel && copied.date === date ? 'Copied!' : 'Copy column'}>
                  <IconButton
                    size="small"
                    onClick={() => handleOnClick(partLabel, date)}
                    sx={{
                      padding: 0,
                      height: '14px',
                      width: '14px',
                      minWidth: '14px',
                      color: copied.group === partLabel && copied.date === date ? 'success.main' : 'white'
                    }}
                  >
                    {copied.group === partLabel && copied.date === date
                      ? <CheckIcon sx={{ fontSize: '10px' }} />
                      : <ContentCopyIcon sx={{ fontSize: '10px' }} />}
                  </IconButton>
                </Tooltip>
              </div>
            </td>
          ))}
        </tr>

        {/* Parts Rows */}
        {!isTotal && partsMap.map((part, idx) => (
          <tr key={part} style={{
            backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper
          }}>
            <td style={{
              ...firstColumnDataStyle,
              position: 'sticky',
              left: 0,
              zIndex: 5,
              boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
              backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper,
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {part}
            </td>
            {dates.map(date => {
              const normalizeDate = (dateStr) => {
                const [month, day, year] = dateStr.split('/');
                return `${parseInt(month)}/${parseInt(day)}/${year}`;
              };
              const normalizedDate = normalizeDate(date);
              const value = isSort
                ? packingData[part]?.[normalizedDate]
                : packingData[part]?.[normalizedDate];

              return (
                <td key={date} style={dataTextStyle}>
                  {value || ''}
                </td>
              );
            })}
          </tr>
        ))}

        {/* Total Row */}
        {headerTwo && (
          <tr style={{ backgroundColor: '#c8e6c9' }}>
            <td style={{
              ...headerStyleTwo,
              position: 'sticky',
              left: 0,
              zIndex: 5,
              boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
            }}>
              {headerTwo}
            </td>
            {dates.map(date => {
              let total;
              if (isTotal) {
                total = dailyTotals?.[date];
              } else {
                total = partsMap.reduce((sum, part) =>
                  sum + (packingData[part]?.[date] || 0), 0
                );
              }
              return (
                <td key={date} style={dataTotalStyle}>
                  {total || ''}
                </td>
              );
            })}
          </tr>
        )}

        {/* Spacer Row */}
        {spacer && (
          <tr>
            <td style={spacerStyle}></td>
            {dates.map((_, idx) => (
              <td key={idx} style={spacerStyle}></td>
            ))}
          </tr>
        )}
      </tbody>
    </table>
  );
});

PackingPageTable.propTypes = {

};

export default PackingPageTable;