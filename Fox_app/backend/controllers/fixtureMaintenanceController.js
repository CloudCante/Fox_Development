// Import required libraries and modules
const { pool } = require('../db.js');

// Class for handling fixtures
class fixtureMaintenanceController {
    // Function to GET all the fixtures 
    static getAllMaintenances = async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM fixture_maintenance');
            res.json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database query failed' });
        }
    }
    // Function to GET a fixture by it's id
    static getMaintenanceById = async (req, res) => {
        try{
            if (!req.params.id) return res.status(400).json({ error: 'Missing required query parameters: id' });
            
            let params = [req.params.id];
            let query = `
                SELECT *
                FROM fixture_maintenance
                WHERE fixture_id = $1
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${req.params.id}`});
            res.json(result.rows);
        } catch (error){
            res.status(500).json({ error: 'Database query failed' });
        }
    }
    // Function to GET all the fixtures 
    static getWithFixtureId = async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT fm.primary_key as primary_key, 
                       f.fixture_id as fixture_id, 
                       fm.event_type as event_type,
                       fm.start_date_time as start_date_time,
                       fm.end_date_time as end_date_time,
                       fm.occurance as occurance,
                       fm.comments as comments
                FROM fixture_maintenance as fm
                JOIN fixtures as f ON fm.fixture_id = f.id
                `);
            res.json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Database query failed hellow' });
        }
    }
    // POST function to create maintenance event
    static postMaintenanceById = async (req, res) => {
        try{
            const fixtureId = parseInt(req.params.id);
            const recivedData = req.body;

            if (!fixtureId) return res.status(400).json({ error: 'Missing required query parameters: id' });

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

            let params = [fixtureId];
            let query = `
                INSERT INTO fixture_maintenance(fixture_id,${formattedKeys})
	            VALUES ($1,${formattedValues})
                RETURNING *
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${fixtureId}`});
            res.json(result.rows);
            console.log("INSERTED event: %s", JSON.stringify(result.rows));
        } catch (error){            
            res.status(500).json({ error: 'Database query failed POST request.' });
        }
    }
    // PUT function to update maintenance event by id
    static putMaintenanceById = async (req, res) => {
        try{
            const fixtureId = parseInt(req.params.id);
            if (!fixtureId) return res.status(400).json({ error: 'Missing required query parameters: id' });
                        
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
            // console.log("UPDATING FixtureId: %s Fields:: %s", fixtureId, formattedString);

            let params = [fixtureId];
            let query = `
                UPDATE fixture_maintenance 
                SET 
                    ${formattedString}
                WHERE primary_key = $1
                RETURNING *
                `;
            
            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `No results found for id: ${fixtureId}` });
            res.json(result.rows);
            console.log("UPDATED event: %s", JSON.stringify(result.rows));
        } catch (error){
            res.status(500).json({ error: 'Database query PUT request.' });
        }
    }    

    // DELETE function to remove maintenance by id
    static deleteMaintenanceById = async (req, res) => {
        try{
            const fixtureId = parseInt(req.params.id);
            if (!fixtureId) return res.status(400).json({ error: 'Missing required query parameters: id' });
            
            let params = [fixtureId];
            let query = `
                DELETE FROM fixture_maintenance 
                WHERE primary_key = $1
                RETURNING *
                `;

            const result = await pool.query(query, params);
            if (result.rows.length == 0) return res.status(404).json({ error: `Record for id: ${fixtureId} not found` });
            res.json(result.rows);
            console.log("DELETED event: %s", JSON.stringify(result.rows));
        } catch (error){
            res.status(500).json({ error: 'Database query failed for DELETE request.' });
        }
    }

}

module.exports = fixtureMaintenanceController;
