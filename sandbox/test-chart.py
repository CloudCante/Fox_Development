import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# EC665 Data - Updated with better sample (last 7 days)
# Top 3 fixtures: NV-NC0066, NV-NC0054, NV-NC0142
fixture_data = {
    'NV-NC0066': [1, 2, 2, 5, 2, 3, 9],  # Most problematic fixture
    'NV-NC0054': [1, 0, 0, 0, 3, 0, 0],   # Moderate issues
    'NV-NC0142': [0, 0, 0, 0, 1, 2, 0]    # Fewer issues
}

# Create DataFrame
df = pd.DataFrame(fixture_data)
dates = ['2025-09-24', '2025-09-25', '2025-09-29', '2025-09-30', 
         '2025-10-01', '2025-10-02', '2025-10-03']

# Calculate subgroup averages and ranges
df['average'] = df.mean(axis=1)
df['range'] = df.max(axis=1) - df.min(axis=1)

# Calculate grand average and average range
grand_average = df['average'].mean()
average_range = df['range'].mean()
subgroup_size = len(fixture_data)  # n = 3

print("=== EC665 X-bar and R Chart Data ===")
print(f"Grand Average (X̄): {grand_average:.2f}")
print(f"Average Range (R̄): {average_range:.2f}")
print(f"Subgroup Size (n): {subgroup_size}")
print("\nSubgroup Data:")
print(df)

# Statistical constants for n=3
A2 = 1.023  # For X-bar chart control limits
D3 = 0      # For R chart lower control limit
D4 = 2.574  # For R chart upper control limit

# Calculate control limits
# X-bar chart control limits
xbar_ucl = grand_average + (A2 * average_range)
xbar_lcl = grand_average - (A2 * average_range)

# R chart control limits  
r_ucl = D4 * average_range
r_lcl = D3 * average_range

print(f"\n=== Control Limits ===")
print(f"X-bar UCL: {xbar_ucl:.2f}")
print(f"X-bar Center Line: {grand_average:.2f}")
print(f"X-bar LCL: {xbar_lcl:.2f} (Note: Negative LCL not practical for error counts)")
print(f"R UCL: {r_ucl:.2f}")
print(f"R Center Line: {average_range:.2f}")
print(f"R LCL: {r_lcl:.2f}")

# Create the charts
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))

# X-bar Chart
ax1.plot(range(len(dates)), df['average'], 'bo-', linewidth=2, markersize=8, label='Subgroup Averages')
ax1.axhline(y=grand_average, color='g', linestyle='-', linewidth=2, label=f'Center Line (X̄ = {grand_average:.2f})')
ax1.axhline(y=xbar_ucl, color='r', linestyle='--', linewidth=2, label=f'UCL = {xbar_ucl:.2f}')
ax1.axhline(y=xbar_lcl, color='r', linestyle='--', linewidth=2, label=f'LCL = {xbar_lcl:.2f}')
ax1.set_title('X-bar Chart - EC665 Error Code (Fixture-Based Subgroups)', fontsize=14, fontweight='bold')
ax1.set_xlabel('Subgroup Number')
ax1.set_ylabel('Average Errors per Day')
ax1.set_xticks(range(len(dates)))
ax1.set_xticklabels([d.split('-')[1]+'/'+d.split('-')[2] for d in dates], rotation=45)
ax1.grid(True, alpha=0.3)
ax1.legend()
# Set y-axis to show control limits properly
y_min = min(xbar_lcl, min(df['average'])) - 0.5
y_max = max(xbar_ucl, max(df['average'])) + 0.5
ax1.set_ylim(y_min, y_max)

# R Chart
ax2.plot(range(len(dates)), df['range'], 'ro-', linewidth=2, markersize=8, label='Subgroup Ranges')
ax2.axhline(y=average_range, color='g', linestyle='-', linewidth=2, label=f'Center Line (R̄ = {average_range:.2f})')
ax2.axhline(y=r_ucl, color='r', linestyle='--', linewidth=2, label=f'UCL = {r_ucl:.2f}')
ax2.axhline(y=r_lcl, color='r', linestyle='--', linewidth=2, label=f'LCL = {r_lcl:.2f}')
ax2.set_title('R Chart - EC665 Error Code (Fixture-Based Subgroups)', fontsize=14, fontweight='bold')
ax2.set_xlabel('Subgroup Number')
ax2.set_ylabel('Range of Errors per Day')
ax2.set_xticks(range(len(dates)))
ax2.set_xticklabels([d.split('-')[1]+'/'+d.split('-')[2] for d in dates], rotation=45)
ax2.grid(True, alpha=0.3)
ax2.legend()
ax2.set_ylim(0, max(df['range']) * 1.2)

plt.tight_layout()
plt.savefig('ec665_xbar_r_chart.png', dpi=300, bbox_inches='tight')
print(f"\nChart saved as 'ec665_xbar_r_chart.png'")
plt.show()

# Check for out-of-control points
print(f"\n=== Chart Interpretation ===")
print("X-bar Chart Analysis:")
for i, avg in enumerate(df['average']):
    if avg > xbar_ucl:
        print(f"  Subgroup {i+1} ({dates[i]}): OUT OF CONTROL - Above UCL ({avg:.2f} > {xbar_ucl:.2f})")
    elif avg < xbar_lcl:
        print(f"  Subgroup {i+1} ({dates[i]}): OUT OF CONTROL - Below LCL ({avg:.2f} < {xbar_lcl:.2f})")
    else:
        print(f"  Subgroup {i+1} ({dates[i]}): IN CONTROL ({avg:.2f})")

print("\nR Chart Analysis:")
for i, rng in enumerate(df['range']):
    if rng > r_ucl:
        print(f"  Subgroup {i+1} ({dates[i]}): OUT OF CONTROL - Above UCL ({rng:.2f} > {r_ucl:.2f})")
    elif rng < r_lcl:
        print(f"  Subgroup {i+1} ({dates[i]}): OUT OF CONTROL - Below LCL ({rng:.2f} < {r_lcl:.2f})")
    else:
        print(f"  Subgroup {i+1} ({dates[i]}): IN CONTROL ({rng:.2f})")
