# Fox Development Backend API Development - Standard Operating Procedure

## Overview
This SOP provides comprehensive step-by-step instructions for developing and maintaining backend APIs in the Fox Development system. This covers both creating new route files and adding endpoints to existing routes.

**Prerequisites**: Basic understanding of Node.js, Express.js, and PostgreSQL

## Table of Contents
1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Creating a New Route File](#creating-a-new-route-file)
3. [Adding Endpoints to Existing Routes](#adding-endpoints-to-existing-routes)
4. [Database Connection Patterns](#database-connection-patterns)
5. [Error Handling Standards](#error-handling-standards)
6. [Response Formatting Guidelines](#response-formatting-guidelines)
7. [Testing Your API](#testing-your-api)
8. [Troubleshooting](#troubleshooting)

## Backend Architecture Overview

The Fox Development backend follows a simple but effective architecture:

```
Fox_app/backend/
├── server.js          # Main server file - registers all routes
├── db.js             # Database connection configuration
├── .env              # Environment variables (DB settings)
└── routes/           # All API route files
    ├── functionalTestingRecords.js
    ├── packingRoutes.js
    ├── tpyRoutes.js
    └── ... (other route files)
```

### How Routes Work
- Each route file contains multiple API endpoints
- Routes are registered in `server.js` with a versioned base path
- **API Version**: All routes use `/api/v1/` prefix for versioning
- Full URL = Version + Base Path + Endpoint (e.g., `/api/v1/functional-testing` + `/station-performance`)
- This allows future API changes without breaking existing integrations

## Creating a New Route File

### Step 1: Create the Route File

Create a new file in the `routes/` directory following the naming convention:
- Use camelCase: `myNewRoute.js`
- Be descriptive: `qualityMetrics.js`, `productionData.js`

### Step 2: Set Up the Basic Structure

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

#################################################
#    This is where you put your API endpoints   #  
#    Each endpoint handles a specific request   #
#    and returns data to the frontend           #
#    All endpoints are accessed via /api/v1/   #
#################################################

module.exports = router;
```

### Step 3: Add Your First Endpoint

```javascript
const express = require('express');
const router = express.Router();
const { pool } = require('../db.js');

#################################################
#    GET /api/v1/my-route/endpoint-name        #
#    Description: What this endpoint does      #
#    Parameters: startDate, endDate, model     #
#    Returns: JSON array of data               #
#################################################
router.get('/endpoint-name', async (req, res) => {
    try {
        // Extract query parameters
        const { startDate, endDate, model } = req.query;
        
        // Validate required parameters
        if (!startDate || !endDate || !model) {
            return res.status(400).json({ 
                error: 'Missing required query parameters: startDate, endDate, model' 
            });
        }
        
        // Build your SQL query
        let query = `
            SELECT 
                column1,
                column2,
                column3
            FROM your_table_name
            WHERE date_column >= $1 AND date_column <= $2 AND model = $3
            ORDER BY column1
        `;
        
        // Set up parameters array (order matters!)
        let params = [startDate, endDate, model];
        
        // Execute the query
        const result = await pool.query(query, params);
        
        // Return the data
        res.json(result.rows);
        
    } catch (error) {
        // Always handle errors gracefully
        console.error('Error in endpoint-name:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 4: Register the Route in server.js

Add these lines to `server.js` in the route registration section:

```javascript
#################################################
#    Register your new route file here         #
#    This connects your route to the server    #
#    and makes it accessible via HTTP          #
#    IMPORTANT: Always use /api/v1/ prefix     #
#    Use kebab-case for route names            #
#################################################
const myNewRouter = require('./routes/myNewRoute');
app.use('/api/v1/my-route', myNewRouter);  // Note: /api/v1/ prefix required
```

### Step 5: Test Your New Route

Your new endpoint will be available at:
`http://localhost:5000/api/v1/my-route/endpoint-name?startDate=2025-01-01&endDate=2025-01-31&model=TestModel`

**Note**: All API endpoints **must** include the `/api/v1/` prefix.

## Adding Endpoints to Existing Routes

### Step 1: Open the Existing Route File

Navigate to the appropriate route file in the `routes/` directory.

### Step 2: Add Your New Endpoint

Add your new endpoint before the `module.exports = router;` line:

```javascript
#################################################
#    GET /api/v1/existing-route/new-endpoint   #
#    Description: What this new endpoint does  #
#    Parameters: param1, param2, param3        #
#    Returns: JSON object with processed data  #
#################################################
router.get('/api/v1/new-endpoint', async (req, res) => {
    try {
        // Extract and validate parameters
        const { param1, param2, param3 } = req.query;
        
        if (!param1 || !param2) {
            return res.status(400).json({ 
                error: 'Missing required parameters: param1, param2' 
            });
        }
        
        // Your SQL query here
        let query = `
            SELECT 
                field1,
                field2,
                field3
            FROM existing_table
            WHERE condition1 = $1 AND condition2 = $2
        `;
        
        let params = [param1, param2];
        const result = await pool.query(query, params);
        
        // Process the data if needed
        const processedData = result.rows.map(row => ({
            // Transform your data here
            id: row.field1,
            name: row.field2,
            value: row.field3
        }));
        
        res.json(processedData);
        
    } catch (error) {
        console.error('Error in new-endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Step 3: Test Your New Endpoint

Your new endpoint will be available at:
`http://localhost:5000/api/v1/existing-route/new-endpoint?param1=value1&param2=value2`

## Database Connection Patterns

### Standard Database Query Pattern

```javascript
#################################################
#    Standard pattern for database queries     #
#    Always use parameterized queries to       #
#    prevent SQL injection attacks             #
#    Always handle errors gracefully           #
#################################################
try {
    // 1. Extract parameters
    const { param1, param2 } = req.query;
    
    // 2. Validate parameters
    if (!param1) {
        return res.status(400).json({ error: 'Missing required parameter: param1' });
    }
    
    // 3. Build query with placeholders
    let query = `
        SELECT column1, column2, column3
        FROM table_name
        WHERE column1 = $1 AND column2 = $2
        ORDER BY column1
    `;
    
    // 4. Set up parameters array
    let params = [param1, param2];
    
    // 5. Execute query
    const result = await pool.query(query, params);
    
    // 6. Return results
    res.json(result.rows);
    
} catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
}
```

### Complex Query with Data Processing

```javascript
#################################################
#    Complex query with data processing        #
#    Use this pattern when you need to         #
#    transform or aggregate data before        #
#    sending it to the frontend                #
#################################################
try {
    const { startDate, endDate, model } = req.query;
    
    if (!startDate || !endDate || !model) {
        return res.status(400).json({ 
            error: 'Missing required parameters: startDate, endDate, model' 
        });
    }
    
    let query = `
        SELECT 
            workstation_name,
            SUM(pass) AS total_pass,
            SUM(fail) AS total_fail,
            CASE WHEN SUM(pass) + SUM(fail) = 0 THEN 0
                 ELSE ROUND(SUM(fail)::numeric / (SUM(pass) + SUM(fail)), 3)
            END AS failure_rate
        FROM testboard_station_performance_daily
        WHERE end_date >= $1 AND end_date <= $2 AND model = $3
        GROUP BY workstation_name
        ORDER BY workstation_name
    `;
    
    let params = [startDate, endDate, model];
    const result = await pool.query(query, params);
    
    // Process the data
    const processedData = result.rows.map(row => ({
        workstation: row.workstation_name,
        passCount: row.total_pass,
        failCount: row.total_fail,
        failureRate: row.failure_rate,
        totalTests: row.total_pass + row.total_fail
    }));
    
    res.json(processedData);
    
} catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: error.message });
}
```

## Error Handling Standards

### Standard Error Handling Pattern

```javascript
#################################################
#    Always use this error handling pattern    #
#    It provides consistent error responses     #
#    and helps with debugging                  #
#################################################
try {
    // Your code here
    
} catch (error) {
    // Log the error for debugging
    console.error('Error in endpoint-name:', error);
    
    // Return appropriate error response
    res.status(500).json({ 
        error: error.message,
        timestamp: new Date().toISOString()
    });
}
```

### Common Error Scenarios

```javascript
#################################################
#    Handle these common error scenarios      #
#    Missing parameters, invalid data, etc.    #
#################################################

// Missing required parameters
if (!startDate || !endDate) {
    return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
    });
}

// Invalid date format
const startDateObj = new Date(startDate);
if (isNaN(startDateObj.getTime())) {
    return res.status(400).json({ 
        error: 'Invalid date format for startDate' 
    });
}

// No data found
if (result.rows.length === 0) {
    return res.status(404).json({ 
        error: 'No data found for the specified criteria' 
    });
}
```

## Response Formatting Guidelines

### Standard Response Formats

```javascript
#################################################
#    Use these standard response formats       #
#    for consistency across all endpoints      #
#################################################

// Success with data array
res.json(result.rows);

// Success with processed data
res.json({
    data: processedData,
    count: processedData.length,
    timestamp: new Date().toISOString()
});

// Error response
res.status(400).json({ 
    error: 'Error message here',
    timestamp: new Date().toISOString()
});

// Success with metadata
res.json({
    data: result.rows,
    metadata: {
        totalRecords: result.rows.length,
        queryTime: Date.now() - startTime,
        parameters: { startDate, endDate, model }
    }
});
```

## Testing Your API

### Step 1: Start the Backend Server

```bash
cd Fox_app/backend
npm start
```

### Step 2: Test with curl

```bash
# Test GET endpoint
curl "http://localhost:5000/api/v1/your-route/endpoint?startDate=2025-01-01&endDate=2025-01-31&model=TestModel"

# Test with different parameters
curl "http://localhost:5000/api/v1/your-route/endpoint?startDate=2025-02-01&endDate=2025-02-28&model=AnotherModel"
```

### Step 3: Test Error Handling

```bash
# Test missing parameters
curl "http://localhost:5000/api/v1/your-route/endpoint"

# Test invalid parameters
curl "http://localhost:5000/api/v1/your-route/endpoint?startDate=invalid&endDate=2025-01-31&model=TestModel"
```

### Step 4: Test in Browser

Open your browser and navigate to:
`http://localhost:5000/api/v1/your-route/endpoint?startDate=2025-01-01&endDate=2025-01-31&model=TestModel`

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot find module" error
**Solution**: Check that your route file is properly exported and the path in `server.js` is correct.

#### Issue: Database connection errors
**Solution**: Verify your `.env` file has the correct database settings and PostgreSQL is running.

#### Issue: "Missing required parameters" error
**Solution**: Check that all required query parameters are being passed in the URL.

#### Issue: Empty results
**Solution**: Verify your SQL query is correct and the data exists in the database.

#### Issue: Server won't start
**Solution**: Check for syntax errors in your route files and ensure all dependencies are installed.

### Debugging Tips

```javascript
#################################################
#    Add these debugging statements to help    #
#    troubleshoot issues during development    #
#################################################

// Log incoming parameters
console.log('Received parameters:', req.query);

// Log SQL query and parameters
console.log('Executing query:', query);
console.log('With parameters:', params);

// Log result count
console.log('Query returned', result.rows.length, 'rows');

// Log first few results
console.log('First few results:', result.rows.slice(0, 3));
```

## Best Practices

### Code Organization
- Keep route files focused on a single domain (e.g., all packing-related endpoints in one file)
- Use descriptive endpoint names
- Add comprehensive comments explaining what each endpoint does

### Performance
- Use parameterized queries to prevent SQL injection
- Add appropriate database indexes for frequently queried columns
- Consider pagination for large result sets

### Security
- Always validate input parameters
- Use environment variables for sensitive configuration
- Never expose database credentials in code

### Maintenance
- Keep error messages helpful but not too verbose
- Log errors for debugging but don't expose sensitive information
- Document any special requirements or dependencies

---

**Note**: This SOP should be updated whenever new patterns or standards are established for the Fox Development backend system.
