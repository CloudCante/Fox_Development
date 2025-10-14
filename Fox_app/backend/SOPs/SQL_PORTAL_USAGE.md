# SQL Portal API - Usage Guide

## Overview
The SQL Portal provides read-only access to the Fox database for data analysis and querying. It uses a dedicated `fox_observer` database user with SELECT-only permissions for security.

**Base URL:** `http://localhost:5000/api/v1/sql-portal`

---

## Database Security
- **User:** `fox_observer` (read-only)
- **Password:** `observe2025`
- **Permissions:** SELECT only on all tables
- **Protection:** Cannot DELETE, INSERT, UPDATE, or ALTER data

---

## Available Endpoints

### 1. List All Tables
**GET** `/tables`

Returns all available tables in the database with column counts.

**Example:**
```bash
curl http://localhost:5000/api/v1/sql-portal/tables
```

**Response:**
```json
{
  "success": true,
  "tables": [
    {
      "table_name": "testboard_master_log",
      "column_count": "20"
    },
    {
      "table_name": "workstation_master_log",
      "column_count": "18"
    }
  ]
}
```

---

### 2. Get Table Information
**GET** `/table-info/:tableName`

Returns detailed structure, row count, and sample data for a specific table.

**Example:**
```bash
curl http://localhost:5000/api/v1/sql-portal/table-info/testboard_master_log
```

**Response:**
```json
{
  "success": true,
  "tableName": "testboard_master_log",
  "rowCount": 329237,
  "columns": [
    {
      "column_name": "sn",
      "data_type": "character varying",
      "character_maximum_length": 255,
      "is_nullable": "NO"
    }
  ],
  "sampleData": [ /* 5 sample rows */ ]
}
```

---

### 3. Execute Custom SQL Query
**POST** `/query`

Execute custom SELECT queries against the database.

**Security:** Only SELECT queries allowed. DELETE, INSERT, UPDATE, DROP, etc. are blocked.

**Request Body:**
```json
{
  "sql": "SELECT sn, pn, workstation_name FROM testboard_master_log WHERE sn = '1652324037004'"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/query \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT sn, pn, workstation_name FROM testboard_master_log LIMIT 10"}'
```

**Response:**
```json
{
  "success": true,
  "rowCount": 10,
  "rows": [ /* query results */ ],
  "executionTime": "5ms",
  "fields": [ /* column metadata */ ]
}
```

---

### 4. Serial Number Lookup
**POST** `/serial-lookup`

Search for serial numbers across both testboard and workstation master logs.

**Request Body:**
```json
{
  "serialNumbers": ["1652324037004", "1652124095791"]
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/serial-lookup \
  -H "Content-Type: application/json" \
  -d '{"serialNumbers":["1652324037004"]}'
```

**Response:**
```json
{
  "success": true,
  "serialNumbers": ["1652324037004"],
  "testboard": {
    "count": 17,
    "records": [ /* testboard records */ ]
  },
  "workstation": {
    "count": 5,
    "records": [ /* workstation records */ ]
  }
}
```

---

### 5. Serial Number Production History
**POST** `/serial-history`

Get complete production history for serial numbers with optional date filtering.

**Request Body:**
```json
{
  "serialNumbers": ["1652324037004"],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Note:** `startDate` and `endDate` are optional.

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/serial-history \
  -H "Content-Type: application/json" \
  -d '{"serialNumbers":["1652324037004"],"startDate":"2025-07-01","endDate":"2025-07-31"}'
```

**Response:**
```json
{
  "success": true,
  "serialNumbers": ["1652324037004"],
  "recordCount": 22,
  "history": [
    {
      "sn": "1652324037004",
      "pn": "692-2G520-0200-500",
      "workstation_name": "FPF",
      "history_station_start_time": "2025-07-23T17:44:32.000Z",
      "history_station_passing_status": "Pass",
      "source": "testboard"
    }
  ]
}
```

---

### 6. Failure Code Lookup
**POST** `/failure-lookup`

Search for records by failure reasons or codes within a date range.

**Request Body:**
```json
{
  "failureCodes": ["ERR_MEMORY_FAIL", "ERR_GPU_TIMEOUT"],
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/failure-lookup \
  -H "Content-Type: application/json" \
  -d '{"failureCodes":["ERR_MEMORY"],"startDate":"2025-07-01","endDate":"2025-07-31"}'
```

---

## Common Use Cases

### Find all records for a serial number
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/serial-lookup \
  -H "Content-Type: application/json" \
  -d '{"serialNumbers":["YOUR_SERIAL_HERE"]}'
```

### Get recent failures for a specific part number
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/query \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT sn, failure_reasons, history_station_start_time FROM testboard_master_log WHERE pn = '\''692-2G520-0200-500'\'' AND history_station_passing_status = '\''Fail'\'' ORDER BY history_station_start_time DESC LIMIT 20"}'
```

### Count records by workstation
```bash
curl -X POST http://localhost:5000/api/v1/sql-portal/query \
  -H "Content-Type: application/json" \
  -d '{"sql":"SELECT workstation_name, COUNT(*) FROM testboard_master_log GROUP BY workstation_name ORDER BY COUNT(*) DESC"}'
```

---

## Master Log Table Structures

### testboard_master_log
Key columns:
- `sn` - Serial number
- `pn` - Part number
- `model` - Product model
- `workstation_name` - Test station name
- `history_station_start_time` - Start timestamp
- `history_station_end_time` - End timestamp
- `history_station_passing_status` - Pass/Fail status
- `operator` - Operator name
- `failure_reasons` - Failure description
- `failure_code` - Error code
- `fixture_no` - Fixture identifier
- `diag_version` - Diagnostic version

### workstation_master_log
Key columns:
- `sn` - Serial number
- `pn` - Part number
- `model` - Product model
- `workstation_name` - Station name
- `history_station_start_time` - Start timestamp
- `history_station_end_time` - End timestamp
- `history_station_passing_status` - Pass/Fail status
- `operator` - Operator name
- `service_flow` - Service flow type
- `customer_pn` - Customer part number
- `outbound_version` - Outbound software version

---

## Future Enhancements

### Write Access (Coming Soon)
When write access is needed, new endpoints will be added with:
- Specific table/column whitelisting
- Additional authentication
- Audit logging
- Parameter validation

Example future endpoints:
- `POST /write/custom-table` - Insert records to specific tables
- `PUT /update/custom-table` - Update specific records
- `POST /export/custom-query` - Export large datasets

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

Common error codes:
- `400` - Bad request (missing/invalid parameters)
- `403` - Forbidden (query contains restricted operations)
- `404` - Not found (table doesn't exist)
- `500` - Server error (database or query execution error)

---

## Tips for Your Coworker

1. **Start by exploring tables:**
   ```
   GET /tables
   GET /table-info/testboard_master_log
   ```

2. **Use serial lookup for quick searches:**
   Paste multiple serial numbers to check their history across all stations.

3. **Write custom queries for analysis:**
   The `/query` endpoint supports full SELECT syntax including JOINs, GROUP BY, ORDER BY, etc.

4. **Be mindful of query size:**
   Add `LIMIT` clauses to large queries to avoid timeouts.

5. **Use date filtering:**
   Add date ranges to speed up queries on large tables.

---

## Security Notes

- This user (`fox_observer`) has **read-only** access
- Cannot modify, delete, or insert data
- All write operations are blocked at both the route level and database level
- When write access is needed in the future, it will be through separate authenticated endpoints

