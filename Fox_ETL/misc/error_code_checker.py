import psycopg2
from datetime import datetime

def connect_to_db():
    return psycopg2.connect(
        host="localhost",
        database="fox_db",
        user="gpu_user",
        password="",
        port="5432"
    )

def check_failure_data():
    conn = connect_to_db()
    try:
        cursor = conn.cursor()
        
        query = """
        WITH RankedFailures AS (
            SELECT 
                sn,
                workstation_name,
                history_station_end_time,
                history_station_passing_status,
                failure_code,
                failure_reasons,
                failure_note,
                ROW_NUMBER() OVER (PARTITION BY sn ORDER BY history_station_end_time DESC) as rn
            FROM testboard_master_log
            WHERE DATE(history_station_end_time) = '2025-07-21'
            AND history_station_passing_status != 'Pass'
        )
        SELECT 
            sn,
            workstation_name,
            history_station_end_time,
            history_station_passing_status,
            failure_code,
            failure_reasons,
            failure_note
        FROM RankedFailures
        WHERE rn = 1
        ORDER BY history_station_end_time DESC;
        """
        
        cursor.execute(query)
        results = cursor.fetchall()
        
        print(f"\nFailure Data Analysis for July 21, 2025:")
        print(f"Total failed units: {len(results)}")
        
        # Count how many have data in each field
        has_failure_code = sum(1 for r in results if r[4] is not None and r[4].strip())
        has_failure_reasons = sum(1 for r in results if r[5] is not None and r[5].strip())
        has_failure_note = sum(1 for r in results if r[6] is not None and r[6].strip())
        
        print(f"\nField Population Analysis:")
        print(f"Records with Failure Code: {has_failure_code} ({(has_failure_code/len(results)*100 if results else 0):.1f}%)")
        print(f"Records with Failure Reasons: {has_failure_reasons} ({(has_failure_reasons/len(results)*100 if results else 0):.1f}%)")
        print(f"Records with Failure Note: {has_failure_note} ({(has_failure_note/len(results)*100 if results else 0):.1f}%)")
        
        print("\nSample of Records (first 5):")
        for r in results[:5]:
            print("\nSerial Number:", r[0])
            print("Workstation:", r[1])
            print("Time:", r[2])
            print("Status:", r[3])
            print("Failure Code:", r[4] if r[4] else "None")
            print("Failure Reasons:", r[5] if r[5] else "None")
            print("Failure Note:", r[6] if r[6] else "None")
            print("-" * 50)
            
    finally:
        conn.close()

if __name__ == "__main__":
    check_failure_data()