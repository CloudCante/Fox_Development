// src/utils/sortDataUtils.js
export function rollupSortData(rawSortData, codes = ['506', '520']) {
  // 1) Pre‑allocate empty buckets only for the codes you care about.
  const out = {};
  for (const code of codes) out[code] = {};

  // 2) Loop with "for…in" (avoids building intermediate arrays).
  for (const code in rawSortData) {
    // skip any code not in our desired list
    const bucket = out[code];
    if (!bucket) continue;

    const dateObj = rawSortData[code];
    for (const dateStr in dateObj) {
      const count = dateObj[dateStr];

      // 3) Parse once per dateStr
      const [mo, da, yr] = dateStr.split('/');
      const dt = new Date(Date.UTC(+yr, +mo - 1, +da));

      // 4) Roll weekends back to Friday in place
      const dow = dt.getUTCDay();
      if (dow === 6)       dt.setUTCDate(dt.getUTCDate() - 1);
      else if (dow === 0)  dt.setUTCDate(dt.getUTCDate() - 2);

      // 5) Format to your desired string without leading zeros
      const rollup = `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}/${dt.getUTCFullYear()}`;

      // 6) Accumulate
      bucket[rollup] = (bucket[rollup] || 0) + count;
    }
  }

  return out;
}
