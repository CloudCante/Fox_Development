export const fetchPackingRecords = async (API_BASE, API_Route, startDate, endDate) => {
  if (!API_BASE) throw new Error('API_BASE is not configured');
  
  try {
    const url = new URL(`${API_BASE}${API_Route}`);
    url.searchParams.append('startDate', startDate.toISOString());
    url.searchParams.append('endDate', endDate.toISOString());
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch packing data: ' + error.message);
  }
};