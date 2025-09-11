#!/usr/bin/env python3
"""
Wareconn Data Downloader (Chrome Version)
- Opens Chrome for a one-time interactive login (optional flags)
- Reuses those cookies for headless Excel download via requests
- Fails fast if the server returns HTML (login/error) instead of Excel
"""

import argparse
import os
import shutil
import sys
import tempfile
import time
from datetime import datetime, timedelta
from typing import Optional

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.common.exceptions import WebDriverException



class WareconnDownloader:
    def __init__(
        self,
        use_chrome_cookies: bool = False,        # default False: prefer interactive login path
        chrome_profile: str = "Default",
        chrome_domain_filter: str = "wareconn.com",
    ):
        self.base_url = "https://www.wareconn.com/r/Summary/downBaseInfo"
        self.chrome_domain_filter = chrome_domain_filter

        # Session + headers that look like Chrome
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": (
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,"
                "application/vnd.ms-excel,"
                "text/html,application/xhtml+xml,application/xml;q=0.9,"
                "image/webp,*/*;q=0.8"
            ),
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            # Helpful for CSRF-protected flows
            "Origin": "https://www.wareconn.com",
            "Referer": "https://www.wareconn.com/",
        })

        # Legacy path (not recommended on locked-down systems); kept for completeness
        if use_chrome_cookies:
            print("Note: direct Chrome cookie DB loading is disabled in this build. "
                  "Use --interactive-login instead.")
            # You could wire your previous DB-cookie method back here if desired.

    # ----------------- Interactive login (Chrome) -----------------

    def interactive_login_and_capture_cookies(
        self,
        login_url: str = "https://www.wareconn.com/",
        use_real_chrome_profile: bool = False,
        chrome_profile: str = "Default",
        persist_profile_dir: Optional[str] = None,
        chromedriver_path: str | None = None,
        headless: bool = False,
    ) -> None:
        """
        Open Chrome (headful by default), let the user log in, then copy cookies into this requests.Session.

        Modes:
        - use_real_chrome_profile=True: attach to your actual Chrome profile (no repeated logins).
        - persist_profile_dir=<path>: dedicated automation profile directory you control; login persists.
        - default: temporary throwaway profile; you'll log in each run.
        """
        temp_profile_dir = None
        driver = None
        try:
            opts = Options()
            
            # Chrome-specific options for better compatibility
            opts.add_argument("--no-sandbox")
            opts.add_argument("--disable-dev-shm-usage")
            opts.add_argument("--disable-blink-features=AutomationControlled")
            opts.add_experimental_option("excludeSwitches", ["enable-automation"])
            opts.add_experimental_option('useAutomationExtension', False)
            
            if not headless:
                opts.add_argument("--start-maximized")
            else:
                opts.add_argument("--headless")

            # Profile management
            if use_real_chrome_profile:
                # Windows Chrome user data directory
                if sys.platform == "win32":
                    user_data_dir = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data")
                elif sys.platform == "darwin":  # macOS
                    user_data_dir = os.path.expanduser("~/Library/Application Support/Google/Chrome")
                else:  # Linux
                    user_data_dir = os.path.expanduser("~/.config/google-chrome")
                
                opts.add_argument(f"--user-data-dir={user_data_dir}")
                opts.add_argument(f"--profile-directory={chrome_profile}")
            elif persist_profile_dir:
                os.makedirs(persist_profile_dir, exist_ok=True)
                opts.add_argument(f"--user-data-dir={persist_profile_dir}")
                opts.add_argument("--profile-directory=Default")
            else:
                temp_profile_dir = tempfile.mkdtemp(prefix="chrome_login_profile_")
                opts.add_argument(f"--user-data-dir={temp_profile_dir}")
                opts.add_argument("--profile-directory=Default")

            # Initialize driver
            if chromedriver_path:
                service = ChromeService(executable_path=chromedriver_path)
                driver = webdriver.Chrome(service=service, options=opts)
            else:
                driver = webdriver.Chrome(options=opts)

            # Execute stealth script to avoid detection
            driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            driver.get(login_url)
            
            if not headless:
                print("\nChrome opened. Please log in to wareconn.com in that window.")
                input("When you are fully logged in, press ENTER here to continue... ")
            else:
                print("Running in headless mode - ensure cookies are already available in the profile.")
                time.sleep(2)  # Give page time to load

            cookies = driver.get_cookies()
            imported = 0
            for c in cookies:
                dom = (c.get("domain") or "")
                if self.chrome_domain_filter in dom:
                    self.session.cookies.set(
                        c["name"], c["value"], domain=dom, path=c.get("path", "/")
                    )
                    imported += 1
            print(f"Imported {imported} cookies from the Chrome session.")

            # Touch the origin once; some sites set extra cookies on first request
            try:
                self.session.get("https://www.wareconn.com/", timeout=30)
            except Exception as e:
                print(f"Warning: Could not make initial request to wareconn.com: {e}")

        except WebDriverException as e:
            print(f"Chrome WebDriver error: {e}")
            print("Make sure Chrome and chromedriver are installed and compatible.")
            raise
        finally:
            if driver:
                try:
                    driver.quit()
                except:
                    pass
            if temp_profile_dir:
                shutil.rmtree(temp_profile_dir, ignore_errors=True)

    # ----------------- Helpers -----------------

    @staticmethod
    def date_to_timestamp(date_str: str) -> int:
        """Convert 'YYYY-MM-DD' to epoch milliseconds (local midnight)."""
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            return int(dt.timestamp() * 1000)
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Use YYYY-MM-DD.")

    @staticmethod
    def _normalize_svc_ids(svc_ids) -> str:
        if svc_ids is None:
            return ""
        if isinstance(svc_ids, (list, tuple)):
            return ",".join(map(str, svc_ids))
        return str(svc_ids)

    @staticmethod
    def _prepare_url(base_url: str, params: dict) -> str:
        """
        Build a URL with params but keep commas unencoded (server expects raw commas
        for 'date' and 'svc_id').
        """
        req = requests.Request("GET", base_url, params=params)
        prepped = requests.Session().prepare_request(req)
        # Safely unescape commas (most servers accept encoded, but this endpoint doesn't)
        return prepped.url.replace("%2C", ",")

    # ----------------- Core download -----------------

    def download_data(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        svc_ids=None,
        cus_id: int = 316,
        pro_id: int = 492,
        output_file: Optional[str] = None,
    ) -> Optional[str]:

        # Sensible defaults: last 7 days ending today
        if end_date is None:
            end_date = datetime.now().strftime("%Y-%m-%d")
        if start_date is None:
            start_date = (datetime.now() - timedelta(days=6)).strftime("%Y-%m-%d")

        # Convert to timestamps
        start_ts = self.date_to_timestamp(start_date)
        end_ts = self.date_to_timestamp(end_date)
        if start_ts > end_ts:
            raise ValueError("start_date must be <= end_date")

        svc_ids_str = self._normalize_svc_ids(svc_ids) or (
            "879,898,1145,1203,1297,1310,1360,1397,1418,1420,1455,1488,1489,1494,1495,1514,1527,1541"
        )

        params = {
            "cusId": cus_id,
            "proId": pro_id,
            "stcName": "",
            "date": f"{start_ts},{end_ts}",
            "pn": "",
            "pmoId": "",
            "svc_id": svc_ids_str,
            "svcNow_id": "",
            "acc_id": "",
            "type": "0",
        }

        print(f"Downloading data for date range: {start_date} to {end_date}")
        print(f"Service IDs: {svc_ids_str}")

        full_url = self._prepare_url(self.base_url, params)
        print(f"URL: {full_url}")

        # Small courtesy delay
        time.sleep(0.4)

        print("Making request to server...")
        resp = self.session.get(full_url, timeout=60, stream=True)
        resp.raise_for_status()

        # If redirected to a login page, bail and save debug
        if resp.url and "login" in resp.url.lower():
            debug_file = (output_file or "wareconn_download") + "_debug.html"
            with open(debug_file, "wb") as f:
                f.write(resp.content)
            print(f"Redirected to login: {resp.url}")
            print(f"Saved HTML to: {debug_file}")
            return None

        ctype = (resp.headers.get("content-type") or "").lower()

        # Decide filename early (honor server filename if present)
        if output_file is None:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            cd = resp.headers.get("content-disposition") or ""
            filename = None
            if "filename=" in cd:
                # naive parse; good enough for simple cases
                filename = cd.split("filename=")[-1].strip('"; ')
            output_file = filename or f"wareconn_data_{ts}.xlsx"

        # If looks like HTML, save it for debugging and exit
        if "text/html" in ctype:
            debug_file = output_file.rsplit(".", 1)[0] + "_debug.html"
            body = resp.content
            with open(debug_file, "wb") as f:
                f.write(body)
            print("Server returned HTML (likely login or error page).")
            print(f"Saved HTML to: {debug_file}")
            return None

        print(f"Saving to file: {output_file}")
        total = 0
        with open(output_file, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    total += len(chunk)

        print(f"Download completed. Total size: {total} bytes")
        print(f"Content type: {ctype or 'Unknown'}")

        # Validate Excel signatures (XLSX zip or legacy XLS OLE)
        try:
            with open(output_file, "rb") as f:
                first8 = f.read(8)
            is_xlsx = first8.startswith(b"PK\x03\x04")        # ZIP container
            is_xls  = first8.startswith(b"\xd0\xcf\x11\xe0")  # OLE
            if not (is_xlsx or is_xls):
                print("Warning: File does not look like an Excel file (signature check failed).")
                return None
        except Exception:
            print("Warning: Could not read back the saved file for signature check.")
            return None

        print(f"Excel file successfully downloaded to: {output_file}")
        return output_file


# ----------------- CLI -----------------

def main():
    parser = argparse.ArgumentParser(description="Download data from wareconn.com using Chrome")

    parser.add_argument("--start-date", "-s", help="Start date (YYYY-MM-DD). Default: today-6d")
    parser.add_argument("--end-date", "-e", help="End date (YYYY-MM-DD). Default: today")
    parser.add_argument("--svc-ids", "-i",
                        help="Service IDs (comma-separated). Default: common set used in app")
    parser.add_argument("--cus-id", "-c", type=int, default=316, help="Customer ID. Default: 316")
    parser.add_argument("--pro-id", "-p", type=int, default=492, help="Project ID. Default: 492")
    parser.add_argument("--output", "-o", help="Output filename. Default: auto-generated .xlsx")

    # Interactive login flags
    parser.add_argument("--interactive-login", action="store_true",
                        help="Open Chrome for interactive login and use those cookies.")
    parser.add_argument("--use-real-chrome-profile", action="store_true",
                        help="Attach to your *real* Chrome profile (avoids logging in each run).")
    parser.add_argument("--chrome-profile", default="Default",
                        help='Chrome profile name ("Default", "Profile 1", etc.).')
    parser.add_argument("--persist-profile-dir",
                        help="Directory for a dedicated automation Chrome profile (persists login across runs).")
    parser.add_argument("--headless", action="store_true",
                        help="Run Chrome in headless mode (only useful with existing profiles).")

    # Legacy cookie DB path (not recommended; kept for parity)
    parser.add_argument("--use-chrome-cookies", action="store_true",
                        help="(Legacy) Try reading Chrome cookie DB directly (disabled in this build).")

    parser.add_argument("--chromedriver-path",
                        help="Path to chromedriver executable (if not in PATH).")
    parser.add_argument("--test-network", action="store_true",
                        help="Test network connectivity to wareconn.com and exit.")
    parser.add_argument("--debug", action="store_true",
                        help="Enable debug output.")

    args = parser.parse_args()

    # Test network connectivity if requested
    if args.test_network:
        print("Testing network connectivity to wareconn.com...")
        try:
            response = requests.get("https://www.wareconn.com/", timeout=10)
            print(f"✓ Successfully connected to wareconn.com (status: {response.status_code})")
            print(f"  Server: {response.headers.get('server', 'Unknown')}")
            print(f"  Content-Type: {response.headers.get('content-type', 'Unknown')}")
            sys.exit(0)
        except requests.exceptions.RequestException as e:
            print(f"✗ Failed to connect to wareconn.com: {e}")
            print("\nTroubleshooting steps:")
            print("1. Check your internet connection")
            print("2. Try opening https://www.wareconn.com/ in your browser")
            print("3. Check if you're behind a corporate firewall")
            print("4. Try a different network (mobile hotspot, etc.)")
            sys.exit(1)

    # Construct downloader
    downloader = WareconnDownloader(
        use_chrome_cookies=args.use_chrome_cookies,
        chrome_profile=args.chrome_profile,
    )

    # Optional interactive login
    if args.interactive_login:
        try:
            downloader.interactive_login_and_capture_cookies(
                use_real_chrome_profile=args.use_real_chrome_profile,
                chrome_profile=args.chrome_profile,
                persist_profile_dir=args.persist_profile_dir,
                chromedriver_path=args.chromedriver_path,
                headless=args.headless,
            )
        except Exception as e:
            print(f"Error during interactive login: {e}")
            print("Make sure Chrome and chromedriver are properly installed.")
            sys.exit(1)

    # Normalize svc ids
    svc_ids = None
    if args.svc_ids:
        svc_ids = [s.strip() for s in args.svc_ids.split(",") if s.strip()]

    # Do the thing
    try:
        result = downloader.download_data(
            start_date=args.start_date,
            end_date=args.end_date,
            svc_ids=svc_ids,
            cus_id=args.cus_id,
            pro_id=args.pro_id,
            output_file=args.output,
        )

        if result:
            print("Download completed successfully!")
            sys.exit(0)
        else:
            print("Download failed!")
            sys.exit(1)
    except Exception as e:
        print(f"Error during download: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()