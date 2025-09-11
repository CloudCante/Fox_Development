// utils/dataUtils.js

/**
 * Filters, transforms, and sorts SNFN station data.
 *
 * @param {Array} dataBase
 *   The raw data array: each element is
 *     [ [stationId, secondaryId], [code, count, snList], ... ]
 * @param {Array<string>} stationFilter
 *   List of station IDs to include (empty = include all)
 * @param {Array<string>} modelFilter
 *   List of models to include (empty = include all)
 * @param {Array<string>} errorCodeFilter
 *   List of error codes to include (empty = include all)
 * @param {boolean} sortByCount
 *   If true, sort by total count; else sort by station key
 * @param {boolean} sortAsc
 *   Sort ascending (true) or descending (false)
 * @returns {Array}
 *   The processed array: filtered stations, each as
 *     [ [stationId, secondaryId], [code, filteredCount, filteredSNs], ... ]
 */
export function processStationData(
  dataBase,
  stationFilter,
  modelFilter,
  errorCodeFilter,
  sortByCount,
  sortAsc
) {
  return (
    dataBase
      // 1) keep only stations in the filter (or all if no filter)
      .filter(
        (station) =>
          stationFilter.length === 0 ||
          stationFilter.includes(station[0][0])
      )

      // 2) for each station, filter & count its error codes / SN lists
      .map((station) => {
        const [stationInfo, ...codes] = station;

        const filteredCodes = codes
          .map(([code, count, snList]) => {
            // filter serial numbers by model
            const filteredSNs = snList.filter(
              ([, , md]) =>
                modelFilter.length === 0 || modelFilter.includes(md ?? '')
            );
            return [code, filteredSNs.length, filteredSNs];
          })
          // keep only codes passing the errorCodeFilter and having >0 SNs
          .filter(
            ([code, count]) =>
              (errorCodeFilter.length === 0 ||
                errorCodeFilter.includes(code)) &&
              count > 0
          );

        // only include this station if it has any codes left
        return filteredCodes.length > 0
          ? [stationInfo, ...filteredCodes]
          : null;
      })
      // drop stations that ended up with no codes
      .filter(Boolean)

      // 3) sort the resulting stations array
      .sort((a, b) => {
        if (sortByCount) {
          // total counts per station
          const sumA = a
            .slice(1)
            .reduce((sum, [, cnt]) => sum + cnt, 0);
          const sumB = b
            .slice(1)
            .reduce((sum, [, cnt]) => sum + cnt, 0);
          return sortAsc ? sumA - sumB : sumB - sumA;
        } else {
          // lexicographic sort on station key
          const keyA = String(a[0][0]);
          const keyB = String(b[0][0]);
          const cmp = keyA.localeCompare(keyB, undefined, {
            numeric: true,
            sensitivity: 'base',
          });
          return sortAsc ? cmp : -cmp;
        }
      })
  );
}
