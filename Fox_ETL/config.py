# Fox ETL Configuration
# Simple config file - just change these values with your personal settings

#You can leave the database settings the same if you went through the setup process or use the SOPs to set up your own database
# Database settings
DATABASE = {
    'host': 'localhost',
    'port': 5432,
    'database': 'fox_db',
    'user': 'gpu_user',
    'password': ''
}

#Change these to your personal settings
# Path settings
PATHS = {
    'input_dir': '/home/darvin/Fox_ETL/input',
    'downloads_dir': '/home/darvin/Downloads'
}
