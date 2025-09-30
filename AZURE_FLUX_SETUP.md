# Azure Flux Setup Guide

This guide will help you integrate Azure Flux models (FLUX 1.1 [pro] and FLUX.1 Kontext [pro]) with your Flux AI Image Generator.

## Overview

Azure Flux models provide enterprise-grade image generation capabilities with:
- **8× faster** performance than leading diffusion-based editors
- Built-in **content safety filters** and **RBAC**
- **Enterprise SLAs** and compliance
- Seamless integration with Azure services

## Models Available

### FLUX 1.1 [pro]
- **Core Task**: Text-to-image generation
- **Speed**: 6× faster than Flux 1-pro; ~10s for a 4MP image
- **Resolution**: Up to 4MP (4 megapixel)
- **Features**: Ultra mode for high quality, Raw mode for natural camera look
- **Pricing**: $40 per 1,000 images

### FLUX.1 Kontext [pro]
- **Core Task**: In-context image generation and editing
- **Speed**: Up to 8× faster than SOTA editors (0.9s per 1024×1024 edit)
- **Features**: Local edits, full scene regen, style transfer, character consistency, iterative editing
- **Pricing**: $40 per 1,000 images

## Setup Instructions

### Step 1: Azure Account Setup

1. If you don't have an Azure subscription, sign up at [Azure Portal](https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go)

### Step 2: Deploy Models in Azure AI Foundry

1. Go to [Azure AI Foundry](https://ai.azure.com/)
2. Search for the model in the model catalog:
   - `FLUX-1.1-pro`
   - `FLUX.1-Kontext-pro`
3. Open the model card in the catalog
4. Click **Deploy** to obtain the inference API endpoint and key
5. Access the playground to test your prompts

### Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Azure FLUX 1.1 [pro]
AZURE_FLUX_11_PRO_ENDPOINT=https://your-endpoint.inference.ml.azure.com/score
AZURE_FLUX_11_PRO_API_KEY=your-api-key-here

# Azure FLUX.1 Kontext [pro]
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=https://your-endpoint.inference.ml.azure.com/score
AZURE_FLUX_KONTEXT_PRO_API_KEY=your-api-key-here
```

### Step 4: Use the Models

Once configured, the Azure Flux models will appear in your model dropdown:
- `flux 1.1 [pro] (Azure)` - For text-to-image generation
- `flux.1 kontext [pro] (Azure)` - For image editing and generation

## API Details

### Request Parameters

The implementation automatically configures:
- **Dimensions**: Converted from aspect ratios (1:1, 16:9, 9:16, 3:2, 2:3)
- **Inference Steps**: 
  - FLUX 1.1 [pro]: 40 steps (optimized for quality)
  - FLUX.1 Kontext [pro]: 25 steps (converges quickly)

### Supported Aspect Ratios

| Ratio | Width | Height | Use Case |
|-------|-------|--------|----------|
| 1:1   | 1024  | 1024   | Square images, social media |
| 16:9  | 1344  | 768    | Landscape, presentations |
| 9:16  | 768   | 1344   | Portrait, mobile stories |
| 3:2   | 1216  | 832    | Standard photography |
| 2:3   | 832   | 1216   | Portrait photography |

## Use Cases

### Creative Pipeline Acceleration
Use FLUX 1.1 [pro] for storyboard ideation → pass frames into Kontext [pro] for surgical tweaks without PSD layers.

### E-commerce Variant Generation
Inject product hero shot + prompt to FLUX.1 Kontext [pro] to auto-paint seasonal backdrops while preserving SKU angles.

### Marketing Automation
Pair Azure OpenAI GPT-4o for copy + FLUX images via Logic Apps; send variants to A/B email testing.

### Digital Twin Simulation
Use iterative editing to visualize wear/tear on equipment over time in maintenance portals.

## Best Practices

### Production Readiness Tips

1. **Seed for Determinism**: Both models accept seed for repeatable outputs—store alongside prompt history
2. **Step Budget**: 
   - Ultra-mode images look best with 40-50 inference steps
   - FLUX.1 Kontext [pro] edits converge in < 30 steps
3. **Guard-rail Chaining**: Pipe outputs through Azure AI Content Safety and your own watermark classifier
4. **Caching**: For high-traffic apps, cache intermediate latent representations (Kontext) to speed multi-turn edits

### Security Features

- **Built-in content safety filters**
- **Role-based access control (RBAC)**
- **Virtual network isolation**
- **Automatic Azure Monitor logging**
- **Azure Policy, Purview, and Sentinel integration**

## Troubleshooting

### Common Issues

**Error: "Azure Flux API endpoint or key not configured"**
- Ensure you've added the environment variables to your `.env` file
- Restart your development server after adding the variables

**Error: "Azure API error (401)"**
- Check that your API key is correct
- Verify the API key hasn't expired in Azure portal

**Error: "Azure API error (429)"**
- You've hit rate limits
- Consider upgrading to a capacity-backed PTU deployment

## Cost Management

- Standard endpoints: Pay-as-you-go ($40 per 1,000 images)
- PTU deployments: Capacity-backed with autoscaling
- Use Azure Cost Management for budget tracking

## Additional Resources

- [Azure AI Foundry Documentation](https://learn.microsoft.com/azure/ai-services/)
- [Content Safety Overview](https://learn.microsoft.com/azure/ai-foundry/ai-services/content-safety-overview)
- [Azure AI Model Catalog](https://azure.microsoft.com/en-us/products/ai-model-catalog)

## Support

For Azure-specific issues:
- [Azure Support Portal](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- [Azure AI Community](https://techcommunity.microsoft.com/t5/azure-ai-services/ct-p/AzureAIServices)

For application issues:
- Open an issue in this repository
- Contact support@fluximage.org
