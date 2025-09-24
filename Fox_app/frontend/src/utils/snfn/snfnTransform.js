/**
 * Parse raw SNFN rows into nested station data and metadata.
 */
export function parseSnFnData(
  rawRows,
  startDate,
  endDate,
  groupByWorkstation
) {
  // Metadata containers
  const codeSet     = new Set();
  const stationSet  = new Set();
  const modelSet    = new Set();
  const descMap     = new Map();         // key: "station::code" → Set of desc

  // Main data map: stationKey → { label, codes: Map<code, { count, serials: Map<sn|pn|md, count> }> }
  const stationMap = new Map();

  for (const d of rawRows) {
    const {
      fixture_no: FN,
      sn: SN,
      error_code: EC,
      code_count: TN,
      pn: PN,
      workstation_name: BT,
      normalized_end_time: DT,
      model: MD,
      error_disc: ED,
    } = d;

    // --- Validation & date filtering ---
    if (typeof EC !== 'string' || TN == null) continue;
    const recDate = new Date(DT);
    if (isNaN(recDate) || recDate < startDate || recDate > endDate) continue;
    if (TN === 0) continue;

    const TEC = (EC === "ECnan"||EC==="EC_na")? "NAN" : EC;

    // --- Determine station grouping ---
    const stationKey      = groupByWorkstation ? BT : FN;
    const stationSubLabel = groupByWorkstation ? FN : BT;

    // Collect metadata
    codeSet.add(TEC);
    stationSet.add(stationKey);
    if (MD) modelSet.add(MD);

    // Collect descriptions
    const descKey = `${stationKey}${TEC}`;
    if (!descMap.has(descKey)) {
      descMap.set(descKey, new Set());
    }
    descMap.get(descKey).add(ED);

    // --- Station setup ---
    if (!stationMap.has(stationKey)) {
      stationMap.set(stationKey, {
        label: [stationKey, stationSubLabel],
        codes: new Map(),
      });
    }
    const stationEntry = stationMap.get(stationKey);

    // --- Code setup ---
    if (!stationEntry.codes.has(TEC)) {
      stationEntry.codes.set(TEC, {
        count: 0,
        serials: new Map(),   // key: `${SN}::${PN}::${MD}` → count
      });
    }
    const codeEntry = stationEntry.codes.get(TEC);

    // Update totals
    codeEntry.count += Number(TN);

    // --- Serial grouping ---
    const serialKey = `${SN}::${PN}::${MD}`;
    const prevSerialCount = codeEntry.serials.get(serialKey) || 0;
    codeEntry.serials.set(serialKey, prevSerialCount + 1);
  }

  // --- Convert stationMap → data array with sorting ---
  const data = Array.from(stationMap.values())
    .map(({ label, codes }) => {
      // sort codes by descending count
      const sortedCodes = Array.from(codes.entries())
        .sort(([_a, aObj], [_b, bObj]) => bObj.count - aObj.count)
        .map(([code, { count, serials }]) => {
          // flatten serials into array [SN, PN, MD, count]
          const serialArr = Array.from(serials.entries()).map(([k, c]) => {
            const [sn, pn, md] = k.split('::');
            return [sn, pn, md, c];
          });
          return [code, count, serialArr];
        });
      return [label, ...sortedCodes];
    });

  // --- Metadata lists ---
  const allErrorCodes = Array.from(codeSet).sort();
  const allStations   = Array.from(stationSet).sort();
  const allModels     = Array.from(modelSet).sort();

  // Flatten descriptions
  const allCodeDesc = Array.from(descMap.entries()).map(([k, descSet]) => [
    k,
    Array.from(descSet).join('\n'),
  ]);

  return { data, allErrorCodes, allStations, allModels, allCodeDesc };
}
