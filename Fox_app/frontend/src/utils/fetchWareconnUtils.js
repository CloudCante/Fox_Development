// wareconn-export.js
import * as XLSX from "xlsx";
import { set } from "idb-keyval"; // tiny IndexedDB wrapper

// Helpers —— build the exact export URL the site expects
function epochMsLocalMidnight(dateStr) {
  const d = new Date(dateStr);              // "YYYY-MM-DD"
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function buildWareconnUrl({
  base = "https://www.wareconn.com/r/Summary/",
  hook = "downStationOutput",
  cusId,
  proId,
  startDate, // "YYYY-MM-DD" local
  endDate,   // "YYYY-MM-DD" local
  svcIds = [], // [879,898,...]
  stcName = "",
  pn = "",
  pmoId = "",
  svc_now_id = "",
  acc_id = "",
  type = 0,
}) {
  const startMs = epochMsLocalMidnight(startDate);
  const endMs   = epochMsLocalMidnight(endDate);
  const params = new URLSearchParams({
    cusId: String(cusId),
    proId: String(proId),
    stcName,
    date: `${startMs},${endMs}`,
    pn,
    pmoId,
    svc_id: svcIds.join(","),
    svcNow_id: svc_now_id,
    acc_id,
    type: String(type),
  });
  return `${base}${hook}?${params.toString()}`;
}

/**
 * Download Wareconn export, parse, and store rows in IndexedDB.
 * Handles Excel and CSV automatically.
 * @returns {Promise<{sheetName:string|null,count:number,filename:string|null,storeKey:string}>}
 */
export async function fetchParseStoreWareconn({
  url,      // pass either a full URL string, or…
  opts,     // fetch options (e.g., { credentials: "include" })
  storeKey, // optional custom key
  // …or pass builder params instead of url:
  builderParams,
} = {}) {
  const finalUrl = url ?? buildWareconnUrl(builderParams);
  const res = await fetch(finalUrl, {
    // Include cookies if the export requires auth; CORS must allow credentials.
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);

  const ctype = res.headers.get("content-type") || "";
  const dispo = res.headers.get("content-disposition") || "";
  const filenameMatch = dispo.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
  const filename = filenameMatch ? decodeURIComponent(filenameMatch[1].replace(/(^"|"$)/g, "")) : null;

  let wb;
  if (ctype.includes("text/csv")) {
    const csv = await res.text();
    wb = XLSX.read(csv, { type: "string" });
  } else {
    const buf = await res.arrayBuffer();
    wb = XLSX.read(buf, { type: "array" });
  }

  const sheetName = wb.SheetNames[0] ?? null;
  const sheet = sheetName ? wb.Sheets[sheetName] : null;
  const rows = sheet ? XLSX.utils.sheet_to_json(sheet, { defval: null }) : [];

  const key = storeKey ?? `wareconn:stationOutput:${sheetName ?? "sheet"}:${Date.now()}`;
  await set(key, rows);

  return { sheetName, count: rows.length, filename, storeKey: key };
}
