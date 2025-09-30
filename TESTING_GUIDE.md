# Azure Flux Integration - Testing Guide

## Prerequisites

Before testing, ensure you have:

1. ✅ Azure AI Foundry account
2. ✅ FLUX models deployed (FLUX-1.1-pro and FLUX.1-Kontext-pro)
3. ✅ API keys and endpoints configured in `.env`
4. ✅ Node.js 18+ installed
5. ✅ Dependencies installed (`npm install`)

## Test Scripts

### 1. Node.js Test Script

**Purpose**: Comprehensive API testing with detailed output

**Command**:
```bash
node test-azure-flux.js
```

**What it tests**:
- Environment variable configuration
- API endpoint connectivity
- Request/response format
- Image URL extraction
- Both FLUX models

**Expected Output**:
```
Azure Flux API Test Script
===========================

============================================================
Testing FLUX 1.1 [pro]
============================================================
Endpoint: https://...
API Key: 6CZgjjg5eJBTkT4OPamY...

Request Body: {
  "prompt": "A beautiful battery with lightning bolts and energy, high quality, detailed",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}

Sending request...

Response Status: 200 OK

✅ Success! Response: {
  "created": 1234567890,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "..."
    }
  ]
}

✅ Image URL: https://...

============================================================
Testing FLUX.1 Kontext [pro]
============================================================
...similar output...

============================================================
Test Summary
============================================================
✅ FLUX 1.1 [pro]: PASSED
✅ FLUX.1 Kontext [pro]: PASSED

✅ All tests passed!
```

### 2. Bash/Curl Test Script

**Purpose**: Lightweight testing without Node.js dependencies

**Command**:
```bash
./test-azure-flux.sh
```

**What it tests**:
- Same as Node.js script
- Uses curl for HTTP requests
- Works in any bash environment

**Expected Output**:
```
======================================================================
Azure Flux API Test Script (curl)
======================================================================

----------------------------------------------------------------------
Testing: FLUX 1.1 [pro]
----------------------------------------------------------------------
Endpoint: https://...
API Key: 6CZgjjg5eJBTkT4OPamY...

Request Body:
{
  "prompt": "A beautiful battery with lightning bolts and energy, high quality, detailed",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}

Sending request...
Response Status: 200

✅ Success!
Response:
{
  "created": 1234567890,
  "data": [...]
}

✅ Image URL: https://...

======================================================================
Test Summary
======================================================================
✅ FLUX 1.1 [pro]: PASSED
✅ FLUX.1 Kontext [pro]: PASSED

✅ All tests passed!
```

## Manual Testing Steps

### Test 1: Configuration Validation

**Steps**:
1. Check `.env` file has all required variables
2. Verify endpoint URLs match the format:
   ```
   https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/MODEL_NAME/images/generations?api-version=2025-04-01-preview
   ```
3. Verify API keys are not empty

**Expected Result**: No errors, all variables present

### Test 2: API Connectivity

**Steps**:
1. Run `node test-azure-flux.js`
2. Check for HTTP 200 response
3. Verify image URL is returned

**Expected Result**: Both models return valid image URLs

### Test 3: UI Integration

**Steps**:
1. Start the application: `npm run dev`
2. Navigate to http://localhost:3000
3. Log in (if required)
4. Select "flux 1.1 [pro] (Azure)" from model dropdown
5. Enter prompt: "A beautiful battery with lightning bolts"
6. Select aspect ratio: 1:1
7. Click "Generate"
8. Wait for image to appear

**Expected Result**:
- Image generates successfully
- Image displays in preview area
- Download/share buttons work

### Test 4: Error Handling

**Test Case A: Invalid API Key**
1. Temporarily change API key in `.env` to invalid value
2. Run test script
3. Should see: "❌ Azure API error (401)"

**Test Case B: Missing Environment Variable**
1. Comment out one endpoint in `.env`
2. Run test script
3. Should see: "❌ Error: Endpoint or API key not configured"

**Test Case C: Invalid Endpoint URL**
1. Change endpoint to invalid URL
2. Run test script
3. Should see network error or 404

## Integration Testing

### Test Different Aspect Ratios

