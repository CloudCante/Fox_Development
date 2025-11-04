const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

app.use(cors()); 
app.use(express.json()); 

// Temporary role mock for testing
app.use((req, res, next) => {
    req.user = { id: '16bb37e7-0ff4-4d3f-be4f-5902a6174ad1', username: 'admin', role: 'superuser' };
    next();
});

// Root route — shows API is running
app.get('/', (req, res) => {
    res.send('API server is running!');
});

// Optional health-check route
app.get('/api/health-check', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

const functionalTestingRouter = require('./routes/functionalTestingRecords');
app.use('/api/functional-testing', functionalTestingRouter);

const packingRouter = require('./routes/packingRoutes');
app.use('/api/packing', packingRouter);

const sortRecordRouter = require('./routes/sortRecord');
app.use('/api/sort-record', sortRecordRouter);

const tpyRouter = require('./routes/tpyRoutes');
app.use('/api/tpy', tpyRouter);

const snfnRouter = require('./routes/snfnRecords');
app.use('/api/snfn', snfnRouter);

const stationHourlySummaryRouter = require('./routes/stationHourlySummary');
app.use('/api/station-hourly-summary', stationHourlySummaryRouter);

const pchartRouter = require('./routes/pChart');
app.use('/api/pchart', pchartRouter);

const workstationRouter = require('./routes/workstationRoutes');
app.use('/api/workstationRoutes', workstationRouter);

const testboardRouter = require('./routes/testboardRecords');
app.use('/api/testboardRecords', testboardRouter);


// Fixture related route files
const fixturesRoutes = require('./routes/fixturesRoutes');
const healthRoutes = require('./routes/healthRoutes');
const usageRoutes = require('./routes/usageRoutes');
const usersRoutes = require('./routes/usersRoutes');
const fixtureMaintenanceRoutes = require('./routes/fixtureMaintenanceRoutes');

// Mount the routes
app.use('/api/fixtures', fixturesRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/fixture-maintenance', fixtureMaintenanceRoutes);


try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/upload', uploadHandlerRouter);
} catch (error) {
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Test DB connection after server starts
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Database connected at:', res.rows[0].now);
});