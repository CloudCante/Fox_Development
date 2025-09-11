"""
FILE MONITOR - ETL Pipeline File Detection and Routing System
============================================================

This script monitors the input directory for specific files and routes them to the appropriate
import scripts for database processing. It handles file conversion (XLS to XLSX) and provides
comprehensive logging for the entire ETL pipeline.

HOW TO ADD NEW FILE TYPES:
==========================
To add support for a new file type, follow these steps:

1. ADD FILE CONSTANTS (Lines 15-18):
   - Add a new filename constant: NEW_FILE_TYPE_FILENAME = "your_file_name.xlsx"
   - Add a new filepath constant: NEW_FILE_TYPE_FILEPATH = os.path.join(INPUT_DIR, NEW_FILE_TYPE_FILENAME)

2. ADD IMPORT SCRIPT PATH (Lines 25-28):
   - Add a new script path: IMPORT_NEW_FILE_TYPE_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_new_file_type.py")

3. ADD FILE DETECTION LOGIC (Lines 148-210):
   - Add a new detection block following the existing pattern
   - Use process_file() for Excel files or process_tsg_file() for TSG files

4. CREATE IMPORT SCRIPT:
   - Create a new file in Fox_ETL/loaders/import_new_file_type.py
   - Follow the pattern of existing import scripts (see import_testboard_file.py)
   - The script should accept file path as command line argument: sys.argv[1]

5. UPDATE LOGGING (Lines 143-144):
   - Add your new file type to the target files list in the startup log

EXAMPLE - Adding a new file type called "quality_reports":
==========================================================
# Step 1: Add constants (around line 16)
QUALITY_REPORTS_FILENAME = "qualityReport.xlsx"
QUALITY_REPORTS_FILEPATH = os.path.join(INPUT_DIR, QUALITY_REPORTS_FILENAME)

# Step 2: Add script path (around line 27)
IMPORT_QUALITY_REPORTS_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_quality_reports_file.py")

# Step 3: Add detection logic (around line 210, before time.sleep(10))
if os.path.exists(QUALITY_REPORTS_FILEPATH):
    logger.info(f"Quality reports file detected: {QUALITY_REPORTS_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Starting quality reports processing pipeline...")
    
    success = process_file(
        QUALITY_REPORTS_FILEPATH, 
        IMPORT_QUALITY_REPORTS_SCRIPT, 
        "quality_reports"
    )
    
    if success:
        logger.info(f"Quality reports processing completed successfully")
    else:
        logger.error(f"Quality reports processing failed")

# Step 4: Create Fox_ETL/loaders/import_quality_reports_file.py
# Step 5: Update logging messages to include "quality_reports"

FILE PROCESSING FLOW:
====================
1. File Detection: Script checks for specific filenames in INPUT_DIR every 10 seconds
2. File Conversion: XLS files are converted to XLSX using LibreOffice
3. Script Execution: Appropriate import script is called with file path as argument
4. Database Import: Import script processes file and loads data into PostgreSQL
5. File Cleanup: Original files are deleted after successful processing
6. Logging: All steps are logged with timestamps and success/failure status

CURRENT SUPPORTED FILE TYPES:
=============================
- workstationOutputReport.xls → import_workstation_file.py → workstation_master_log table
- Test board record report.xls → import_testboard_file.py → testboard_master_log table  
- snfnReport.xls → import_snfn_file.py → snfn_master_log table
- FXNC_PB-DEBUG_*.tsg → import_dummy_file.py → (custom processing)
"""

import os
import sys
import time
import subprocess
from datetime import datetime
import logging

# Import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import PATHS

# Configure logging for the file monitor
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# INPUT DIRECTORY CONFIGURATION
# =============================
# This is where the file monitor looks for new files to process
# All files should be placed directly in this directory with their expected filenames
INPUT_DIR = PATHS['input_dir']

# FILE TYPE CONSTANTS - ADD NEW FILE TYPES HERE
# ==============================================
# Each file type needs a filename constant and a filepath constant
# The filename should match exactly what gets downloaded from the external system
WORKSTATION_XLS_FILENAME = "workstationOutputReport.xls"      # Workstation processing data
TESTBOARD_XLS_FILENAME = "Test board record report.xls"       # Test board testing data
SNFN_XLS_FILENAME = "snfnReport.xls"                          # Serial Number Failure Number data
DUMMY_TSG_FILENAME = "FXNC_PB-DEBUG_692-2G506-0200-0R6_1320222088828_P_BAT_20250908T133950Z.tsg"  # TSG test data

