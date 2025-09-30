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

const fixturesRouter = require('./routes/fixturesRoutes');
app.use('/api/v1/fixtures', fixturesRouter);

try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/upload', uploadHandlerRouter);
} catch (error) {
}


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
});


pool.query('SELECT NOW()', (err, res) => {
});

module.exports = {pool};