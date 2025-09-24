"""
IMPORT SCRIPT TEMPLATE - ETL Pipeline Database Import
====================================================

This is a template/pseudo-code example showing how to create a new import script
for the Fox ETL pipeline. This template shows the standard structure that ALL
import scripts should follow, with explanations of what each section does.

HOW TO USE THIS TEMPLATE:
========================
1. Copy this file to create your new import script
2. Replace the pseudo-code sections with your actual implementation
3. Follow the numbered sections in order
4. Keep the standard structure but customize the data mapping

STANDARD IMPORT SCRIPT STRUCTURE:
=================================
1. Imports and Dependencies
2. Database Connection Function
3. Table Creation Function
4. Data Cleaning Functions
5. Main Processing Function
6. Command Line Interface
7. Error Handling and Logging

EXAMPLE USAGE:
=============
python3 import_your_file_type.py /path/to/your/file.xlsx

"""

# =============================================================================
# SECTION 1: IMPORTS AND DEPENDENCIES
# =============================================================================
# These imports are REQUIRED for all import scripts
import sys                    # For command line arguments (sys.argv[1])
import os                     # For file path operations
import pandas as pd           # For Excel file reading and data manipulation
import psycopg2              # For PostgreSQL database connection
import math                  # For mathematical operations (NaN handling)
from psycopg2.extras import execute_values  # For efficient batch database inserts

# Optional imports (add as needed):
# import logging              # For detailed logging
# from datetime import datetime  # For timestamp handling
# import numpy as np         # For advanced data operations

# =============================================================================
# SECTION 2: DATABASE CONNECTION FUNCTION
# =============================================================================
# This function is IDENTICAL in all import scripts
# DO NOT MODIFY - Copy exactly as shown

def connect_to_db():
    """
    DATABASE CONNECTION FUNCTION
    ===========================
    Establishes connection to the PostgreSQL database.
    This function is standardized across all import scripts.
    
    Returns:
        psycopg2.connection: Database connection object
        
    Database Configuration:
        Host: localhost
        Database: fox_db
        User: gpu_user
        Password: (empty)
        Port: 5432
    """
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

# =============================================================================
# SECTION 3: TABLE CREATION FUNCTION
# =============================================================================
# This function creates/verifies the database table for your data type
# CUSTOMIZE: Table name, columns, and constraints based on your data

