# API Versioning Guide - Fox Development

**Date**: October 9, 2025  
**Version**: 1.0  
**For**: Development Team

---

## What Changed?

We migrated all API endpoints to use versioned URLs with the `/api/v1/` prefix.

### Before:
```
http://localhost:5000/api/functional-testing/station-performance
```

### After:
```
http://localhost:5000/api/v1/functional-testing/station-performance
```

**All 25 endpoints across 11 route files have been updated.**

---

## Why API Versioning is Important

### The Problem Without Versioning

Imagine this scenario:

1. **Today**: Your frontend uses `/api/tpy/daily` to get throughput data
2. **Next Month**: You need to change the response format to add new fields
3. **Problem**: Old frontend breaks because it expects the old format!

**Without versioning**, you're stuck:
- Can't improve the API without breaking things
- Can't deprecate old endpoints cleanly
- Can't support multiple clients (mobile app, web, desktop)
- Changes affect everyone immediately

### The Solution With Versioning

With `/api/v1/`, `/api/v2/`, etc.:

1. **Today**: Frontend uses `/api/v1/tpy/daily` 
2. **Next Month**: You create `/api/v2/tpy/daily` with new format
3. **Result**: Old frontend keeps working! New frontend uses v2.

**Benefits**:
- **Zero downtime** - old APIs keep working
- **Gradual migration** - update frontend at your own pace
- **Multiple versions** - support different clients
- **Clear deprecation** - "v1 will be removed in 6 months"
- **Professional** - industry standard practice

### Real-World Example

**Scenario**: You need to change how error codes are returned.

**Without Versioning** (Breaking Change):
```javascript
// Old format - breaks existing code
{ error_code: "EC665", count: 10 }

// New format - breaks all frontends using old format
{ code: "EC665", occurrences: 10, description: "..." }
```

**With Versioning** (Safe):
```javascript
// v1 keeps working
GET /api/v1/snfn/model-errors
Response: { error_code: "EC665", count: 10 }

// v2 uses new format
GET /api/v2/snfn/model-errors  
Response: { code: "EC665", occurrences: 10, description: "..." }
```

Both work simultaneously! Frontend teams migrate when ready.

---

## Complete Migration Overview

### Backend Changes (server.js)

**Before**:
```javascript
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);

const testboardRouter = require('./routes/testboardRecords');
app.use('/api/testboardRecords', testboardRouter);  // camelCase

const workstationRouter = require('./routes/workstationRoutes');
app.use('/api/workstationRoutes', workstationRouter);  // camelCase
```

**After**:
```javascript
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/v1/functional-testing', functionalTestingRouter);  // v1 prefix

const testboardRouter = require('./routes/testboardRecords');
app.use('/api/v1/testboard-records', testboardRouter);  // v1 + kebab-case

const workstationRouter = require('./routes/workstationRoutes');
app.use('/api/v1/workstation-routes', workstationRouter);  // v1 + kebab-case
```

**Key Changes**:
1. Added `/v1/` prefix to all routes
2. Renamed `testboardRecords` → `testboard-records` (kebab-case)
3. Renamed `workstationRoutes` → `workstation-routes` (kebab-case)

### Frontend Changes (37 files updated)

Every API call in the frontend needed updating. Here are real examples:

---

## Real Code Examples from Our Codebase

### Example 1: TPY (Throughput) Endpoint

**Backend Route File**: `routes/tpyRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// GET /api/v1/tpy/daily
router.get('/daily', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required query parameters: startDate, endDate' 
            });
        }
        
        const query = `
            SELECT date, model, station, pass_count, fail_count
            FROM daily_tpy_metrics
            WHERE date BETWEEN $1 AND $2
            ORDER BY date, model, station
        `;
        
        const result = await pool.query(query, [startDate, endDate]);
        res.json(result.rows);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

**Backend Registration** in `server.js`:
```javascript
const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/v1/tpy', tpyRouter);  // Registered with /api/v1/ prefix
```

**Frontend Usage** in `Fox_app/frontend/src/components/hooks/throughput/useThroughputData.js`:

**BEFORE (Old)**:
```javascript
const dailyUrl = `${API_BASE}/api/tpy/daily?startDate=${startDate}&endDate=${endDate}`;
const dailyData = await secureApiCall(dailyUrl);
```

**AFTER (New)**:
```javascript
const dailyUrl = `${API_BASE}/api/v1/tpy/daily?startDate=${startDate}&endDate=${endDate}`;
const dailyData = await secureApiCall(dailyUrl);
```

**Complete Request Flow**:
1. User selects date range in UI
2. Frontend calls: `http://localhost:5000/api/v1/tpy/daily?startDate=2025-10-01&endDate=2025-10-07`
3. Express routes to: `tpyRouter` (from `server.js` registration)
4. Route handler in `tpyRoutes.js` processes: `/daily` endpoint
5. Database query executes with date parameters
6. Results returned as JSON to frontend
7. Frontend displays data in charts

