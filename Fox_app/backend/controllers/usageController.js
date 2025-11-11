// ============================================================================
// File: controllers/usageController.js
//
// PURPOSE:
//   Handles CRUD operations for the 'usage' table.
//
// NOTES:
//   - RBAC handled via middlewares (allowReadUpdate for GET/PATCH, isSuperuser for POST/DELETE).
//   - Parameterized queries are used to prevent SQL injection.
// ============================================================================

const { pool } = require('../db.js'); // PostgreSQL connection pool
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');

class usageController {

    // =====================================================
    // READ — Get all usage records
    // =====================================================
    static async getAllUsage(req, res) {
        try {
            const query = 'SELECT * FROM usage ORDER BY id ASC;';
            const result = await pool.query(query);
            res.status(200).json(result.rows); // Return all usage records
        } catch (error) {
            console.error('Database error (getAllUsage):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // READ — Get a usage record by ID
    // =====================================================
    static async getUsageById(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'SELECT * FROM usage WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No usage record found with id: ${id}` });

            res.status(200).json(result.rows[0]); // Return single usage record
        } catch (error) {
            console.error('Database error (getUsageById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    // =====================================================
    // CREATE — Add new usage record (superuser only)
    // =====================================================
    static async postUsage(req, res) {
        try {
            const allowed = ['machine_id', 'operator', 'shift', 'output', 'comments', 'creator'];
            const required = ['machine_id', 'operator', 'shift', 'output'];

            // Validate required fields
            const missing = required.filter(f => !Object.prototype.hasOwnProperty.call(req.body, f));
            if (missing.length > 0) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

            const { columns, placeholders, values } = dynamicPostQuery(allowed, req);
            if (placeholders.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

            const query = `
                INSERT INTO usage (${columns.join(', ')}, create_date)
                VALUES (${placeholders.join(', ')}, NOW())
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]); // Return created usage record
        } catch (error) {
            console.error('Database error (postUsage):', error);
            res.status(500).json({ error: 'Database create failed' });
        }
    }

    // =====================================================
    // UPDATE — Partially update usage record (PATCH)
    // =====================================================
    static async updateUsage(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const allowed = ['machine_id', 'operator', 'shift', 'output', 'comments', 'creator'];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);

            if (setClauses.length === 0) return res.status(400).json({ error: 'No valid fields provided for update' });

            values.push(id); // Append id for WHERE clause
            const query = `UPDATE usage SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) return res.status(404).json({ error: `No usage record found with id: ${id}` });

            res.status(200).json({ message: 'Usage record updated', updatedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (updateUsage):', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // =====================================================
    // DELETE — Remove usage record (superuser only)
    // =====================================================
    static async deleteUsage(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) return res.status(400).json({ error: 'Invalid id format' });

            const query = 'DELETE FROM usage WHERE id = $1 RETURNING *;';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) return res.status(404).json({ error: `No usage record found with id: ${id}` });

            res.status(200).json({ message: 'Usage record deleted', deletedRow: result.rows[0] });
        } catch (error) {
            console.error('Database error (deleteUsage):', error);
            res.status(500).json({ error: 'Database delete failed' });
        }
    }
}

module.exports = usageController;
