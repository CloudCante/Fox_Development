import psycopg2

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def cleanup_workstation_table():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        print("Cleaning up workstation_master_log table...")
        
        cursor.execute("DROP TABLE IF EXISTS workstation_master_log")
        
        create_query = """
        CREATE TABLE workstation_master_log (
            id SERIAL PRIMARY KEY,
            sn VARCHAR(50) NOT NULL,
            pn VARCHAR(100) NOT NULL,
            customer_pn VARCHAR(100),
            outbound_version VARCHAR(10),
            workstation_name VARCHAR(100) NOT NULL,
            history_station_start_time TIMESTAMP NOT NULL,
            history_station_end_time TIMESTAMP NOT NULL,
            hours VARCHAR(20),
            service_flow TEXT,
            model VARCHAR(100),
            history_station_passing_status VARCHAR(20),
            passing_station_method VARCHAR(50),
            operator VARCHAR(100),
            first_station_start_time TIMESTAMP,
            data_source VARCHAR(20) DEFAULT 'workstation',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        cursor.execute(create_query)
        conn.commit()
        
        print("Workstation table recreated with clean schema")
        print("Columns: sn, pn, customer_pn, outbound_version, workstation_name, history_station_start_time, history_station_end_time, hours, service_flow, model, history_station_passing_status, passing_station_method, operator, first_station_start_time, data_source")
        
    except Exception as e:
        print(f"Error recreating workstation table: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def cleanup_testboard_table():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        print("Cleaning up testboard_master_log table...")
        
        cursor.execute("DROP TABLE IF EXISTS testboard_master_log")
        
        create_query = """
        CREATE TABLE testboard_master_log (
            id SERIAL PRIMARY KEY,
            sn VARCHAR(50) NOT NULL,
            pn VARCHAR(100) NOT NULL,
            model VARCHAR(100),
            work_station_process VARCHAR(100),
            baseboard_sn VARCHAR(50),
            baseboard_pn VARCHAR(100),
            workstation_name VARCHAR(100) NOT NULL,
            history_station_start_time TIMESTAMP NOT NULL,
            history_station_end_time TIMESTAMP NOT NULL,
            history_station_passing_status VARCHAR(20),
            operator VARCHAR(100),
            failure_reasons TEXT,
            failure_note TEXT,
            failure_code VARCHAR(50),
            diag_version VARCHAR(50),
            fixture_no VARCHAR(50),
            data_source VARCHAR(20) DEFAULT 'testboard',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        cursor.execute(create_query)
        conn.commit()
        
        print("Testboard table recreated with clean schema")
        print("Columns: sn, pn, model, work_station_process, baseboard_sn, baseboard_pn, workstation_name, history_station_start_time, history_station_end_time, history_station_passing_status, operator, failure_reasons, failure_note, failure_code, diag_version, fixture_no, data_source")
        
    except Exception as e:
        print(f"Error recreating testboard table: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def main():
    print("Starting database schema cleanup...")
    print("=" * 60)
    
    cleanup_workstation_table()
    
    print()
    
    cleanup_testboard_table()
    
    print()
    print("Cleanup Summary")
    print("=" * 60)
    print("Workstation table: Removed problematic columns (day, etc.)")
    print("Testboard table: Removed problematic columns (number_of_times_baseboard_is_used, etc.)")
    print("Both tables now have clean, focused schemas")
    print("Deduplication will work correctly with only relevant columns")
    
    print("\nYou can now test the import scripts with clean tables!")

if __name__ == "__main__":
    main() 