---

### Example 2: Testboard Records (Renamed Route)

**Backend Route File**: `routes/testboardRecords.js`

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// POST /api/v1/testboard-records/sn-check
router.post('/sn-check', async (req, res) => {
    try {
        const { sns, startDate, endDate } = req.body;
        
        if (!sns || !Array.isArray(sns) || sns.length === 0) {
            return res.status(400).json({ 
                error: 'Missing or invalid sns array' 
            });
        }
        
        const query = `
            SELECT sn, fixture_no, history_station_passing_status
            FROM testboard_master_log
            WHERE sn = ANY($1::text[])
            AND history_station_end_time BETWEEN $2 AND $3
        `;
        
        const result = await pool.query(query, [sns, startDate, endDate]);
        res.json(result.rows);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

**Backend Registration** in `server.js`:
```javascript
const testboardRouter = require('./routes/testboardRecords');
app.use('/api/v1/testboard-records', testboardRouter);  
// Note: Changed from /api/testboardRecords (camelCase) 
//       to /api/v1/testboard-records (kebab-case with version)
```

**Frontend Usage** in `Fox_app/frontend/src/components/pages/dev/DidTheyFail.js`:

**BEFORE (❌ Old)**:
```javascript
const backendSnData = await importQuery(
  API_BASE,
  '/api/testboardRecords/sn-check',  // Old: camelCase, no version
  {},
  'POST',
  { sns, startDate, endDate }
);
```

**AFTER (New)**:
```javascript
const backendSnData = await importQuery(
  API_BASE,
  '/api/v1/testboard-records/sn-check',  // New: kebab-case with v1
  {},
  'POST',
  { sns, startDate, endDate }
);
```

**Complete Request Flow**:
1. User enters serial numbers in "Did They Fail?" page
2. Frontend calls: `http://localhost:5000/api/v1/testboard-records/sn-check`
3. Express routes to: `testboardRouter` (from `server.js` registration)
4. Route handler in `testboardRecords.js` processes: `/sn-check` endpoint
5. Database queries for those serial numbers
6. Results returned showing pass/fail status
7. Frontend displays results in table

**Important**: Notice the route name changed from `testboardRecords` to `testboard-records`. This is for consistency (all routes use kebab-case now).

---

### Example 3: Functional Testing Endpoint

**Backend Route File**: `routes/functionalTestingRecords.js`

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// GET /api/v1/functional-testing/station-performance
router.get('/station-performance', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        
        if (!startDate || !endDate || !model) {
            return res.status(400).json({ 
                error: 'Missing required parameters: startDate, endDate, model' 
            });
        }
        
        const query = `
            SELECT 
                workstation_name,
                SUM(pass) as total_pass,
                SUM(fail) as total_fail
            FROM testboard_station_performance_daily
            WHERE end_date >= $1 AND end_date <= $2 AND model = $3
            GROUP BY workstation_name
            ORDER BY workstation_name
        `;
        
        const result = await pool.query(query, [startDate, endDate, model]);
        res.json(result.rows);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

**Backend Registration** in `server.js`:
```javascript
const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/v1/functional-testing', functionalTestingRouter);
```

**Frontend Usage** in `Fox_app/frontend/src/components/pages/quality/TestStationPerformancePage.js`:

**BEFORE (Old)**:
```javascript
const fetchModelData = ({value, key, setter}) => 
  importQuery(API_BASE, {
    model: value,
    startDate,
    endDate,
    key,
    setDataCache: setter,
    API_BASE,
    API_Route: '/api/functional-testing/station-performance?'  // Old
  });
```

**AFTER (New)**:
```javascript
const fetchModelData = ({value, key, setter}) => 
  importQuery(API_BASE, {
    model: value,
    startDate,
    endDate,
    key,
    setDataCache: setter,
    API_BASE,
    API_Route: '/api/v1/functional-testing/station-performance?'  // New: v1 prefix
  });
```

**Complete Request Flow**:
1. User selects model (SXM4/SXM5/SXM6) and date range in Test Station Performance page
2. Frontend calls: `http://localhost:5000/api/v1/functional-testing/station-performance?model=Tesla%20SXM5&startDate=2025-10-01&endDate=2025-10-07`
3. Express routes to: `functionalTestingRouter`
4. Route handler processes: `/station-performance` endpoint
5. Database aggregates pass/fail counts by workstation
6. Results returned as JSON array
7. Frontend displays data in performance charts

---

## All Routes That Changed

| Old Route | New Route | Files Updated |
|-----------|-----------|---------------|
| `/api/functional-testing` | `/api/v1/functional-testing` | 14 files |
| `/api/packing` | `/api/v1/packing` | 6 files |
| `/api/sort-record` | `/api/v1/sort-record` | 2 files |
| `/api/tpy` | `/api/v1/tpy` | 12 files |
| `/api/snfn` | `/api/v1/snfn` | 6 files |
| `/api/station-hourly-summary` | `/api/v1/station-hourly-summary` | 2 files |
| `/api/pchart` | `/api/v1/pchart` | 4 files |
| `/api/workstationRoutes` ⚠️ | `/api/v1/workstation-routes` | 2 files |
| `/api/testboardRecords` ⚠️ | `/api/v1/testboard-records` | 18 files |
| `/api/spc` | `/api/v1/spc` | 0 files (new) |
| `/api/upload` | `/api/v1/upload` | 2 files |

⚠️ = Also renamed for consistency (camelCase → kebab-case)

**Total**: 74 API calls updated across both `frontend/` and `frontend-web/`

---

## Step-by-Step Example: Following a Request End-to-End

Let's trace a real request from the user clicking a button to data appearing on screen.

### Scenario: User Views Station Hourly Summary

#### 1. **User Action**
User navigates to "Station Hourly Summary" page and selects date: **2025-10-03**

#### 2. **Frontend Code** (`Fox_app/frontend/src/components/pages/quality/stationReports/StationHourlySummaryPage.js`)

```javascript
// Line 17 - The fetch call
fetch(`${API_BASE}/api/v1/station-hourly-summary?startDate=${selectedDate}&endDate=${selectedDate}`)
  .then(res => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  })
  .then(json => {
    setData(json);
    setLoading(false);
  })
```

**What happens here**:
- `API_BASE` = `http://localhost:5000` (or your server URL)
- `selectedDate` = `2025-10-03`
- **Full URL**: `http://localhost:5000/api/v1/station-hourly-summary?startDate=2025-10-03&endDate=2025-10-03`

#### 3. **Backend Routing** (`Fox_app/backend/server.js`)

```javascript
// Line 58-59 - Route registration
const stationHourlySummaryRouter = require('./routes/stationHourlySummary');
app.use('/api/v1/station-hourly-summary', stationHourlySummaryRouter);
```

**What happens here**:
- Express sees request to `/api/v1/station-hourly-summary`
- Routes it to `stationHourlySummaryRouter`
- Strips `/api/v1/station-hourly-summary` from path
- Passes remaining path (`/` in this case) to the router

#### 4. **Route Handler** (`Fox_app/backend/routes/stationHourlySummary.js`)

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// This handles GET /api/v1/station-hourly-summary/
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required query parameters: startDate, endDate' 
            });
        }
        
        const query = `
            SELECT 
                workstation,
                hour,
                pass_count,
                fail_count,
                total_count
            FROM station_hourly_summary
            WHERE date >= $1 AND date <= $2
            ORDER BY workstation, hour
        `;
        
        const params = [startDate, endDate];
        const result = await pool.query(query, params);
        
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error in station-hourly-summary:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

**What happens here**:
- Extracts `startDate` and `endDate` from query parameters
- Validates they exist (returns 400 error if missing)
- Builds SQL query with placeholders ($1, $2)
- Executes query against PostgreSQL database
- Returns results as JSON

#### 5. **Database Query**

PostgreSQL receives:
```sql
SELECT 
    workstation,
    hour,
    pass_count,
    fail_count,
    total_count
FROM station_hourly_summary
WHERE date >= '2025-10-03' AND date <= '2025-10-03'
ORDER BY workstation, hour
```

Returns:
```json
[
  { "workstation": "BAT", "hour": 8, "pass_count": 45, "fail_count": 5, "total_count": 50 },
  { "workstation": "BAT", "hour": 9, "pass_count": 52, "fail_count": 8, "total_count": 60 },
  { "workstation": "FCT", "hour": 8, "pass_count": 30, "fail_count": 2, "total_count": 32 },
  ...
]
```

#### 6. **Response to Frontend**

The fetch promise resolves with the JSON data:
```javascript
.then(json => {
  setData(json);  // Updates React state
  setLoading(false);  // Hides loading spinner
})
```

#### 7. **UI Update**

React re-renders the page with the new data, displaying it in tables/charts.

### Complete Flow Diagram

```
User Clicks
    ↓
Frontend Component (StationHourlySummaryPage.js)
    ↓
fetch('/api/v1/station-hourly-summary?startDate=2025-10-03&endDate=2025-10-03')
    ↓
Express Server (server.js)
    ↓
Route Registration (/api/v1/station-hourly-summary → stationHourlySummaryRouter)
    ↓
Route Handler (stationHourlySummary.js)
    ↓
Database Query (station_hourly_summary table)
    ↓
PostgreSQL Returns Data
    ↓
JSON Response to Frontend
    ↓
React Updates UI
    ↓
User Sees Data
```

---

## How to Create New Endpoints (With Versioning)

### Step 1: Add Endpoint to Route File

Create or edit a file in `routes/` (e.g., `routes/myNewRoute.js`):

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// GET /api/v1/my-route/get-data
router.get('/get-data', async (req, res) => {
    try {
        const { param1, param2 } = req.query;
        
        if (!param1) {
            return res.status(400).json({ error: 'Missing param1' });
        }
        
        const query = `SELECT * FROM my_table WHERE field = $1`;
        const result = await pool.query(query, [param1]);
        
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 2: Register in server.js

```javascript
const myNewRouter = require('./routes/myNewRoute');
app.use('/api/v1/my-route', myNewRouter);  // Always use /api/v1/
```

**Important**: Use **kebab-case** for route names:
- Good: `/api/v1/my-route`, `/api/v1/station-hourly`
- Bad: `/api/v1/myRoute`, `/api/v1/stationHourly`

### Step 3: Call from Frontend

```javascript
// In your React component
const fetchData = async () => {
  const response = await fetch(`${API_BASE}/api/v1/my-route/get-data?param1=value1`);
  const data = await response.json();
  setMyData(data);
};
```

---

## Migration Checklist for Developers

When working with APIs, always remember:

### For Backend Development:
- [ ] Route files go in `routes/` directory
- [ ] Register routes in `server.js` with `/api/v1/` prefix
- [ ] Use kebab-case for route names (e.g., `testboard-records`, not `testboardRecords`)
- [ ] Always validate request parameters
- [ ] Always use try/catch error handling
- [ ] Use parameterized queries ($1, $2) to prevent SQL injection

### For Frontend Development:
- [ ] All API calls must use `/api/v1/` prefix
- [ ] Use `${API_BASE}/api/v1/...` pattern (don't hardcode URLs)
- [ ] Handle loading states while fetching
- [ ] Handle errors gracefully
- [ ] Use kebab-case route names (match backend)

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting the /v1/ Prefix

**Wrong**:
```javascript
fetch(`${API_BASE}/api/tpy/daily?startDate=...`)  // Missing /v1/
```

**Right**:
```javascript
fetch(`${API_BASE}/api/v1/tpy/daily?startDate=...`)  // Has /v1/
```

### Mistake 2: Using Old camelCase Routes

**Wrong**:
```javascript
app.use('/api/v1/testboardRecords', testboardRouter);  // camelCase
fetch(`${API_BASE}/api/v1/testboardRecords/sn-check`)  // Won't work!
```

**Right**:
```javascript
app.use('/api/v1/testboard-records', testboardRouter);  // kebab-case
fetch(`${API_BASE}/api/v1/testboard-records/sn-check`)  // Works!
```

### Mistake 3: Inconsistent Naming

**Wrong**:
```javascript
// Backend
app.use('/api/v1/my-route', myRouter);

// Frontend  
fetch('/api/v1/myRoute/endpoint')  // Doesn't match!
```

**Right**:
```javascript
// Backend
app.use('/api/v1/my-route', myRouter);

// Frontend
fetch('/api/v1/my-route/endpoint')  // Matches!
```

---

## Testing Your Changes

### 1. Test Backend Endpoint

```bash
# Start server
cd Fox_app/backend
npm start

# Test with curl
curl "http://localhost:5000/api/v1/tpy/daily?startDate=2025-10-01&endDate=2025-10-07"
```

**Expected**: JSON response with data

### 2. Test Frontend Integration

```bash
# Start frontend
cd Fox_app/frontend
npm start

# Open browser
http://localhost:3000
```

**Expected**: Pages load without errors, data displays correctly

### 3. Check Browser Console

Press F12, check Console tab for errors like:
- `404 Not Found` - Route doesn't exist (check spelling/version)
- `400 Bad Request` - Missing parameters
- `500 Server Error` - Backend database/logic error

---

## Quick Reference

### Current API Structure (October 2025)

```
/api/v1/functional-testing/*     - Test station performance data
/api/v1/packing/*                - Packing metrics
/api/v1/sort-record/*            - Sort test data
/api/v1/tpy/*                    - Throughput per year metrics
/api/v1/snfn/*                   - Error code records
/api/v1/station-hourly-summary/* - Hourly station summaries
/api/v1/pchart/*                 - P-chart statistical data
/api/v1/workstation-routes/*     - Workstation timing data
/api/v1/testboard-records/*      - Testboard test records
/api/v1/spc/*                    - Statistical process control charts
/api/v1/upload/*                 - File upload handling
```

### Key Rules

1. **Always use `/api/v1/` prefix** in both backend and frontend
2. **Always use kebab-case** for route names (my-route, not myRoute)
3. **Always validate parameters** before database queries
4. **Always handle errors** with try/catch
5. **Always use parameterized queries** ($1, $2, $3) for SQL

---

## What's Next?

### Future API Versions

When we need to make breaking changes:

1. Create new route files in `routes/v2/`
2. Register in `server.js` with `/api/v2/` prefix
3. Keep `/api/v1/` working (backward compatibility)
4. Gradually migrate frontend to v2
5. Eventually deprecate v1

**Example**:
```javascript
// Both versions work simultaneously
app.use('/api/v1/tpy', tpyRouterV1);  // Old clients
app.use('/api/v2/tpy', tpyRouterV2);  // New clients
```

---

## Questions?

**Q: Do I always need to use /api/v1/ now?**  
A: Yes! All new endpoints must use `/api/v1/` prefix.

**Q: What if I forget the /v1/?**  
A: Your frontend will get 404 errors. Always include it.

**Q: Can I still use camelCase like testboardRecords?**  
A: No, use kebab-case like `testboard-records` for consistency.

**Q: What happens to old endpoints without /v1/?**  
A: They no longer work. Everything is on v1 now.

**Q: When do we create /api/v2/?**  
A: Only when we need breaking changes (different response format, etc.). Most changes can stay in v1.

**Q: How do I test if my endpoint works?**  
A: Use curl or your browser: `curl "http://localhost:5000/api/v1/your-route/endpoint?params=..."`

---

## Need Help?

If you run into issues:
1. Check browser console for error messages
2. Check backend terminal for error logs
3. Verify the route is registered in `server.js`
4. Verify the frontend uses correct `/api/v1/` prefix
5. Test the endpoint with curl first (isolates backend issues)
6. Ask the team - we've all been there!

---

**Last Updated**: October 9, 2025 - API Versioning Implementation
