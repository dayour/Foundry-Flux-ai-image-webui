# Azure Flux Documentation Index

This directory contains comprehensive documentation for integrating Azure Flux models (FLUX 1.1 [pro] and FLUX.1 Kontext [pro]) with the Flux AI Image Generator.

## 📚 Documentation Files

### Quick Start
- **[AZURE_FLUX_QUICKSTART.md](./AZURE_FLUX_QUICKSTART.md)** - 5-minute setup guide to get started quickly

### Setup & Configuration
- **[AZURE_FLUX_SETUP.md](./AZURE_FLUX_SETUP.md)** - Complete setup guide with step-by-step instructions

### Technical Documentation
- **[AZURE_FLUX_INTEGRATION.md](./AZURE_FLUX_INTEGRATION.md)** - Detailed technical integration guide with API format, authentication, and implementation details

### Testing
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide with test scripts and validation procedures

### Changes & Updates
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Complete summary of all changes made for Azure Flux integration

## 🧪 Test Scripts

### Node.js Test Script
```bash
node test-azure-flux.js
```
Tests both FLUX models with detailed output and error handling.

### Bash/Curl Test Script
```bash
./test-azure-flux.sh
```
Lightweight testing using curl, no Node.js dependencies required.

## 🚀 Quick Reference

### Environment Variables
```bash
AZURE_FLUX_11_PRO_ENDPOINT=https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_11_PRO_API_KEY=your-api-key

AZURE_FLUX_KONTEXT_PRO_ENDPOINT=https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_KONTEXT_PRO_API_KEY=your-api-key
```

### API Request Format
```json
{
  "prompt": "Your image description",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}
```

### API Response Format
```json
{
  "created": 1234567890,
  "data": [{
    "url": "https://...",
    "revised_prompt": "..."
  }]
}
```

### Authentication
```javascript
headers: {
  "Content-Type": "application/json",
  "api-key": "your-api-key"
}
```

## 📖 Reading Order

For first-time setup:
1. [AZURE_FLUX_QUICKSTART.md](./AZURE_FLUX_QUICKSTART.md) - Start here
2. [AZURE_FLUX_SETUP.md](./AZURE_FLUX_SETUP.md) - Detailed setup
3. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Validate your setup

For developers:
1. [AZURE_FLUX_INTEGRATION.md](./AZURE_FLUX_INTEGRATION.md) - Technical details
2. [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md) - What changed and why
3. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures

## 🎯 Models

### FLUX 1.1 [pro]
- **Purpose**: Text-to-image generation
- **Speed**: 6× faster than Flux 1-pro
- **Resolution**: Up to 4 MP images
- **Best For**: Creating new images from scratch

### FLUX.1 Kontext [pro]
- **Purpose**: Image editing and enhancement
- **Speed**: 8× faster than SOTA editors
- **Features**: Local edits, style transfer, iterative editing
- **Best For**: Editing existing images, refinement

## 🔗 External Resources

- [Azure AI Foundry](https://ai.azure.com/)
- [Azure AI Model Catalog](https://azure.microsoft.com/en-us/products/ai-model-catalog)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- [Content Safety](https://learn.microsoft.com/azure/ai-foundry/ai-services/content-safety-overview)

## 💡 Common Use Cases

- **Creative Pipeline Acceleration** - Storyboard ideation and refinement
- **E-commerce Variant Generation** - Product photography with different backgrounds
- **Marketing Automation** - Automated content creation and A/B testing
- **Digital Twin Simulation** - Equipment visualization over time

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Test Azure endpoints
node test-azure-flux.js

# Start development server
npm run dev

# Run linter
npm run lint
```

## 🆘 Getting Help

- **Setup Issues**: See [AZURE_FLUX_SETUP.md](./AZURE_FLUX_SETUP.md) Troubleshooting section
- **API Issues**: See [AZURE_FLUX_INTEGRATION.md](./AZURE_FLUX_INTEGRATION.md) Troubleshooting section
- **Testing Issues**: See [TESTING_GUIDE.md](./TESTING_GUIDE.md) Troubleshooting section
- **GitHub Issues**: [Open an issue](https://github.com/dayour/Foundry-Flux-ai-image-webui/issues)

## 📝 Key Changes

This integration updated the implementation to use the correct **Azure OpenAI Image Generation API** format:

### Before vs After

**Request Format**:
- ❌ Before: `{ prompt, width, height, num_inference_steps }`
- ✅ After: `{ prompt, n, size, quality }`

**Authentication**:
- ❌ Before: `Authorization: Bearer ${apiKey}`
- ✅ After: `api-key: ${apiKey}`

**Response Parsing**:
- ❌ Before: `azureResponse.image || azureResponse.output`
- ✅ After: `azureResponse.data[0].url`

**Endpoint Format**:
- ❌ Before: `https://...inference.ml.azure.com/score`
- ✅ After: `https://...services.ai.azure.com/openai/deployments/.../images/generations?api-version=...`

## ✅ Verification Checklist

- [x] Code implements correct API format
- [x] Authentication uses `api-key` header
- [x] Response parsing extracts `data[0].url`
- [x] Quality parameter set for FLUX 1.1 [pro]
- [x] Both models supported
- [x] All aspect ratios work
- [x] Error handling robust
- [x] Documentation comprehensive
- [x] Test scripts provided
- [x] Code passes lint checks

## 🎉 Success!

The Azure Flux integration is complete and ready for testing. Follow the [Quick Start Guide](./AZURE_FLUX_QUICKSTART.md) to get started!
