# Azure Flux Integration - Changes Summary

## Overview

This document summarizes the changes made to integrate Azure Flux models (FLUX 1.1 [pro] and FLUX.1 Kontext [pro]) with the proper Azure OpenAI Image Generation API format.

## Problem Statement

The original implementation used an incorrect API format for Azure Flux endpoints. The Azure Flux models on Azure AI Foundry use the **Azure OpenAI Image Generation API** format, not a custom inference endpoint format.

## Key Changes

### 1. API Request Format Update

**Before:**
```javascript
{
    prompt: prompts,
    width: dimensions.width,
    height: dimensions.height,
    num_inference_steps: 40  // or 25
}
```

**After:**
```javascript
{
    prompt: prompts,
    n: 1,
    size: "1024x1024",
    quality: "hd"  // for FLUX 1.1 [pro]
}
```

### 2. Authentication Header Update

**Before:**
```javascript
headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
}
```

**After:**
```javascript
headers: {
    "Content-Type": "application/json",
    "api-key": apiKey
}
```

### 3. Response Parsing Update

**Before:**
```javascript
output: azureResponse.image || azureResponse.output || azureResponse.result || azureResponse.url
```

**After:**
```javascript
// Azure OpenAI Image API returns data in format:
// { created: timestamp, data: [{ url: "...", revised_prompt: "..." }] }
const imageUrl = azureResponse.data?.[0]?.url || 
               azureResponse.data?.[0]?.b64_json ||
               azureResponse.url ||
               azureResponse.image;
```

### 4. Endpoint URL Format Update

**Before:**
```
https://your-endpoint.inference.ml.azure.com/score
```

**After:**
```
https://your-resource.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
```

## Files Modified

### 1. `app/api/predictions/route.ts`
- **Changes**: Updated `callAzureFluxAPI()` function
- **Lines Modified**: 20-69, 105-116
- **Purpose**: Implement correct Azure OpenAI Image API format

### 2. `AZURE_FLUX_SETUP.md`
- **Changes**: Updated endpoint examples and API details section
- **Purpose**: Provide accurate configuration instructions

### 3. `README.md`
- **Changes**: Updated endpoint format examples in Azure Flux section
- **Purpose**: Guide users to correct endpoint configuration

## Files Created

### 1. `AZURE_FLUX_INTEGRATION.md`
- **Purpose**: Comprehensive integration guide
- **Contents**:
  - API format documentation
  - Request/response examples
  - Authentication details
  - Aspect ratio mappings
  - Troubleshooting guide
  - Use cases and benefits

### 2. `test-azure-flux.js`
- **Purpose**: Node.js test script for validating Azure Flux endpoints
- **Features**:
  - Tests both FLUX 1.1 [pro] and FLUX.1 Kontext [pro]
  - Validates request/response format
  - Provides detailed error messages
  - Generates test images with "battery" prompt

### 3. `test-azure-flux.sh`
- **Purpose**: Bash/curl test script for validating Azure Flux endpoints
- **Features**:
  - Alternative to Node.js script
  - Uses curl for API calls
  - Color-coded output
  - Works without npm dependencies

### 4. `.env` (local only, not committed)
- **Purpose**: Local environment configuration with actual endpoints
- **Note**: Contains sensitive API keys, excluded by `.gitignore`

## Aspect Ratio Mapping

The implementation supports these aspect ratios:

| Ratio | Size (WxH) | Use Case |
|-------|-----------|----------|
| 1:1   | 1024×1024 | Square images, social media |
| 16:9  | 1344×768  | Landscape, presentations |
| 9:16  | 768×1344  | Portrait, mobile stories |
| 3:2   | 1216×832  | Standard photography |
| 2:3   | 832×1216  | Portrait photography |

## Model-Specific Parameters

### FLUX 1.1 [pro]
- **Quality**: Set to "hd" for highest quality output
- **Speed**: 6× faster than Flux 1-pro
- **Resolution**: Up to 4 MP images

### FLUX.1 Kontext [pro]
- **Speed**: 8× faster than other SOTA editors (0.9s per 1024×1024 edit)
- **Features**: Local edits, style transfer, character consistency

## Testing

Two test scripts are provided:

### Node.js Test Script
```bash
node test-azure-flux.js
```

### Bash/curl Test Script
```bash
./test-azure-flux.sh
```

Both scripts:
1. Load environment variables from `.env`
2. Test both FLUX models
3. Generate images with "battery" prompt
4. Display detailed results

## Environment Configuration

Required environment variables:

```bash
AZURE_FLUX_11_PRO_ENDPOINT=https://your-resource.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_11_PRO_API_KEY=your-api-key-here
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=https://your-resource.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_KONTEXT_PRO_API_KEY=your-api-key-here
```

## Code Quality

- ✅ **Lint**: Passed (no new warnings)
- ✅ **TypeScript**: Syntax correct (existing type errors unrelated to changes)
- ✅ **Git**: Changes committed and pushed

## Next Steps

### For Users:
1. Update `.env` file with correct endpoint format
2. Restart development server
3. Run test scripts to verify configuration
4. Generate images using the UI

### For Manual Testing (requires network access):
1. Access Azure AI Foundry
2. Deploy FLUX models if not already deployed
3. Copy endpoint and API key
4. Test with provided scripts
5. Verify image generation in the UI

## Benefits

- **Correct API Format**: Uses official Azure OpenAI Image API
- **Better Error Handling**: Improved response parsing and error messages
- **Comprehensive Documentation**: Multiple guides for different user needs
- **Testing Tools**: Two test scripts for validation
- **Enterprise Ready**: Proper authentication and security

## References

- [Azure AI Foundry](https://ai.azure.com/)
- [Azure OpenAI Image API Documentation](https://learn.microsoft.com/azure/ai-services/openai/reference)
- [FLUX Models on Azure](https://azure.microsoft.com/en-us/products/ai-model-catalog)
- [Content Safety](https://learn.microsoft.com/azure/ai-foundry/ai-services/content-safety-overview)

## Support

For issues:
- **Azure Deployment**: Contact Azure Support
- **Integration Code**: Open GitHub issue
- **API Format**: Refer to this document and `AZURE_FLUX_INTEGRATION.md`
