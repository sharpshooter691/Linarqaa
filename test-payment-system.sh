#!/bin/bash

# Payment System Test Script
# This script tests the payment system functionality

echo "=== Linarqaa Payment System Test ==="
echo ""

# Base URL
BASE_URL="http://localhost:8080/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Function to make HTTP requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "$body"
    return $http_code
}

echo "1. Testing payment statistics..."
stats_response=$(make_request "GET" "/payments/statistics")
stats_code=$?
print_status $stats_code "Payment statistics endpoint"

echo "2. Testing overdue payments..."
overdue_response=$(make_request "GET" "/payments/overdue")
overdue_code=$?
print_status $overdue_code "Overdue payments endpoint"

echo "3. Testing all payments endpoint..."
payments_response=$(make_request "GET" "/payments")
payments_code=$?
print_status $payments_code "All payments endpoint"

echo "4. Testing monthly bill generation..."
# Get current year and month
current_year=$(date +%Y)
current_month=$(date +%m)

generate_response=$(make_request "POST" "/payments/generate-monthly?year=$current_year&month=$current_month")
generate_code=$?
print_status $generate_code "Monthly bill generation"

echo ""
echo "=== Test Results ==="
echo "Statistics Response:"
echo "$stats_response" | jq '.' 2>/dev/null || echo "$stats_response"

echo ""
echo "Overdue Payments Response:"
echo "$overdue_response" | jq '.' 2>/dev/null || echo "$overdue_response"

echo ""
echo "All Payments Response:"
echo "$payments_response" | jq '.' 2>/dev/null || echo "$payments_response"

echo ""
echo "Bill Generation Response:"
echo "$generate_response" | jq '.' 2>/dev/null || echo "$generate_response"

echo ""
echo "=== Test Summary ==="
echo "Statistics: $([ $stats_code -eq 200 ] && echo "PASS" || echo "FAIL")"
echo "Overdue: $([ $overdue_code -eq 200 ] && echo "PASS" || echo "FAIL")"
echo "Payments: $([ $payments_code -eq 200 ] && echo "PASS" || echo "FAIL")"
echo "Generation: $([ $generate_code -eq 200 ] && echo "PASS" || echo "FAIL")"

echo ""
echo "=== Usage Examples ==="
echo "To generate bills for current month:"
echo "curl -X POST \"$BASE_URL/payments/generate-monthly\""
echo ""
echo "To get all unpaid payments:"
echo "curl \"$BASE_URL/payments?status=UNPAID\""
echo ""
echo "To get payment statistics:"
echo "curl \"$BASE_URL/payments/statistics\""
echo ""
echo "To get overdue payments:"
echo "curl \"$BASE_URL/payments/overdue\""
