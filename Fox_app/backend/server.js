const express = require('express');
const cors = require('cors'); 
const { pool } = require('./db.js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

/*#################################################
#    Global Error Handling Setup               #
#    These handlers catch uncaught exceptions  #
#    and unhandled promise rejections to       #
#    prevent the server from crashing          #
#################################################*/

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
});

/*#################################################
#    Middleware Configuration                   #
#    CORS allows frontend to make requests     #
#    express.json() parses JSON request bodies #
#################################################*/
app.use(cors()); 
app.use(express.json()); 

/*#################################################
#    API Route Registration                     #
#    All API endpoints are registered here     #
#    Each route file contains multiple         #
#    endpoints for a specific domain           #
#    Format: /api/domain-name/endpoint         #
#################################################*/
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

const dashboardRouter = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRouter);

/*#################################################
#    Optional Route Registration                #
#    Upload handler is wrapped in try-catch    #
#    in case the file doesn't exist or has     #
#    errors - this prevents server startup     #
#    from failing due to missing dependencies  #
#################################################*/
try {
    const uploadHandlerRouter = require('./routes/uploadHandler');
    app.use('/api/upload', uploadHandlerRouter);
} catch (error) {
}


/*#################################################
#    Server Startup and Database Connection     #
#    Server starts on PORT 5000 (or env var)   #
#    Database connection is tested on startup   #
#    to ensure everything is working properly   #
#################################################*/
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
});


pool.query('SELECT NOW()', (err, res) => {
});

module.exports = {pool};