# FILE PATH CONSTANTS - AUTO-GENERATED FROM FILENAMES
# ===================================================
# These combine the input directory with the filename constants
# DO NOT MODIFY - These are automatically generated from the filename constants above
WORKSTATION_FILEPATH = os.path.join(INPUT_DIR, WORKSTATION_XLS_FILENAME)
TESTBOARD_FILEPATH = os.path.join(INPUT_DIR, TESTBOARD_XLS_FILENAME)
SNFN_FILEPATH = os.path.join(INPUT_DIR, SNFN_XLS_FILENAME)
DUMMY_TSG_FILEPATH = os.path.join(INPUT_DIR, DUMMY_TSG_FILENAME)

# IMPORT SCRIPT PATHS - ADD NEW IMPORT SCRIPTS HERE
# ================================================
# These point to the Python scripts that will process each file type
# Each import script should be located in Fox_ETL/loaders/ directory
ETL_V2_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Get Fox_ETL root directory
IMPORT_TESTBOARD_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_testboard_file.py")      # Processes test board data
IMPORT_WORKSTATION_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_workstation_file.py")  # Processes workstation data
IMPORT_SNFN_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_snfn_file.py")                # Processes SNFN data
IMPORT_DUMMY_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_dummy_file.py")              # Processes Dummy test data

