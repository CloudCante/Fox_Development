import psycopg2

def main():
    print("Deleting master_records table from fox_db...")
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="fox_db",
            user="gpu_user",
            password="",
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS master_records CASCADE;")
        conn.commit()
        cursor.close()
        conn.close()
        print("master_records table deleted.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 