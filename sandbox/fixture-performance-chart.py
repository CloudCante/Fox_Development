import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Total Fixture Failures Data (All Error Codes Combined)
# Top 3 fixtures: NV-NC0150, NV-NC0167, NV-NC0066 over last 4 days
fixture_data = {
    'NV-NC0150': [5, 4, 4, 2],  # Highest total failures
    'NV-NC0167': [5, 4, 1, 3],   # Second highest
    'NV-NC0066': [2, 5, 3, 7]    # Third highest
}

# Create DataFrame
df = pd.DataFrame(fixture_data)
dates = ['2025-09-29', '2025-09-30', '2025-10-01', '2025-10-02']

# Calculate subgroup averages and ranges
df['average'] = df.mean(axis=1)
df['range'] = df.max(axis=1) - df.min(axis=1)

# Calculate grand average and average range
grand_average = df['average'].mean()
average_range = df['range'].mean()
subgroup_size = len(fixture_data)  # n = 3

print("=== Fixture Performance X-bar and R Chart Data ===")
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
ax1.set_title('X-bar Chart - Total Fixture Failures (All Error Codes)', fontsize=14, fontweight='bold')
ax1.set_xlabel('Subgroup Number')
ax1.set_ylabel('Average Failures per Day')
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
ax2.set_title('R Chart - Total Fixture Failures (All Error Codes)', fontsize=14, fontweight='bold')
ax2.set_xlabel('Subgroup Number')
ax2.set_ylabel('Range of Failures per Day')
ax2.set_xticks(range(len(dates)))
ax2.set_xticklabels([d.split('-')[1]+'/'+d.split('-')[2] for d in dates], rotation=45)
ax2.grid(True, alpha=0.3)
ax2.legend()
ax2.set_ylim(0, max(df['range']) * 1.2)

plt.tight_layout()
plt.savefig('fixture_performance_xbar_r_chart.png', dpi=300, bbox_inches='tight')
print(f"\nChart saved as 'fixture_performance_xbar_r_chart.png'")
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

# Additional analysis
print(f"\n=== Fixture Performance Analysis ===")
print("Individual Fixture Performance:")
for fixture in fixture_data.keys():
    total_errors = sum(fixture_data[fixture])
    avg_errors = np.mean(fixture_data[fixture])
    print(f"  {fixture}: {total_errors} total errors, {avg_errors:.2f} avg per day")

print(f"\nProcess Stability Assessment:")
if average_range > grand_average:
    print("  HIGH VARIABILITY: Fixtures performing very differently")
else:
    print("  MODERATE VARIABILITY: Fixtures performing relatively consistently")

if grand_average > 3:
    print("  HIGH FAILURE RATE: Overall fixture performance needs improvement")
elif grand_average > 1.5:
    print("  MODERATE FAILURE RATE: Monitor for trends")
else:
    print("  LOW FAILURE RATE: Good fixture performance")
