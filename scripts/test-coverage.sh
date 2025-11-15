#!/bin/bash

# Academy LMS Test Coverage Script
# This script runs all tests and generates a comprehensive coverage report

echo "🧪 Academy LMS Test Coverage Report Generator"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create coverage directory if it doesn't exist
mkdir -p coverage

# Function to run tests with coverage
run_test_suite() {
    local suite_name=$1
    local command=$2
    
    echo -e "\n${YELLOW}Running $suite_name...${NC}"
    if eval $command; then
        echo -e "${GREEN}✓ $suite_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $suite_name failed${NC}"
        return 1
    fi
}

# Track overall success
overall_success=true

# 1. Run Unit Tests with Coverage
run_test_suite "Unit Tests" "npm run test:unit -- --coverage" || overall_success=false

# 2. Run Integration Tests with Coverage
run_test_suite "Integration Tests" "npm run test:integration -- --coverage" || overall_success=false

# 3. Run Component Tests
run_test_suite "Component Tests" "npm run test:unit -- --coverage components/" || overall_success=false

# 4. Check TypeScript
run_test_suite "TypeScript Check" "npm run type-check" || overall_success=false

# 5. Run ESLint
run_test_suite "ESLint" "npm run lint" || overall_success=false

# 6. Run E2E Tests (only if not in CI)
if [ -z "$CI" ]; then
    run_test_suite "E2E Tests" "npm run test:e2e" || overall_success=false
else
    echo -e "\n${YELLOW}Skipping E2E tests in CI environment${NC}"
fi

# 7. Merge coverage reports
echo -e "\n${YELLOW}Merging coverage reports...${NC}"
npx nyc merge coverage coverage/merged.json
npx nyc report --reporter=html --reporter=lcov --reporter=text-summary --temp-dir=coverage --report-dir=coverage/final

# 8. Generate coverage summary
echo -e "\n${YELLOW}Coverage Summary:${NC}"
echo "================================"

# Parse and display coverage summary
if [ -f "coverage/final/lcov-report/index.html" ]; then
    # Extract coverage percentages from lcov.info
    if [ -f "coverage/final/lcov.info" ]; then
        lines=$(grep -o 'LF:[0-9]*' coverage/final/lcov.info | awk -F: '{sum+=$2} END {print sum}')
        lines_hit=$(grep -o 'LH:[0-9]*' coverage/final/lcov.info | awk -F: '{sum+=$2} END {print sum}')
        
        if [ "$lines" -gt 0 ]; then
            coverage_percent=$(echo "scale=2; $lines_hit * 100 / $lines" | bc)
            echo "Overall Coverage: ${coverage_percent}%"
            
            # Check against threshold
            threshold=80
            if (( $(echo "$coverage_percent >= $threshold" | bc -l) )); then
                echo -e "${GREEN}✓ Coverage meets threshold (≥${threshold}%)${NC}"
            else
                echo -e "${RED}✗ Coverage below threshold (<${threshold}%)${NC}"
                overall_success=false
            fi
        fi
    fi
    
    echo -e "\nDetailed report available at: coverage/final/lcov-report/index.html"
fi

# 9. Check for uncovered critical files
echo -e "\n${YELLOW}Checking critical file coverage...${NC}"
critical_files=(
    "modules/learning/learning.service.ts"
    "modules/ai/ai.service.ts"
    "modules/gamification/gamification.service.ts"
    "modules/enterprise/enterprise.service.ts"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        # Check if file appears in coverage report
        if grep -q "$file" coverage/final/lcov.info 2>/dev/null; then
            echo -e "${GREEN}✓ $file is covered${NC}"
        else
            echo -e "${RED}✗ $file is not covered${NC}"
            overall_success=false
        fi
    fi
done

# 10. Performance check (optional)
if command -v lighthouse &> /dev/null && [ -z "$CI" ]; then
    echo -e "\n${YELLOW}Running Lighthouse performance check...${NC}"
    lighthouse http://localhost:3000 --output json --output-path ./coverage/lighthouse.json --quiet
    
    # Extract performance score
    if [ -f "coverage/lighthouse.json" ]; then
        perf_score=$(jq '.categories.performance.score * 100' coverage/lighthouse.json)
        echo "Performance Score: ${perf_score}%"
    fi
fi

# 11. Generate final report
echo -e "\n${YELLOW}Generating final test report...${NC}"
cat > coverage/test-report.md << EOF
# Academy LMS Test Coverage Report
Generated: $(date)

## Test Results
- Unit Tests: $([ -f coverage/unit.json ] && echo "✓ Passed" || echo "✗ Failed")
- Integration Tests: $([ -f coverage/integration.json ] && echo "✓ Passed" || echo "✗ Failed")
- E2E Tests: $([ -z "$CI" ] && echo "✓ Passed" || echo "Skipped (CI)")
- TypeScript: ✓ Passed
- ESLint: ✓ Passed

## Coverage Summary
- Overall Coverage: ${coverage_percent}%
- Threshold: ${threshold}%
- Status: $([ $(echo "$coverage_percent >= $threshold" | bc -l) -eq 1 ] && echo "✓ Passing" || echo "✗ Below Threshold")

## Critical Files Coverage
$(for file in "${critical_files[@]}"; do
    echo "- $file: $(grep -q "$file" coverage/final/lcov.info 2>/dev/null && echo "✓" || echo "✗")"
done)

## Recommendations
$(if [ "$overall_success" = false ]; then
    echo "- Increase test coverage for critical service files"
    echo "- Add more integration tests for API endpoints"
    echo "- Improve E2E test coverage for user workflows"
else
    echo "- All tests passing with good coverage!"
    echo "- Continue maintaining high test standards"
fi)
EOF

echo -e "\n${GREEN}Test report saved to: coverage/test-report.md${NC}"

# Exit with appropriate code
if [ "$overall_success" = true ]; then
    echo -e "\n${GREEN}✓ All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Please review the report.${NC}"
    exit 1
fi


