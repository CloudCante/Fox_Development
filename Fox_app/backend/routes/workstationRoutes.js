const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// Get workstation times
// Group by serial number and workstationnames
router.post('/station-times', async (req, res) => {
    try {
        const { sns } = req.body;
        if (!sns || !Array.isArray(sns) || sns.length === 0 ) {
            return res.status(400).json({ error: 'Missing or invalid sns array in request body' });
        }
        const query = `
            SELECT 
                sn,
                workstation_name,
                SUM(EXTRACT(EPOCH FROM (history_station_end_time - history_station_start_time))) / 3600.0::double precision AS "total_time"
            FROM workstation_master_log
            WHERE sn = ANY($1)
            GROUP BY sn, workstation_name
            ORDER BY sn, workstation_name;
        `;
        const params = [sns];
        const result = await pool.query(query,params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;