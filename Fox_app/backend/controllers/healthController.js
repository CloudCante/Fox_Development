// controller for health table

// Import required libraries and modules
//const fixturesModel = require('../models/fixturesModel');
const { pool } = require('../db.js');
<<<<<<< HEAD

=======
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');
>>>>>>> origin/main
// Class for handling health
class healthController {
   
    //READ all health
    static async getAllHealth(req, res) {
        try {
<<<<<<< HEAD
            const query = 'SELECT * FROM health ORDER BY fixture_id ASC;';
=======
            const query = 'SELECT * FROM health ORDER BY id ASC;';
>>>>>>> origin/main
            const result = await pool.query(query);
            res.json(result.rows);
        }
        catch (error) {
            console.error('Database error (getAllHealth):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

<<<<<<< HEAD


    //READ Health by ID

    static async getHealthById(req, res) {
        try {
            const id = parseInt(req.params.fixture_id, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid or missing id parameter' });

                const query = 'SELECT * FROM health WHERE fixture_id = $1';

                const result = await pool.query(query, [id]);
                if (result.rows.length === 0) return res.status(404).json({ error: `No result found for id: ${id}` });
                res.json(result.rows[0]);
=======
    //READ Health by ID
    static async getHealthById(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            
            const query = 'SELECT * FROM health WHERE id = $1';

            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: `No result found for id: ${id}` });
            res.json(result.rows[0]);
>>>>>>> origin/main
        } 
        catch (error) {
            console.error('Database error (getHealthById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
<<<<<<< HEAD
        }

    //CREATE Health

=======
    }

    //CREATE Health
>>>>>>> origin/main
    static async postHealth(req, res) {
         try {
            //allowed fields
            const allowed = ['fixture_id', 'status', 'comments', 'creator'];
<<<<<<< HEAD

=======
>>>>>>> origin/main
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
                INSERT INTO health (${columns.join(', ')}, create_date)
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
<<<<<<< HEAD
        }
    
     
    // UPDATE Fixtures allowing partial updates should be PATCH
    static async updateHealth(req, res) {
        try {
            const id = parseInt(req.params.primary_key, 10);
            if (Number.isNaN(id)) {
                 return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            const allowed = ['fixture_id', 'status', 'comments', 'creator',];

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

=======
    }
    
    // UPDATE Fixture Health allowing partial updates should be PATCH
    static async updateHealth(req, res) {
        try {
           const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
                }
        
            const allowed = ['fixture_id', 'status', 'comments', 'creator',];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);
>>>>>>> origin/main
            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            
            //add id 

            values.push(id);
            const query = `
                UPDATE health
                SET ${setClauses.join(', ')}
<<<<<<< HEAD
                WHERE primary_key = $${paramIndex}
=======
                WHERE id = $${paramIndex}
>>>>>>> origin/main
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }
<<<<<<< HEAD
            res.json('Sussessfully updated fixture health with id: ' + id + '. Updated row: ' + result.rows[0]);
          
        } catch (error) {
=======
            res.json(`Successfully updated fixture health with id: ${id}. Updated row: ` + result.rows[0]);
          
        } 
        catch (error) {
>>>>>>> origin/main
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }
<<<<<<< HEAD
    // DELETE Health
    static async deleteHealth(req, res) {
        try {
            const id = parseInt(req.params.primary_key, 10);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid or missing id parameter' });
            const query = 'DELETE FROM health WHERE primary_key = $1 RETURNING *;';
=======

    // DELETE Health
    static async deleteHealth(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id))  return res.status(400).json({ error: 'Invalid or missing id parameter' });
        
            const query = 'DELETE FROM health WHERE id = $1 RETURNING *;';
>>>>>>> origin/main
            const values = [id];
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }
            else {
<<<<<<< HEAD
                res.json({ message: `Fixture Health with primary_key: ${id} deleted successfully.`, deletedRow: result.rows[0] });
=======
                res.json({ message: `Fixture Health with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
>>>>>>> origin/main
            }
        }
         catch (error) {
                console.error('Database error (deleteHealth):', error);
                res.status(500).json({ error: 'Database delete failed' });
<<<<<<< HEAD
            }
    }
}
=======
        }

    }
}  
>>>>>>> origin/main
    module.exports = healthController;
