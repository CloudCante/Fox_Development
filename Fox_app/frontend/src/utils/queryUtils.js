import { dataCache } from "./cacheUtils";

/**
 * Handles date parameter formatting
 */
const formatDateParam = (date, isEndDate = false) => {
  const utcDate = new Date(date);
  utcDate.setUTCHours(isEndDate ? 23 : 0, isEndDate ? 59 : 0, isEndDate ? 59 : 0, isEndDate ? 999 : 0);
  return utcDate.toISOString();
};
/**
 * Builds URL parameters
 */
const buildParams = (parameters = [], startDate, endDate) => {
  const params = new URLSearchParams();
  parameters.forEach(param => {
    if (param?.value) params.append(param.id, param.value);
  });
  if (startDate) params.append('startDate', formatDateParam(startDate));
  if (endDate) params.append('endDate', formatDateParam(endDate, true));
  return params;
};
/**
 * Generic fetch with caching
 */
const fetchWithCache = async (url, cacheKey, setDataCache, mapFn) => {
  try {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData) {
      if (typeof setDataCache === 'function') {
        setDataCache(cachedData);
        return cachedData;
      }
      console.error('setDataCache is not a function');
      return [];
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const mapped = Array.isArray(data) ? data.map(mapFn) : [];
    if (typeof setDataCache === 'function') {
      setDataCache(mapped);
      dataCache.set(cacheKey, mapped);
    }
    return mapped;
  } catch (error) {
    console.error('Fetch error:', error);
    if (typeof setDataCache === 'function') setDataCache([]);
    return [];
  }
};
/**
 * Exported functions for querying data
 */
export async function importQuery(base, route, params = {}, method = 'GET', body = null) {
  try {
    let url = `${base}${route}`;
    let fetchOptions = { method };

    if (method === 'GET') {
      const queryParams = new URLSearchParams(params);
      url += queryParams.toString();
    } else if (method === 'POST') {
      fetchOptions.headers = { 'Content-Type': 'application/json' };
      fetchOptions.body = JSON.stringify(body || params);
    }

    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('importQuery error:', err);
    throw new Error(`importQuery failed: ${err.message}`);
  }
}

export async function fetchWorkstationQuery({
  parameters = [],
  startDate,
  endDate,
  key,
  setDataCache,
  API_BASE,
  API_Route
}) {
  const params = buildParams(parameters, startDate, endDate);
  const cacheKey = `${key}_${params.toString()}`;
  const url = `${API_BASE}${API_Route}${params.toString()}`;
  
  const mapFn = row => ({
    station: row.workstation_name,
    pass: row.pass,
    fail: row.fail,
    failurerate: parseFloat(row.failurerate)
  });

  return fetchWithCache(url, cacheKey, setDataCache, mapFn);
}
export async function fetchFixtureQuery({
  parameters = [],
  startDate,
  endDate,
  key,
  setDataCache,
  API_BASE,
  API_Route
}) {
  const params = buildParams(parameters, startDate, endDate);
  const cacheKey = `${key}_${params.toString()}`;
  const url = `${API_BASE}${API_Route}${params.toString()}`;
  
  const mapFn = item => ({
    station: item.fixture_no,
    pass: parseInt(item.pass),
    fail: parseInt(item.fail),
    failurerate: parseFloat(item.failurerate),
    fail_percent_of_total: parseFloat(item.fail_percent_of_total)
  });

  return fetchWithCache(url, cacheKey, setDataCache, mapFn);
}

export async function fetchErrorQuery({
  parameters = [],
  startDate,
  endDate,
  key,
  setDataCache,
  API_BASE,
  API_Route
}) {
  const params = buildParams(parameters, startDate, endDate);
  const cacheKey = `${key}_${params.toString()}`;
  const url = `${API_BASE}${API_Route}${params.toString()}`;
  
  const mapFn = row => ({
    error_code: row.error_code,
    code_count: parseFloat(row.code_count)
  });

  return fetchWithCache(url, cacheKey, setDataCache, mapFn);
}