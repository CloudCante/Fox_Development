#!/usr/bin/env python3
"""
Query all RECEIVE records from workstation_master_log for a given date and hours 20-23.
Usage: python query_receive_by_hour.py 2025-07-07
"""
import sys
import psycopg2
from datetime import datetime, timedelta

DB_CONFIG = {
    'host': 'localhost',
    'database': 'fox_db',
    'user': 'gpu_user',
    'password': '',
    'port': '5432'
}

def main():
    if len(sys.argv) != 2:
        print("Usage: python query_receive_by_hour.py YYYY-MM-DD")
        sys.exit(1)
    date_str = sys.argv[1]
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    except Exception:
        print("Invalid date format. Use YYYY-MM-DD.")
        sys.exit(1)
    start_dt = date_obj.replace(hour=20, minute=0, second=0)
    end_dt = date_obj + timedelta(days=1)
    end_dt = end_dt.replace(hour=0, minute=0, second=0)

    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT sn, history_station_end_time, EXTRACT(HOUR FROM history_station_end_time) AS hour
                FROM workstation_master_log
                WHERE workstation_name = 'RECEIVE'
                  AND history_station_end_time >= %s
                  AND history_station_end_time < %s
                ORDER BY history_station_end_time;
            """, (start_dt, end_dt))
            rows = cur.fetchall()
            print(f"RECEIVE records for {date_str} between 20:00 and 23:59:")
            print(f"{'sn':<20} {'end_time':<20} {'hour':<4}")
            print('-' * 50)
            for sn, end_time, hour in rows:
                print(f"{sn:<20} {end_time}   {int(hour):<4}")
            print(f"\nTotal records: {len(rows)}")
    finally:
        conn.close()

if __name__ == "__main__":
    main() 