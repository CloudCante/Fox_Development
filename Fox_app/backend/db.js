const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'fox_db',
    user: 'gpu_user',
    password: '',
});

pool.on('error', (err) => {
});

pool.on('connect', () => {
});

module.exports = { pool };