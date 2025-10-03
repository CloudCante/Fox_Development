// Import required libraries and modules
const { pool } = require('../db.js');

// Class for handling fixtures
class fixturesController {
    // Function to GET all the fixtures 
    static getAllFixtures = async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT * 
                FROM fixtures 
                WHERE tester_type = 'B Tester'
                ORDER BY fixture_id ASC
                `);
            res.json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }
    // Function to GET a fixture by it's id
    static getFixtureById = async (req, res) => {
        try{
            if (!req.params.id) return res.status(400).json({ error: 'Missing required query parameters: id' });
            
            let params = [req.params.id];
            let query = `
                SELECT *
                FROM fixtures
                WHERE fixture_id = $1
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${req.params.id}`});
            res.json(result.rows);
        } catch (error){
            res.status(500).json({ error: 'Database query failed' });
        }
    }
    // POST function to create maintenance event
    static postFixtureById = async (req, res) => {
        try{
            if (!req.params.id) return res.status(400).json({ error: 'Missing required query parameters: id' });
            const fixtureId = parseInt(req.params.id);
            const recivedData = req.body;
            let formattedKeys = '';
            let formattedValues = '';

            // Loop through the properties of the req.body object and build string of fields to update
            for (const key in recivedData) {
                if (Object.prototype.hasOwnProperty.call(recivedData, key)) {
                const value = recivedData[key];

                const lastKeyAt = Object.keys(recivedData).at(-1);
                if (lastKeyAt == key){
                    // Append key-value pair with NO comma
                    formattedKeys += `${key}`;
                    formattedValues += `'${value}'`;
                    continue;
                }
                // Append a key-value pair with a comma
                formattedKeys += `${key},`;
                formattedValues += `'${value}',`;
                }                
            }
            console.log("Keys to INSERT: %s", formattedKeys);
            console.log("Values to INSERT: %s", formattedValues);

            let params = [fixtureId];
            let query = `
                INSERT INTO fixtures(fixture_id,${formattedKeys})
	            VALUES ($1,${formattedValues})
                RETURNING *
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${fixtureId}`});
            res.json(result.rows);
            console.log("Event inserted: %s", JSON.stringify(result.rows));
        } catch (error){            
            res.status(500).json({ error: 'Database query failed' });
        }
    }
    // PUT function to update maintenance event by id
    static putFixtureById = async (req, res) => {
        try{
            if (!req.params.id) return res.status(400).json({ error: 'Missing required query parameters: id' });
            
            const fixtureId = parseInt(req.params.id);
            const recivedData = req.body;
            let formattedString = '';

            // Loop through the properties of the req.body object and build string of fields to update
            for (const key in recivedData) {
                if (Object.prototype.hasOwnProperty.call(recivedData, key)) {
                const value = recivedData[key];

                const lastKeyAt = Object.keys(recivedData).at(-1);
                if (lastKeyAt == key){
                    // Append key-value pair with NO comma
                    formattedString += `${key} = '${value}'`;
                    continue;
                }
                // Append a key-value pair with a comma
                formattedString += `${key} = '${value}',`;
                }                
            }
            console.log("Fields to UPDATE: %s", formattedString);

            let params = [fixtureId];
            let query = `
                UPDATE fixtures
                SET 
                    ${formattedString}
                WHERE fixture_id = $1
                RETURNING *
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${fixtureId}`});
            res.json(result.rows);
            console.log("Event updated: %s", JSON.stringify(result.rows));
        } catch (error){
            res.status(500).json({ error: 'Database query failed' });
        }
    }    
    // DELETE function to remove maintenance by id
    static deleteFixtureById = async (req, res) => {
        try{
            if (!req.params.id) return res.status(400).json({ error: 'Missing required query parameters: id' });
            
            let params = [req.params.id];
            let query = `
                DELETE FROM fixtures
                WHERE fixture_id = $1
                RETURNING *
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${req.params.id}`});
            res.json(result.rows);
            console.log("Event deleted: %s", JSON.stringify(result.rows));
        } catch (error){
            res.status(500).json({ error: 'Database query failed' });
        }
    }

}

module.exports = fixturesController;
