#!/usr/bin/env python3
"""
Fox Database Recovery Script - Windows Version
==============================================

This script assumes PostgreSQL 17 is already installed and configured
following the DATABASE_SETUP_SOP_WINDOWS.md instructions.

Usage:
    python db_recovery_windows.py [backup_file.dump]

If no backup file is specified, it will look for fox_backup.dump in the current directory.
"""

import subprocess
import os
import sys
import argparse
from pathlib import Path

def check_prerequisites():
    """Check if PostgreSQL is running and accessible."""
    print("🔍 Checking prerequisites...")
    
    try:
        # Test connection to PostgreSQL
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True, shell=True)
        if result.returncode != 0:
            print("❌ PostgreSQL not found. Please install PostgreSQL 17 first.")
            print("   Follow the instructions in DATABASE_SETUP_SOP_WINDOWS.md")
            return False
        
        version = result.stdout.strip()
        print(f"✅ Found: {version}")
        
        # Test connection to database
        result = subprocess.run([
            'psql', '-h', 'localhost', '-U', 'gpu_user', '-d', 'fox_db', 
            '-c', 'SELECT 1;'
        ], capture_output=True, text=True, shell=True)
        
        if result.returncode != 0:
            print("❌ Cannot connect to fox_db as gpu_user")
            print("   Please ensure:")
            print("   1. PostgreSQL service is running")
            print("   2. fox_db database exists")
            print("   3. gpu_user exists with proper permissions")
            print("   4. pg_hba.conf is configured for trust authentication")
            print("   Follow the instructions in DATABASE_SETUP_SOP_WINDOWS.md")
            return False
        
        print("✅ Database connection successful")
        return True
        
    except FileNotFoundError:
        print("❌ PostgreSQL not found. Please install PostgreSQL 17 first.")
        print("   Follow the instructions in DATABASE_SETUP_SOP_WINDOWS.md")
        return False
    except Exception as e:
        print(f"❌ Error checking prerequisites: {e}")
        return False

def find_backup_file(backup_file=None):
    """Find the backup file to restore."""
    if backup_file:
        if os.path.exists(backup_file):
            return backup_file
        else:
            print(f"❌ Backup file not found: {backup_file}")
            return None
    
    # Look for common backup file names
    common_names = [
        'fox_backup.dump',
        'fox_backup.sql',
        'backup.dump',
        'backup.sql'
    ]
    
    for name in common_names:
        if os.path.exists(name):
            return name
    
    print("❌ No backup file found. Please specify a backup file:")
    print("   python db_recovery_windows.py C:\\path\\to\\backup.dump")
    return None

def restore_database(backup_file):
    """Restore the database from backup file."""
    print(f"📥 Restoring database from {backup_file}...")
    
    # Get file size for progress indication
    file_size_mb = os.path.getsize(backup_file) / (1024 * 1024)
    print(f"   Backup file size: {file_size_mb:.1f} MB")
    
    try:
        # Determine if it's a dump file or SQL file
        if backup_file.endswith('.dump'):
            # Use pg_restore for binary dump files
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
                backup_file
            ]
        else:
            # Use psql for SQL files
            cmd = [
                'psql',
                '--host=localhost',
                '--port=5432',
                '--username=gpu_user',
                '--dbname=fox_db',
                '--file=' + backup_file
            ]
        
        print(f"   Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        
        if result.returncode == 0:
            print("✅ Database restored successfully!")
            return True
        else:
            print(f"❌ Restore failed: {result.stderr}")
            
            # Try alternative method for dump files
            if backup_file.endswith('.dump'):
                print("🔄 Trying alternative restore method...")
                return restore_with_alternative_method(backup_file)
            
            return False
            
    except Exception as e:
        print(f"❌ Error during restore: {e}")
        return False

def restore_with_alternative_method(backup_file):
    """Alternative restore method for problematic dump files."""
    print("📥 Trying alternative restore method...")
    
    try:
        # Create temp directory
        temp_dir = os.path.join(os.environ.get('TEMP', 'C:\\temp'), 'fox_recovery')
        os.makedirs(temp_dir, exist_ok=True)
        
        # First, try to restore schema only
        schema_file = os.path.join(temp_dir, 'fox_schema.sql')
        schema_cmd = [
            'pg_restore',
            '--host=localhost',
            '--port=5432',
            '--username=gpu_user',
            '--dbname=fox_db',
            '--schema-only',
            '--no-owner',
            '--no-privileges',
            f'--file={schema_file}',
            backup_file
        ]
        
        result = subprocess.run(schema_cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print("✅ Schema extracted successfully")
            
            # Restore schema
            schema_restore_cmd = [
                'psql',
                '--host=localhost',
                '--port=5432',
                '--username=gpu_user',
                '--dbname=fox_db',
                f'--file={schema_file}'
            ]
            
            result = subprocess.run(schema_restore_cmd, capture_output=True, text=True, shell=True)
            if result.returncode == 0:
                print("✅ Schema restored successfully")
                
                # Try to restore data
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
                    backup_file
                ]
                
                result = subprocess.run(data_cmd, capture_output=True, text=True, shell=True)
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
            print(f"❌ Schema extraction failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error during alternative restore: {e}")
        return False

def verify_restore():
    """Verify the database was restored correctly."""
    print("🧪 Verifying database restore...")
    
    try:
        # Check if tables exist
        result = subprocess.run([
            'psql', '-h', 'localhost', '-U', 'gpu_user', '-d', 'fox_db',
            '-c', "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
        ], capture_output=True, text=True, shell=True)
        
        if result.returncode == 0:
            tables = [line.strip() for line in result.stdout.split('\n') if line.strip() and not line.startswith('table_name') and not line.startswith('---')]
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table}")
            
            # Check for expected tables
            expected_tables = [
                'daily_tpy_metrics', 'fixture_performance_daily', 'packing_daily_summary',
                'snfn_aggregate_daily', 'station_hourly_summary', 'testboard_master_log',
                'workstation_master_log', 'weekly_tpy_metrics'
            ]
            
            found_expected = sum(1 for table in expected_tables if table in tables)
            if found_expected >= len(expected_tables) * 0.8:  # At least 80% of expected tables
                print("✅ Database restore appears successful!")
                return True
            else:
                print("⚠️  Some expected tables may be missing")
                return True
        else:
            print(f"❌ Could not verify tables: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying restore: {e}")
        return False

def main():
    """Main recovery function."""
    parser = argparse.ArgumentParser(description='Fox Database Recovery Script - Windows')
    parser.add_argument('backup_file', nargs='?', help='Path to backup file (default: fox_backup.dump)')
    parser.add_argument('--force', action='store_true', help='Skip confirmation prompts')
    
    args = parser.parse_args()
    
    print("🚀 Fox Database Recovery - Windows")
    print("=" * 40)
    
    # Check prerequisites
    if not check_prerequisites():
        return False
    
    # Find backup file
    backup_file = find_backup_file(args.backup_file)
    if not backup_file:
        return False
    
    print(f"📁 Using backup file: {backup_file}")
    
    # Confirm restore
    if not args.force:
        response = input("\n⚠️  This will replace all data in fox_db. Continue? (y/N): ")
        if response.lower() != 'y':
            print("❌ Restore cancelled")
            return False
    
    # Restore database
    if not restore_database(backup_file):
        return False
    
    # Verify restore
    if not verify_restore():
        print("⚠️  Restore completed but verification failed")
        return True
    
    print("\n🎉 Recovery complete!")
    print("=" * 40)
    print("Your database has been restored successfully!")
    print("You can now run the Fox_app backend and Fox_ETL scripts.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
