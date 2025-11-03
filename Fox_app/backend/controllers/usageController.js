// controller for usage table

// Import required libraries and modules
//const fixturesModel = require('../models/fixturesModel');
const { pool } = require('../db.js');
<<<<<<< HEAD

=======
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');
>>>>>>> origin/main
// Class for handling usage
class usageController {
   
    //READ all usage
    static async getAllUsage(req, res) {
        try {
<<<<<<< HEAD
            const query = 'SELECT * FROM usage ORDER BY fixture_id ASC;';
=======
            const query = 'SELECT * FROM usage ORDER BY id ASC;';
>>>>>>> origin/main
            const result = await pool.query(query);
            res.json(result.rows);
        }
        catch (error) {
            console.error('Database error (getAllUsage):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

<<<<<<< HEAD


    //READ Usage by ID

    static async getUsageById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid or missing id parameter' });

                const query = 'SELECT * FROM usage WHERE id = $1';

=======
    //READ Usage by ID
    static async getUsageById(req, res) {
        try {
                const id = req.params.id;
                if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
             }
                const query = 'SELECT * FROM usage WHERE id = $1';
>>>>>>> origin/main
                const result = await pool.query(query, [id]);
                if (result.rows.length === 0) return res.status(404).json({ error: `No result found for id: ${id}` });
                res.json(result.rows[0]);
        } 
        catch (error) {
            console.error('Database error (getUsageById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
        }

    //CREATE Usage
<<<<<<< HEAD

=======
>>>>>>> origin/main
    static async postUsage(req, res) {
         try {
            //allowed fields
            const allowed = ['fixture_id', 'test_slot', 'test_station', 'test_type', 'gpu_pn', 'gpu_sn', 'log_path', 'creator'];

            //required fields
            const required = ['fixture_id'];
            //check for missing required fields
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));
                if (missing.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
                }
<<<<<<< HEAD



            const columns = [];
            const placeholders = [];
            const values = [];
            let paramIndex = 1;

            for (const col of allowed) {
                if (Object.prototype.hasOwnProperty.call(req.body, col)) {
                    placeholders.push(`$${paramIndex}`);
                    values.push(req.body[col]);
                    columns.push(col);
                    paramIndex++;
                }
            }

=======
            const {columns,placeholders, values } = dynamicPostQuery(allowed, req);
>>>>>>> origin/main
            if (placeholders.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for create' });
            }
            
            const query = `
                INSERT INTO usage (${columns.join(', ')}, create_date)
            VALUES(
                ${placeholders.join(', ')},
                NOW()
            )
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            
            res.status(201).json(result.rows[0]);
          
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database create failed' });
        }
        }
     
    // UPDATE Usage allowing partial updates
    static async updateUsage(req, res) {
        try {
<<<<<<< HEAD
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                 return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            const allowed = ['fixture_id', 'test_slot', 'test_station', 'test_type', 'gpu_pn', 'gpu_sn', 'log_path', 'creator', 'create_date'];

            const setClauses = [];
            const values = [];
            let paramIndex = 1;

            for (const col of allowed) {
                if (Object.prototype.hasOwnProperty.call(req.body, col)) {
                    setClauses.push(`${col} = $${paramIndex}`);
                    values.push(req.body[col]);
                    paramIndex++;
                }
            }

            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            
            //add id 

=======
            const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            const allowed = ['fixture_id', 'test_slot', 'test_station', 'test_type', 'gpu_pn', 'gpu_sn', 'log_path', 'creator'];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);
            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            //add id 
>>>>>>> origin/main
            values.push(id);
            const query = `
                UPDATE usage
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture usage found with id: ${id}` });
            }
<<<<<<< HEAD
            res.json('Sussessfully updated fixture usage with id: ' + id + '. Updated row: ' + result.rows[0]);
=======
            res.json(`Successfully updated fixture usage with id: ${id}. Updated row: ` + result.rows[0]);
>>>>>>> origin/main
          
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }
    // DELETE Usage
    static async deleteUsage(req, res) {
        try {
<<<<<<< HEAD
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid or missing id parameter' });
=======
            const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
>>>>>>> origin/main
            const query = 'DELETE FROM usage WHERE id = $1 RETURNING *;';
            const values = [id];
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture usage found with id: ${id}` });
            }
            else {
                res.json({ message: `Fixture Usage with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
            }
        }
         catch (error) {
                console.error('Database error (deleteUsage):', error);
                res.status(500).json({ error: 'Database delete failed' });
            }
    }
}
    module.exports = usageController;
