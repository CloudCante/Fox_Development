// controller for health table

// Import required libraries and modules
//const fixturesModel = require('../models/fixturesModel');
const { pool } = require('../db.js');
import { uuidRegex } from './Controller_scripts.js';

// Class for handling health
class healthController {
   
    //READ all health
    static async getAllHealth(req, res) {
        try {
            const query = 'SELECT * FROM health ORDER BY id ASC;';
            const result = await pool.query(query);
            res.json(result.rows);
        }
        catch (error) {
            console.error('Database error (getAllHealth):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

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
        } 
        catch (error) {
            console.error('Database error (getHealthById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    //CREATE Health
    static async postHealth(req, res) {
         try {
            //allowed fields
            const allowed = ['fixture_id', 'status', 'comments', 'creator'];
            //required fields
            const required = ['fixture_id'];
            //check for missing required fields
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));
                if (missing.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
                }
            //prepare columns and values for insert
            const columns = [];
            const placeholders = [];
            const values = [];
            let paramIndex = 1;
            //build query parts with provided fields in itterations
            for (const col of allowed) {
                if (Object.prototype.hasOwnProperty.call(req.body, col)) {
                    placeholders.push(`$${paramIndex}`);
                    values.push(req.body[col]);
                    columns.push(col);
                    paramIndex++;
                }
            }

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
    }
    
    // UPDATE Fixture Health allowing partial updates should be PATCH
    static async updateHealth(req, res) {
        try {
           const id = req.params.id;
            if (!uuidRegex.test(id)) {
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

            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            
            //add id 

            values.push(id);
            const query = `
                UPDATE health
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }
            res.json(`Successfully updated fixture health with id: ${id}. Updated row: ` + result.rows[0]);
          
        } 
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // DELETE Health
    static async deleteHealth(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id))  return res.status(400).json({ error: 'Invalid or missing id parameter' });
        
            const query = 'DELETE FROM health WHERE id = $1 RETURNING *;';
            const values = [id];
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture health found with id: ${id}` });
            }
            else {
                res.json({ message: `Fixture Health with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
            }
        }
         catch (error) {
                console.error('Database error (deleteHealth):', error);
                res.status(500).json({ error: 'Database delete failed' });
        }

    }
}  
    module.exports = healthController;
