# SPC (Statistical Process Control) Routes Documentation

## Overview
The SPC routes provide X-bar and R control chart data for monitoring fixture performance and error codes. This enables real-time quality monitoring and identifies when manufacturing processes go out of control.

---

## Base URL
```
http://localhost:5000/api/spc
```

---

## Endpoints

### 1. GET `/api/spc/chart`
Generate X-bar and R control chart data based on filters.

#### Query Parameters

| Parameter   | Type   | Required | Default | Description                                      |
|-------------|--------|----------|---------|--------------------------------------------------|
| startDate   | string | ✅ Yes   | -       | Start date (YYYY-MM-DD)                          |
| endDate     | string | ✅ Yes   | -       | End date (YYYY-MM-DD)                            |
| model       | string | No       | ALL     | Filter by model (e.g., "Tesla SXM5")             |
| fixtureNo   | string | No       | TOP_N   | Comma-separated fixture numbers or single fixture |
| errorCode   | string | No       | ALL     | Specific error code (e.g., "EC665")              |
| topN        | number | No       | 3       | Number of fixtures in subgroup (3-10)            |

#### Example Requests

**Basic - Top 3 fixtures for EC665:**
```bash
GET /api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&errorCode=EC665
```

**Specific fixtures:**
```bash
GET /api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&fixtureNo=NV-NC0066,NV-NC0139,NV-NC0142
```

**Model-specific, all error codes:**
```bash
GET /api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&model=Tesla%20SXM5&topN=5
```

#### Response Format

```json
{
  "filters_applied": {
    "start_date": "2025-09-15",
    "end_date": "2025-10-07",
    "model": "ALL",
    "fixture_no": "TOP_N",
    "error_code": "EC665",
    "top_n_fixtures": 3
  },
  
  "fixtures_in_chart": [
    { "fixture_no": "NV-NC0066", "total_errors": 44 },
    { "fixture_no": "NV-NC0142", "total_errors": 13 },
    { "fixture_no": "NV-NC0054", "total_errors": 8 }
  ],
  
  "daily_data": [
    {
      "date": "2025-09-24",
      "fixtures": {
        "NV-NC0066": { "errors": 9, "data_quality": "actual" },
        "NV-NC0142": { "errors": 0, "data_quality": "assumed_zero" },
        "NV-NC0054": { "errors": 1, "data_quality": "actual" }
      },
      "subgroup_average": 3.33,
      "subgroup_range": 9
    }
  ],
  
  "control_limits": {
    "xbar": {
      "ucl": 5.99,
      "center_line": 2.19,
      "lcl": -1.61,
      "lcl_display": 0
    },
    "r": {
      "ucl": 9.56,
      "center_line": 3.71,
      "lcl": 0
    }
  },
  
  "statistics": {
    "grand_average": 2.19,
    "average_range": 3.71,
    "subgroup_size": 3,
    "total_subgroups": 7,
    "constants_used": { "A2": 1.023, "D3": 0, "D4": 2.574 }
  },
  
  "violations": [
    {
      "date": "2025-09-24",
      "type": "xbar_near_ucl",
      "chart": "xbar",
      "value": 4.33,
      "limit": 5.99,
      "severity": "warning",
      "message": "Average errors (4.33) approaching UCL (5.99)"
    }
  ],
  
  "data_quality": {
    "total_days": 7,
    "work_days": 7,
    "fixtures_analyzed": 3,
    "sufficient_data": true,
    "warnings": 1,
    "critical_issues": 0
  }
}
```

#### Error Responses

**400 - Missing Parameters:**
```json
{
  "error": "Missing required query parameters: startDate, endDate"
}
```

**400 - Insufficient Data:**
```json
{
  "error": "Insufficient data: Need at least 5 work days for valid control limits",
  "data_quality": {
    "work_days_found": 3,
    "work_days_required": 5
  }
}
```

**404 - No Data Found:**
```json
{
  "error": "No data found for the specified filters",
  "filters_applied": { ... }
}
```

---

