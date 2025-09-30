# Azure Flux API - Example Calls

This document provides example API calls for testing Azure Flux models.

## Environment Setup

First, set your environment variables:

```bash
export AZURE_FLUX_11_PRO_ENDPOINT="https://your-resource.services.ai.azure.com/openai/deployments/FLUX-1.1-pro/images/generations?api-version=2025-04-01-preview"
export AZURE_FLUX_11_PRO_API_KEY="your-api-key-here"

export AZURE_FLUX_KONTEXT_PRO_ENDPOINT="https://your-resource.services.ai.azure.com/openai/deployments/FLUX.1-Kontext-pro/images/generations?api-version=2025-04-01-preview"
export AZURE_FLUX_KONTEXT_PRO_API_KEY="your-api-key-here"
```

## Example 1: Generate Battery Image (FLUX 1.1 [pro])

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{
    "prompt": "A beautiful battery with lightning bolts and energy, high quality, detailed",
    "n": 1,
    "size": "1024x1024",
    "quality": "hd"
  }' | jq '.'
```

### Expected Response

```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://...azure.com/path/to/generated-image.png",
      "revised_prompt": "A beautiful battery with lightning bolts and energy surrounding it, rendered in high quality with detailed textures..."
    }
  ]
}
```

## Example 2: Generate Landscape (FLUX.1 Kontext [pro])

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_KONTEXT_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_KONTEXT_PRO_API_KEY" \
  -d '{
    "prompt": "A serene mountain landscape at sunset with a lake in the foreground",
    "n": 1,
    "size": "1024x1024"
  }' | jq '.'
```

### Expected Response

```json
{
  "created": 1234567890,
  "data": [
    {
      "url": "https://...azure.com/path/to/landscape-image.png",
      "revised_prompt": "A tranquil mountain landscape scene at sunset featuring a calm lake..."
    }
  ]
}
```

## Example 3: Portrait Image (9:16 ratio)

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{
    "prompt": "Professional portrait photography of a business woman, studio lighting, high quality",
    "n": 1,
    "size": "768x1344",
    "quality": "hd"
  }' | jq '.'
```

## Example 4: Landscape Image (16:9 ratio)

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{
    "prompt": "Cinematic wide shot of a futuristic city skyline at night with neon lights",
    "n": 1,
    "size": "1344x768",
    "quality": "hd"
  }' | jq '.'
```

## Example 5: Product Photography (3:2 ratio)

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{
    "prompt": "Professional product photography of a luxury watch on a dark background, studio lighting, reflections, high quality",
    "n": 1,
    "size": "1216x832",
    "quality": "hd"
  }' | jq '.'
```

## Example 6: Abstract Art (1:1 ratio)

### Curl Command

```bash
curl -X POST "$AZURE_FLUX_KONTEXT_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_KONTEXT_PRO_API_KEY" \
  -d '{
    "prompt": "Abstract geometric art with vibrant colors, circles and triangles, modern design",
    "n": 1,
    "size": "1024x1024"
  }' | jq '.'
