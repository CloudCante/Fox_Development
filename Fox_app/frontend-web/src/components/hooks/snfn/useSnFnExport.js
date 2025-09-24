// hooks/useSnFnExport.js
import { exportSecureCSV, jsonExport } from '../../../utils/exportUtils';
import { useState, useCallback, useMemo } from 'react';

export function useSnFnExport({ paginatedData, groupByWorkstation, codeDescMap,filteredData, closeExport }) {
    const [exportCooldown, setExportCooldown] = useState(false);

    const getTimestamp = () => {
        const now = new Date();
        return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    };

    const exportToCSV = useCallback(() => { 
        try {
          const rows = [];
          filteredData.forEach((station) => {
              const stationId = station[0][0];
              const stationSecondaryId = station[0][1];
              station.slice(1).forEach(([errorCode, count, snList]) => {
              snList.forEach((sn) => {
                  rows.push([`'${stationId}'`,`'${stationSecondaryId}'`, errorCode, sn[3], sn[0],sn[1],sn[2]]);
              });
              });
          });
          const headers = [
            groupByWorkstation ? 'Workstation' : 'Fixture',
            groupByWorkstation ? 'Fixture' : 'Workstation',
            'Error Code',
            'Error Count',
            'Serial Number',
            'Part Number',
            'Model'
          ];
          const filename = `snfn_filtered_data_${getTimestamp()}.csv`;
          // Use secure export function
          exportSecureCSV(rows, headers, filename);
        } 
        catch (error) {
          console.error('Export failed:', error);
          alert('Export failed. Please try again.');
        };
    }, [filteredData,paginatedData, groupByWorkstation, codeDescMap]);

    const exportToJSON = useCallback(() => {
        try{
          const jsonData = [];
          filteredData.forEach((station) => {
              const stationId = station[0];
              const errors = station.slice(1).map(([errorCode, count, snList]) => ({
              errorCode,
              count,
              serialNumbers: snList,
              }));
              jsonData.push({
                [groupByWorkstation ? 'workstation' : 'fixture']: stationId,
                errors
              });
          });
          const filename = `snfn_filtered_data_${getTimestamp()}.json`
          jsonExport(jsonData,null,2,filename);
        } 
        catch(error) {
          console.error('Export failed:', error);
          alert('Export failed. Please try again.');
        };
    }, [filteredData,paginatedData, groupByWorkstation]);

    function handleExportCSV() {
        if (exportCooldown) return;
        setExportCooldown(true);
        try {
        exportToCSV();
        } catch(err) {
        console.error(err);
        alert('Export failed');
        } finally {
        // always clear cooldown
        setTimeout(()=>setExportCooldown(false),3000);
        }
    }
    function handleExportJSON() {
        if (exportCooldown) return;
        setExportCooldown(true);
        setTimeout(()=>setExportCooldown(false),3000);
        exportToJSON();
    }

  const exportOptions = useMemo(() => [
    { id:'exportCsv', handleClick:handleExportCSV, label:'Export CSV', disabled:exportCooldown },
    { divider:true, id:'d1' },
    { id:'exportJson', handleClick:handleExportJSON, label:'Export JSON', disabled:exportCooldown },
  ], [handleExportCSV, handleExportJSON, exportCooldown]);

  return { exportOptions,exportCooldown };
}
