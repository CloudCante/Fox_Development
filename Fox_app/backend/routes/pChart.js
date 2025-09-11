const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

router.get('/data', async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            workstation,
            serviceFlow,
            pn,
            model
        } = req.query;

        // Validate date range (minimum 10 days for 4-day work week)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 9) {
                return res.status(400).json({
                    error: 'Insufficient data range',
                    message: 'P-Chart requires minimum 10 days for 8 workdays (4-day work week). Please select a larger date range.'
                });
            }
        }

        let queryParams = [startDate, endDate];
        let paramCount = 2;

        let query = `
            SELECT 
                date,
                pn,
                model,
                workstation_name,
                service_flow,
                total_count,
                pass_count,
                fail_count
            FROM workstation_pchart_daily
            WHERE date BETWEEN $1 AND $2
        `;

        if (model) {
            paramCount++;
            query += ` AND model = $${paramCount}`;
            queryParams.push(model);
        }

        if (workstation) {
            paramCount++;
            query += ` AND workstation_name = $${paramCount}`;
            queryParams.push(workstation);
        }

        if (serviceFlow) {
            paramCount++;
            query += ` AND service_flow = $${paramCount}`;
            queryParams.push(serviceFlow);
        }

        if (pn) {
            paramCount++;
            query += ` AND pn = $${paramCount}`;
            queryParams.push(pn);
        }

        query += ' ORDER BY date ASC';

        const { rows } = await pool.query(query, queryParams);
        
        // Note: Removed the 15-point validation since frontend will consolidate
        res.json(rows);

    } catch (error) {
        console.error('Error fetching P-Chart data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch P-Chart data',
            details: error.message 
        });
    }
});

// Get available filter options with cascading support
router.get('/filters', async (req, res) => {
    try {
        const { model, workstation } = req.query;
        
        const filters = {};

        // Always get models first
        const modelsQuery = 'SELECT DISTINCT model FROM workstation_pchart_daily WHERE model IS NOT NULL ORDER BY model';
        const modelsResult = await pool.query(modelsQuery);
        filters.models = modelsResult.rows.map(row => row.model);

        // If model is selected, get workstations for that model
        if (model) {
            const workstationsQuery = `
                SELECT DISTINCT workstation_name 
                FROM workstation_pchart_daily 
                WHERE model = $1 
                ORDER BY workstation_name
            `;
            const workstationsResult = await pool.query(workstationsQuery, [model]);
            filters.workstations = workstationsResult.rows.map(row => row.workstation_name);

            // If both model and workstation are selected, get service flows and part numbers
            if (workstation) {
                const serviceFlowsQuery = `
                    SELECT DISTINCT service_flow 
                    FROM workstation_pchart_daily 
                    WHERE model = $1 AND workstation_name = $2 AND service_flow IS NOT NULL
                    ORDER BY service_flow
                `;
                const serviceFlowsResult = await pool.query(serviceFlowsQuery, [model, workstation]);
                filters.serviceFlows = serviceFlowsResult.rows.map(row => row.service_flow);

                // Get part numbers for this model/workstation combination
                const partNumbersQuery = `
                    SELECT DISTINCT pn 
                    FROM workstation_pchart_daily 
                    WHERE model = $1 AND workstation_name = $2
                    ORDER BY pn
                `;
                const partNumbersResult = await pool.query(partNumbersQuery, [model, workstation]);
                filters.partNumbers = partNumbersResult.rows.map(row => row.pn);
            }
        }

        res.json(filters);

    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ 
            error: 'Failed to fetch filter options',
            details: error.message 
        });
    }
});

module.exports = router;