### 2. GET `/api/spc/top-offenders`
Get top fixtures and error codes to guide filter selection.

#### Query Parameters

| Parameter   | Type   | Required | Default | Description                              |
|-------------|--------|----------|---------|------------------------------------------|
| dateRange   | number | No       | 30      | Number of days to look back              |
| model       | string | No       | ALL     | Filter by model                          |
| limit       | number | No       | 10      | Number of results per category to return |

#### Example Request

```bash
GET /api/spc/top-offenders?dateRange=30&model=Tesla%20SXM5&limit=10
```

#### Response Format

```json
{
  "date_range_days": 30,
  "model_filter": "Tesla SXM5",
  
  "top_fixtures": [
    {
      "fixture_no": "NV-NC0066",
      "total_errors": 63,
      "days_active": 15,
      "avg_per_day": 2.1
    },
    {
      "fixture_no": "NV-NC0139",
      "total_errors": 28,
      "days_active": 12,
      "avg_per_day": 0.93
    }
  ],
  
  "top_error_codes": [
    {
      "error_code": "EC665",
      "total_errors": 89,
      "fixtures_affected": 15
    },
    {
      "error_code": "EC011",
      "total_errors": 34,
      "fixtures_affected": 8
    }
  ],
  
  "top_combinations": [
    {
      "fixture_no": "NV-NC0066",
      "error_code": "EC665",
      "combo_count": 44,
      "percent_of_fixture_errors": 69.8
    },
    {
      "fixture_no": "NV-NC0139",
      "error_code": "EC011",
      "combo_count": 16,
      "percent_of_fixture_errors": 57.1
    }
  ]
}
```

---

### 3. GET `/api/spc/available-filters`
Get available filter options (models, error codes, fixtures).

#### Query Parameters

| Parameter   | Type   | Required | Default | Description              |
|-------------|--------|----------|---------|--------------------------|
| dateRange   | number | No       | 30      | Number of days to check  |

#### Example Request

```bash
GET /api/spc/available-filters?dateRange=30
```

#### Response Format

```json
{
  "models": ["Tesla SXM5", "Red October", "Tesla SXM4", "SXM6"],
  "error_codes": ["EC011", "EC014", "EC143", "EC280", "EC665", ...],
  "total_fixtures": 213,
  "date_range": {
    "earliest": "2025-09-07T10:30:00.000Z",
    "latest": "2025-10-07T16:45:00.000Z"
  }
}
```

---

## Data Quality Indicators

The API returns `data_quality` flags for each data point:

| Value         | Meaning                                               |
|---------------|-------------------------------------------------------|
| `actual`      | Real data point - fixture actually had this many errors |
| `assumed_zero`| No data found for this day - assumed zero errors      |

**Example:**
```json
{
  "date": "2025-09-25",
  "fixtures": {
    "NV-NC0066": { "errors": 3, "data_quality": "actual" },
    "NV-NC0142": { "errors": 0, "data_quality": "assumed_zero" }
  }
}
```

---

## Control Limit Calculations

### X-bar Chart (Average Chart)
Monitors the average error count per day.

- **UCL** = X̄ + (A₂ × R̄)
- **Center Line** = X̄ (grand average)
- **LCL** = X̄ - (A₂ × R̄)

### R Chart (Range Chart)
Monitors variability between fixtures.

- **UCL** = D₄ × R̄
- **Center Line** = R̄ (average range)
- **LCL** = D₃ × R̄

### Constants Used (by subgroup size)

| n | A₂    | D₃    | D₄    |
|---|-------|-------|-------|
| 3 | 1.023 | 0     | 2.574 |
| 4 | 0.729 | 0     | 2.282 |
| 5 | 0.577 | 0     | 2.114 |
| 6 | 0.483 | 0     | 2.004 |
| 7 | 0.419 | 0.076 | 1.924 |
| 8 | 0.373 | 0.136 | 1.864 |
| 9 | 0.337 | 0.184 | 1.816 |
| 10| 0.308 | 0.223 | 1.777 |

---

## Violation Severity Levels

