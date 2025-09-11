import psycopg2
from datetime import datetime

dt_str = "2025-07-07 23:48:01"
dt_obj = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")

print("Original string:", dt_str)
print("Python datetime object:", dt_obj, "| tzinfo:", dt_obj.tzinfo)

conn = psycopg2.connect(
    host="localhost",
    database="fox_db",
    user="gpu_user",
    password="",
    port="5432"
)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS test_time_shift (
    id SERIAL PRIMARY KEY,
    test_time TIMESTAMP WITHOUT TIME ZONE
);
TRUNCATE test_time_shift;
""")
conn.commit()
print("Test table created and truncated.")

cur.execute("INSERT INTO test_time_shift (test_time) VALUES (%s) RETURNING id;", (dt_obj,))
conn.commit()
print("Inserted into database.")

cur.execute("SELECT test_time FROM test_time_shift ORDER BY id DESC LIMIT 1;")
db_value = cur.fetchone()[0]
print("Value fetched from database:", db_value, "| type:", type(db_value), "| tzinfo:", getattr(db_value, 'tzinfo', None))

cur.close()
conn.close() 