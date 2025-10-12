# Azure Flux Quick Start Guide

## 5-Minute Setup

### Step 1: Get Your Azure Credentials

1. Go to [Azure AI Foundry](https://ai.azure.com/)
2. Search for "FLUX-1.1-pro" in the model catalog
3. Click **Deploy**
4. Copy your endpoint URL and API key
5. Repeat for "FLUX.1-Kontext-pro"

### Step 2: Configure Environment

Create or update `.env` file:

```bash
# FLUX 1.1 [pro] - Replace YOUR_RESOURCE with your Azure resource name
AZURE_FLUX_11_PRO_ENDPOINT=https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_11_PRO_API_KEY=your-api-key-here

# FLUX.1 Kontext [pro]
AZURE_FLUX_KONTEXT_PRO_ENDPOINT=https://YOUR_RESOURCE.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview
AZURE_FLUX_KONTEXT_PRO_API_KEY=your-api-key-here
```

### Step 3: Test Configuration

Run the consolidated diagnostics script to validate both Azure endpoints and local helper logic:

```bash
pnpm flux:diagnostics
```

Need to limit the checks?

- Remote API calls only: `pnpm flux:diagnostics:remote`
- Local helper checks only: `pnpm flux:diagnostics:local`

You can also invoke it directly if you prefer:

```bash
node scripts/azure/flux-diagnostics.js --help
```

### Step 4: Run the Application

```bash
npm run dev
```

### Step 5: Generate Images

1. Open <http://localhost:3000>
2. Enter your prompt
3. Select aspect ratio
4. Choose model:
   - **flux 1.1 [pro] (Azure)** - Text-to-image
   - **flux.1 kontext [pro] (Azure)** - Image editing
5. Click **Generate**

## API Format Quick Reference

### Request

```json
{
  "prompt": "Your image description",
  "n": 1,
  "size": "1024x1024",
  "quality": "hd"
}
```

### Response

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

## Supported Sizes

- `1024x1024` - Square (1:1)
- `1344x768` - Landscape (16:9)
- `768x1344` - Portrait (9:16)
- `1216x832` - Photography (3:2)
- `832x1216` - Portrait Photo (2:3)

## Common Issues

### ❌ "Azure Flux API endpoint or key not configured"

- Add environment variables to `.env`
- Restart server: `npm run dev`

### ❌ "Azure API error (401)"

- Check API key is correct
- Verify key hasn't expired

### ❌ "No image URL in Azure response"

- Verify endpoint URL format
- Check API version is `2025-04-01-preview`

### ❌ Network/DNS errors

- Verify Azure resource name is correct
- Check network connectivity
- Ensure no firewall blocking Azure

## Example Prompts

### FLUX 1.1 [pro] (Text-to-Image)

- "A futuristic cityscape at sunset, ultra detailed, 8k"
- "Professional product photo of a luxury watch, studio lighting"
- "Abstract art with vibrant colors and geometric shapes"

### FLUX.1 Kontext [pro] (Image Editing)

- "Change the background to a beach scene"
- "Add dramatic lighting from the left"
- "Make the colors more vibrant and saturated"

## Pricing

- **Pay-as-you-go**: $40 per 1,000 images
- **PTU (Provisioned Throughput)**: Contact Azure for pricing

## Best Practices

1. **Use descriptive prompts** - More detail = better results
2. **Choose the right model**:
   - FLUX 1.1 [pro]: New images from scratch
   - FLUX.1 Kontext [pro]: Editing existing images
3. **Monitor costs** - Use Azure Cost Management
4. **Enable content safety** - Pipe through Azure AI Content Safety

## Next Steps

- 📖 Read [AZURE_FLUX_INTEGRATION.md](../AZURE_FLUX_INTEGRATION.md) for detailed documentation
- 📖 Read [AZURE_FLUX_SETUP.md](../AZURE_FLUX_SETUP.md) for setup guide
- 📖 Read [CHANGES_SUMMARY.md](../CHANGES_SUMMARY.md) for technical details
- 🧪 Run test scripts to validate configuration
- 🎨 Start generating images!

## Resources

- [Azure AI Foundry](https://ai.azure.com/)
- [Model Catalog](https://azure.microsoft.com/en-us/products/ai-model-catalog)
- [Documentation](https://learn.microsoft.com/azure/ai-services/)
- [Support](https://github.com/dayour/Foundry-Flux-ai-image-webui/issues)
