# Total Fixture Performance X-bar and R Chart Documentation

## Objective
Monitor overall fixture reliability across all error codes to identify:
- Which fixtures are performing worse than others
- Overall fixture health trends over time
- Early warning system for fixture maintenance needs

## Methodology

### Step 1: Collect Data
**Data Source**: `snfn_aggregate_daily` table
**Filter**: All error codes (no filter)
**Time Range**: Last 30 days
**Grouping**: By fixture and date

**Raw Data Example**:
```
fixture_no    | test_date   | daily_errors (all error codes)
NV-NC0150     | 2025-09-29  | 2
NV-NC0150     | 2025-09-30  | 4
NV-NC0150     | 2025-10-01  | 4
NV-NC0150     | 2025-10-02  | 2
NV-NC0167     | 2025-09-29  | 1
NV-NC0167     | 2025-09-30  | 3
NV-NC0066     | 2025-09-30  | 7
```

### Step 2: Calculate Subgroup Averages and Ranges

**Subgroup Definition**: Each day = one subgroup
**Sample Size (n)**: 3 fixtures per subgroup (top 3 fixtures by total errors)

**Subgroup Data Table**:
```
Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0
```

**Calculations**:
- **2025-09-29**: Average = (5+5+2)/3 =  ...4.00,......Range = 5-2 = 3.0
- **2025-09-30**: Average = (4+4+5)/3 =  ....4.33,......Range = 5-4 = 1.0
- **2025-10-01**: Average = (4+1+3)/3 =  ....2.67,......Range = 4-1 = 3.0
- **2025-10-02**: Average = (2+3+7)/3 =  ....4.00,......Range = 7-2 = 5.0

`Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0`

`Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0`

`Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0`

`Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0`

`Sample        2025-09-29   2025-09-30   2025-10-01   2025-10-02
NV-NC0150         5            4            4            2
NV-NC0167         5            4            1            3
NV-NC0066         2            5            3            7
Average           4.00         4.33         2.67         4.00
Range             3.0          1.0          3.0          5.0`

