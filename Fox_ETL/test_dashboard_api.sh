#!/bin/bash

# Test script for GPU Testing Dashboard API
# This simulates what the testers would do from their bash scripts

API_BASE="http://localhost:5000/api/dashboard"

echo "=== Testing GPU Testing Dashboard API ==="
echo

# Test 1: Get dashboard status
echo "1. Testing GET /api/dashboard/status"
curl -s -X GET "$API_BASE/status" | jq '.'
echo
echo "---"
echo

# Test 2: Add a test fixture
echo "2. Testing POST /api/dashboard/fixtures"
curl -s -X POST "$API_BASE/fixtures" \
  -H "Content-Type: application/json" \
  -d '{
    "tester_type": "B Tester",
    "fixture_id": "TEST-001",
    "rack": "1",
    "fixture_sn": "TEST123456",
    "test_type": "Refurbish",
    "ip_address": "192.168.1.100",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "creator": "test_script"
  }' | jq '.'
echo
echo "---"
echo

# Test 3: Update health status
echo "3. Testing POST /api/dashboard/health"
curl -s -X POST "$API_BASE/health" \
  -H "Content-Type: application/json" \
  -d '{
    "fixture_id": 1,
    "status": "active",
    "comments": "Test fixture is working properly",
    "creator": "test_script"
  }' | jq '.'
echo
echo "---"
echo

# Test 4: Start a test
echo "4. Testing POST /api/dashboard/usage/start"
curl -s -X POST "$API_BASE/usage/start" \
  -H "Content-Type: application/json" \
  -d '{
    "fixture_id": 1,
    "test_slot": "Left",
    "test_station": "BAT",
    "test_type": "Refurbish",
    "gpu_pn": "692-2G520-0200-500",
    "gpu_sn": "1234567890123",
    "log_path": "/TESLA/G520/test_log.txt",
    "creator": "test_script"
  }' | jq '.'
echo
echo "---"
echo

# Test 5: Get updated dashboard status
echo "5. Testing GET /api/dashboard/status (after updates)"
curl -s -X GET "$API_BASE/status" | jq '.'
echo
echo "---"
echo

echo "=== API Testing Complete ==="
