import psycopg2
import pandas as pd
import os

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def debug_comparison():
    print("DEBUGGING COMPARISON LOGIC")
    print("=" * 60)
    
    file_path = "/home/cloud/projects/ETL_V2/input/workstationOutputReport.xlsx"
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    print(f"Reading file: {file_path}")
    df = pd.read_excel(file_path)
    
    df.columns = [col.lower().replace(' ', '_').replace('-', '_') for col in df.columns]
    df['data_source'] = 'workstation'
    
    row = df.iloc[0]
    print(f"\nTesting first record from file:")
    
    mapped_row = {
        'sn': str(row.get('sn', '')),
        'pn': str(row.get('pn', '')),
        'model': str(row.get('model', '')),
        'work_station_process': str(row.get('work_station_process', '')),
        'baseboard_sn': str(row.get('baseboard_sn', '')),
        'baseboard_pn': str(row.get('baseboard_pn', '')),
        'number_of_times_baseboard_is_used': row.get('number_of_times_baseboard_is_used'),
        'workstation_name': str(row.get('workstation_name', '')),
        'history_station_start_time': pd.to_datetime(row.get('history_station_start_time')).to_pydatetime(),
        'history_station_end_time': pd.to_datetime(row.get('history_station_end_time')).to_pydatetime(),
        'history_station_passing_status': str(row.get('history_station_passing_status', '')),
        'operator': str(row.get('operator', '')),
        'failure_reasons': str(row.get('failure_reasons', '')),
        'failure_note': str(row.get('failure_note', '')),
        'failure_code': str(row.get('failure_code', '')),
        'diag_version': str(row.get('diag_version', '')),
        'fixture_no': str(row.get('fixture_no', '')),
        'customer_pn': str(row.get('customer_pn', '')),
        'outbound_version': str(row.get('outbound_version', '')),
        'hours': str(row.get('hours', '')),
        'service_flow': str(row.get('service_flow', '')),
        'passing_station_method': str(row.get('passing_station_method', '')),
        'first_station_start_time': pd.to_datetime(row.get('first_station_start_time')).to_pydatetime() if pd.notna(row.get('first_station_start_time')) else None,
        'data_source': 'workstation'
    }
    
    print(f"File record data:")
    for key, value in mapped_row.items():
        print(f"  {key}: {type(value).__name__} = {value}")
    
    conn = connect_to_db()
    cursor = conn.cursor()
    
    try:
        check_query = """
        SELECT COUNT(*) FROM workstation_master_log 
        WHERE sn = %s 
        AND pn = %s 
        AND model = %s 
        AND work_station_process = %s 
        AND baseboard_sn = %s 
        AND baseboard_pn = %s 
        AND number_of_times_baseboard_is_used = %s 
        AND workstation_name = %s 
        AND history_station_start_time = %s 
        AND history_station_end_time = %s 
        AND history_station_passing_status = %s 
        AND operator = %s 
        AND failure_reasons = %s 
        AND failure_note = %s 
        AND failure_code = %s 
        AND diag_version = %s 
        AND fixture_no = %s 
        AND customer_pn = %s 
        AND outbound_version = %s 
        AND hours = %s 
        AND service_flow = %s 
        AND passing_station_method = %s 
        AND first_station_start_time = %s 
        AND data_source = %s
        """
        
        check_values = (
            mapped_row['sn'], mapped_row['pn'], mapped_row['model'], mapped_row['work_station_process'], 
            mapped_row['baseboard_sn'], mapped_row['baseboard_pn'], mapped_row['number_of_times_baseboard_is_used'], 
            mapped_row['workstation_name'], mapped_row['history_station_start_time'], mapped_row['history_station_end_time'], 
            mapped_row['history_station_passing_status'], mapped_row['operator'], mapped_row['failure_reasons'], 
            mapped_row['failure_note'], mapped_row['failure_code'], mapped_row['diag_version'], mapped_row['fixture_no'], 
            mapped_row['customer_pn'], mapped_row['outbound_version'], mapped_row['hours'], mapped_row['service_flow'], 
            mapped_row['passing_station_method'], mapped_row['first_station_start_time'], mapped_row['data_source']
        )
        
        print(f"\nRunning exact comparison query...")
        print(f"Query values:")
        for i, (key, value) in enumerate(mapped_row.items()):
            print(f"  {i+1}. {key}: {type(value).__name__} = {value}")
        
        cursor.execute(check_query, check_values)
        exists = cursor.fetchone()[0]
        print(f"\nDatabase matches found: {exists}")
        
        if exists == 0:
            print(f"\nNo matches found. Let's check what's actually in the database...")
            
            cursor.execute("SELECT COUNT(*) FROM workstation_master_log WHERE sn = %s", (mapped_row['sn'],))
            sn_count = cursor.fetchone()[0]
            print(f"Records with same SN ({mapped_row['sn']}): {sn_count}")
            
            if sn_count > 0:
                cursor.execute("SELECT * FROM workstation_master_log WHERE sn = %s LIMIT 1", (mapped_row['sn'],))
                db_record = cursor.fetchone()
                
                cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'workstation_master_log' ORDER BY ordinal_position")
                columns = [col[0] for col in cursor.fetchall()]
                
                print(f"\nDatabase record with same SN:")
                for i, (col_name, value) in enumerate(zip(columns, db_record)):
                    print(f"  {col_name}: {type(value).__name__} = {value}")
                
                print(f"\nTesting simpler comparison...")
                simple_query = """
                SELECT COUNT(*) FROM workstation_master_log 
                WHERE sn = %s AND pn = %s AND model = %s AND workstation_name = %s
                """
                cursor.execute(simple_query, (mapped_row['sn'], mapped_row['pn'], mapped_row['model'], mapped_row['workstation_name']))
                simple_count = cursor.fetchone()[0]
                print(f"Simple comparison matches: {simple_count}")
        
        print(f"\n{'='*60}")
        
    except Exception as e:
        print(f"Error during debugging: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    debug_comparison() 