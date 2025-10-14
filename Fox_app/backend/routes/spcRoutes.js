const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

/*#################################################
#    SPC (Statistical Process Control) Routes    #
#    Used for X-bar and R Control Charts         #
#    Data source: snfn_aggregate_daily table     #
#################################################*/

// Statistical constants for control limit calculations
const SPC_CONSTANTS = {
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 }
};

/**
 * Helper function: Calculate control limits for X-bar and R charts
 */
function calculateControlLimits(dailyData, topNFixtures) {
    const n = topNFixtures;
    const constants = SPC_CONSTANTS[n];
    
    if (!constants) {
        throw new Error(`Unsupported subgroup size: ${n}. Must be between 3 and 10.`);
    }
    
    // Group data by date
    const dateGroups = {};
    dailyData.forEach(row => {
        const date = row.work_date;
        if (!dateGroups[date]) {
            dateGroups[date] = [];
        }
        dateGroups[date].push(parseFloat(row.daily_errors));
    });
    
    // Calculate averages and ranges for each subgroup (date)
    const subgroups = Object.keys(dateGroups).map(date => {
        const errors = dateGroups[date];
        const avg = errors.reduce((sum, val) => sum + val, 0) / errors.length;
        const range = Math.max(...errors) - Math.min(...errors);
        return { date, average: avg, range: range };
    });
    
    // Calculate grand average and average range
    const grandAverage = subgroups.reduce((sum, sg) => sum + sg.average, 0) / subgroups.length;
    const averageRange = subgroups.reduce((sum, sg) => sum + sg.range, 0) / subgroups.length;
    
    // Calculate control limits
    const xbarUCL = grandAverage + (constants.A2 * averageRange);
    const xbarLCL = grandAverage - (constants.A2 * averageRange);
    const rUCL = constants.D4 * averageRange;
    const rLCL = constants.D3 * averageRange;
    
    return {
        xbar: {
            ucl: parseFloat(xbarUCL.toFixed(3)),
            center_line: parseFloat(grandAverage.toFixed(3)),
            lcl: parseFloat(xbarLCL.toFixed(3)),
            lcl_display: parseFloat(Math.max(0, xbarLCL).toFixed(3)) // Non-negative for display
        },
        r: {
            ucl: parseFloat(rUCL.toFixed(3)),
            center_line: parseFloat(averageRange.toFixed(3)),
            lcl: parseFloat(rLCL.toFixed(3))
        },
        subgroups: subgroups
    };
}

/**
 * Helper function: Detect control chart violations
 */
function detectViolations(dailyData, controlLimits, topFixtures) {
    const violations = [];
    const { xbar, r, subgroups } = controlLimits;
    
    // Check X-bar violations
    subgroups.forEach((sg, idx) => {
        if (sg.average > xbar.ucl) {
            violations.push({
                date: sg.date,
                type: 'xbar_above_ucl',
                chart: 'xbar',
                value: sg.average,
                limit: xbar.ucl,
                severity: 'critical',
                message: `Average errors (${sg.average.toFixed(2)}) exceeded UCL (${xbar.ucl.toFixed(2)})`
            });
        } else if (sg.average < xbar.lcl && xbar.lcl > 0) {
            violations.push({
                date: sg.date,
                type: 'xbar_below_lcl',
                chart: 'xbar',
                value: sg.average,
                limit: xbar.lcl,
                severity: 'improvement',
                message: `Average errors (${sg.average.toFixed(2)}) below LCL (${xbar.lcl.toFixed(2)}) - Process improved`
            });
        } else if (sg.average > xbar.ucl * 0.9) {
            violations.push({
                date: sg.date,
                type: 'xbar_near_ucl',
                chart: 'xbar',
                value: sg.average,
                limit: xbar.ucl,
                severity: 'warning',
                message: `Average errors (${sg.average.toFixed(2)}) approaching UCL (${xbar.ucl.toFixed(2)})`
            });
        }
        
        // Check R chart violations
        if (sg.range > r.ucl) {
            violations.push({
                date: sg.date,
                type: 'r_above_ucl',
                chart: 'r',
                value: sg.range,
                limit: r.ucl,
                severity: 'critical',
                message: `Range (${sg.range.toFixed(2)}) exceeded UCL (${r.ucl.toFixed(2)}) - High variability`
            });
        } else if (sg.range > r.ucl * 0.9) {
            violations.push({
                date: sg.date,
                type: 'r_near_ucl',
                chart: 'r',
                value: sg.range,
                limit: r.ucl,
                severity: 'warning',
                message: `Range (${sg.range.toFixed(2)}) approaching UCL (${r.ucl.toFixed(2)})`
            });
        }
    });
    
    return violations;
}

