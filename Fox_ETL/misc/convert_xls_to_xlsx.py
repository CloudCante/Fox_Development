import os
import subprocess
from pathlib import Path
import sys

def find_soffice():
    possible_paths = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
            
    return None

def ensure_dir(directory):
    Path(directory).mkdir(parents=True, exist_ok=True)

def convert_using_libreoffice(input_file, output_file):
    output_dir = os.path.dirname(output_file)
    
    ensure_dir(output_dir)
    
    soffice_path = find_soffice()
    if not soffice_path:
        print("Error: LibreOffice not found! Please install LibreOffice.")
        sys.exit(1)
    
    cmd = [
        soffice_path,
        '--headless',
        '--convert-to', 'xlsx',
        '--outdir', output_dir,
        input_file
    ]
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"LibreOffice conversion error: {e.stderr}")
        return False

def convert_and_organize_files():
    base_dir = os.path.abspath(os.path.join(os.getcwd(), "input", "data log"))
    
    conversions = [
        {
            'source_dir': os.path.join(base_dir, "testboardrecord"),
            'target_dir': os.path.join(base_dir, "testboardrecord_xlsx"),
            'file_prefix': 'test_board_record_report'
        },
        {
            'source_dir': os.path.join(base_dir, "workstationreport"),
            'target_dir': os.path.join(base_dir, "workstationreport_xlsx"),
            'file_prefix': 'workstationOutputReport'
        }
    ]
    
    total_converted = 0
    
    for conv in conversions:
        source_dir = conv['source_dir']
        print(f"\nProcessing files from {source_dir}")
        
        if not os.path.exists(source_dir):
            print(f"Source directory not found: {source_dir}")
            continue
            
        for root, _, files in os.walk(source_dir):
            for file in files:
                if file.endswith('.xls'):
                    rel_path = os.path.relpath(root, source_dir)
                    
                    output_dir = os.path.join(conv['target_dir'], rel_path)
                    ensure_dir(output_dir)
                    
                    input_file = os.path.join(root, file)
                    output_file = os.path.join(output_dir, file)
                    
                    try:
                        print(f"Converting: {file}")
                        if convert_using_libreoffice(input_file, output_file):
                            total_converted += 1
                            print(f"Saved to: {output_file.replace('.xls', '.xlsx')}")
                        else:
                            print(f"Failed to convert {file}")
                    except Exception as e:
                        print(f"Error converting {file}: {e}")
                        continue

    print(f"\nTotal files converted: {total_converted}")

if __name__ == "__main__":
    print("Starting XLS to XLSX conversion using LibreOffice...")
    convert_and_organize_files() 