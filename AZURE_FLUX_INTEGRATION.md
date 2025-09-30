# Azure Flux Integration Guide

## Overview

This document describes the Azure Flux integration for the Flux AI Image Generator. The integration allows you to use FLUX models hosted on Azure AI Foundry for enterprise-grade image generation with enhanced security, scalability, and compliance.

## Supported Models

### FLUX 1.1 [pro]
- **Purpose**: Text-to-image generation with ultra-high quality
- **Speed**: 6× faster than Flux 1-pro
- **Resolution**: Up to 4 MP images
- **Features**: Ultra mode for 4 MP images, Raw mode for natural "camera" look
- **Best For**: Storyboard ideation, high-quality content creation

### FLUX.1 Kontext [pro]
- **Purpose**: In-context image generation and editing (text + image prompt)
- **Speed**: 8× faster than other SOTA editors (0.9s per 1024×1024 edit)
- **Features**: Local edits, full scene re-gen, style transfer, character consistency, iterative editing
- **Best For**: Image editing, e-commerce variants, iterative refinement

## API Format

The integration uses the **Azure OpenAI Image Generation API** format, which is compatible with the FLUX models deployed on Azure AI Foundry.

### Request Format

```json
{
  "prompt": "Your image description here",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}
```

### Response Format

```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "Enhanced prompt used for generation"
    }
  ]
}
```

## Implementation Details

### Endpoint Configuration

The Azure Flux endpoints follow this pattern:
```
https://{resource-name}.services.ai.azure.com/openai/deployments/{deployment-name}/images/generations?api-version=2025-04-01-preview
```

Example:
```
https://copilot-dy-foundry.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
```

### Authentication

Authentication uses the `api-key` header (not `Authorization: Bearer`):
```javascript
headers: {
  "Content-Type": "application/json",
  "api-key": "your-api-key-here"
}
```

### Aspect Ratio Mapping

The implementation supports the following aspect ratios:

| Aspect Ratio | Size (WxH) | Use Case |
|--------------|-----------|----------|
| 1:1 | 1024×1024 | Square images, social media |
| 16:9 | 1344×768 | Landscape, presentations |
| 9:16 | 768×1344 | Portrait, mobile stories |
| 3:2 | 1216×832 | Standard photography |
| 2:3 | 832×1216 | Portrait photography |

### Quality Settings

For FLUX 1.1 [pro], the implementation automatically adds:
```json
{
  "quality": "hd"
}
```

This enables the highest quality output for the model.

## Environment Variables

Required environment variables in `.env`:

```bash
# FLUX 1.1 [pro]
AZURE_FLUX_11_PRO_ENDPOINT=https://your-resource.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_11_PRO_API_KEY=your-api-key-here

# FLUX.1 Kontext [pro]
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=https://your-resource.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_KONTEXT_PRO_API_KEY=your-api-key-here
```

## Testing

A test script is provided to validate the Azure Flux integration:

```bash
node test-azure-flux.js
```

This script will:
1. Load environment variables from `.env`
2. Test both FLUX 1.1 [pro] and FLUX.1 Kontext [pro] endpoints
3. Generate test images using the "battery" prompt
4. Display results and any errors

### Expected Output

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
```

## Code Changes

### Files Modified

1. **`app/api/predictions/route.ts`**
   - Updated `callAzureFluxAPI()` to use Azure OpenAI Image API format
   - Changed from `width`/`height` parameters to `size` parameter (e.g., "1024x1024")
   - Changed authentication from `Authorization: Bearer` to `api-key` header
   - Updated response parsing to extract image URL from `data[0].url`
   - Added `quality: "hd"` parameter for FLUX 1.1 [pro]

### Files Created

1. **`test-azure-flux.js`** - Test script for validating Azure Flux endpoints
2. **`AZURE_FLUX_INTEGRATION.md`** - This documentation file

## Use Cases

### Creative Pipeline Acceleration
Use FLUX 1.1 [pro] for initial storyboard generation, then pass frames to Kontext [pro] for precise editing without requiring PSD layers.

### E-commerce Variant Generation
Upload product images and use FLUX.1 Kontext [pro] with prompts to automatically generate seasonal backdrops while preserving product angles.

### Marketing Automation
Pair with Azure OpenAI GPT-4o for copy generation, then use FLUX for image generation, and send variants to A/B email testing.

### Digital Twin Simulation
Use iterative editing with FLUX.1 Kontext [pro] to visualize equipment wear and tear over time for maintenance portals.

## Benefits of Azure Flux

- **Enterprise-grade security and compliance** - Microsoft Product Terms, RBAC, network isolation
- **6-8× faster** than other diffusion-based editors
- **Built-in content safety filters** - Azure AI Content Safety integration
- **Scalable deployments** - Autoscaling on A100/H100 pools
- **Unified access** - Same API surface as other Azure AI services
- **SLA guarantees** - Enterprise uptime commitments

## Pricing

- **Standard endpoints**: Pay-as-you-go at $40 per 1,000 images
- **PTU deployments**: Capacity-backed with autoscaling for high-traffic applications

## Troubleshooting

### Error: "Azure Flux API endpoint or key not configured"
- Ensure environment variables are set in `.env`
- Restart the development server after adding variables

### Error: "Azure API error (401)"
- Verify API key is correct
- Check that the API key hasn't expired in Azure portal

### Error: "No image URL in Azure response"
- Check the response format from Azure
- Ensure the API version is compatible (2025-04-01-preview)

### Network Issues
If you encounter `ENOTFOUND` or DNS resolution errors:
- Verify the endpoint URL is correct
- Check network connectivity to Azure services
- Ensure no firewall rules are blocking Azure endpoints

## Additional Resources

- [Azure AI Foundry](https://ai.azure.com/)
- [Azure AI Foundry Documentation](https://learn.microsoft.com/azure/ai-services/)
- [Content Safety Overview](https://learn.microsoft.com/azure/ai-foundry/ai-services/content-safety-overview)
- [Azure AI Model Catalog](https://azure.microsoft.com/en-us/products/ai-model-catalog)

## Support

For issues with:
- **Azure Flux deployment**: Contact Azure support
- **Integration code**: Open an issue in this repository
- **Model capabilities**: Refer to Black Forest Labs documentation
