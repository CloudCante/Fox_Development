import pandas as pd
import sys
import os

def convert_timestamp(value):
    import pandas as pd
    if pd.isna(value):
        return None
    if isinstance(value, pd.Timestamp):
        return value.to_pydatetime()
    return pd.to_datetime(value)

EXCEL_PATH = r'C:\projects\Fox_ETL\workstationOutputReport-7-14-2025.xlsx'
SN_TARGET = '1651624100018'
WORKSTATION_TARGET = 'RECEIVE'

if not os.path.isfile(EXCEL_PATH):
    print(f"File not found: {EXCEL_PATH}")
    sys.exit(1)

df = pd.read_excel(EXCEL_PATH)
row = df[(df['SN'].astype(str) == SN_TARGET) & (df['Workstation_Name'] == WORKSTATION_TARGET)]

if row.empty:
    print(f"No row found with SN={SN_TARGET} and Workstation_Name={WORKSTATION_TARGET}")
    sys.exit(1)

raw_value = row.iloc[0]['History_Station_End_Time']
converted_value = convert_timestamp(raw_value)

print(f"Row with SN={SN_TARGET} and Workstation_Name={WORKSTATION_TARGET} History_Station_End_Time:")
print(f"  Raw:      {raw_value} (type: {type(raw_value)})")
print(f"    tzinfo: {getattr(raw_value, 'tzinfo', None)}")
print(f"  Converted:{converted_value} (type: {type(converted_value)})")
print(f"    tzinfo: {getattr(converted_value, 'tzinfo', None)}") 