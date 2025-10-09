# Total Fixture Performance SQL Queries Documentation

## Overview
This document contains SQL queries for monitoring overall fixture performance across all error codes (not just specific error codes).

## Database Schema Reference

**Primary Table**: `snfn_aggregate_daily`
```sql
-- Key columns for fixture performance analysis:
fixture_no               TEXT        -- Fixture identifier (e.g., NV-NC0150)
history_station_end_time TIMESTAMP   -- When the test completed
error_code              TEXT        -- All error codes (no filter!)
```

## Query 1: Daily Total Errors by Date (Overall System Health)

```sql
-- Purpose: See total error volume over time (all error codes combined)
-- Use: Understand overall system health trends

SELECT 
    DATE(history_station_end_time) as test_date,
    COUNT(*) as daily_total_errors
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(history_station_end_time)
ORDER BY test_date DESC;
```

**Output Example**:
```
test_date  | daily_total_errors 
2025-10-03 | 25
2025-10-02 | 28
2025-10-01 | 18
```

**Learning Notes**:
- No `error_code` filter = includes ALL error codes
- Shows overall system performance, not specific problems
- Higher numbers indicate broader system issues

## Query 2: Fixture Performance Ranking (Worst Performers)

```sql
-- Purpose: Identify which fixtures have the highest total error rates
-- Use: Prioritize maintenance efforts

SELECT 
    fixture_no,
    COUNT(*) as total_errors_30days,
    COUNT(DISTINCT DATE(history_station_end_time)) as days_with_errors,
    COUNT(DISTINCT error_code) as unique_error_types,
    ROUND(COUNT(*)::numeric / 30, 2) as avg_errors_per_day
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fixture_no
ORDER BY total_errors_30days DESC
LIMIT 10;
```

**Learning Notes**:
- `COUNT(DISTINCT error_code)` = how many different error types
- `ROUND(COUNT(*)::numeric / 30, 2)` = daily average over 30 days
- This gives you the "worst fixtures" for prioritization

## Query 3: Top Fixtures Daily Errors (Control Chart Data)

```sql
-- Purpose: Get daily error counts for top 3 worst fixtures
-- Use: This powers the fixture performance X-bar and H chart

WITH fixture_daily_errors AS (
    -- Step 1: Calculate daily total errors per fixture (all error codes)
    SELECT 
        fixture_no,
        DATE(history_station_end_time) as test_date,
        COUNT(*) as daily_total_errors
    FROM snfn_aggregate_daily 
    WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY fixture_no, DATE(history_station_end_time)
),
top_fixtures AS (
    -- Step 2: Find top 3 fixtures with highest total error count
    SELECT 
        fixture_no, 
        SUM(daily_total_errors) as total_errors
    FROM fixture_daily_errors
    GROUP BY fixture_no
    ORDER BY total_errors DESC
    LIMIT 3
)
-- Step 3: Get daily data for top 3 fixtures only
SELECT 
    fde.fixture_no,
    fde.test_date,
    fde.daily_total_errors
FROM fixture_daily_errors fde
JOIN top_fixtures tf ON fde.fixture_no = tf.fixture_no
ORDER BY fde.test_date DESC, fde.daily_total_errors DESC;
```

**Learning Notes**:
- Same CTE pattern as EC665 queries
- No `error_code` filter = includes all error codes
- This creates the data table for control charts

## Query 4: Work Schedule Impact Analysis

```sql
-- Purpose: See how work days affect error patterns
-- Use: Validate business schedule assumptions

SELECT 
    EXTRACT(dow FROM DATE(history_station_end_time)) as day_of_week,
    CASE EXTRACT(dow FROM DATE(history_station_end_time))
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday' 
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
        WHEN 0 THEN 'Sunday'
    END as day_name,
    COUNT(*) as total_errors_all_codes,
    COUNT(DISTINCT fixture_no) as fixtures_with_errors,
    COUNT(DISTINCT error_code) as unique_error_codes
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(dow FROM DATE(history_station_end_time))
ORDER BY day_of_week;
```

**Learning Notes**:
- `COUNT(DISTINCT fixture_no)` = how many fixtures had errors
- `COUNT(DISTINCT error_code)` = how many different error types
- Shows pattern of when errors occur across work week

## Query 5: Fixture Error Code Breakdown

```sql
-- Purpose: See what error types each problematic fixture generates
-- Use: Identify if fixtures have specific error patterns

SELECT 
    fixture_no,
    error_code,
    COUNT(*) as error_count,
    ROUND((COUNT(*)::numeric / SUM(COUNT(*)) OVER (PARTITION BY fixture_no)) * 100, 1) as percentage_of_fixture_errors
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
  AND fixture_no IN (
    -- Subquery: Get top 5 worst fixtures
    SELECT fixture_no
    FROM snfn_aggregate_daily 
    WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY fixture_no
    ORDER BY COUNT(*) DESC
    LIMIT 5
  )
GROUP BY fixture_no, error_code
ORDER BY fixture_no, error_count DESC;
```

**Learning Notes**:
- `OVER (PARTITION BY fixture_no)` = window function for percentage calculation
- `SUMQ) OVER (...)` = sum within each partition (fixture)
- Shows which error codes are most common for each fixture

