import subprocess
import time
from datetime import datetime
import logging
from pathlib import Path

class ScriptOrchestrator:
    def __init__(self):
        # Define base paths first
        self.scheduler_dir = Path(__file__).parent  # scheduler folder
        self.historical_testboard_dir = self.scheduler_dir.parent / "aggregators" / "historical" / "testboard"
        self.historical_workstation_dir = self.scheduler_dir.parent / "aggregators" / "historical" / "workstation"
        self.throughput_dir = self.scheduler_dir.parent / "aggregators" / "throughput"
        
        # Now setup logging after paths are defined
        self._setup_logging()
        
        # Define script groups
        self.script_groups = {
            'testboard': [
                self.historical_testboard_dir / 'aggregate_station_performance_all_time.py',
                self.historical_testboard_dir / 'aggregate_fixture_performance_all_time.py',
                self.historical_testboard_dir / 'aggregate_snfn_reports_all_time.py'
            ],
            'workstation': [
                self.historical_workstation_dir / 'aggregate_packing_all_time.py',
                self.historical_workstation_dir / 'aggregate_pchart_all_time.py',
                self.historical_workstation_dir / 'aggregate_station_hourly_counts_all_time.py',
                self.historical_workstation_dir / 'aggregate_sort_test_all_time.py'
            ],
            'throughput': [
                self.throughput_dir / 'aggregate_tpy_all_time_daily.py',
                self.throughput_dir / 'aggregate_tpy_all_time_weekly.py'
            ]
        }
        
        # Verify all scripts exist
        self._verify_scripts()
        
        # Wait time between cycles (2 minutes = 120 seconds)
        self.wait_time = 120

    def _verify_scripts(self):
        """Verify all script paths exist before starting"""
        missing_scripts = []
        
        for category, scripts in self.script_groups.items():
            for script_path in scripts:
                if not script_path.exists():
                    missing_scripts.append(f"{category}: {script_path}")
        
        if missing_scripts:
            raise FileNotFoundError(
                "The following scripts were not found:\n" + 
                "\n".join(missing_scripts)
            )

    def _setup_logging(self):
        # Create logs directory if it doesn't exist
        log_dir = self.scheduler_dir / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / "historical_orchestrator.log"
        logging.basicConfig(
            filename=str(log_file),
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        # Also print to console
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        logging.getLogger().addHandler(console_handler)

    def run_script(self, script_path: Path, category: str) -> bool:
        try:
            logging.info(f"Starting {category} script: {script_path.name}")
            start_time = datetime.now()
            
            # Run the script from the Fox_ETL directory so it can find config.py
            subprocess.run(
                ['python', str(script_path)],
                check=True,
                cwd=self.scheduler_dir.parent  # Set working directory to Fox_ETL
            )
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            logging.info(f"Successfully completed {script_path.name}. Duration: {duration:.2f} seconds")
            return True
            
        except subprocess.CalledProcessError as e:
            logging.error(f"Error running {script_path.name}: {e}")
            return False
        except Exception as e:
            logging.error(f"Unexpected error running {script_path.name}: {e}")
            return False

    def run_cycle(self):
        cycle_start = datetime.now()
        logging.info("Starting new historical aggregation cycle")
        
        # First run testboard scripts
        logging.info("=== Starting Historical Testboard Scripts ===")
        for script in self.script_groups['testboard']:
            success = self.run_script(script, 'testboard')
            if not success:
                logging.error(f"Cycle interrupted due to failure in testboard script: {script.name}")
                return False
        
        # Then run workstation scripts
        logging.info("=== Starting Historical Workstation Scripts ===")
        for script in self.script_groups['workstation']:
            success = self.run_script(script, 'workstation')
            if not success:
                logging.error(f"Cycle interrupted due to failure in workstation script: {script.name}")
                return False

        # Finally run throughput scripts (TPY must run after other scripts)
        logging.info("=== Starting Historical Throughput Scripts ===")
        for script in self.script_groups['throughput']:
            success = self.run_script(script, 'throughput')
            if not success:
                logging.error(f"Cycle interrupted due to failure in throughput script: {script.name}")
                return False
        
        cycle_end = datetime.now()
        duration = (cycle_end - cycle_start).total_seconds()
        logging.info(f"Historical cycle completed successfully. Total duration: {duration:.2f} seconds")
        return True

    def start(self):
        logging.info("Historical Orchestrator starting")
        logging.info(f"Historical Testboard directory: {self.historical_testboard_dir}")
        logging.info(f"Historical Workstation directory: {self.historical_workstation_dir}")
        logging.info(f"Throughput directory: {self.throughput_dir}")
        cycle_count = 1
        
        while True:
            try:
                logging.info(f"\n{'='*50}")
                logging.info(f"Starting historical cycle #{cycle_count}")
                logging.info(f"{'='*50}")
                
                self.run_cycle()
                
                logging.info(f"Waiting {self.wait_time} seconds before next cycle...")
                time.sleep(self.wait_time)
                
                cycle_count += 1
                
            except KeyboardInterrupt:
                logging.info("Historical Orchestrator stopped by user")
                break
            except Exception as e:
                logging.error(f"Unexpected error in cycle: {e}")
                # Wait before trying again
                time.sleep(self.wait_time)

def main():
    orchestrator = ScriptOrchestrator()
    orchestrator.start()

if __name__ == "__main__":
    main()