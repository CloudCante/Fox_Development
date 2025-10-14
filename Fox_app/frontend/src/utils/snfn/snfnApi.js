import { importQuery } from "../queryUtils";;

export async function fetchSnFnData(apiBase, startDate, endDate) {
  const params = {
    startDate: startDate.toISOString(),
    endDate:   endDate  .toISOString(),
  };
<<<<<<< HEAD
  const raw = await importQuery(apiBase, '/api/snfn/station-errors?', params);
=======
  const raw = await importQuery(apiBase, '/api/v1/snfn/station-errors?', params);
>>>>>>> origin/main
  if (!Array.isArray(raw)) {
    throw new Error('SNFN API did not return an array');
  }
  return raw;
}
