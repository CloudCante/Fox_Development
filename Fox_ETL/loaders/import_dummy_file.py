import sys
import os
import json
import psycopg2
from datetime import datetime
import re

# Import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATABASE

def connect_to_db():
    return psycopg2.connect(
        host=DATABASE['host'],
        database=DATABASE['database'],
        user=DATABASE['user'],
        password=DATABASE['password'],
        port=DATABASE['port']
    )

def create_table_if_not_exists(cursor):
    """Create the test_dummy_table if it doesn't exist"""
    create_table_query = """
    CREATE TABLE IF NOT EXISTS test_dummy_table (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        file_timestamp TIMESTAMP,
        json_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """
    cursor.execute(create_table_query)
    
    # Create indexes for better performance
    index_queries = [
        "CREATE INDEX IF NOT EXISTS idx_test_dummy_json_data ON test_dummy_table USING GIN (json_data);",
        "CREATE INDEX IF NOT EXISTS idx_test_dummy_filename ON test_dummy_table (filename);",
        "CREATE INDEX IF NOT EXISTS idx_test_dummy_file_timestamp ON test_dummy_table (file_timestamp);"
    ]
    
    for query in index_queries:
        cursor.execute(query)

def extract_timestamp_from_filename(filename):
    """Extract timestamp from filename like FXNC_PB-DEBUG_692-2G506-0200-0R6_1320222088828_P_BAT_20250908T133950Z.tsg"""
    # Look for pattern like 20250908T133950Z
    timestamp_match = re.search(r'(\d{8}T\d{6}Z)', filename)
    if timestamp_match:
        timestamp_str = timestamp_match.group(1)
        try:
            # Convert 20250908T133950Z to 2025-09-08T13:39:50Z
            formatted_timestamp = f"{timestamp_str[:4]}-{timestamp_str[4:6]}-{timestamp_str[6:8]}T{timestamp_str[9:11]}:{timestamp_str[11:13]}:{timestamp_str[13:15]}Z"
            return datetime.fromisoformat(formatted_timestamp.replace('Z', '+00:00'))
        except:
            return None
    return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python import_dummy_file.py /path/to/file.tsg")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.isfile(file_path):
        print(f"File not found: {file_path}")
        sys.exit(1)
    
    filename = os.path.basename(file_path)
    print(f"Importing {filename} into test_dummy_table...")
    
    conn = connect_to_db()
    try:
        # Read and parse JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        # Extract timestamp from filename
        file_timestamp = extract_timestamp_from_filename(filename)
        if not file_timestamp:
            print(f"Warning: Could not extract timestamp from filename: {filename}")
            file_timestamp = datetime.now()
        
        cursor = conn.cursor()
        
        # Create table if it doesn't exist
        create_table_if_not_exists(cursor)
        conn.commit()
        
        # Insert the data
        insert_query = """
        INSERT INTO test_dummy_table (filename, file_timestamp, json_data)
        VALUES (%s, %s, %s)
        """
        
        cursor.execute(insert_query, (filename, file_timestamp, json.dumps(json_data)))
        conn.commit()
        
        print(f"Successfully imported {filename} with {len(json_data)} JSON records")
        print(f"File timestamp: {file_timestamp}")
        
        cursor.close()
        
        # Delete the file after successful import
        try:
            os.remove(file_path)
            print(f"Deleted file: {filename}")
        except Exception as e:
            print(f"Could not delete file: {e}")
            
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from {filename}: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error importing {filename}: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