def convert_xls_to_xlsx(xls_file_path):
    """
    CONVERT XLS TO XLSX
    ===================
    Converts Microsoft Excel .xls files to .xlsx format using LibreOffice.
    This is necessary because pandas has better support for .xlsx files.
    
    Args:
        xls_file_path (str): Full path to the .xls file to convert
        
    Returns:
        str: Full path to the converted .xlsx file, or None if conversion failed
        
    Process:
        1. Generate .xlsx filename by replacing .xls extension
        2. Use LibreOffice headless mode to convert the file
        3. Log the conversion command and results
        4. Return the new file path if successful
        
    Note: LibreOffice must be installed on the system for this to work
    """
    try:
        # Generate the output filename by replacing .xls with .xlsx
        xlsx_file_path = os.path.splitext(xls_file_path)[0] + '.xlsx'
        
        logger.info(f"Converting {os.path.basename(xls_file_path)} to XLSX...")
        
        # Build LibreOffice command for headless conversion
        cmd = [
            'libreoffice',                    # LibreOffice executable
            '--headless',                     # Run without GUI
            '--convert-to', 'xlsx',          # Convert to XLSX format
            '--outdir', os.path.dirname(xls_file_path),  # Output to same directory as input
            xls_file_path                     # Input file path
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # Execute the conversion command with timeout
        result = subprocess.run(
            cmd,
            capture_output=True,              # Capture both stdout and stderr
            text=True,                        # Return output as text
            timeout=60                        # 60 second timeout
        )
        
        # Check if conversion was successful
        if result.returncode == 0:
            logger.info(f"Successfully converted to {os.path.basename(xlsx_file_path)}")
            return xlsx_file_path
        else:
            logger.error(f"LibreOffice conversion failed: {result.stderr}")
            return None
            
    except subprocess.TimeoutExpired:
        logger.error(f"LibreOffice conversion timed out for {os.path.basename(xls_file_path)}")
        return None
    except Exception as e:
        logger.error(f"Error converting {os.path.basename(xls_file_path)}: {e}")
        return None

def process_tsg_file(file_path, script_path, file_type):
    """Process TSG files directly without Excel conversion"""
    try:
        logger.info(f"Processing {file_type} data using {os.path.basename(script_path)}...")
        
        cmd = ['python3', script_path, file_path]
        logger.info(f"Running command: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            logger.info(f"Successfully imported {file_type} data")
            logger.info(f"Output: {result.stdout}")
            return True
        else:
            logger.error(f"Import script failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"Import script timed out for {file_type}")
        return False
    except Exception as e:
        logger.error(f"Error processing {file_type}: {e}")
        return False

def process_file(file_path, script_path, file_type):
    """
    PROCESS EXCEL FILE - MAIN FILE PROCESSING FUNCTION
    =================================================
    This is the core function that processes Excel files (.xls/.xlsx) and routes them
    to the appropriate import script for database processing.
    
    Args:
        file_path (str): Full path to the Excel file to process
        script_path (str): Full path to the Python import script to execute
        file_type (str): Human-readable file type name for logging purposes
        
    Returns:
        bool: True if processing was successful, False otherwise
        
    Process Flow:
        1. Convert .xls to .xlsx if necessary (using LibreOffice)
        2. Validate that the converted file exists
        3. Delete the original .xls file to save space
        4. Execute the import script with the .xlsx file path as argument
        5. Log success/failure and return status
        
    Command Structure:
        The import script is called as: python3 script_path xlsx_file_path
        The import script receives the file path as sys.argv[1]
        
    Timeout: 300 seconds (5 minutes) for import script execution
    """
    try:
        # STEP 1: Convert XLS to XLSX if necessary
        # This handles the case where files are downloaded as .xls format
        xlsx_file_path = convert_xls_to_xlsx(file_path)
        
        if not xlsx_file_path:
            logger.error(f"Failed to convert {os.path.basename(file_path)} to XLSX")
            return False
        
        # STEP 2: Validate that the converted file actually exists
        if not os.path.exists(xlsx_file_path):
            logger.error(f"XLSX file not found after conversion: {os.path.basename(xlsx_file_path)}")
            return False

        # STEP 3: Clean up original file to save disk space
        # Only delete if it's different from the converted file (i.e., was .xls)
        try:
            if file_path != xlsx_file_path:  # Only delete if it was actually converted
                os.remove(file_path)
                logger.info(f"Deleted original XLS file: {os.path.basename(file_path)}")
        except Exception as e:
            logger.warning(f"Could not delete original XLS file: {e}")
        
        # STEP 4: Execute the import script
        logger.info(f"Importing {file_type} data using {os.path.basename(script_path)}...")
        
        # Build the command: python3 script_path xlsx_file_path
        cmd = ['python3', script_path, xlsx_file_path]
        logger.info(f"Running command: {' '.join(cmd)}")
        
        # Execute the import script with timeout and output capture
        result = subprocess.run(
            cmd,
            capture_output=True,              # Capture both stdout and stderr
            text=True,                        # Return output as text
            timeout=300                       # 5 minute timeout for import processing
        )
        
        # STEP 5: Handle the results
        if result.returncode == 0:
            logger.info(f"Successfully imported {file_type} data")
            logger.info(f"Output: {result.stdout}")
            return True
        else:
            logger.error(f"Import script failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error(f"Import script timed out for {file_type}")
        return False
    except Exception as e:
        logger.error(f"Error processing {file_type}: {e}")
        return False

def monitor_for_files():
    """
    MAIN FILE MONITORING LOOP
    =========================
    This is the main function that continuously monitors the input directory for new files
    and routes them to the appropriate processing functions. It runs in an infinite loop
    checking every 10 seconds for the presence of specific files.
    
    File Detection Pattern:
    - Each file type has a specific filename that must match exactly
    - Files are detected using os.path.exists() checks
    - When a file is found, it's immediately processed and then deleted
    
    Processing Order:
    1. Workstation files (workstationOutputReport.xls)
    2. Test board files (Test board record report.xls)  
    3. SNFN files (snfnReport.xls)
    4. TSG files (FXNC_PB-DEBUG_*.tsg)
    
    Error Handling:
    - Individual file processing failures don't stop the monitor
    - The monitor continues running even if one file type fails
    - All errors are logged with full stack traces
    
    To Add New File Types:
    - Add filename and filepath constants at the top of the file
    - Add import script path constant
    - Add detection block following the existing pattern
    - Update the startup logging messages
    """
    # STARTUP LOGGING - Shows what files the monitor is looking for
    logger.info("Starting file monitor for PostgreSQL ETL pipeline")
    logger.info(f"Monitoring directory: {INPUT_DIR}")
    logger.info(f"Target files: {WORKSTATION_XLS_FILENAME}, {TESTBOARD_XLS_FILENAME}, {SNFN_XLS_FILENAME}, {DUMMY_TSG_FILENAME}")
    logger.info(f"Import scripts: {os.path.basename(IMPORT_WORKSTATION_SCRIPT)}, {os.path.basename(IMPORT_TESTBOARD_SCRIPT)}, {os.path.basename(IMPORT_SNFN_SCRIPT)}, {os.path.basename(IMPORT_DUMMY_SCRIPT)}")
    
    # MAIN MONITORING LOOP - Runs continuously until interrupted
    while True:
        try:
            # WORKSTATION FILE DETECTION AND PROCESSING
            # =========================================
            # Looks for: workstationOutputReport.xls
            # Routes to: import_workstation_file.py
            # Database:  workstation_master_log table
            if os.path.exists(WORKSTATION_FILEPATH):
                logger.info(f"Workstation file detected: {WORKSTATION_XLS_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"Starting workstation file processing pipeline...")
                
                success = process_file(
                    WORKSTATION_FILEPATH, 
                    IMPORT_WORKSTATION_SCRIPT, 
                    "workstation"
                )
                
                if success:
                    logger.info(f"Workstation file processing completed successfully")
                else:
                    logger.error(f"Workstation file processing failed")
            
            # TEST BOARD FILE DETECTION AND PROCESSING
            # ========================================
            # Looks for: Test board record report.xls
            # Routes to: import_testboard_file.py
            # Database:  testboard_master_log table
            if os.path.exists(TESTBOARD_FILEPATH):
                logger.info(f"Test board file detected: {TESTBOARD_XLS_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"Starting test board file processing pipeline...")
                
                success = process_file(
                    TESTBOARD_FILEPATH, 
                    IMPORT_TESTBOARD_SCRIPT, 
                    "testboard"
                )
                
                if success:
                    logger.info(f"Test board file processing completed successfully")
                else:
                    logger.error(f"STEP 3: Test board file processing failed")

            # SNFN FILE DETECTION AND PROCESSING
            # ==================================
            # Looks for: snfnReport.xls
            # Routes to: import_snfn_file.py
            # Database:  snfn_master_log table
            if os.path.exists(SNFN_FILEPATH):
                logger.info(f"STEP 1: SnfN file detected: {SNFN_XLS_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"STEP 2: Starting SnFn file processing pipeline...")
                
                success = process_file(
                    SNFN_FILEPATH, 
                    IMPORT_SNFN_SCRIPT, 
                    "snfn"
                )
                
                if success:
                    logger.info(f"STEP 3: snfn file processing completed successfully")
                else:
                    logger.error(f"STEP 3: snfn file processing failed")
            
            # TSG FILE DETECTION AND PROCESSING
            # =================================
            # Looks for: FXNC_PB-DEBUG_*.tsg (specific test file)
            # Routes to: import_dummy_file.py
            # Database:  Custom processing (not standard table)
            if os.path.exists(DUMMY_TSG_FILEPATH):
                logger.info(f"Dummy TSG file detected: {DUMMY_TSG_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                logger.info(f"Starting dummy TSG file processing pipeline...")
                
                success = process_tsg_file(
                    DUMMY_TSG_FILEPATH, 
                    IMPORT_DUMMY_SCRIPT, 
                    "dummy_tsg"
                )
                
                if success:
                    logger.info(f"Dummy TSG file processing completed successfully")
                else:
                    logger.error(f"Dummy TSG file processing failed")
                
            # SLEEP BETWEEN CHECKS
            # ====================
            # Wait 10 seconds before checking again
            # This prevents excessive CPU usage while maintaining responsive file detection
            time.sleep(10)  # Check every 10 seconds
            
        except KeyboardInterrupt:
            # GRACEFUL SHUTDOWN
            # ================
            # Handle Ctrl+C gracefully
            logger.info("File monitor shutdown requested")
            break
        except Exception as e:
            # ERROR HANDLING
            # ==============
            # Log any unexpected errors but continue monitoring
            logger.error(f"Error in monitor loop: {e}")
            import traceback
            logger.error(traceback.format_exc())
            time.sleep(10)  # Wait before retrying


# MAIN EXECUTION
# ==============
# This script is designed to be run as a standalone service
# It will start monitoring for files immediately when executed
if __name__ == "__main__":
    monitor_for_files() 

"""
QUICK REFERENCE - ADDING NEW FILE TYPES
=======================================

STEP 1: Add file constants (around line 98)
-------------------------------------------
NEW_FILE_TYPE_FILENAME = "your_file_name.xlsx"
NEW_FILE_TYPE_FILEPATH = os.path.join(INPUT_DIR, NEW_FILE_TYPE_FILENAME)

STEP 2: Add import script path (around line 120)
------------------------------------------------
IMPORT_NEW_FILE_TYPE_SCRIPT = os.path.join(ETL_V2_DIR, "loaders", "import_new_file_type.py")

STEP 3: Add detection logic (around line 418, before time.sleep(10))
--------------------------------------------------------------------
if os.path.exists(NEW_FILE_TYPE_FILEPATH):
    logger.info(f"New file type detected: {NEW_FILE_TYPE_FILENAME} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Starting new file type processing pipeline...")
    
    success = process_file(
        NEW_FILE_TYPE_FILEPATH, 
        IMPORT_NEW_FILE_TYPE_SCRIPT, 
        "new_file_type"
    )
    
    if success:
        logger.info(f"New file type processing completed successfully")
    else:
        logger.error(f"New file type processing failed")

STEP 4: Update startup logging (around line 328)
------------------------------------------------
Add your new file type to the target files list in the startup log message

STEP 5: Create import script
---------------------------
Create Fox_ETL/loaders/import_new_file_type.py following the pattern of existing scripts

TROUBLESHOOTING
===============
- Check that LibreOffice is installed for XLS to XLSX conversion
- Verify file permissions on the input directory
- Check that import scripts are executable and have correct paths
- Review logs for specific error messages
- Ensure database connection is working in import scripts
"""