/**
 * GET /api/spc/chart
 * Generate SPC chart data with control limits
 * 
 * Query params:
 * - startDate (required): YYYY-MM-DD
 * - endDate (required): YYYY-MM-DD
 * - model (optional): Filter by model (e.g., "Tesla SXM5")
 * - fixtureNo (optional): Comma-separated fixture numbers or single fixture
 * - errorCode (optional): Specific error code (e.g., "EC665") or empty for all
 * - topN (optional): Number of fixtures in subgroup (default: 3)
 */
router.get('/chart', async (req, res) => {
    try {
        const { startDate, endDate, model, fixtureNo, errorCode, topN = 3 } = req.query;
        
        // Validate required parameters
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                error: 'Missing required query parameters: startDate, endDate' 
            });
        }
        
        // Validate topN
        const topNInt = parseInt(topN);
        if (topNInt < 3 || topNInt > 10) {
            return res.status(400).json({ 
                error: 'topN must be between 3 and 10' 
            });
        }
        
        // Parse fixture numbers if provided
        const fixtureArray = fixtureNo ? fixtureNo.split(',').map(f => f.trim()) : null;
        
        // Build the SQL query
        const query = `
            WITH work_days AS (
                SELECT generate_series($1::date, $2::date, '1 day'::interval)::date as work_date
                WHERE EXTRACT(dow FROM generate_series::date) BETWEEN 1 AND 4
            ),
            filtered_errors AS (
                SELECT 
                    DATE(history_station_end_time) as error_date,
                    fixture_no,
                    COUNT(*) as daily_errors
                FROM snfn_aggregate_daily
                WHERE history_station_end_time >= $1 
                  AND history_station_end_time <= $2
                  AND ($3::text IS NULL OR model = $3)
                  AND ($4::text[] IS NULL OR fixture_no = ANY($4))
                  AND ($5::text IS NULL OR error_code = $5)
                  AND error_code NOT IN ('EC_na', 'ECnan', 'NA')
                GROUP BY DATE(history_station_end_time), fixture_no
            ),
            top_fixtures AS (
                SELECT fixture_no, SUM(daily_errors) as total_errors
                FROM filtered_errors
                GROUP BY fixture_no
                ORDER BY total_errors DESC
                LIMIT $6
            ),
            fixture_dates AS (
                SELECT tf.fixture_no, wd.work_date
                FROM top_fixtures tf
                CROSS JOIN work_days wd
            )
            SELECT 
                fd.work_date,
                fd.fixture_no,
                COALESCE(fe.daily_errors, 0) as daily_errors,
                CASE 
                    WHEN fe.daily_errors IS NULL THEN 'assumed_zero' 
                    ELSE 'actual' 
                END as data_quality,
                tf.total_errors
            FROM fixture_dates fd
            LEFT JOIN filtered_errors fe 
                ON fd.fixture_no = fe.fixture_no 
                AND fd.work_date = fe.error_date
            JOIN top_fixtures tf ON fd.fixture_no = tf.fixture_no
            ORDER BY fd.work_date, tf.total_errors DESC, fd.fixture_no;
        `;
        
        const params = [
            startDate, 
            endDate, 
            model || null, 
            fixtureArray, 
            errorCode || null, 
            topNInt
        ];
        
        const result = await pool.query(query, params);
        
        // Check if we have sufficient data
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'No data found for the specified filters',
                filters_applied: { startDate, endDate, model, fixtureNo, errorCode }
            });
        }
        
        // Get unique fixtures and dates
        const uniqueFixtures = [...new Set(result.rows.map(r => r.fixture_no))];
        const uniqueDates = [...new Set(result.rows.map(r => r.work_date))];
        
        // Check minimum data requirements
        if (uniqueDates.length < 5) {
            return res.status(400).json({ 
                error: 'Insufficient data: Need at least 5 work days for valid control limits',
                data_quality: {
                    work_days_found: uniqueDates.length,
                    work_days_required: 5
                }
            });
        }
        
        if (uniqueFixtures.length < topNInt) {
            return res.status(400).json({ 
                error: `Insufficient fixtures: Found ${uniqueFixtures.length} but need ${topNInt}`,
                suggestion: `Try reducing topN to ${uniqueFixtures.length} or broadening your filters`
            });
        }
        
        // Calculate control limits
        const controlLimits = calculateControlLimits(result.rows, topNInt);
        
        // Detect violations
        const violations = detectViolations(result.rows, controlLimits, uniqueFixtures);
        
        // Format daily data for easier frontend consumption
        const dailyDataByDate = {};
        result.rows.forEach(row => {
            const date = row.work_date;
            if (!dailyDataByDate[date]) {
                dailyDataByDate[date] = {
                    date: date,
                    fixtures: {}
                };
            }
            dailyDataByDate[date].fixtures[row.fixture_no] = {
                errors: parseInt(row.daily_errors),
                data_quality: row.data_quality
            };
        });
        
        const dailyData = Object.values(dailyDataByDate);
        
        // Add subgroup statistics to daily data
        dailyData.forEach((day, idx) => {
            if (controlLimits.subgroups[idx]) {
                day.subgroup_average = controlLimits.subgroups[idx].average;
                day.subgroup_range = controlLimits.subgroups[idx].range;
            }
        });
        
        // Response payload
        res.json({
            filters_applied: {
                start_date: startDate,
                end_date: endDate,
                model: model || 'ALL',
                fixture_no: fixtureNo || 'TOP_N',
                error_code: errorCode || 'ALL',
                top_n_fixtures: topNInt
            },
            fixtures_in_chart: uniqueFixtures.map(fixture => ({
                fixture_no: fixture,
                total_errors: result.rows.find(r => r.fixture_no === fixture)?.total_errors || 0
            })),
            daily_data: dailyData,
            control_limits: {
                xbar: controlLimits.xbar,
                r: controlLimits.r
            },
            statistics: {
                grand_average: controlLimits.xbar.center_line,
                average_range: controlLimits.r.center_line,
                subgroup_size: topNInt,
                total_subgroups: uniqueDates.length,
                constants_used: SPC_CONSTANTS[topNInt]
            },
            violations: violations,
            data_quality: {
                total_days: uniqueDates.length,
                work_days: uniqueDates.length,
                fixtures_analyzed: uniqueFixtures.length,
                sufficient_data: uniqueDates.length >= 5,
                warnings: violations.filter(v => v.severity === 'warning').length,
                critical_issues: violations.filter(v => v.severity === 'critical').length
            }
        });
        
    } catch (error) {
        console.error('SPC Chart Error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * GET /api/spc/top-offenders
 * Get top fixtures and error codes to guide filter selection
 * 
 * Query params:
 * - dateRange (optional): Number of days to look back (default: 30)
 * - model (optional): Filter by model
 * - limit (optional): Number of results to return (default: 10)
 */
router.get('/top-offenders', async (req, res) => {
    try {
        const { dateRange = 30, model, limit = 10 } = req.query;
        
        const limitInt = parseInt(limit);
        const dateRangeInt = parseInt(dateRange);
        
        // Query 1: Top Fixtures
        const fixturesQuery = `
            SELECT 
                fixture_no,
                COUNT(*) as total_errors,
                COUNT(DISTINCT DATE(history_station_end_time)) as days_active,
                ROUND(COUNT(*)::numeric / $1, 2) as avg_per_day
            FROM snfn_aggregate_daily
            WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '1 day' * $1
              AND ($2::text IS NULL OR model = $2)
              AND error_code NOT IN ('EC_na', 'ECnan', 'NA')
            GROUP BY fixture_no
            ORDER BY total_errors DESC
            LIMIT $3
        `;
        
        // Query 2: Top Error Codes
        const errorCodesQuery = `
            SELECT 
                error_code,
                COUNT(*) as total_errors,
                COUNT(DISTINCT fixture_no) as fixtures_affected
            FROM snfn_aggregate_daily
            WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '1 day' * $1
              AND ($2::text IS NULL OR model = $2)
              AND error_code NOT IN ('EC_na', 'ECnan', 'NA')
            GROUP BY error_code
            ORDER BY total_errors DESC
            LIMIT $3
        `;
        
        // Query 3: Top Combinations
        const combinationsQuery = `
            SELECT 
                fixture_no,
                error_code,
                COUNT(*) as combo_count,
                ROUND(
                    COUNT(*)::numeric / 
                    SUM(COUNT(*)) OVER (PARTITION BY fixture_no) * 100
                , 1) as percent_of_fixture_errors
            FROM snfn_aggregate_daily
            WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '1 day' * $1
              AND ($2::text IS NULL OR model = $2)
              AND error_code NOT IN ('EC_na', 'ECnan', 'NA')
            GROUP BY fixture_no, error_code
            ORDER BY combo_count DESC
            LIMIT $3
        `;
        
        const params = [dateRangeInt, model || null, limitInt];
        
        // Execute all queries in parallel
        const [fixturesResult, errorCodesResult, combinationsResult] = await Promise.all([
            pool.query(fixturesQuery, params),
            pool.query(errorCodesQuery, params),
            pool.query(combinationsQuery, params)
        ]);
        
        res.json({
            date_range_days: dateRangeInt,
            model_filter: model || 'ALL',
            top_fixtures: fixturesResult.rows,
            top_error_codes: errorCodesResult.rows,
            top_combinations: combinationsResult.rows
        });
        
    } catch (error) {
        console.error('Top Offenders Error:', error);
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * GET /api/spc/available-filters
 * Get available filter options (models, fixtures, error codes)
 */
router.get('/available-filters', async (req, res) => {
    try {
        const { dateRange = 30 } = req.query;
        
        const query = `
            SELECT 
                ARRAY_AGG(DISTINCT model) FILTER (WHERE model IS NOT NULL) as models,
                ARRAY_AGG(DISTINCT error_code) FILTER (WHERE error_code NOT IN ('EC_na', 'ECnan', 'NA')) as error_codes,
                COUNT(DISTINCT fixture_no) as total_fixtures,
                MIN(history_station_end_time) as earliest_date,
                MAX(history_station_end_time) as latest_date
            FROM snfn_aggregate_daily
            WHERE history_station_end_time >= CURRENT_DATE - INTERVAL '1 day' * $1
        `;
        
        const result = await pool.query(query, [parseInt(dateRange)]);
        
        res.json({
            models: result.rows[0].models || [],
            error_codes: (result.rows[0].error_codes || []).sort(),
            total_fixtures: parseInt(result.rows[0].total_fixtures),
            date_range: {
                earliest: result.rows[0].earliest_date,
                latest: result.rows[0].latest_date
            }
        });
        
    } catch (error) {
        console.error('Available Filters Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

