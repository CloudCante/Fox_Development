import psycopg2
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
from config import DATABASE

AGGREGATE_SQL = '''
SELECT
  CASE
    WHEN model = 'Tesla SXM4' THEN '506'
    WHEN model = 'Tesla SXM5' THEN '520'
    ELSE NULL
  END AS sort_code,
  CASE
    WHEN EXTRACT(DOW FROM history_station_end_time) = 6 THEN DATE(history_station_end_time) - INTERVAL '1 day'
    WHEN EXTRACT(DOW FROM history_station_end_time) = 0 THEN DATE(history_station_end_time) - INTERVAL '2 days'
    ELSE DATE(history_station_end_time)
  END AS test_date,
  COUNT(*) AS test_count
FROM workstation_master_log
WHERE workstation_name = 'TEST'
  AND model IN ('Tesla SXM4', 'Tesla SXM5')
  AND history_station_end_time >= %s
  AND history_station_end_time < %s
GROUP BY sort_code, test_date
ORDER BY sort_code, test_date;
'''

def main():
    conn = psycopg2.connect(**DATABASE)
    try:
        with conn.cursor() as cur:
            today = datetime.utcnow().date()
            start_date = today - timedelta(days=6)
            end_date = today + timedelta(days=1)  
            print(f"Aggregating TEST data from {start_date} to {end_date - timedelta(days=1)} (inclusive)...")

            cur.execute(AGGREGATE_SQL, (start_date, end_date))
            rows = cur.fetchall()
            print(f"Aggregated {len(rows)} rows.")

            sort_data = {'506': {}, '520': {}}
            for sort_code, test_date, test_count in rows:
                if sort_code in sort_data:
                    date_str = f"{test_date.month}/{test_date.day}/{test_date.year}"
                    sort_data[sort_code][date_str] = test_count
            print("\nSORT data for frontend:")
            print(sort_data)
    finally:
        conn.close()

if __name__ == "__main__":
    main() 