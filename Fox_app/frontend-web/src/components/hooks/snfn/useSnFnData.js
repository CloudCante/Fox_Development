import { useState, useEffect } from 'react';
import { fetchSnFnData } from '../../../utils/snfn/snfnApi';
import { parseSnFnData } from '../../../utils/snfn/snfnTransform';

export function useSnFnData(
  apiBase,
  startDate,
  endDate,
  groupByWorkstation,
  refreshInterval = 300000 // 5 min
) {
  const [data, setData] = useState([]);
  const [allErrorCodes, setAllErrorCodes] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [allCodeDesc, setAllCodeDesc] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const raw = await fetchSnFnData(apiBase, startDate, endDate);
        const {
          data: parsedData,
          allErrorCodes,
          allStations,
          allModels,
          allCodeDesc,
        } = parseSnFnData(raw, startDate, endDate, groupByWorkstation);

        if (!isMounted) return;
        setData(parsedData);
        setAllErrorCodes(allErrorCodes);
        setAllStations(allStations);
        setAllModels(allModels);
        setAllCodeDesc(allCodeDesc);
      } catch (err) {
        console.error('SNFN load error:', err);
      }
    }

    document.visibilityState === 'visible' && load();
    const id = setInterval(load, refreshInterval);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [apiBase, startDate, endDate, groupByWorkstation, refreshInterval]);

  return { data, allErrorCodes, allStations, allModels, allCodeDesc };
}
