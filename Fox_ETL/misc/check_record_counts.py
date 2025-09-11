import psycopg2

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def check_record_counts():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT COUNT(*) FROM workstation_master_log")
        workstation_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM testboard_master_log")
        testboard_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT sn) FROM workstation_master_log")
        unique_workstation_sn = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT sn) FROM testboard_master_log")
        unique_testboard_sn = cursor.fetchone()[0]
        
        print("Database Record Counts")
        print("=" * 40)
        print(f"Workstation Master Log:")
        print(f"  Total records: {workstation_count:,}")
        print(f"  Unique serial numbers: {unique_workstation_sn:,}")
        print()
        print(f"Testboard Master Log:")
        print(f"  Total records: {testboard_count:,}")
        print(f"  Unique serial numbers: {unique_testboard_sn:,}")
        print()
        print(f"Combined Total: {workstation_count + testboard_count:,} records")
        
        cursor.execute("""
            SELECT COUNT(*) FROM workstation_master_log 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        """)
        recent_workstation = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT COUNT(*) FROM testboard_master_log 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
        """)
        recent_testboard = cursor.fetchone()[0]
        
        print()
        print("Recent Activity (Last 24 Hours)")
        print("=" * 40)
        print(f"Workstation records added: {recent_workstation:,}")
        print(f"Testboard records added: {recent_testboard:,}")
        
    except Exception as e:
        print(f"Error checking record counts: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    check_record_counts() 