# Fox Development Database Setup - Linux Standard Operating Procedure

## Overview
This SOP provides step-by-step instructions for setting up the Fox development database on a clean Linux system. This replaces the automated script approach with reliable manual steps.

**For Windows users, see: `DATABASE_SETUP_SOP_WINDOWS.md`**

## Prerequisites
- Clean Linux system (Fedora/Ubuntu/CentOS)
- Root/sudo access
- `fox_backup.dump` file available

## Step 1: Install PostgreSQL

### For Fedora/RHEL/CentOS:
```bash
# Install PostgreSQL 17 (to match production version)
sudo dnf install postgresql17 postgresql17-server postgresql17-contrib -y

# Create data directory with proper permissions
sudo mkdir -p /var/lib/pgsql
sudo chown postgres:postgres /var/lib/pgsql
sudo chmod 700 /var/lib/pgsql

# Initialize the database cluster
sudo postgresql-setup --initdb

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### For Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Configure PostgreSQL Authentication

### Find the pg_hba.conf file:
```bash
sudo -u postgres psql -c "SHOW hba_file;"
```

### Edit the pg_hba.conf file:
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

### Update the authentication method:
Find these lines:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
```

Change `md5` to `trust`:
```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
```

### Restart PostgreSQL to apply changes:
```bash
sudo systemctl restart postgresql
```

## Step 3: Create the Database

```bash
# Create the fox_db database
sudo -u postgres psql -c "CREATE DATABASE fox_db;"
```

## Step 4: Create the Database User

```bash
# Create gpu_user with no password (matching production)
sudo -u postgres psql -c "CREATE USER gpu_user;"

# Grant necessary privileges
sudo -u postgres psql -c "ALTER USER gpu_user CREATEDB CREATEROLE;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fox_db TO gpu_user;"
sudo -u postgres psql -d fox_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gpu_user;"
sudo -u postgres psql -d fox_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gpu_user;"
sudo -u postgres psql -d fox_db -c "GRANT ALL PRIVILEGES ON SCHEMA public TO gpu_user;"
```

## Step 5: Restore from Dump File

```bash
# Navigate to the directory containing fox_backup.dump
cd /path/to/fox_backup.dump

# Restore the database
pg_restore --host=localhost --port=5432 --username=gpu_user --dbname=fox_db --clean --if-exists --verbose --no-owner --no-privileges fox_backup.dump
```

## Step 6: Verify the Setup

```bash
# Test connection
psql -h localhost -U gpu_user -d fox_db -c "SELECT version();"

# List tables
psql -h localhost -U gpu_user -d fox_db -c "\dt"
```

## Troubleshooting

### If pg_restore fails:
Try the alternative method:
```bash
# Convert dump to SQL format first
pg_restore --host=localhost --port=5432 --username=gpu_user --dbname=fox_db --schema-only --no-owner --no-privileges --file=/tmp/fox_schema.sql fox_backup.dump

# Restore schema
psql -h localhost -U gpu_user -d fox_db -f /tmp/fox_schema.sql

# Restore data
pg_restore --host=localhost --port=5432 --username=gpu_user --dbname=fox_db --data-only --no-owner --no-privileges --disable-triggers fox_backup.dump
```

### If authentication fails:
1. Verify pg_hba.conf has `trust` method for localhost
2. Restart PostgreSQL: `sudo systemctl restart postgresql`
3. Check PostgreSQL is running: `sudo systemctl status postgresql`

## Expected Results

After successful setup:
- Database `fox_db` exists
- User `gpu_user` exists with no password
- 13 tables restored from dump file
- Connection works without password prompt

## Next Steps

1. Start the Fox_app backend: `cd Fox_app/backend && npm start`
2. Run ETL scripts as needed
3. Verify all applications can connect to the database

---
**Note:** This SOP replaces the automated `db_auto_build.py` script for better reliability and cross-platform compatibility.
