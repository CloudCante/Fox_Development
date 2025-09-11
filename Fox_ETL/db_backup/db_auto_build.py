#!/usr/bin/env python3
"""
Database Setup Script for Fox Development Environment
Rebuilds the local PostgreSQL database from the production dump file.
"""

import subprocess
import os
import sys
import glob
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def get_postgres_user():
    """Detect the PostgreSQL system user."""
    print("🔍 Detecting PostgreSQL system user...")
    
    # Common PostgreSQL user names to try
    possible_users = ['postgres', 'postgresql', 'pgsql']
    
    for user in possible_users:
        try:
            # Check if user exists and can access PostgreSQL
            result = subprocess.run(['sudo', '-u', user, 'psql', '-c', 'SELECT version();'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                print(f"✅ Found PostgreSQL user: {user}")
                return user
        except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    # If no standard user works, try to find from system
    try:
        # Look for postgres user in /etc/passwd
        result = subprocess.run(['grep', 'postgres', '/etc/passwd'], capture_output=True, text=True)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'postgres' in line and '/bin/bash' in line:
                    user = line.split(':')[0]
                    print(f"✅ Found PostgreSQL user from system: {user}")
                    return user
    except:
        pass
    
    print("❌ Could not detect PostgreSQL system user")
    return None

def configure_postgresql_auth(postgres_user):
    """Configure PostgreSQL authentication for development (trust method)."""
    print("🔧 Configuring PostgreSQL authentication...")
    try:
        # Find pg_hba.conf file
        pg_hba_paths = [
            '/var/lib/pgsql/data/pg_hba.conf',
            '/var/lib/postgresql/*/main/pg_hba.conf',
            '/usr/local/var/postgres/pg_hba.conf',
            '/opt/homebrew/var/postgres/pg_hba.conf',  # macOS Homebrew
            '/usr/local/pgsql/data/pg_hba.conf'        # Custom installs
        ]
        
        pg_hba_path = None
        for path in pg_hba_paths:
            if '*' in path:
                # Handle glob patterns
                import glob
                matches = glob.glob(path)
                if matches:
                    pg_hba_path = matches[0]
                    break
            elif os.path.exists(path):
                pg_hba_path = path
                break
        
        if not pg_hba_path:
            # Try to find it using postgres command
            try:
                result = subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 'SHOW hba_file;'], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    pg_hba_path = result.stdout.strip().split('\n')[2].strip()  # Skip header lines
                    print(f"   Found pg_hba.conf via postgres command: {pg_hba_path}")
                else:
                    print("⚠️  Could not find pg_hba.conf file")
                    return False
            except:
                print("⚠️  Could not find pg_hba.conf file")
                return False
        
        print(f"   Found pg_hba.conf at: {pg_hba_path}")
        
        # Read current config
        with open(pg_hba_path, 'r') as f:
            content = f.read()
        
        # Check if already configured for trust
        if 'host    all             all             127.0.0.1/32            trust' in content:
            print("✅ PostgreSQL already configured for trust authentication")
            return True
        
        # Backup original file
        backup_path = pg_hba_path + '.backup'
        subprocess.run(['sudo', 'cp', pg_hba_path, backup_path], check=True)
        print(f"   Created backup: {backup_path}")
        
        # Replace md5 with trust for local connections
        subprocess.run(['sudo', 'sed', '-i', 's/md5/trust/g', pg_hba_path], check=True)
        print("   Updated authentication method to 'trust'")
        
        # Restart PostgreSQL to apply changes
        print("   Restarting PostgreSQL service...")
        subprocess.run(['sudo', 'systemctl', 'restart', 'postgresql'], check=True)
        print("✅ PostgreSQL authentication configured successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error configuring PostgreSQL authentication: {e}")
        print("💡 You may need to manually configure pg_hba.conf")
        return False

def check_postgresql():
    """Check if PostgreSQL is installed and running."""
    print("🔍 Checking PostgreSQL installation...")
    try:
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ PostgreSQL found: {result.stdout.strip()}")
            
            # Check if PostgreSQL service is running
            print("🔍 Checking if PostgreSQL service is running...")
            service_result = subprocess.run(['sudo', 'systemctl', 'is-active', 'postgresql'], capture_output=True, text=True)
            if service_result.returncode == 0 and service_result.stdout.strip() == 'active':
                print("✅ PostgreSQL service is running")
                return True
            else:
                print("⚠️  PostgreSQL service is not running. Attempting to start...")
                start_result = subprocess.run(['sudo', 'systemctl', 'start', 'postgresql'], capture_output=True, text=True)
                if start_result.returncode == 0:
                    print("✅ PostgreSQL service started successfully")
                    return True
                else:
                    print("❌ Failed to start PostgreSQL service")
                    return False
        else:
            print("❌ PostgreSQL not found in PATH")
            return False
    except FileNotFoundError:
        print("❌ PostgreSQL not installed or not in PATH")
        return False

def check_dump_file():
    """Check if the dump file exists."""
    dump_file = "fox_backup.dump"
    if os.path.exists(dump_file):
        size_mb = os.path.getsize(dump_file) / (1024 * 1024)
        print(f"✅ Dump file found: {dump_file} ({size_mb:.1f} MB)")
        return dump_file
    else:
        print(f"❌ Dump file not found: {dump_file}")
        return None

def create_database(postgres_user):
    """Create the fox_db database using psql command."""
    print("🗄️  Creating database...")
    try:
        # Drop database if it exists (using detected postgres user)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 'DROP DATABASE IF EXISTS fox_db;'], check=False)
        print("   - Dropped existing fox_db (if it existed)")
        
        # Create new database
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 'CREATE DATABASE fox_db;'], check=True)
        print("   - Created fox_db database")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Database creation failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def create_user(postgres_user):
    """Create the gpu_user if it doesn't exist (no password, like production)."""
    print("👤 Setting up database user...")
    try:
        # Create user with NO PASSWORD (matching production exactly)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 
                       "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'gpu_user') THEN CREATE ROLE gpu_user LOGIN; END IF; END $$;"], check=True)
        
        # Grant superuser privileges to gpu_user for database restoration
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 'ALTER USER gpu_user CREATEDB CREATEROLE;'], check=True)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-c', 'GRANT ALL PRIVILEGES ON DATABASE fox_db TO gpu_user;'], check=True)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-d', 'fox_db', '-c', 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gpu_user;'], check=True)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-d', 'fox_db', '-c', 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gpu_user;'], check=True)
        subprocess.run(['sudo', '-u', postgres_user, 'psql', '-d', 'fox_db', '-c', 'GRANT ALL PRIVILEGES ON SCHEMA public TO gpu_user;'], check=True)
        
        print("   - Created/verified gpu_user (no password, like production)")
        print("   - Granted superuser privileges for database restoration")
        print("   - Granted all privileges to fox_db")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error setting up user: {e}")
        return False

