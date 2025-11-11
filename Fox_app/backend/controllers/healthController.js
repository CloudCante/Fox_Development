// ============================================================================
// File: controllers/healthController.js
//
// PURPOSE:
//   Handles CRUD operations for the 'health' table.
//
// NOTES:
//   - RBAC handled by middlewares (allowReadUpdate for GET/PATCH, isSuperuser for POST/DELETE).
//   - Uses parameterized queries for security against SQL injection.
// ============================================================================

const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');

class healthController {

    // =====================================================
    // READ — Get all health records
    // =====================================================
    static async getAllHealth(req, res) {
        try {
            const query = 'SELECT * FROM health ORDER BY id ASC;';
            const result = await pool.query(query);
            res.status(200).json(result.rows); // Return all health records
        } catch (error) {
            console.error('Database error (getAllHealth):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // READ — Get health record by ID
    // =====================================================
    static async getHealthById(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'SELECT * FROM health WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No health record found with id: ${id}` });

            res.status(200).json(result.rows[0]); // Return single health record
        } catch (error) {
            console.error('Database error (getHealthById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // CREATE — Add new health record (superuser only)
    // =====================================================
    static async postHealth(req, res) {
        try {
            const allowed = ['machine_id', 'status', 'description', 'creator'];
            const required = ['machine_id', 'status'];

            // Validate required fields
            const missing = required.filter(f => !Object.prototype.hasOwnProperty.call(req.body, f));
            if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

            const { columns, placeholders, values } = dynamicPostQuery(allowed, req);
            if (placeholders.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

            const query = `
                INSERT INTO health (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]); // Return created health record
        } catch (error) {
            console.error('Database error (postHealth):', error);
            res.status(500).json({ error: 'Database create failed' });
        }
    }

    // =====================================================
    // UPDATE — Modify health record (PATCH)
    // =====================================================
    static async updateHealth(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const allowed = ['machine_id', 'status', 'description', 'creator'];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);

            if (setClauses.length === 0) return res.status(400).json({ error: 'No valid fields provided for update' });

            values.push(id); // Append id for WHERE clause
            const query = `UPDATE health SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) return res.status(404).json({ error: `No health record found with id: ${id}` });

            res.status(200).json({ message: 'Health record updated', updatedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (updateHealth):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // =====================================================
    // DELETE — Remove health record (superuser only)
    // =====================================================
    static async deleteHealth(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'DELETE FROM health WHERE id = $1 RETURNING *;';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No health record found with id: ${id}` });

            res.status(200).json({ message: 'Health record deleted', deletedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (deleteHealth):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

module.exports = healthController;