def create_your_table_name_table(conn):
    """
    TABLE CREATION FUNCTION
    =======================
    Creates the database table for your data type if it doesn't exist.
    Also adds unique constraints to prevent duplicate records.
    
    Args:
        conn: Database connection object
        
    CUSTOMIZE THIS SECTION:
    - Change table name from 'your_table_name' to your actual table name
    - Define columns based on your Excel file structure
    - Add appropriate data types (VARCHAR, TIMESTAMP, INTEGER, etc.)
    - Create unique constraint based on your data's unique fields
    """
    print("Creating/verifying your_table_name table...")
    cursor = conn.cursor()
    
    # CREATE TABLE STATEMENT - CUSTOMIZE THIS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS your_table_name_master_log (
        id SERIAL PRIMARY KEY,                    -- Auto-incrementing primary key
        column1 VARCHAR(255) NOT NULL,            -- Required field from Excel
        column2 VARCHAR(255),                     -- Optional field from Excel
        column3 TIMESTAMP NOT NULL,               -- Timestamp field
        column4 INTEGER,                          -- Numeric field
        data_source VARCHAR(50) NOT NULL,         -- Always include this field
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Always include this
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- Always include this
    );
    """)
    
    # UNIQUE CONSTRAINT - CUSTOMIZE THIS
    # This prevents duplicate records based on your data's unique fields
    try:
        cursor.execute("""
        ALTER TABLE your_table_name_master_log 
        ADD CONSTRAINT your_table_name_unique_constraint 
        UNIQUE (column1, column2, column3, data_source);
        """)
    except Exception as e:
        print(f"Note: Unique constraint may already exist: {e}")
    
    conn.commit()
    cursor.close()

# =============================================================================
# SECTION 4: DATA CLEANING FUNCTIONS
# =============================================================================
# These functions are STANDARD and should be copied exactly
# They handle common data cleaning tasks

def clean_column_name(col_name):
    """
    CLEAN COLUMN NAMES
    ==================
    Converts Excel column names to database-friendly format.
    - Converts to lowercase
    - Replaces spaces and hyphens with underscores
    - Removes special characters
    
    Args:
        col_name (str): Original column name from Excel
        
    Returns:
        str: Cleaned column name for database
    """
    cleaned = col_name.lower().replace(' ', '_').replace('-', '_')
    cleaned = ''.join(c for c in cleaned if c.isalnum() or c == '_')
    return cleaned

def convert_timestamp(value):
    """
    CONVERT TIMESTAMP VALUES
    ========================
    Converts various timestamp formats to Python datetime objects.
    Handles pandas Timestamps, strings, and NaN values.
    
    Args:
        value: Timestamp value from Excel (various formats)
        
    Returns:
        datetime or None: Converted timestamp or None if invalid
    """
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    return pd.to_datetime(value)

def convert_empty_string(value):
    """
    CONVERT EMPTY STRINGS TO NULL
    =============================
    Converts empty strings to None (NULL in database).
    This prevents empty strings from being stored in the database.
    
    Args:
        value: String value from Excel
        
    Returns:
        str or None: Original value or None if empty
    """
    if isinstance(value, str) and value.strip() == '':
        return None
    return value

# =============================================================================
# SECTION 5: MAIN PROCESSING FUNCTION
# =============================================================================
# This is the core function that processes your Excel file
# CUSTOMIZE: Data mapping based on your Excel file structure

def main():
    """
    MAIN PROCESSING FUNCTION
    ========================
    This is the core function that processes the Excel file and imports it to the database.
    
    Process Flow:
    1. Validate command line arguments
    2. Connect to database
    3. Create/verify table structure
    4. Read Excel file
    5. Clean and map data
    6. Check for existing records (deduplication)
    7. Insert new records
    8. Clean up files
    9. Handle errors
    
    CUSTOMIZE THIS SECTION:
    - Change table creation function call
    - Modify data mapping based on your Excel columns
    - Update insert query with your table columns
    """
    
    # STEP 1: VALIDATE COMMAND LINE ARGUMENTS
    # =======================================
    if len(sys.argv) != 2:
        print("Usage: python import_your_file_type.py /path/to/file.xlsx")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    print(f"Importing {file_path} into your_table_name_master_log...")
    
    # STEP 2: CONNECT TO DATABASE
    # ===========================
    conn = connect_to_db()
    
    try:
        # STEP 3: CREATE/VERIFY TABLE
        # ===========================
        create_your_table_name_table(conn)  # CUSTOMIZE: Change function name
        
        # STEP 4: READ EXCEL FILE
        # =======================
        df = pd.read_excel(file_path)
        print(f"Successfully read file with {len(df)} rows")
        
        # Clean column names to match database schema
        df.columns = [clean_column_name(col) for col in df.columns]
        print(f"Cleaned columns: {df.columns.tolist()}")
        
        # STEP 5: MAP DATA TO DATABASE SCHEMA
        # ===================================
        # CUSTOMIZE THIS SECTION based on your Excel file structure
        mapped_data = []
        for idx, row in df.iterrows():
            # Map each Excel row to database columns
            # CUSTOMIZE: Change column names and mapping logic
            mapped_row = {
                'column1': convert_empty_string(str(row.get('excel_column_1', ''))),
                'column2': convert_empty_string(str(row.get('excel_column_2', ''))),
                'column3': convert_timestamp(row.get('excel_column_3')),
                'column4': row.get('excel_column_4', 0) if not pd.isna(row.get('excel_column_4')) else None,
                'data_source': 'your_data_source_name'  # CUSTOMIZE: Change data source name
            }
            mapped_data.append(mapped_row)
        
        # STEP 6: DEDUPLICATION CHECK
        # ===========================
        # Check for existing records to prevent duplicates
        cursor = conn.cursor()
        print(f"Checking for existing records to prevent duplicates...")
        
        existing_count = 0
        new_records = []
        
        for row in mapped_data:
            # CUSTOMIZE: Update this query to match your unique constraint fields
            check_query = """
            SELECT COUNT(*) FROM your_table_name_master_log 
            WHERE column1 = %s 
            AND column2 = %s 
            AND column3 = %s 
            AND data_source = %s
            """
            
            check_values = (
                row['column1'], 
                row['column2'], 
                row['column3'], 
                row['data_source']
            )
            
            cursor.execute(check_query, check_values)
            exists = cursor.fetchone()[0]
            
            if exists > 0:
                existing_count += 1
            else:
                new_records.append(row)
        
        print(f"Found {existing_count:,} existing records, {len(new_records):,} new records to insert")
        
        # STEP 7: INSERT NEW RECORDS
        # ==========================
        if new_records:
            # CUSTOMIZE: Update this query to match your table columns
            insert_query = """
            INSERT INTO your_table_name_master_log (
                column1, column2, column3, column4, data_source
            ) VALUES %s
            """
            
            values = [(
                row['column1'], 
                row['column2'], 
                row['column3'], 
                row['column4'], 
                row['data_source']
            ) for row in new_records]
            
            execute_values(cursor, insert_query, values)
            conn.commit()
            print(f"Imported {len(new_records):,} new records from {os.path.basename(file_path)}")
        else:
            print(f"No new records to import (all {existing_count:,} records already exist)")
        
        cursor.close()
        
        # STEP 8: CLEAN UP FILES
        # ======================
        try:
            os.remove(file_path)
            print(f"Deleted Excel file: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"Could not delete Excel file: {e}")
            
    except Exception as e:
        print(f"Error importing {os.path.basename(file_path)}: {e}")
        conn.rollback()
    finally:
        conn.close()

# =============================================================================
# SECTION 6: COMMAND LINE INTERFACE
# =============================================================================
# This section is IDENTICAL in all import scripts
# DO NOT MODIFY - Copy exactly as shown

if __name__ == "__main__":
    main()

"""
CUSTOMIZATION CHECKLIST
=======================
When creating your new import script, make sure to:

