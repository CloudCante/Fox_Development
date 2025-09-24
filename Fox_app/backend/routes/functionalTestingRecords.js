const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/station-performance', async (req, res) => {
    try {
        const { startDate, endDate, model } = req.query;
        if (!startDate || !endDate || !model) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate, model' });
        }
        let query = `
            SELECT
                workstation_name,
                SUM(pass) AS pass,
                SUM(fail) AS fail,
                CASE WHEN SUM(pass) + SUM(fail) = 0 THEN 0
                     ELSE ROUND(SUM(fail)::numeric / (SUM(pass) + SUM(fail)), 3)
                END AS failurerate
            FROM testboard_station_performance_daily
            WHERE end_date >= $1 AND end_date <= $2 AND model = $3
            GROUP BY workstation_name
            ORDER BY workstation_name
        `;
        let params = [startDate, endDate, model];
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
    }
});

router.get('/fixture-performance', async (req, res) => {
    try {
        const { startDate, endDate, model, pn, workstation_name } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
        }
        
        let query = `
            WITH filtered_data AS (
                SELECT
                    fixture_no,
                    SUM(pass) AS pass,
                    SUM(fail) AS fail,
                    SUM(total) AS total
                FROM fixture_performance_daily
                WHERE day >= $1 AND day <= $2
        `;
        
        let params = [startDate, endDate];
        let paramIndex = 3;
        
        if (model) {
            query += ` AND model = $${paramIndex}`;
            params.push(model);
            paramIndex++;
        }
        
        if (pn) {
            query += ` AND pn = $${paramIndex}`;
            params.push(pn);
            paramIndex++;
        }
        
        if (workstation_name) {
            query += ` AND workstation_name = $${paramIndex}`;
            params.push(workstation_name);
            paramIndex++;
        }
        
        query += `
                GROUP BY fixture_no
            ),
            total_fails AS (
                SELECT SUM(fail) AS total_failures FROM filtered_data
            )
            SELECT
                fd.fixture_no,
                fd.pass,
                fd.fail,
                fd.total,
                CASE WHEN fd.total = 0 THEN 0
                     ELSE ROUND(fd.fail::numeric / fd.total, 3)
                END AS failurerate,
                CASE WHEN tf.total_failures = 0 THEN 0
                     ELSE ROUND(fd.fail::numeric / tf.total_failures, 3)
                END AS fail_percent_of_total
            FROM filtered_data fd, total_fails tf
            ORDER BY fd.fail DESC
            LIMIT 6
        `;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
    }
});

module.exports = router;