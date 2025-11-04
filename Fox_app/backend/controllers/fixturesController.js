// ============================================================================
// File: controllers/fixturesController.js
//
// PURPOSE:
//   Controller class for managing CRUD operations on the 'fixtures' table.
//
// NOTES:
//   - Role-based access control (RBAC) is NOT handled here.
//     It’s enforced by middlewares (e.g. allowReadUpdate, isSuperuser) in routes.
//   - This controller only performs database logic.
//
// ============================================================================

// Import required modules
const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');

// Define a class for fixtures-related CRUD operations
class fixturesController {

    // =====================================================
    // READ — Get all fixture records
    // =====================================================
    static async getAllFixtures(req, res) {
        try {
            // Build query string
            const query = 'SELECT * FROM fixtures ORDER BY id ASC;';

            // Execute query
            const result = await pool.query(query);

            // Send all rows as JSON
            res.json(result.rows);
        } catch (error) {
            // Log and send error response
            console.error('Database error (getAllFixtures):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    //  READ — Get a specific fixture by ID
    // =====================================================
    static async getFixtureById(req, res) {
        try {
            const id = req.params.id; // Extract ID from request URL

            // Validate UUID format
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            // Build parameterized SQL query
            const query = 'SELECT * FROM fixtures WHERE id = $1';
            const result = await pool.query(query, [id]);

            // If no record found, return 404
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No result found for id: ${id}` });
            }

            // Return the single record
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Database error (getFixtureById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    //  CREATE — Add a new fixture record
    // =====================================================
    static async postFixture(req, res) {
        try {
            // Allowed and required fields for this table
            const allowed = [
                'tester_type', 'fixture_name', 'rack',
                'fixture_sn', 'test_type', 'ip_address',
                'mac_address', 'creator'
            ];
            const required = ['fixture_name'];

            // Check for missing required fields
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));
            if (missing.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
            }

            // Dynamically build insert query parts
            const { columns, placeholders, values } = dynamicPostQuery(allowed, req);

            if (placeholders.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for create' });
            }

            // Final SQL query with current timestamp
            const query = `
                INSERT INTO fixtures (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `;

            // Execute the query and return inserted record
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Database error (postFixture):', error);
            res.status(500).json({ error: 'Database create failed' });
        }
    }

    // =====================================================
    //  UPDATE — Partially update fixture record (PATCH)
    // =====================================================
    static async updateFixtures(req, res) {
        try {
            const id = req.params.id;

            // Validate UUID format
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            // Define allowed fields for update
            const allowed = [
                'tester_type', 'fixture_name', 'rack',
                'fixture_sn', 'test_type', 'ip_address',
                'mac_address', 'creator'
            ];

            // Build dynamic SET clauses and parameterized values
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);

            // If no valid field provided, stop
            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }

            // Add id at the end for WHERE clause
            values.push(id);

            // Final update query
            const query = `
                UPDATE fixtures
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            // Execute query
            const result = await pool.query(query, values);

            // If no record found, return 404
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture found with id: ${id}` });
            }

            // Return success response
            res.json({
                message: `Successfully updated fixture with id: ${id}`,
                updatedRow: result.rows[0]
            });
        } catch (error) {
            console.error('Database error (updateFixtures):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // =====================================================
    //  DELETE — Remove a fixture record
    // =====================================================
    static async deleteFixture(req, res) {
        try {
            const id = req.params.id;

            // Validate UUID
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            // Build delete query
            const query = 'DELETE FROM fixtures WHERE id = $1 RETURNING *;';
            const result = await pool.query(query, [id]);

            // If no record found, return 404
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture found with id: ${id}` });
            }

            // Send success response
            res.json({
                message: `Fixture with id: ${id} deleted successfully.`,
                deletedRow: result.rows[0]
            });
        } catch (error) {
            console.error('Database error (deleteFixture):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

// Export controller class
module.exports = fixturesController;
