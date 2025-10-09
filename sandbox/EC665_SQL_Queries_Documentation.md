# EC665 X-bar and R Chart SQL Queries Documentation

## Overview
This document contains all SQL queries used to generate data for the EC665 error code X-bar and R control charts.

## Database Schema Reference

**Primary Table**: `snfn_aggregate_daily`
```sql
-- Key columns for EC665 analysis:
fixture_no               TEXT        -- Fixture identifier (e.g., NV-NC0066)
history_station_end_time TIMESTAMP   -- When the test completed
error_code              TEXT        -- Error code (e.g., EC665)
```

## Query 1: Daily EC665 Errors by Date (Overall Pattern)

```sql
-- Purpose: Understand EC665 error frequency over time
-- Use: Determine if EC665 is a significant problem

SELECT 
    DATE(history_station_end_time) as test_date, 
    COUNT(*) as daily_errors 
FROM snfn_aggregate_daily 
WHERE error_code = 'EC665'
  AND history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(history_station_end_time) 
ORDER BY test_date DESC;
```

**Output Example**:
```
test_date  | daily_errors 
2025-10-03 | 15
2025-10-02 | 19
2025-10-01 | 14
```

**Learning Notes**:
- `CURRENT_DATE` = today's date
- `INTERVAL '30 days'` = go back 30 days from today
- `DATE()` function extracts just the date part from timestamp
- `COUNT(*)` counts rows in each group

## Query 2: Work Schedule Analysis (Monday-Thursday Pattern)

```sql
-- Purpose: Identify work days vs non-work days
-- Use: Understand business schedule for subgroup planning

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
    COUNT(*) as total_errors
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(dow FROM DATE(history_station_end_time))
ORDER BY day_of_week;
```

**Learning Notes**:
- `EXTRACT(dow FROM date)` = day of week (1=Monday, 0=Sunday)
- `CASE WHEN` = conditional logic (IF/THEN in SQL)
- This shows you work Monday-Thursday primarily

## Query 3: Error Code Frequency Distribution

```sql
-- Purpose: See which error codes appear most often
-- Use: Decide which error codes are worth monitoring

SELECT 
    error_code,
    COUNT(*) as total_frequency,
    COUNT(DISTINCT DATE(history_station_end_time)) as days_appeared,
    COUNT(DISTINCT fixture_no) as fixtures_affected,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT DATE(history_station_end_time)), 2) as avg_per_day
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY error_code
ORDER BY total_frequency DESC;
```

**Learning Notes**:
- `COUNT(DISTINCT column)` = count unique values
- `ROUND(number, 2)` = round to 2 decimal places
- `::numeric` = cast to number type for division
- `ORDER BY total_frequency DESC` = sort highest first

## Query 4: Fixture-Specific EC665 Errors (Main Chart Data)

```sql
-- Purpose: Get daily EC665 errors for top 3 fixtures
-- Use: This is the core data for X-bar and R charts

WITH fixture_daily_errors AS (
    -- First CTE: Calculate daily errors per fixture
    SELECT 
        fixture_no,
        DATE(history_station_end_time) as test_date,
        COUNT(*) as daily_errors
    FROM snfn_aggregate_daily 
    WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '10 days'
      AND error_code = 'EC665'
    GROUP BY fixture_no, DATE(history_station_end_time)
),
top_fixtures AS (
    -- Second CTE: Find top 3 fixtures by total errors
    SELECT fixture_no, SUM(daily_errors) as total_errors
    FROM fixture_daily_errors
    GROUP BY fixture_no
    ORDER BY total_errors DESC
    LIMIT 3
)
-- Main query: Join daily data with top fixtures
SELECT 
    fde.fixture_no,
    fde.test_date,
    fde.daily_errors
FROM fixture_daily_errors fde
JOIN top_fixtures tf ON fde.fixture_no = tf.fixture_no
ORDER BY fde.test_date, fde.daily_errors DESC;
```

**Learning Notes**:
- `WITH` = Common Table Expression (CTE) - like a temporary table
- `LIMIT 3` = get only top 3 results
- `JOIN ... ON` = combine tables based on matching columns
- This query powers the actual control chart

## Query 5: Subgroup Quality Assessment

```sql
-- Purpose: Check if we have enough data for reliable control limits
-- Use: Validate that subgroups are statistically sound

SELECT 
    error_code,
    COUNT(DISTINCT DATE(history_station_end_time)) as days_with_data,
    COUNT(*) as total_errors,
    CASE 
        WHEN COUNT(DISTINCT DATE(history_station_end_time)) >= 20 THEN 'SUFFICIENT'
        WHEN COUNT(DISTINCT DATE(history_station_end_time)) >= 15 THEN 'MARGINAL' 
        ELSE 'INSUFFICIENT'
    END as subgroup_quality
FROM snfn_aggregate_daily 
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY error_code
HAVING COUNT(*) >= 20  -- Only error codes with meaningful frequency
ORDER BY days_with_data DESC, total_errors DESC
LIMIT 10;
```

**Learning Notes**:
- `HAVING` = filter groups (WHERE filters rows)
- `CASE WHEN` = conditional logic for categorization
- Good practice: Check data quality before analysis

## Query Patterns Used

### Pattern 1: Time-based Filtering

```sql
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL 'X days'
```
**Use**: Get recent data for control charts

### Pattern 2: Daily Aggregation

```sql
SELECT 
    DATE(timestamp_column) as date,
    COUNT(*) as daily_count
FROM table
GROUP BY DATE(timestamp_column)
```
**Use**: Summarize metrics by day (required for control charts)

### Pattern 3: Top N Analysis

```sql
SELECT column, SUM(metric)
FROM table
GROUP BY column
ORDER BY SUM(metric) DESC
LIMIT N
```
**Use**: Find worst-performing fixtures/errors

### Pattern 4: CTE for Complex Analysis

```sql
WITH step1 AS (
    -- First calculation
),
step2 AS (
    -- Second calculation using step1
)
SELECT * FROM step1 JOIN step2 ...
```
**Use**: Break complex queries into manageable steps

## Performance Tips

1. **Use DATE() function consistently** - ensures proper indexing
2. **Filter by time first** - reduces data volume early
3. **Use LIMIT** - prevent accidental large result sets
4. **Index suggestions**: `(error_code, history_station_end_time)` for faster queries

## Error Handling

```sql
-- Check for NULL values
WHERE error_code IS NOT NULL
  AND fixture_no IS NOT NULL

-- Handle missing dates gracefully  
WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '30 days'
  AND history_station_end_time IS NOT NULL
```

## Common Modifications

### For Different Time Ranges:
```sql
-- Last 7 days
WHERE history_station_end_time >= CURRENT_DATE - INTER VAL '7 days'

-- Last week (from Monday)  
WHERE DATE(history_station_end_time) >= DATE_TRUNC('week', CURRENT_DATE)
```

### For Different Error Codes:
```sql
-- Multiple error codes
WHERE error_code IN ('EC665', 'EC143', 'EC665')

-- Exclude specific codes
WHERE error_code NOT IN ('EC_na', 'ECnan')
```

### For Different Fixture Counts:
```sql
-- Top 5 fixtures instead of 3
LIMIT 5

-- All fixtures (not just top N)
-- Remove the LIMIT clause
```
