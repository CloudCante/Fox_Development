#!/usr/bin/env node
/**
 * Test script for SPC API endpoints
 * Run: node test_spc_api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/spc';

// Test configurations
const tests = [
    {
        name: 'Test 1: Get top offenders (last 30 days)',
        endpoint: '/top-offenders',
        params: {
            dateRange: 30,
            limit: 10
        }
    },
    {
        name: 'Test 2: Get available filters',
        endpoint: '/available-filters',
        params: {
            dateRange: 30
        }
    },
    {
        name: 'Test 3: Generate SPC chart for EC665 (top 3 fixtures)',
        endpoint: '/chart',
        params: {
            startDate: '2025-09-15',
            endDate: '2025-10-07',
            errorCode: 'EC665',
            topN: 3
        }
    },
    {
        name: 'Test 4: Generate SPC chart for specific fixture (NV-NC0066)',
        endpoint: '/chart',
        params: {
            startDate: '2025-09-15',
            endDate: '2025-10-07',
            fixtureNo: 'NV-NC0066,NV-NC0139,NV-NC0142',
            topN: 3
        }
    },
    {
        name: 'Test 5: Generate SPC chart for Tesla SXM5 model (all error codes)',
        endpoint: '/chart',
        params: {
            startDate: '2025-09-15',
            endDate: '2025-10-07',
            model: 'Tesla SXM5',
            topN: 3
        }
    },
    {
        name: 'Test 6: Test with different subgroup size (n=5)',
        endpoint: '/chart',
        params: {
            startDate: '2025-09-15',
            endDate: '2025-10-07',
            errorCode: 'EC665',
            topN: 5
        }
    }
];

async function runTest(test) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Endpoint: ${test.endpoint}`);
    console.log(`Params:`, JSON.stringify(test.params, null, 2));
    
    try {
        const response = await axios.get(`${BASE_URL}${test.endpoint}`, {
            params: test.params
        });
        
        console.log(`✅ Status: ${response.status}`);
        
        // Pretty print relevant parts of response
        if (test.endpoint === '/top-offenders') {
            console.log(`\n📊 Top Fixtures (${response.data.top_fixtures.length}):`);
            response.data.top_fixtures.slice(0, 5).forEach((fixture, idx) => {
                console.log(`  ${idx + 1}. ${fixture.fixture_no}: ${fixture.total_errors} errors (${fixture.avg_per_day}/day)`);
            });
            
            console.log(`\n🔴 Top Error Codes (${response.data.top_error_codes.length}):`);
            response.data.top_error_codes.slice(0, 5).forEach((error, idx) => {
                console.log(`  ${idx + 1}. ${error.error_code}: ${error.total_errors} errors (${error.fixtures_affected} fixtures)`);
            });
        } else if (test.endpoint === '/available-filters') {
            console.log(`\n📋 Available Filters:`);
            console.log(`  Models: ${response.data.models.join(', ')}`);
            console.log(`  Total Fixtures: ${response.data.total_fixtures}`);
            console.log(`  Error Codes: ${response.data.error_codes.length} unique codes`);
            console.log(`  Date Range: ${response.data.date_range.earliest} to ${response.data.date_range.latest}`);
        } else if (test.endpoint === '/chart') {
            console.log(`\n📈 Chart Data:`);
            console.log(`  Fixtures in Chart: ${response.data.fixtures_in_chart.map(f => f.fixture_no).join(', ')}`);
            console.log(`  Subgroups (Days): ${response.data.statistics.total_subgroups}`);
            console.log(`  Subgroup Size (n): ${response.data.statistics.subgroup_size}`);
            
            console.log(`\n📊 Control Limits:`);
            console.log(`  X-bar UCL: ${response.data.control_limits.xbar.ucl}`);
            console.log(`  X-bar Center: ${response.data.control_limits.xbar.center_line}`);
            console.log(`  X-bar LCL: ${response.data.control_limits.xbar.lcl}`);
            console.log(`  R UCL: ${response.data.control_limits.r.ucl}`);
            console.log(`  R Center: ${response.data.control_limits.r.center_line}`);
            
            console.log(`\n⚠️  Violations:`);
            if (response.data.violations.length === 0) {
                console.log(`  ✅ No violations detected - Process in control`);
            } else {
                response.data.violations.forEach(v => {
                    const icon = v.severity === 'critical' ? '🔴' : v.severity === 'warning' ? '🟡' : '🟢';
                    console.log(`  ${icon} ${v.date}: ${v.message}`);
                });
            }
            
            console.log(`\n📅 Sample Daily Data (first 3 days):`);
            response.data.daily_data.slice(0, 3).forEach(day => {
                console.log(`  ${day.date}:`);
                Object.entries(day.fixtures).forEach(([fixture, data]) => {
                    console.log(`    ${fixture}: ${data.errors} errors (${data.data_quality})`);
                });
                console.log(`    → Avg: ${day.subgroup_average?.toFixed(2)}, Range: ${day.subgroup_range}`);
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
        }
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log('🚀 Starting SPC API Tests...');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Make sure the backend server is running on port 5000!\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await runTest(test);
        if (result.success) {
            passed++;
        } else {
            failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📊 Test Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Total: ${tests.length}`);
    console.log(`${'='.repeat(70)}\n`);
}

// Check if axios is available
try {
    require('axios');
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('❌ axios is not installed. Please run: npm install axios');
    console.log('   Or test manually using curl/Postman');
    process.exit(1);
}

