# EC665 Error Code X-bar and R Chart Documentation

## Objective
Monitor EC665 error code across fixtures to identify:
- Which fixtures are causing EC665 errors
- When EC665 error rates go out of control
- Trends in EC665 failures over time

## Methodology

### Step 1: Collect Data
**Data Source**: `snfn_aggregate_daily` table
**Filter**: `error_code = 'EC665'`
**Time Range**: Last 30 days
**Grouping**: By fixture and date

**Raw Data Example**:
```
fixture_no    | test_date   | daily_errors
NV-NC0066     | 2025-09-24  | 9
NV-NC0066     | 2025-09-25  | 3
NV-NC0066     | 2025-09-29  | 2
NV-NC0157     | 2025-09-24  | 4
NV-NC0157     | 2025-09-25  | 2
NV-NC0150     | 2025-09-25  | 1
```

### Step 2: Calculate Subgroup Averages and Ranges

**Subgroup Definition**: Each day = one subgroup
**Sample Size (n)**: 3 fixtures per subgroup (top 3 fixtures for EC665)

**Subgroup Data Table**:
```
Sample        2025-09-24   2025-09-25   2025-09-29   2025-09-30   2025-10-01   2025-10-02   2025-10-03
NV-NC0066         9            3            2            5            2            2            1
NV-NC0157         4            2            0            2            1            1            0
NV-NC0150         0            1            1            0            3            4            3
Average          4.33         2.00         1.00         2.33         2.00         2.33         1.33
Range            9            2            2            5            2            3            3
```

**Calculations**:
- **2025-09-24**: Average = (9+4+0)/3 = 4.33, Range = 9-0 = 9
- **2025-09-25**: Average = (3+2+1)/3 = 2.00, Range = 3-1 = 2
- **2025-09-29**: Average = (2+0+1)/3 = 1.00, Range = 2-0 = 2
- **2025-09-30**: Average = (5+2+0)/3 = 2.33, Range = 5-0 = 5
- **2025-10-01**: Average = (2+1+3)/3 = 2.00, Range = 3-1 = 2
- **2025-10-02**: Average = (2+1+4)/3 = 2.33, Range = 4-1 = 3
- **2025-10-03**: Average = (1+0+3)/3 = 1.33, Range = 3-0 = 3

### Step 3: Calculate Grand Average and Average Range

**Grand Average (X̄)**: (4.33 + 2.00 + 1.00 + 2.33 + 2.00 + 2.33 + 1.33) ÷ 7 = **2.19**
**Average Range (R̄)**: (9 + 2 + 2 + 5 + 2 + 3 + 3) ÷ 7 = **3.71**

### Step 4: Calculate Control Limits

**Statistical Constants for n=3**:
- A₂ = 1.023 (X-bar chart)
- D₃ = 0 (R chart lower limit)
- D₄ = 2.574 (R chart upper limit)

**X-bar Chart Control Limits**:
- Upper Control Limit (UCL) = X̄ + (A₂ × R̄) = 2.19 + (1.023 × 3.71) = **5.99**
- Center Line = X̄ = **2.19**
- Lower Control Limit (LCL) = X̄ - (A₂ × R̄) = 2.19 - (1.023 × 3.71) = **-1.61**

**R Chart Control Limits**:
- Upper Control Limit (UCL) = D₄ × R̄ = 2.574 × 3.71 = **9.56**
- Center Line = R̄ = **3.71**
- Lower Control Limit (LCL) = D₃ × R̄ = 0 × 3.71 = **0.00**

### Step 5: Plot Subgroup Averages (X-bar Chart)
- **Y-axis**: Average errors per day
- **X-axis**: Subgroup number (date)
- **Data points**: Daily averages (4.33, 2.00, 1.00, etc.)
- **Center Line**: 2.19
- **Control Limits**: 5.99 (UCL), -1.61 (LCL)

### Step 6: Plot Subgroup Ranges (R Chart)
- **Y-axis**: Range of errors per day
- **X-axis**: Subgroup number (date)
- **Data points**: Daily ranges (9, 2, 2, etc.)
- **Center Line**: 3.71
- **Control Limits**: 9.56 (UCL), 0.00 (LCL)

## Chart Interpretation

### X-bar Chart Analysis:
- **Purpose**: Monitor average EC665 error rate per day
- **All subgroups**: IN CONTROL (all points between 5.99 and -1.61)
- **Trend**: Decreasing from 4.33 to 1.33 (good trend)

### R Chart Analysis:
- **Purpose**: Monitor variability in EC665 errors between fixtures
- **Most subgroups**: IN CONTROL
- **Most problematic day**: 2025-09-24 (range = 9, approaching UCL)

## Key Findings

1. **Fixture NV-NC0066**: Primary source of EC665 errors (9 errors on 09/24)
2. **Process Improvement**: EC665 errors trending down over time
3. **High Variability**: Range up to 9 suggests inconsistent fixture performance
4. **Action Required**: Monitor NV-NC0066 fixture for EC665-specific issues

## Control Limit Interpretation

- **Points above UCL**: Process out of control (investigate immediately)
- **Points below LCL**: Process improved (investigate what changed)
- **Runs of 7+ points**: Process may be trending
- **R Chart UCL violation**: Excessive variability between fixtures

## Next Steps

1. **Focus on NV-NC0066**: Investigate why this fixture has most EC665 errors
2. **Maintenance**: Check temperature regulation system (EC665 likely temperature-related)
3. **Monitor trends**: Continue tracking to ensure improvement continues
4. **Expand analysis**: Apply same methodology to other high-frequency error codes