□ Change table name from 'your_table_name' to your actual table name
□ Update column definitions in CREATE TABLE statement
□ Modify unique constraint fields to match your data
□ Update data mapping in the main() function
□ Change data_source name to identify your data type
□ Update insert query columns to match your table
□ Update deduplication check query fields
□ Test with a sample file before deploying

COMMON DATA TYPES FOR COLUMNS:
==============================
VARCHAR(255)     - Text fields (names, descriptions, codes)
TIMESTAMP        - Date/time fields
INTEGER          - Whole numbers
DECIMAL(10,2)    - Decimal numbers with 2 decimal places
TEXT             - Long text fields (notes, descriptions)
BOOLEAN          - True/False values

EXAMPLE MAPPING FOR DIFFERENT DATA TYPES:
=========================================
# String field (required)
'workstation_name': convert_empty_string(str(row.get('Workstation Name', '')))

# String field (optional)
'operator': convert_empty_string(str(row.get('Operator', '')))

# Timestamp field
'start_time': convert_timestamp(row.get('Start Time'))

# Numeric field
'quantity': int(row.get('Quantity', 0)) if not pd.isna(row.get('Quantity')) else None

# Decimal field
'rate': float(row.get('Rate', 0.0)) if not pd.isna(row.get('Rate')) else None

# Boolean field
'is_passing': bool(row.get('Passing Status') == 'PASS')

# Data source identifier
'data_source': 'your_data_type_name'
"""
