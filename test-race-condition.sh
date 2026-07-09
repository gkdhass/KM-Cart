#!/bin/bash

# Test script for MongoDB serverless race condition fix
# Tests concurrent requests to verify no 500 errors occur

API_URL="https://km-cart.vercel.app/api/products"
NUM_REQUESTS=20

echo "════════════════════════════════════════════════════════════"
echo "  Testing MongoDB Race Condition Fix"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "API Endpoint: $API_URL"
echo "Concurrent Requests: $NUM_REQUESTS"
echo ""
echo "Sending $NUM_REQUESTS concurrent requests..."
echo ""

# Array to store results
declare -a results

# Send concurrent requests
for i in $(seq 1 $NUM_REQUESTS); do
  (
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL")
    echo "$response"
  ) &
done

# Wait for all background jobs to complete
wait

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Results Summary"
echo "════════════════════════════════════════════════════════════"
echo ""

# Count status codes
success_count=$(curl -s -o /dev/null -w "%{http_code}\n" "$API_URL" 2>&1 | grep -c "200")
error_count=$(curl -s -o /dev/null -w "%{http_code}\n" "$API_URL" 2>&1 | grep -c "500")

echo "Expected: All 20 requests return 200"
echo ""
echo "✅ If all show 200: Race condition FIXED"
echo "❌ If any show 500: Race condition still present"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. Check Vercel Function Logs for connection messages"
echo "2. Look for: '[DB] ✅ MongoDB Connected: <hostname>'"
echo "3. Look for: '[DB] 📦 Database: gkcart'"
echo "4. Verify NO 'undefined' in connection logs"
echo ""
echo "Vercel Logs: https://vercel.com/dashboard → Your Project → Deployments → Latest → Functions"
echo ""
