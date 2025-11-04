// controller for health table
// This controller handles CRUD operations for the "health" table
// RBAC: Actual access control is enforced at the route level via middleware
//       - Superuser: full CRUD
//       - Regular users: READ and UPDATE only

// Import required modules
const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js'); // utilities for UUID validation & dynamic SQL generation

// Class to encapsulate all health-related controller methods
class healthController {

    // READ all health records
    // All users (superuser and regular users) can perform this
    static async getAllHealth(req, res) {
        try {
            const query = 'SELECT * FROM health ORDER BY id ASC;'; // SQL query to fetch all rows
            const result = await pool.query(query); // execute query
            res.json(result.rows); // send rows as JSON response
        } catch (error) {
            console.error('Database error (getAllHealth):', error); // log error to server
            res.status(500).json({ error: 'Database query failed' }); // respond with 500
        }
    }

    // READ single health record by ID
    static async getHealthById(req, res) {
        try {
            const id = req.params.id; // get id from URL
            if (!uuidRegex.test(id)) { // validate UUID format
                return res.status(400).json({ error: 'Invalid or missing id parameter' }); // reject invalid id
            }

            const query = 'SELECT * FROM health WHERE id = $1'; // parameterized query
            const result = await pool.query(query, [id]); // execute query with id

            if (result.rows.length === 0) { // no record found
                return res.status(404).json({ error: `No result found for id: ${id}` });
            }

            res.json(result.rows[0]); // return single record as JSON
        } catch (error) {
            console.error('Database error (getHealthById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // CREATE a new health record
    // Only accessible to superusers via route middleware
    static async postHealth(req, res) {
        try {
            const allowed = ['fixture_id', 'status', 'comments', 'creator']; // fields allowed for insertion
            const required = ['fixture_id']; // required fields
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field)); // check missing

            if (missing.length > 0) { // reject if required fields missing
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
            }

            const { columns, placeholders, values } = dynamicPostQuery(allowed, req); // build SQL dynamically
            if (placeholders.length === 0) { // no valid fields
                return res.status(400).json({ error: 'No valid fields provided for create' });
            }

            const query = `
                INSERT INTO health (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `; // construct SQL with timestamp

            const result = await pool.query(query, values); // execute query
            res.status(201).json(result.rows[0]); // return created record
        } catch (error) {
            console.error('Database error (postHealth):', error);
            res.status(500).json({ error: 'Database create failed' });
        }
    }

    // UPDATE existing health record
    // Partial updates allowed using PATCH
    // Accessible to superuser and regular users (READ+UPDATE) via middleware
    static async updateHealth(req, res) {
        try {
            const id = req.params.id; // get record id
            if (!uuidRegex.test(id)) { // validate UUID
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            const allowed = ['fixture_id', 'status', 'comments', 'creator']; // fields allowed for update
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req); // build SET clauses dynamically

            if (setClauses.length === 0) { // nothing to update
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }

            values.push(id); // append id for WHERE clause
            const query = `
                UPDATE health
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `; // construct UPDATE SQL

            const result = await pool.query(query, values); // execute update

            if (result.rows.length === 0) { // record not found
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }

            res.json(`Successfully updated fixture health with id: ${id}. Updated row: ` + JSON.stringify(result.rows[0]));
        } catch (error) {
            console.error('Database error (updateHealth):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // DELETE a health record
    // Only accessible to superusers via route middleware
    static async deleteHealth(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }

            const query = 'DELETE FROM health WHERE id = $1 RETURNING *;'; // delete record with returning clause
            const values = [id];

            const result = await pool.query(query, values); // execute delete
            if (result.rows.length === 0) { // record not found
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }

            res.json({ message: `Fixture Health with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (deleteHealth):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

// Export controller class for use in routes
module.exports = healthController;