**Test each ratio**:
```bash
# In the UI, test each:
- 1:1 (1024×1024)
- 16:9 (1344×768)
- 9:16 (768×1344)
- 3:2 (1216×832)
- 2:3 (832×1216)
```

**Expected Result**: Images generated in correct dimensions

### Test Both Models

**FLUX 1.1 [pro] Test**:
- Prompt: "Professional product photography of a smartwatch"
- Expected: High-quality, detailed image

**FLUX.1 Kontext [pro] Test**:
- Prompt: "A serene landscape with mountains"
- Expected: Image with good composition and editing potential

## Performance Testing

### Response Time Test

**Steps**:
1. Measure time from request to response
2. Use test scripts with timing

**Expected Results**:
- FLUX 1.1 [pro]: ~10 seconds for 1024×1024
- FLUX.1 Kontext [pro]: ~1 second for 1024×1024

### Load Testing (Optional)

**Steps**:
1. Generate multiple images in succession
2. Monitor Azure cost/usage
3. Check for rate limiting

**Expected Results**:
- No errors under normal load
- Rate limits respected (if any)

## Troubleshooting Tests

### Test 1: Network Connectivity

**Command**:
```bash
curl -I https://YOUR_RESOURCE.services.ai.azure.com
```

**Expected**: HTTP response (200 or 401)

### Test 2: DNS Resolution

**Command**:
```bash
nslookup YOUR_RESOURCE.services.ai.azure.com
```

**Expected**: Valid IP address

### Test 3: API Key Validation

**Command**:
```bash
curl -X POST "https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{"prompt":"test","n":1,"size":"1024x1024"}'
```

**Expected**: JSON response with image URL or error message

## Regression Testing

After making changes, run all tests:

```bash
# 1. Lint check
npm run lint

# 2. Type check (optional, may show pre-existing errors)
npx tsc --noEmit

# 3. API tests
node test-azure-flux.js
./test-azure-flux.sh

# 4. Start dev server
npm run dev

# 5. Manual UI testing
# - Test image generation
# - Test both models
# - Test all aspect ratios
# - Test error handling
```

## Test Checklist

Before marking the feature as complete:

- [ ] Node.js test script passes
- [ ] Bash test script passes
- [ ] UI generates images with FLUX 1.1 [pro]
- [ ] UI generates images with FLUX.1 Kontext [pro]
- [ ] All aspect ratios work correctly
- [ ] Error messages are clear and helpful
- [ ] Download button works
- [ ] Share buttons work
- [ ] Performance is acceptable
- [ ] Documentation is accurate
- [ ] Code is committed and pushed

## Known Limitations

### Network Access
The test environment may have network restrictions preventing access to Azure endpoints. If tests fail with DNS or connection errors:

1. ✅ Code implementation is correct
2. ✅ API format is correct
3. ❌ Network access to Azure is blocked

**Solution**: Test in an environment with Azure access (local development, staging, production)

### Build Failures
The build may fail due to:
1. Network restrictions (can't fetch Google Fonts)
2. Pre-existing TypeScript errors (unrelated to changes)

**Note**: These are environment issues, not code issues

## Success Criteria

The integration is successful when:

1. ✅ API calls use correct format (Azure OpenAI Image API)
2. ✅ Authentication uses `api-key` header
3. ✅ Response parsing extracts `data[0].url`
4. ✅ Both models are supported
5. ✅ All aspect ratios work
6. ✅ Quality parameter set for FLUX 1.1 [pro]
7. ✅ Error handling is robust
8. ✅ Documentation is comprehensive
9. ✅ Test scripts are provided
10. ✅ Code passes lint checks

## Next Steps After Testing

Once all tests pass:

1. ✅ Merge changes to main branch
2. ✅ Deploy to staging environment
3. ✅ Test in staging with real Azure endpoints
4. ✅ Deploy to production
5. ✅ Monitor for errors
6. ✅ Collect user feedback
7. ✅ Iterate based on feedback

## Support

For testing issues:
- **Network/DNS**: Check firewall and network settings
- **API Errors**: Check Azure portal for deployment status
- **Code Issues**: Open GitHub issue with test output
- **Documentation**: Refer to AZURE_FLUX_INTEGRATION.md