`Sample        2025-09-29   2025 SAMPLE DATA TABLE:
|||
|:---|:---|
|Fixture|2025-09-29|2025-09-30|2025-10-01|2025-10-02|Total|Avg/day|
|NV-NC0150|5|4|4|2|15|3.75|
 NV-NC0167     | 5|4|1|3|13|3.25 |
|NV-NC0066     |2|5|3|7|17|4.25|
|Column Average|4.00|4.33|2.67|4.00||3.75|
|Day Range|3.0|1.0|3.0|5.0||3.0|

CALCULATIONS:
- Day 1 avg = (5+5+2)/3 = 4.00 .. Range = 5−2 = 3.0
- Day 2 avg = (4+4+5)/3 = 4.33 .. Range = 5−4 = 1.0
- Day 3 avg = (4+1+3)/3 = 2.67 .. Range = 4−1 = 3.0
- Day 4 avg = (2+3+7)/3 = 4.00 .. Range = 7−2 = 5.0
- Grand Avg = (4.00+4.33+2.67+4.00)/4 = 3.75
- Avg Range = (3.0+1.0+3.0+5.0)/4 = 3.0

STEP 4: CONTROL LIMITS (subgroup n = 3)
Xbar: UCL/A2*R̄ + X̄ = 1.023*3.0 + 3.75 = 6.82
.....     Center = X̄ = 3.75
.....     LCL = X̄ − A2*R̄ = 3.75 − 1.023*3.0 = 0.68
R: UCL = D4 * R̄ = 2.574 × 3.0 = 7.72
...    Center = R̄ = 3.0
...    LCL = D3 * R̄ = 0

STEP 5 & 6: PLOT AND ANALYSIS
— Xbar: Y= Averages (4.00, 4.33, 2.67, 4.00); controls = 6.82 / 3.75 / 0.68
— R: Y= Ranges (3.0, 1.0, 3.0, 5.0); controls = 7.72 / 3.0 / 0
— All subgroups IN CONTROL
— Failure rate HIGH (>3 avg); moderate variability

EXECUTIVE SUMMARY
· Track overall fixture health across all error codes.
· Detects deterioration early; guides maintenance priorities.
· Use to pick which fixture(s) warrant deeper error-code drill-down.

|||
|:---:|:---|
|Key insights:|High failure rate: all fixtures need improvement|
|Most problematic:|NV-NC0066 (4.25/day avg)|
|Variability:|Moderate; process reasonably consistent|
|Action:|Prioritize NV-NC0066 maintenance; apply error-specific charts next|

FINDINGS SHOW YOUR WORK 
1) Chart construction: subgroups per day, top 3 fixtures, n=3.
2) Control limits: Xbar UCL/LCL = 6.82/0.68; R UCL = 7.72.
3) Interpretation: early-warning tool; daily aggregate failure rate.
4) Use: trigger deeper error-code analysis on worst fixtures.

Q&A
— Why per-day subgroups? Natural business cycle; simple to interpret.
— Why n=3? Balanced precision vs practicality; D4 constant applies.
— UCL/R limits OK? Yes, within chart visually; LCL not practical for counts.
— Action after R spike? Investigate that day’s fixtures; correlate with work load/staff.

SUMMARY MATH CHEATSHEET
Grand Average (X̄) = 3.75 ..............Average Range (R̄) = 3.0
UCLX = X̄ + 1.023*R̄ = 6.82 .........UCLR = 2.574*R̄ = 7.72
LCLX = X̄ − 1.023*R̄ = 0.68 .........LCLR = 0
All subgroups IN CONTROL.

Appendix
• Data source: snfn_aggregate_daily (all error codes).
• Top fixtures selected by total 30-day failures.
• Business-logic note: exclude holidays/no-work days (preferably in dashboard with user toggle).
• Charts: Xbar above, R below; annotate UCL, center, LCL; flag violations.

|||
|:---|:---|
|Sample|2025-09-29|2025-09-30|2025-10-01|2025-10-02|
NV-NC0150        5            4            4            2
NV-NC0167        5            4            1            3
NV-NC0066        2            5            3            7
Average          4.00         4.33         2.67         4.00
Range            3.0          1.0          3.0          5.0

CALCULATIONS:
- **2025-09-29**: Average = (5+5+2)/3 = 4.00, Range = 5-2 = 3.0
- **2025-09-30**: Average = (4+4+5)/3 = 4.33, Range = 5-4 = 1.0
- **2025-10-01**: Average = (4+1+3)/3 = 2.67, Range = 4-1 = 3.0
- **2025-10-02**: Average = (2+3+7)/3 = 4.00, Range = 7-2 = 5.0

### Step 3: Calculate Grand Average and Average Range

**Grand Average (X̄)**: (4.00 + 4.33 + 2.67 + 4.00) ÷ 4 = **3.75**
**Average Range (R̄)**: (3.0 + 1.0 + 3.0 + 5.0) ÷ 4 = **3.0**

### Step 4: Calculate Control Limits

**Statistical Constants for n=3**:
- A₂ = 1.023 (X-bar chart)
- D₃ = 0 (R chart lower limit)
- D₄ = 2.574 (R chart upper limit)

**X-bar Chart Control Limits**:
- Upper Control Limit (UCL) = X̄ + (A₂ × R̄) = 3.75 + (1.023 × 3.0) = **6.82**
- Center Line = X̄ = **3.75**
- Lower Control Limit (LCL) = X̄ - (A₂ × R̄) = 3.75 - (1.023 × 3.0) = **0.68**

**R Chart Control Limits**:
- Upper Control Limit (UCL) = D₄ × R̄ = 2.574 × 3.0 = **7.72**
- Center Line = R̄ = **3.0**
- Lower Control Limit (LCL) = D₃ × R̄ = 0 × 3.0 = **0.00**

### Step 5: Plot Subgroup Averages (X-bar Chart)
- **Y-axis**: Average total failures per day
- **X-axis**: Subgroup number (date)
- **Data points**: Daily averages (4.00, 4.33, 2.67, 4.00)
- **Center Line**: 3.75
- **Control Limits**: 6.82 (UCL), 0.68 (LCL)

### Step 6: Plot Subgroup Ranges (R Chart)
- **Y-axis**: Range of total failures per day
- **X-axis**: Subgroup number (date)
- **Data points**: Daily ranges (3.0, 1.0, 3.0, 5.0)
- **Center Line**: 3.0
- **Control Limits**: 7.72 (UCL), 0.00 (LCL)

## Chart Interpretation

### X-bar Chart Analysis:
- **Purpose**: Monitor average total failure rate per day
- **All subgroups**: IN CONTROL (all points between 6.82 and 0.68)
- **Trend**: Moderate failure rate (~3.75 per day average)

### R Chart Analysis:
- **Purpose**: Monitor variability in total failures between fixtures
- **All subgroups**: IN CONTROL
- **Variability**: Moderate range (1.0 to 5.0 daily range)

## Key Findings

1. **Overall System Health**: HIGH FAILURE RATE - all fixtures need improvement
2. **Fixture Ranking**: NV-NC0066 worst (4.25 avg/day), NV-NC0150 close second (3.75 avg/day)
3. **Consistent Problem**: All three fixtures performing poorly, not just one
4. **Variability**: Moderate between fixtures, suggesting systematic issues

## Control Limit Interpretation

- **Points above UCL**: Fixture performance critically degraded (investigate immediately)
- **Points below LCL**: Fixture performance improved significantly (investigate what changed)
- **R Chart UCL violation**: Excessive variability between fixtures (check calibration/maintenance)
- **Trending patterns**: Seven consecutive points above/below center line suggests sustained change

## Business Application

### Tier 1 Monitoring (Early Warning System)
1. **Daily Review**: Check if any fixture exceeds UCL
2. **Weekly Analysis**: Look for trending patterns
3. **Maintenance Trigger**: R chart violations indicate fixture inconsistencies

### Tier 2 Deep Dive Process
1. **Identify Problem Fixtures**: Focus on highest failure fixtures first
2. **Error Code Analysis**: Use EC665 chart (or other specific error charts) for root cause
3. **Targeted Maintenance**: Fix specific issues rather than random repairs

## Next Steps

1. **Priority Maintenance**: Focus on NV-NC0066 fixture (highest failure rate)
2. **Error Code Investigation**: Use specific error charts to identify root causes
3. **Process Improvement**: Investigate why all fixtures have high failure rates
4. **Expand Coverage**: Monitor more fixtures as maintenance improves worst performers
