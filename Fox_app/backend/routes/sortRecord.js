const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/sort-data', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = '';
        let params = [];
        
        if (startDate && endDate) {
            dateFilter = 'AND history_station_end_time >= $1 AND history_station_end_time <= $2';
            params = [startDate, endDate];
        }
        
        const result = await pool.query(
            `SELECT
                CASE
                    WHEN model = 'Tesla SXM4' THEN '506'
                    WHEN model = 'Tesla SXM5' THEN '520'
                    ELSE NULL
                END AS sort_code,
                CASE
                    WHEN EXTRACT(DOW FROM history_station_end_time) = 6 THEN DATE(history_station_end_time) - INTERVAL '1 day'
                    WHEN EXTRACT(DOW FROM history_station_end_time) = 0 THEN DATE(history_station_end_time) - INTERVAL '2 days'
                    ELSE DATE(history_station_end_time)
                END AS test_date,
                COUNT(*) AS test_count
            FROM workstation_master_log
            WHERE workstation_name = 'TEST'
                AND model IN ('Tesla SXM4', 'Tesla SXM5')
                ${dateFilter}
            GROUP BY sort_code, test_date
            ORDER BY sort_code, test_date;`,
            params
        );
        const sortData = { '506': {}, '520': {} };
        
        result.rows.forEach(row => {
            if (row.sort_code && row.test_date) {
                const dateStr = `${row.test_date.getMonth() + 1}/${row.test_date.getDate()}/${row.test_date.getFullYear()}`;
                sortData[row.sort_code][dateStr] = parseInt(row.test_count);
            }
        });
        
        res.json(sortData);
    } catch (error) {
    }
});

module.exports = router;
