import psycopg2
from psycopg2.extras import execute_values
<<<<<<< HEAD

DB_CONFIG = {
    'host': 'localhost',
    'database': 'fox_db',
    'user': 'gpu_user',
    'password': '',
    'port': '5432'
}

CREATE_TABLE_SQL = '''
CREATE TABLE IF NOT EXISTS fixture_performance_daily (
    day DATE NOT NULL,
    fixture_no TEXT NOT NULL,
    model TEXT,
    pn TEXT,
    workstation_name TEXT,
    pass INTEGER NOT NULL,
    fail INTEGER NOT NULL,
    total INTEGER NOT NULL,
    PRIMARY KEY (day, fixture_no, model, pn, workstation_name)
);
'''
=======
import sys
import os
# Add Fox_ETL directory to path to find config.py
current_dir = os.path.dirname(os.path.abspath(__file__))
while current_dir != '/':
    config_path = os.path.join(current_dir, 'config.py')
    if os.path.exists(config_path):
        sys.path.insert(0, current_dir)
        break
    current_dir = os.path.dirname(current_dir)
from config import DATABASE
>>>>>>> origin/main

AGGREGATE_SQL = '''
SELECT
    DATE(history_station_end_time) AS day,
    fixture_no,
    model,
    pn,
    workstation_name,
    COUNT(*) AS total,
    COUNT(CASE WHEN history_station_passing_status = 'Pass' THEN 1 END) AS pass,
    COUNT(CASE WHEN history_station_passing_status = 'Fail' THEN 1 END) AS fail
FROM testboard_master_log
WHERE history_station_end_time IS NOT NULL
    AND history_station_end_time >= CURRENT_DATE - INTERVAL '6 days'
    AND history_station_end_time <= CURRENT_DATE
GROUP BY day, fixture_no, model, pn, workstation_name
ORDER BY day DESC, fail DESC;
'''

INSERT_SQL = '''
INSERT INTO fixture_performance_daily (
    day, fixture_no, model, pn, workstation_name, pass, fail, total
) VALUES %s
ON CONFLICT (day, fixture_no, model, pn, workstation_name) DO UPDATE SET
    pass = EXCLUDED.pass,
    fail = EXCLUDED.fail,
    total = EXCLUDED.total;
'''

def main():
<<<<<<< HEAD
    conn = psycopg2.connect(**DB_CONFIG)
=======
    conn = psycopg2.connect(**DATABASE)
>>>>>>> origin/main
    try:
        with conn.cursor() as cur:
            print("Creating fixture_performance_daily table if not exists...")
            cur.execute(CREATE_TABLE_SQL)
            conn.commit()

            print("Aggregating fixture performance data from testboard_master_log (last 7 days)...")
            cur.execute(AGGREGATE_SQL)
            rows = cur.fetchall()
            print(f"Aggregated {len(rows)} rows.")

            if rows:
                values = [(
                    r[0], r[1], r[2], r[3], r[4], r[6], r[7], r[5]
                ) for r in rows]
                execute_values(cur, INSERT_SQL, values)
                conn.commit()
                print("Recent fixture performance aggregation complete and upserted.")
            else:
                print("No data to aggregate for the last 7 days.")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()