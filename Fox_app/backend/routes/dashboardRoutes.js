const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

// GET /api/dashboard/status - Get all fixture statuses and current usage
router.get('/status', async (req, res) => {
    try {
        // Get all fixtures with their latest health status
        const fixturesQuery = `
            SELECT 
                f.id,
                f.tester_type,
                f.fixture_id,
                f.rack,
                f.fixture_sn,
                f.test_type,
                f.ip_address,
                f.mac_address,
                f.parent,
                h.status,
                h.comments,
                h.create_date as last_health_update
            FROM fixtures f
            LEFT JOIN LATERAL (
                SELECT status, comments, create_date
                FROM health h2
                WHERE h2.fixture_id = f.id
                ORDER BY h2.create_date DESC
                LIMIT 1
            ) h ON true
            ORDER BY f.id
        `;

        // Get current usage (active tests)
        const usageQuery = `
            SELECT 
                u.primary_key,
                u.fixture_id,
                u.test_slot,
                u.test_station,
                u.test_type,
                u.gpu_pn,
                u.gpu_sn,
                u.log_path,
                u.create_date as test_start_time
            FROM usage u
            WHERE u.create_date >= NOW() - INTERVAL '24 hours'
            ORDER BY u.create_date DESC
        `;

        const [fixturesResult, usageResult] = await Promise.all([
            pool.query(fixturesQuery),
            pool.query(usageQuery)
        ]);

        res.json({
            success: true,
            data: {
                fixtures: fixturesResult.rows,
                current_usage: usageResult.rows
            }
        });

    } catch (error) {
        console.error('Dashboard status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard status',
            error: error.message
        });
    }
});

// POST /api/dashboard/health - Update fixture health status
router.post('/health', async (req, res) => {
    try {
        const { fixture_id, status, comments, creator = 'system' } = req.body;

        // Validate required fields
        if (!fixture_id || !status) {
            return res.status(400).json({
                success: false,
                message: 'fixture_id and status are required'
            });
        }

        // Validate status values
        const validStatuses = ['active', 'no_response', 'under_maintenance', 'RMA'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Insert new health record
        const insertQuery = `
            INSERT INTO health (fixture_id, status, comments, creator, create_date)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [fixture_id, status, comments, creator]);

        res.json({
            success: true,
            message: 'Health status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Health update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update health status',
            error: error.message
        });
    }
});

// POST /api/dashboard/usage/start - Start a new test
router.post('/usage/start', async (req, res) => {
    try {
        const { 
            fixture_id, 
            test_slot, 
            test_station, 
            test_type, 
            gpu_pn, 
            gpu_sn, 
            log_path,
            creator = 'system' 
        } = req.body;

        // Validate required fields
        if (!fixture_id || !test_slot || !test_station || !test_type) {
            return res.status(400).json({
                success: false,
                message: 'fixture_id, test_slot, test_station, and test_type are required'
            });
        }

        // Validate test_slot values
        const validSlots = ['Left', 'Right'];
        if (!validSlots.includes(test_slot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid test_slot. Must be one of: ${validSlots.join(', ')}`
            });
        }

        // Validate test_type values
        const validTypes = ['Refurbish', 'Sort', 'NA'];
        if (!validTypes.includes(test_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid test_type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Insert new usage record
        const insertQuery = `
            INSERT INTO usage (fixture_id, test_slot, test_station, test_type, gpu_pn, gpu_sn, log_path, creator, create_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [
            fixture_id, test_slot, test_station, test_type, 
            gpu_pn, gpu_sn, log_path, creator
        ]);

        res.json({
            success: true,
            message: 'Test started successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Usage start error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start test',
            error: error.message
        });
    }
});

// GET /api/dashboard/fixtures - Get all fixtures
router.get('/fixtures', async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id,
                f.tester_type,
                f.fixture_id,
                f.rack,
                f.fixture_sn,
                f.test_type,
                f.ip_address,
                f.mac_address,
                f.parent,
                f.creator,
                f.create_date
            FROM fixtures f
            ORDER BY f.id
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Fixtures fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fixtures',
            error: error.message
        });
    }
});

// POST /api/dashboard/fixtures - Add new fixture
router.post('/fixtures', async (req, res) => {
    try {
        const { 
            tester_type, 
            fixture_id, 
            rack, 
            fixture_sn, 
            test_type, 
            ip_address, 
            mac_address, 
            parent,
            creator = 'system' 
        } = req.body;

        // Validate required fields
        if (!tester_type || !fixture_id || !rack) {
            return res.status(400).json({
                success: false,
                message: 'tester_type, fixture_id, and rack are required'
            });
        }

        // Validate tester_type values
        const validTesterTypes = ['B Tester', 'LA Slot', 'RA Slot'];
        if (!validTesterTypes.includes(tester_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid tester_type. Must be one of: ${validTesterTypes.join(', ')}`
            });
        }

        // Insert new fixture
        const insertQuery = `
            INSERT INTO fixtures (tester_type, fixture_id, rack, fixture_sn, test_type, ip_address, mac_address, parent, creator, create_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [
            tester_type, fixture_id, rack, fixture_sn, test_type, 
            ip_address, mac_address, parent, creator
        ]);

        res.json({
            success: true,
            message: 'Fixture added successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Fixture creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create fixture',
            error: error.message
        });
    }
});

module.exports = router;
