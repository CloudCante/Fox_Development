// controller for fixtures table

// Import required libraries and modules
//const fixturesModel = require('../models/fixturesModel');
const { pool } = require('../db.js');
const { uuidRegex, dynamicQuery, dynamicPostQuery } = require('./controllerUtilities.js');

// Class for handling fixtures
class fixturesController {
    //READ all fixtures
    static async getAllFixtures(req, res) {
        try {
            const query = 'SELECT * FROM fixtures ORDER BY id ASC;';
            const result = await pool.query(query);
            res.json(result.rows);
        }
        catch (error) {
            console.error('Database error (getAllHealth):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    //READ Fixtures by ID
    static async getFixtureById(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
            }
            const query = 'SELECT * FROM fixtures WHERE id = $1';
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) return res.status(404).json({ error: `No result found for id: ${id}` });
            res.json(result.rows[0]);
        } 
        catch (error) {
            console.error('Database error (getHealthById):', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }

    //CREATE Fixture
    static async postFixture(req, res) {
         try {
            //allowed fields
            const allowed = ['tester_type', 'fixture_name', 'rack', 'fixture_sn', 'test_type', 'ip_address', 'mac_address', 'creator'];

            //required fields
            const required = ['fixture_name'];
            //check for missing required fields
            const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));
                if (missing.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
                }
            const {columns, placeholders, values } = dynamicPostQuery(allowed, req);
            if (placeholders.length === 0) { //no valid fields provided
                return res.status(400).json({ error: 'No valid fields provided for create' });
            }
            const query = `
                INSERT INTO fixtures (${columns.join(', ')}, create_date)
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
     
    // UPDATE Fixtures allowing partial updates should be PATCH
    static async updateFixtures(req, res) {
        try {
           const id = req.params.id;
            if (!uuidRegex.test(id)) { //validate UUID format
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
                }
        
            const allowed = ['tester_type', 'fixture_name', 'rack', 'fixture_sn', 'test_type', 'ip_address', 'mac_address', 'creator'];
            const { setClauses, values, paramIndex } = dynamicQuery(allowed, req);
            if (setClauses.length === 0) {
                return res.status(400).json({ error: 'No valid fields provided for update' });
            }
            
            //add id 

            values.push(id);
            const query = `
                UPDATE fixtures
                SET ${setClauses.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *;
            `;

            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture found with id: ${id}` });
            }
            res.json(`Successfully updated fixture with id: ${id}. Updated row: ` + result.rows[0]);
          
        } 
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    }

    // DELETE Fixture
    static async deleteFixture(req, res) {
        try {
            const id = req.params.id;
            if (!uuidRegex.test(id))  
                return res.status(400).json({ error: 'Invalid or missing id parameter' });
        
            const query = 'DELETE FROM fixtures WHERE id = $1 RETURNING *;';
            const values = [id];
            const result = await pool.query(query, values);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `No fixture found with id: ${id}` });
            }
            else {
                res.json({ message: `Fixture with id: ${id} deleted successfully.`, deletedRow: result.rows[0] });
            }
        }
         catch (error) {
                console.error('Database error (deleteFixture):', error);
                res.status(500).json({ error: 'Database delete failed' });
        }

    }
}
    
    module.exports = fixturesController;
