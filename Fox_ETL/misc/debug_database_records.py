import psycopg2

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def debug_database_records():
    print("DEBUGGING DATABASE RECORDS")
    print("=" * 60)
    
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM workstation_master_log LIMIT 3")
        db_records = cursor.fetchall()
        
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'workstation_master_log' ORDER BY ordinal_position")
        columns = [col[0] for col in cursor.fetchall()]
        
        print(f"Found {len(db_records)} records in database")
        print(f"Columns: {columns}")
        
        for i, record in enumerate(db_records):
            print(f"\n--- DATABASE RECORD {i+1} ---")
            print(f"Database record data types:")
            for j, (col_name, value) in enumerate(zip(columns, record)):
                print(f"  {col_name}: {type(value).__name__} = {value}")
            
            if i == 0:
                sn = record[columns.index('sn')]
                pn = record[columns.index('pn')]
                model = record[columns.index('model')]
                
                print(f"\nTesting if this database record matches our file data...")
                print(f"  Database SN: {sn} (type: {type(sn).__name__})")
                print(f"  Database PN: {pn} (type: {type(pn).__name__})")
                print(f"  Database Model: {model} (type: {type(model).__name__})")
                
                test_query = """
                SELECT COUNT(*) FROM workstation_master_log 
                WHERE sn = %s AND pn = %s AND model = %s
                """
                cursor.execute(test_query, (sn, pn, model))
                count = cursor.fetchone()[0]
                print(f"Records with same SN/PN/Model: {count}")
        
        print(f"\n{'='*60}")

    except Exception as e:
        print(f"Error during debugging: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    debug_database_records() 