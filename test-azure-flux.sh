#!/bin/bash
#
# Test script for Azure Flux API endpoints using curl
# This script tests the Azure Flux endpoints with a simple API call
#

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================================================"
echo "Azure Flux API Test Script (curl)"
echo "======================================================================"
echo ""

# Function to test an endpoint
test_endpoint() {
    local model_name=$1
    local endpoint=$2
    local api_key=$3
    local quality=$4

    echo "----------------------------------------------------------------------"
    echo "Testing: ${model_name}"
    echo "----------------------------------------------------------------------"
    echo "Endpoint: ${endpoint}"
    echo "API Key: ${api_key:0:20}..."
    echo ""

    if [ -z "$endpoint" ] || [ -z "$api_key" ]; then
        echo -e "${RED}❌ Error: Endpoint or API key not configured${NC}"
        return 1
    fi

    # Build request body
    if [ "$quality" = "hd" ]; then
        request_body='{
            "prompt": "A beautiful battery with lightning bolts and energy, high quality, detailed",
            "n": 1,
            "size": "1024x1024",
            "quality": "hd"
        }'
    else
        request_body='{
            "prompt": "A beautiful battery with lightning bolts and energy, high quality, detailed",
            "n": 1,
            "size": "1024x1024"
        }'
    fi

    echo "Request Body:"
    echo "$request_body" | jq '.' 2>/dev/null || echo "$request_body"
    echo ""

    echo "Sending request..."
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
        -H "Content-Type: application/json" \
        -H "api-key: $api_key" \
        -d "$request_body")

    # Extract status code and body
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    echo "Response Status: $status_code"
    echo ""

    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ Success!${NC}"
        
        # Extract and display image URL or base64 data
        image_url=$(echo "$body" | jq -r '.data[0].url' 2>/dev/null)
        b64_data=$(echo "$body" | jq -r '.data[0].b64_json' 2>/dev/null)
        
        if [ -n "$image_url" ] && [ "$image_url" != "null" ]; then
            echo ""
            echo -e "${GREEN}✅ Image URL: $image_url${NC}"
        elif [ -n "$b64_data" ] && [ "$b64_data" != "null" ]; then
            b64_length=${#b64_data}
            echo ""
            echo -e "${GREEN}✅ Image returned as base64-encoded data${NC}"
            echo -e "${GREEN}✅ Base64 data length: $b64_length characters${NC}"
            echo -e "${GREEN}✅ Content safety filters passed${NC}"
        else
            echo ""
            echo -e "${RED}⚠️  Warning: No image URL or base64 data found${NC}"
        fi
        return 0
    else
        echo -e "${RED}❌ Failed!${NC}"
        echo "Response:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# Test FLUX 1.1 [pro]
test_endpoint "FLUX 1.1 [pro]" "$AZURE_FLUX_11_PRO_ENDPOINT" "$AZURE_FLUX_11_PRO_API_KEY" "hd"
flux_11_result=$?
echo ""

# Test FLUX.1 Kontext [pro]
test_endpoint "FLUX.1 Kontext [pro]" "$AZURE_FLUX_KONTEXT_PRO_ENDPOINT" "$AZURE_FLUX_KONTEXT_PRO_API_KEY" ""
flux_kontext_result=$?
echo ""

# Summary
echo "======================================================================"
echo "Test Summary"
echo "======================================================================"
if [ $flux_11_result -eq 0 ]; then
    echo -e "${GREEN}✅ FLUX 1.1 [pro]: PASSED${NC}"
else
    echo -e "${RED}❌ FLUX 1.1 [pro]: FAILED${NC}"
fi

if [ $flux_kontext_result -eq 0 ]; then
    echo -e "${GREEN}✅ FLUX.1 Kontext [pro]: PASSED${NC}"
else
    echo -e "${RED}❌ FLUX.1 Kontext [pro]: FAILED${NC}"
fi

echo ""
if [ $flux_11_result -eq 0 ] && [ $flux_kontext_result -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
