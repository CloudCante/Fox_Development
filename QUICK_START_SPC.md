# SPC API Quick Start Guide

## 🚀 Test It Now (5 minutes)

### Step 1: Start Backend
```bash
cd /home/cloud/projects/Fox_Development/Fox_app/backend
npm start
```

### Step 2: Test with curl
```bash
# Get top problem fixtures
curl "http://localhost:5000/api/spc/top-offenders?dateRange=30" | jq

# Generate EC665 chart
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&errorCode=EC665&topN=3" | jq
```

### Step 3: Run Automated Tests
```bash
cd /home/cloud/projects/Fox_Development/Fox_app/backend
node test_spc_api.js
```

---

## 📋 API Cheat Sheet

### Endpoint 1: Generate Chart
```
GET /api/spc/chart
```

**Required:**
- `startDate` (YYYY-MM-DD)
- `endDate` (YYYY-MM-DD)

**Optional:**
- `model` (e.g., "Tesla SXM5")
- `fixtureNo` (e.g., "NV-NC0066" or "NV-NC0066,NV-NC0139")
- `errorCode` (e.g., "EC665")
- `topN` (3-10, default: 3)

**Example:**
```bash
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&errorCode=EC665"
```

---

### Endpoint 2: Top Offenders
```
GET /api/spc/top-offenders
```

**Optional:**
- `dateRange` (days, default: 30)
- `model` (e.g., "Tesla SXM5")
- `limit` (default: 10)

**Example:**
```bash
curl "http://localhost:5000/api/spc/top-offenders?dateRange=30&limit=5"
```

---

### Endpoint 3: Available Filters
```
GET /api/spc/available-filters
```

**Optional:**
- `dateRange` (days, default: 30)

**Example:**
```bash
curl "http://localhost:5000/api/spc/available-filters"
```

---

## 🎨 Frontend TODO

### Components Needed:
1. **SPCFilters.jsx** - Filter panel (model, fixture, error, dates)
2. **XBarChart.jsx** - X-bar control chart
3. **RChart.jsx** - R (range) control chart
4. **TopOffendersPanel.jsx** - Shows suggestions for filters
5. **ViolationAlert.jsx** - Displays out-of-control warnings

### Recommended Libraries:
- **Chart.js** or **Recharts** for charting
- **Material-UI DatePicker** for date selection
- **Autocomplete** for fixture selection

---

## 📚 Documentation

- **Full API Docs:** `Fox_app/backend/routes/SPC_ROUTES_README.md`
- **Versioning Strategy:** `Fox_app/backend/API_VERSIONING_STRATEGY.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Chart Theory:** `sandbox/EC665_Xbar_R_Chart_Documentation.md`

---

## 🐛 Troubleshooting

**"Connection refused"**
→ Make sure backend is running on port 5000

**"Insufficient data" error**
→ Need at least 5 work days (Mon-Thu) in date range

**"No data found"**
→ Check your date range and filters (maybe no errors in that period)

**Empty fixtures array**
→ Reduce `topN` or broaden filters

---

## ✅ Success Checklist

- [ ] Backend server starts without errors
- [ ] `test_spc_api.js` passes all 6 tests
- [ ] Can fetch top offenders
- [ ] Can generate chart for EC665
- [ ] Can generate chart for specific fixture
- [ ] Frontend filter panel created
- [ ] X-bar chart displays correctly
- [ ] R chart displays correctly
- [ ] Violations are highlighted

---

## 📞 Quick Examples

### Get worst fixture and its worst error:
```bash
# Step 1: Get top offenders
TOP=$(curl -s "http://localhost:5000/api/spc/top-offenders?limit=1")
FIXTURE=$(echo $TOP | jq -r '.top_fixtures[0].fixture_no')
ERROR=$(echo $TOP | jq -r '.top_error_codes[0].error_code')

# Step 2: Generate chart for that combo
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&fixtureNo=$FIXTURE&errorCode=$ERROR"
```

### Compare two specific fixtures:
```bash
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-15&endDate=2025-10-07&fixtureNo=NV-NC0066,NV-NC0139&topN=2"
```

### All errors for a model:
```bash
curl "http://localhost:5000/api/spc/chart?startDate=2025-09-01&endDate=2025-10-07&model=Tesla%20SXM5&topN=5"
```

---

**Ready to go! 🎉**

