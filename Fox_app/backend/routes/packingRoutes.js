const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/packing-records', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required query parameters.' });
        }
        const result = await pool.query(
            `SELECT pack_date, model, part_number, packed_count
             FROM packing_daily_summary
             WHERE pack_date >= $1 AND pack_date <= $2
             ORDER BY pack_date, model, part_number;`,
            [startDate, endDate]
        );

        const data = {};
        result.rows.forEach(row => {
            if (!data[row.model]) {
                data[row.model] = {
                    groupLabel: row.model,
                    totalLabel: `${row.model} Total`,
                    parts: {}
                };
            }

            if (!data[row.model].parts[row.part_number]) {
                data[row.model].parts[row.part_number] = {};
            }

            const dateObj = new Date(row.pack_date);
            const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
            data[row.model].parts[row.part_number][dateStr] = row.packed_count;
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;