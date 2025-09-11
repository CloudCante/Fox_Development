import sys
import pandas as pd

file_path = "/home/cloud/projects/pros/data log/testboardrecord_xlsx/April_2025/test_board_record_report_04_01_2025_to_04_03_2025.xlsx"
print("Testboard Record Report")
try:
    df = pd.read_excel(file_path)
    print(f"Columns in {file_path}:")
    for col in df.columns:
        print(col)
except Exception as e:
    print(f"Error reading {file_path}: {e}") 

file_path2 = "/home/cloud/projects/pros/data log/workstationreport_xlsx/April_2025/workstationOutputReport_04_06_2025_to_04_08_2025.xlsx"
print("Workstation Output Report")
try:
    df = pd.read_excel(file_path2)
    print(f"Columns in {file_path2}:")
    for col in df.columns:
        print(col)
except Exception as e:
    print(f"Error reading {file_path2}: {e}") 