```

## JavaScript/Node.js Example

```javascript
async function generateImage(prompt, size = "1024x1024", useHD = true) {
    const endpoint = process.env.AZURE_FLUX_11_PRO_ENDPOINT;
    const apiKey = process.env.AZURE_FLUX_11_PRO_API_KEY;
    
    const requestBody = {
        prompt: prompt,
        n: 1,
        size: size
    };
    
    if (useHD) {
        requestBody.quality = "hd";
    }
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error (${response.status}): ${error}`);
    }
    
    const data = await response.json();
    return data.data[0].url;
}

// Usage
const imageUrl = await generateImage(
    "A beautiful battery with lightning bolts",
    "1024x1024",
    true
);
console.log("Image generated:", imageUrl);
```

## Python Example

```python
import requests
import os
import json

def generate_image(prompt, size="1024x1024", use_hd=True):
    endpoint = os.environ['AZURE_FLUX_11_PRO_ENDPOINT']
    api_key = os.environ['AZURE_FLUX_11_PRO_API_KEY']
    
    headers = {
        'Content-Type': 'application/json',
        'api-key': api_key
    }
    
    body = {
        'prompt': prompt,
        'n': 1,
        'size': size
    }
    
    if use_hd:
        body['quality'] = 'hd'
    
    response = requests.post(endpoint, headers=headers, json=body)
    response.raise_for_status()
    
    data = response.json()
    return data['data'][0]['url']

# Usage
image_url = generate_image(
    "A beautiful battery with lightning bolts",
    "1024x1024",
    True
)
print(f"Image generated: {image_url}")
```

## All Supported Sizes

```bash
# Square (1:1)
"size": "1024x1024"

# Landscape (16:9)
"size": "1344x768"

# Portrait (9:16)
"size": "768x1344"

# Photography (3:2)
"size": "1216x832"

# Portrait Photography (2:3)
"size": "832x1216"
```

## Error Handling Example

```bash
#!/bin/bash
response=$(curl -s -w "\n%{http_code}" -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{
    "prompt": "A test image",
    "n": 1,
    "size": "1024x1024",
    "quality": "hd"
  }')

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$status_code" = "200" ]; then
    echo "✅ Success!"
    echo "$body" | jq '.data[0].url'
else
    echo "❌ Error: $status_code"
    echo "$body"
fi
```

## Batch Generation Example

```javascript
async function generateBatch(prompts, size = "1024x1024") {
    const results = [];
    
    for (const prompt of prompts) {
        try {
            const url = await generateImage(prompt, size, true);
            results.push({ prompt, url, success: true });
            console.log(`✅ Generated: ${prompt}`);
        } catch (error) {
            results.push({ prompt, error: error.message, success: false });
            console.error(`❌ Failed: ${prompt} - ${error.message}`);
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
}

// Usage
const prompts = [
    "A beautiful battery with lightning",
    "A serene mountain landscape",
    "Abstract geometric art"
];

const results = await generateBatch(prompts);
console.log(JSON.stringify(results, null, 2));
```

## Testing Different Models

```bash
# FLUX 1.1 [pro] - Best for new images
curl -X POST "$AZURE_FLUX_11_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_11_PRO_API_KEY" \
  -d '{"prompt": "Your prompt", "n": 1, "size": "1024x1024", "quality": "hd"}'

# FLUX.1 Kontext [pro] - Best for editing
curl -X POST "$AZURE_FLUX_KONTEXT_PRO_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "api-key: $AZURE_FLUX_KONTEXT_PRO_API_KEY" \
  -d '{"prompt": "Your prompt", "n": 1, "size": "1024x1024"}'
```

## Common Errors and Solutions

### 401 Unauthorized
```json
{
  "error": {
    "code": "401",
    "message": "Access denied due to invalid subscription key."
  }
}
```
**Solution**: Check your API key is correct and hasn't expired.

### 429 Too Many Requests
```json
{
  "error": {
    "code": "429",
    "message": "Rate limit is exceeded."
  }
}
```
**Solution**: Implement rate limiting, add delays between requests, or upgrade to PTU.

### 400 Bad Request
```json
{
  "error": {
    "code": "400",
    "message": "Invalid request parameters."
  }
}
```
**Solution**: Check request format matches examples above.

## Performance Benchmarks

Based on Azure documentation:

- **FLUX 1.1 [pro]**: ~10 seconds for 1024×1024
- **FLUX.1 Kontext [pro]**: ~0.9 seconds for 1024×1024 edit

## Cost Estimation

- **Standard**: $40 per 1,000 images
- **Example**: 100 images = $4

## Next Steps

1. Try the examples above with your credentials
2. Modify prompts for your use case
3. Test different sizes and ratios
4. Integrate into your application
5. Monitor costs and performance

## Resources

- [Test Scripts](./test-azure-flux.js)
- [Quick Start Guide](./AZURE_FLUX_QUICKSTART.md)
- [Integration Guide](./AZURE_FLUX_INTEGRATION.md)
- [Testing Guide](./TESTING_GUIDE.md)