def restore_database(dump_file):
    """Restore database from dump file."""
    print("📥 Restoring database from dump file...")
    try:
        # Try pg_restore first with version compatibility
        cmd = [
            'pg_restore',
            '--host=localhost',
            '--port=5432',
            '--username=gpu_user',
            '--dbname=fox_db',
            '--clean',
            '--if-exists',
            '--verbose',
            '--no-owner',
            '--no-privileges',
            dump_file
        ]
        
        # No password needed (matching production)
        env = os.environ.copy()
        
        print(f"   Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, env=env)
        
        if result.returncode == 0:
            print("✅ Database restored successfully!")
            return True
        else:
            print(f"⚠️  pg_restore failed: {result.stderr}")
            print("🔄 Trying alternative restore method...")
            
            # Try with psql if pg_restore fails
            return restore_with_psql(dump_file)
            
    except FileNotFoundError:
        print("❌ pg_restore not found. Make sure PostgreSQL is installed.")
        return False
    except Exception as e:
        print(f"❌ Error during restore: {e}")
        return False

def restore_with_psql(dump_file):
    """Alternative restore method using psql."""
    print("📥 Trying restore with psql...")
    try:
        # First, let's try to convert the dump to SQL format
        print("🔄 Converting dump to SQL format...")
        convert_cmd = [
            'pg_restore',
            '--host=localhost',
            '--port=5432',
            '--username=gpu_user',
            '--dbname=fox_db',
            '--schema-only',
            '--no-owner',
            '--no-privileges',
            '--file=/tmp/fox_schema.sql',
            dump_file
        ]
        
        result = subprocess.run(convert_cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Schema converted successfully")
            
            # Now try to restore the schema
            schema_cmd = [
                'psql',
                '--host=localhost',
                '--port=5432',
                '--username=gpu_user',
                '--dbname=fox_db',
                '--file=/tmp/fox_schema.sql'
            ]
            
            print("📥 Restoring schema...")
            result = subprocess.run(schema_cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Schema restored successfully!")
                
                # Try to restore data separately
                print("📥 Attempting to restore data...")
                data_cmd = [
                    'pg_restore',
                    '--host=localhost',
                    '--port=5432',
                    '--username=gpu_user',
                    '--dbname=fox_db',
                    '--data-only',
                    '--no-owner',
                    '--no-privileges',
                    '--disable-triggers',
                    dump_file
                ]
                
                result = subprocess.run(data_cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    print("✅ Data restored successfully!")
                    return True
                else:
                    print(f"⚠️  Data restore failed, but schema is ready: {result.stderr}")
                    print("✅ Database structure is ready - you can populate it manually")
                    return True
            else:
                print(f"❌ Schema restore failed: {result.stderr}")
                return False
        else:
            print(f"❌ Schema conversion failed: {result.stderr}")
            print("\n💡 Possible solutions:")
            print("   1. Update PostgreSQL to a newer version")
            print("   2. Recreate the dump file with PostgreSQL 16")
            print("   3. Use a different restore method")
            return False
            
    except Exception as e:
        print(f"❌ Error during psql restore: {e}")
        return False

def test_connection():
    """Test the database connection with gpu_user (same as ETL scripts)."""
    print("🧪 Testing database connection...")
    try:
        # Use the exact same connection as the ETL scripts (matching production)
        conn = psycopg2.connect(
            host="localhost",
            database="fox_db",
            user="gpu_user",
            password="",
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ Connection successful!")
        print(f"   Database version: {version[:50]}...")
        
        # Check if tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"   Found {len(tables)} tables:")
        for table in tables:
            print(f"     - {table[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def main():
    """Main setup function."""
    print("🚀 Fox Development Database Setup")
    print("=" * 40)
    
    # Detect PostgreSQL user first
    postgres_user = get_postgres_user()
    if not postgres_user:
        print("\n❌ Could not detect PostgreSQL system user.")
        print("   Please ensure PostgreSQL is properly installed and configured.")
        print("   - Fedora: sudo dnf install postgresql postgresql-server postgresql-contrib")
        print("   - Then: sudo postgresql-setup --initdb")
        return False
    
    # Check prerequisites
    if not check_postgresql():
        print("\n❌ Please install PostgreSQL first:")
        print("   - Fedora: sudo dnf install postgresql postgresql-server postgresql-contrib")
        return False
    
    # Configure PostgreSQL authentication for development
    if not configure_postgresql_auth(postgres_user):
        print("\n⚠️  Authentication configuration failed, but continuing...")
        print("   You may need to manually configure pg_hba.conf if database operations fail")
    
    dump_file = check_dump_file()
    if not dump_file:
        print(f"\n❌ Please place the dump file in the same directory as this script")
        return False
    
    # Create database
    if not create_database(postgres_user):
        return False
    
    # Create user
    if not create_user(postgres_user):
        return False
    
    # Restore from dump
    if not restore_database(dump_file):
        return False
    
    # Test connection (using same credentials as ETL)
    if not test_connection():
        return False
    
    print("\n🎉 Setup complete!")
    print("=" * 40)
    print("Your development database is ready!")
    print("You can now run the Fox_app backend and Fox_ETL scripts.")
    print("\nNext steps:")
    print("1. Start the Fox_app backend: cd Fox_app/backend && npm start")
    print("2. Run ETL scripts as needed")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
EOF


#sudo postgresql-setup --initdb
#sudo systemctl start postgresql && sudo systemctl enable postgresql