| Severity   | Description                                  |
|------------|----------------------------------------------|
| `critical` | Point beyond control limits - immediate action required |
| `warning`  | Point approaching limits (>90% of limit)     |
| `improvement` | Point below LCL - process improved        |

---

## Testing

### Manual Testing with curl

**Test 1: Top Offenders**
```bash
curl "http://localhost:5000/api/spc/top-offenders?dateRange=30&limit=5"
```

**Test 2: Generate Chart**
```bash
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&errorCode=EC665&topN=3"
```

**Test 3: Available Filters**
```bash
curl "http://localhost:5000/api/spc/available-filters"
```

### Automated Testing

Run the test script:
```bash
cd /home/cloud/projects/Fox_Development/Fox_app/backend
node test_spc_api.js
```

---

## Common Use Cases

### Use Case 1: Monitor specific error code (EC665)
```javascript
const response = await fetch(
  '/api/spc/chart?startDate=2025-09-01&endDate=2025-10-07&errorCode=EC665&topN=3'
);
const data = await response.json();

// Check for violations
if (data.violations.some(v => v.severity === 'critical')) {
  alert('Process out of control!');
}
```

### Use Case 2: Compare specific fixtures
```javascript
const response = await fetch(
  '/api/spc/chart?startDate=2025-09-01&endDate=2025-10-07&fixtureNo=NV-NC0066,NV-NC0139,NV-NC0142&topN=3'
);
```

### Use Case 3: Model-specific analysis
```javascript
const response = await fetch(
  '/api/spc/chart?startDate=2025-09-01&endDate=2025-10-07&model=Tesla%20SXM5&topN=5'
);
```

### Use Case 4: Get suggestions for filters
```javascript
// Step 1: Get top offenders
const offenders = await fetch('/api/spc/top-offenders?dateRange=30');
const { top_fixtures, top_error_codes } = await offenders.json();

// Step 2: Use the worst performer
const worstFixture = top_fixtures[0].fixture_no;
const worstError = top_error_codes[0].error_code;

// Step 3: Generate chart for that combination
const chart = await fetch(
  `/api/spc/chart?startDate=2025-09-01&endDate=2025-10-07&fixtureNo=${worstFixture}&errorCode=${worstError}`
);
```

---

## Data Source

All data comes from the `snfn_aggregate_daily` table, which aggregates failure records from `testboard_master_log`.

**Excluded Error Codes:** `EC_na`, `ECnan`, `NA` (invalid/placeholder codes)

**Work Days:** Only Monday-Thursday are included by default (days 1-4 in PostgreSQL)

---

## Performance Notes

- Queries are optimized for 30-90 day ranges
- Typical response time: <100ms for 30 days of data
- Data volume: ~2,000 failure records per month
- No pre-aggregation required - calculates on-the-fly

---

## Troubleshooting

### "Insufficient data" error
- Need at least 5 work days (Mon-Thu) in the date range
- Try expanding the date range
- Check if fixtures have any failures in that period

### "Insufficient fixtures" error
- Fewer fixtures found than requested topN
- Reduce topN parameter
- Broaden filters (remove model/error code filters)

### Empty response
- Check date format (must be YYYY-MM-DD)
- Verify fixtures exist in database
- Check that error codes are valid

---

## Future Enhancements

- [ ] Add run rules detection (7 consecutive points, etc.)
- [ ] Export to CSV/Excel
- [ ] Email alerts for violations
- [ ] Historical comparison (this month vs last month)
- [ ] Trend analysis (improving/degrading indicators)
- [ ] Custom work day configuration (not hardcoded Mon-Thu)

---

## Related Documentation

- **API Versioning Strategy**: `API_VERSIONING_STRATEGY.md`
- **SOP**: `Fox_app/backend/SOPs/BACKEND_API_DEVELOPMENT_SOP.md`
- **Chart Theory**: `sandbox/EC665_Xbar_R_Chart_Documentation.md`
- **SQL Queries**: `sandbox/EC665_SQL_Queries_Documentation.md`

