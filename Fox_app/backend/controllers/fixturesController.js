// ============================================================================
// File: controllers/fixturesController.js
//
// PURPOSE:
//   Handles all CRUD operations for the 'fixtures' table.
//
// NOTES:
//   - RBAC handled by middlewares (allowReadUpdate, isSuperuser).
//   - All database interactions use parameterized queries to prevent SQL injection.
// ============================================================================

const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');

class fixturesController {

    // =====================================================
    // READ — Get all fixture records
    // =====================================================
    static async getAllFixtures(req, res) {
        try {
            const query = 'SELECT * FROM fixtures ORDER BY id ASC;';
            const result = await pool.query(query);
            res.status(200).json(result.rows); // Return all fixtures
        } catch (error) {
            console.error('Database error (getAllFixtures):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // READ — Get fixture by ID
    // =====================================================
    static async getFixtureById(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'SELECT * FROM fixtures WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No fixture found with id: ${id}` });

            res.status(200).json(result.rows[0]); // Return single fixture
        } catch (error) {
            console.error('Database error (getFixtureById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // CREATE — Add new fixture (superuser only)
    // =====================================================
    static async postFixture(req, res) {
        try {
            const allowed = ['tester_type', 'fixture_name', 'rack', 'fixture_sn', 'test_type', 'ip_address', 'mac_address', 'creator'];
            const required = ['fixture_name'];

            // Validate required fields
            const missing = required.filter(f => !Object.prototype.hasOwnProperty.call(req.body, f));
            if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

            const { columns, placeholders, values } = dynamicPostQuery(allowed, req);
            if (placeholders.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

            const query = `
                INSERT INTO fixtures (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]); // Return newly created fixture
        } catch (error) {
            console.error('Database error (postFixture):', error);
            res.status(500).json({ error: 'Database create failed' });
        }
    }

    // =====================================================
    // UPDATE — Modify fixture record (PATCH)
    // =====================================================
    static async updateFixtures(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const allowed = ['tester_type', 'fixture_name', 'rack', 'fixture_sn', 'test_type', 'ip_address', 'mac_address', 'creator'];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);

            if (setClauses.length === 0) return res.status(400).json({ error: 'No valid fields provided for update' });

            values.push(id); // Append id for WHERE clause
            const query = `UPDATE fixtures SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) return res.status(404).json({ error: `No fixture found with id: ${id}` });

            res.status(200).json({ message: `Fixture updated`, updatedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (updateFixtures):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // =====================================================
    // DELETE — Remove fixture (superuser only)
    // =====================================================
    static async deleteFixture(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'DELETE FROM fixtures WHERE id = $1 RETURNING *;';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No fixture found with id: ${id}` });

            res.status(200).json({ message: `Fixture deleted`, deletedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (deleteFixture):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

module.exports = fixturesController;
