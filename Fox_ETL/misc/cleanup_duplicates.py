import psycopg2

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def cleanup_workstation_duplicates():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        print("Cleaning up workstation_master_log duplicates...")
        
        cursor.execute("SELECT COUNT(*) FROM workstation_master_log")
        initial_count = cursor.fetchone()[0]
        print(f"Initial record count: {initial_count:,}")
        
        cleanup_query = """
        DELETE FROM workstation_master_log 
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY sn, pn, customer_pn, outbound_version, workstation_name,
                                        history_station_start_time, history_station_end_time, hours,
                                        service_flow, model, history_station_passing_status,
                                        passing_station_method, operator, first_station_start_time, data_source
                           ORDER BY id
                       ) as rn
                FROM workstation_master_log
            ) t
            WHERE rn > 1
        )
        """
        
        cursor.execute(cleanup_query)
        deleted_count = cursor.rowcount
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) FROM workstation_master_log")
        final_count = cursor.fetchone()[0]
        
        print(f"Deleted {deleted_count:,} duplicate records")
        print(f"Final record count: {final_count:,}")
        print(f"Workstation cleanup complete!")
        
        return deleted_count
        
    except Exception as e:
        print(f"Error cleaning workstation duplicates: {e}")
        conn.rollback()
        return 0
    finally:
        cursor.close()
        conn.close()

def cleanup_testboard_duplicates():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        print("Cleaning up testboard_master_log duplicates...")
        
        cursor.execute("SELECT COUNT(*) FROM testboard_master_log")
        initial_count = cursor.fetchone()[0]
        print(f"Initial record count: {initial_count:,}")
    
        cleanup_query = """
        DELETE FROM testboard_master_log 
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY sn, pn, model, work_station_process, baseboard_sn,
                                        baseboard_pn, workstation_name, history_station_start_time,
                                        history_station_end_time, history_station_passing_status,
                                        operator, failure_reasons, failure_note, failure_code,
                                        diag_version, fixture_no, data_source
                           ORDER BY id
                       ) as rn
                FROM testboard_master_log
            ) t
            WHERE rn > 1
        )
        """
        
        cursor.execute(cleanup_query)
        deleted_count = cursor.rowcount
        conn.commit()
        
        cursor.execute("SELECT COUNT(*) FROM testboard_master_log")
        final_count = cursor.fetchone()[0]
        
        print(f"Deleted {deleted_count:,} duplicate records")
        print(f"Final record count: {final_count:,}")
        print(f"Testboard cleanup complete!")
        
        return deleted_count
        
    except Exception as e:
        print(f"Error cleaning testboard duplicates: {e}")
        conn.rollback()
        return 0
    finally:
        cursor.close()
        conn.close()

def main():
    print("Starting duplicate cleanup process...")
    print("=" * 50)
    
    workstation_deleted = cleanup_workstation_duplicates()
    
    print()
    
    testboard_deleted = cleanup_testboard_duplicates()
    
    print()
    print("Cleanup Summary")
    print("=" * 50)
    print(f"Workstation duplicates removed: {workstation_deleted:,}")
    print(f"Testboard duplicates removed: {testboard_deleted:,}")
    print(f"Total duplicates removed: {workstation_deleted + testboard_deleted:,}")
    
    if workstation_deleted > 0 or testboard_deleted > 0:
        print("Database cleaned up successfully!")
        print("You can now test the import scripts again - they should show 0 new records.")
    else:
        print("No duplicates found - database is already clean!")

if __name__ == "__main__":
    main() 