## Query 6: Trend Analysis (Fixture Performance Over Time)

```sql
-- Purpose: Detect if fixture performance is improving or degrading
-- Use: Early warning system for fixture health

WITH weekly_totals AS (
    SELECT 
        fixture_no,
        DATE_TRUNC('week', DATE(history_station_end_time)) as week_start,
        COUNT(*) as weekly_error_count
    FROM snfn_aggregate_daily 
    WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '8 weeks'
    GROUP BY fixture_no, DATE_TRUNC('week', DATE(history_station_end_time))
),
fixture_trends AS (
    SELECT 
        fixture_no,
        week_start,
        weekly_error_count,
        LAG(weekly_error_count, 1) OVER (PARTITION BY fixture_no ORDER BY week_start) as previous_week,
        weekly_error_count - LAG(weekly_error_count, 1) OVER (PARTITION BY fixture_no ORDER BY week_start) as change_from_last_week
    FROM weekly_totals
)
SELECT 
    fixture_no,
    week_start,
    weekly_error_count,
    change_from_last_week,
    CASE 
        WHEN change_from_last_week > 0 THEN 'Getting Worse'
        WHEN change_from_last_week < 0 THEN 'Improving'
        ELSE 'No Change'
    END as trend_direction
FROM fixture_trends
WHERE change_from_last_week IS NOT NULL
ORDER BY fixture_no, week_start DESC;
```

**Learning Notes**:
- `DATE_TRUNC('week', date)` = start of week (Monday)
- `LAG(column, 1) OVER (...)` = previous row's value in order
- `PARTITION BY fixture_no` = restart calculation for each fixture
- Perfect for trend detection!

## Query Patterns Explained

### Pattern 1: Total Error Aggregation
```sql
-- Count ALL errors (no filter)
SELECT COUNT(*) FROM snfn_aggregate_daily WHERE [time_filter]
```
**vs Specific Error Filter**:
```sql
-- Count specific error only
SELECT COUNT(*) FROM snfn_aggregate_daily WHERE error_code = 'EC665'
```

### Pattern 2: Multi-Level Aggregation
```sql
-- Daily totals per fixture
SELECT fixture_no, DATE(time), COUNT(*)
FROM table
GROUP BY fixture_no, DATE(time)
ORDER BY COUNT(*) DESC
```
**Use**: Find worst performers at any level

### Pattern 3: Window Functions for Trends
```sql
-- Compare current with previous period
LAG(metric) OVER (PARTITION BY group ORDER BY time)
```
**Use**: Detect improving/declining trends

### Pattern 4: Nested Aggregation
```sql
-- Outer query: fixture totals
-- Inner query: daily fixture totals
SELECT fixture, SUM(daily_errors) FROM (
    SELECT fixture, DATE(time), COUNT(*) as daily_errors 
    FROM table GROUP BY fixture, DATE(time)
) GROUP BY fixture
```

## Performance Optimization Notes

### Index Recommendations:
```sql
-- Create index for fixture performance queries
CREATE INDEX idx_fixture_performance 
ON snfn_aggregate_daily (history_station_end_time, fixture_no);
```

### Query Optimization:
```sql
-- Efficient date filtering
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL 'X days'
-- Instead of: 
WHERE DATE(history_station_end_time) >= CURRENT_DATE - X
```

### Large Dataset Handling:
```sql
-- For millions of records, add LIMIT to exploratory queries
SELECT * FROM large_result LIMIT 1000;
```

## Common Modifications

### Different Time Windows:
```sql
-- Last 30 days vs last 14 days
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '14 days'
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
```

### Different Fixture Counts:
```sql
-- Top 3 vs top 5 vs all fixtures
LIMIT 3
LIMIT 5
-- Remove LIMIT for all fixtures
```

### Different Error Filters:
```sql
-- Exclude certain error types
WHERE error_code NOT IN ('EC_na', 'ECnan')

-- Include only specific error codes  
WHERE error_code IN ('EC665', 'EC143', 'EC445')
```

### Adding More Metrics:
```sql
-- Add workstation dimension
SELECT 
    workstation_name,
    fixture_no,
    COUNT(*) as errors
FROM snfn_aggregate_daily
GROUP BY workstation_name, fixture_no
```

## Business Logic Applications

### Exclude Holiday/Shutdown Days:
```sql
-- Advanced: Exclude specific dates
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
  AND DATE(history_station_end_time) NOT IN ('2025-12-25', '2025-01-01')
```

### Weekend Work Detection:
```sql
-- Include only if weekend work occurred
WHERE (EXTRACT(dow FROM DATE(history_station_end_time)) IN (0,6))
   OR (EXTRACT(dow FROM DATE(history_station_end_time)) BETWEEN 1 AND 5)
```

### Maintenance Impact Analysis:
```sql
-- Before/after maintenance periods
SELECT 
    DATE(history_station_end_time),
    CASE 
        WHEN DATE(history_station_end_time) >= '2025-10-01' THEN 'After Maintenance'
        ELSE 'Before Maintenance'
    END as period,
    COUNT(*) as errors
FROM snfn_aggregate_daily
WHERE fixture_no = 'NV-NC0066'
GROUP BY DATE(history_station_end_time)
ORDER BY test_date;
```
