// controller for usage table
// Handles all CRUD operations for fixture usage data

// Import required modules
const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js'); // utility functions for dynamic queries

// Define a class for usage controller
class usageController {

    // READ all usage records
    static async getAllUsage(req, res) {
        try {
            // SQL query to get all usage records, ordered by ID
            const query = 'SELECT * FROM usage ORDER BY id ASC;';
            const result = await pool.query(query); // execute query
            res.json(result.rows); // return rows as JSON
        } catch (error) {
            console.error('Database error (getAllUsage):', error);
            res.status(500).json({ error: 'Database query failed' }); // return error if DB fails
        }
    }

    // READ usage by ID
    static async getUsageById(req, res) {
        try {
            const id = req.params.id; // get ID from route
            if (!uuidRegex.test(id)) { // validate UUID format
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            const query = 'SELECT * FROM usage WHERE id = $1'; // parameterized query
            const result = await pool.query(query, [id]); // execute query
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No result found for id: ${id}` }); // handle missing row
            }
            res.json(result.rows[0]); // return single row as JSON
        } catch (error) {
            console.error('Database error (getUsageById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // CREATE new usage record
    static async postUsage(req, res) {
        try {
            // Define allowed fields that can be inserted
            const allowed = [
                'fixture_id', 'test_slot', 'test_station', 'test_type', 
                'gpu_pn', 'gpu_sn', 'log_path', 'creator'
            ];

            // Define required fields
            const required = ['fixture_id'];

            // Check if any required fields are missing in request body
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));
            if (missing.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
            }

            // Build dynamic insert query using helper
            const { columns, placeholders, values } = dynamicPostQuery(allowed, req);

            if (placeholders.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for create' });
            }

            // Construct SQL query string with placeholders and auto-generated create_date
            const query = `
                INSERT INTO usage (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `;

            const result = await pool.query(query, values); // execute insert query
            res.status(201).json(result.rows[0]); // return newly created row
        } catch (error) {
            console.error('Database error (postUsage):', error);
            res.status(500).json({ error: 'Database create failed' }); // return 500 on DB failure
        }
    }

    // UPDATE usage record (partial update allowed, via PATCH)
    static async updateUsage(req, res) {
        try {
            const id = req.params.id; // get ID from route
            if (!uuidRegex.test(id)) { // validate UUID format
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            // Define allowed fields for update
            const allowed = [
                'fixture_id', 'test_slot', 'test_station', 'test_type',
                'gpu_pn', 'gpu_sn', 'log_path', 'creator'
            ];

            // Build dynamic SET clauses and values
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);

            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }

            values.push(id); // add ID as last parameter for WHERE clause

            // Construct SQL update query
            const query = `
                UPDATE usage
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            const result = await pool.query(query, values); // execute update
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture usage found with id: ${id}` });
            }

            // Return success message along with updated row
            res.json(`Successfully updated fixture usage with id: ${id}. Updated row: ` + JSON.stringify(result.rows[0]));
        } catch (error) {
            console.error('Database error (updateUsage):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // DELETE usage record
    static async deleteUsage(req, res) {
        try {
            const id = req.params.id; // get ID from route
            if (!uuidRegex.test(id)) { // validate UUID format
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            // SQL delete query
            const query = 'DELETE FROM usage WHERE id = $1 RETURNING *;';
            const values = [id];

            const result = await pool.query(query, values); // execute delete

            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture usage found with id: ${id}` });
            } else {
                // Return deleted row info
                res.json({ message: `Fixture Usage with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
            }
        } catch (error) {
            console.error('Database error (deleteUsage):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

// Export the usageController class
module.exports = usageController;
