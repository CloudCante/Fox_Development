const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get testboard station errorcodes
// Group by fixturen number and error codes
router.get('/station-errors', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate ) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        const query = `
            SELECT
                workstation_name,
                fixture_no,
                error_code,
                sn,
                model,
                error_disc,
                COUNT(error_code) as code_count,
                MIN(pn) as pn,
                (date_trunc('day', history_station_end_time) + interval '1 day - 1 microsecond') AS normalized_end_time

            FROM snfn_aggregate_daily
            WHERE history_station_end_time BETWEEN $1 AND $2
            GROUP BY fixture_no, sn, error_code, error_disc,model, workstation_name, (date_trunc('day', history_station_end_time) + interval '1 day - 1 microsecond')
            ORDER BY workstation_name
        `;
        const params = [startDate, endDate];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/model-errors', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate ) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        if(!model){
            return res.status(400).json({ error: 'Missing required query parameters: model' });
        }
        const query = `
            SELECT
                CASE
                    WHEN error_code IN ('ECnan', 'EC_na')
                        THEN 'NAN'
                    ELSE error_code
                END AS error_code,
                COUNT(*) as code_count
            FROM snfn_aggregate_daily
            WHERE history_station_end_time BETWEEN $1 AND $2
            AND (model = $3 OR $3 = 'ALL')
            GROUP BY
                CASE
                    WHEN error_code IN ('ECnan', 'EC_na')
                        THEN 'NAN'
                    ELSE error_code
                END
            ORDER BY code_count DESC
            `;
        const params = [startDate, endDate, model];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;