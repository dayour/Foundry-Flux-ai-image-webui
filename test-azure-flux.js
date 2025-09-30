#!/usr/bin/env node
/**
 * Test script for Azure Flux API integration
 * This validates that the Azure Flux endpoints are correctly configured
 * and can generate images.
 */

require('dotenv').config();

const FLUX_11_PRO_ENDPOINT = process.env.AZURE_FLUX_11_PRO_ENDPOINT;
const FLUX_11_PRO_KEY = process.env.AZURE_FLUX_11_PRO_API_KEY;
const FLUX_KONTEXT_PRO_ENDPOINT = process.env.AZURE_FLUX_KONTEXT_PRO_ENDPOINT;
const FLUX_KONTEXT_PRO_KEY = process.env.AZURE_FLUX_KONTEXT_PRO_API_KEY;

async function testAzureFluxEndpoint(endpoint, apiKey, modelName) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${modelName}`);
    console.log('='.repeat(60));
    console.log(`Endpoint: ${endpoint}`);
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET'}`);

    if (!endpoint || !apiKey) {
        console.error('❌ Error: Endpoint or API key not configured');
        return false;
    }

    const requestBody = {
        prompt: "A beautiful battery with lightning bolts and energy, high quality, detailed",
        n: 1,
        size: "1024x1024"
    };

    if (modelName.includes('1.1')) {
        requestBody.quality = "hd";
    }

    console.log(`\nRequest Body:`, JSON.stringify(requestBody, null, 2));

    try {
        console.log('\nSending request...');
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify(requestBody),
        });

        console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error('❌ Error Response:', responseText);
            return false;
        }

        const data = JSON.parse(responseText);
        console.log('\n✅ Success! Response data received');
        
        if (data.data && data.data[0]) {
            const imageData = data.data[0];
            
            if (imageData.url) {
                console.log('\n✅ Image URL:', imageData.url);
                return true;
            } else if (imageData.b64_json) {
                console.log('\n✅ Image returned as base64-encoded data');
                console.log(`✅ Base64 data length: ${imageData.b64_json.length} characters`);
                console.log('✅ Content safety filters passed');
                return true;
            } else {
                console.error('❌ Error: No image URL or base64 data found in response');
                return false;
            }
        } else {
            console.error('❌ Error: Invalid response structure');
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
        return false;
    }
}

async function main() {
    console.log('Azure Flux API Test Script');
    console.log('===========================\n');

    const results = [];

    // Test FLUX 1.1 [pro]
    const flux11Result = await testAzureFluxEndpoint(
        FLUX_11_PRO_ENDPOINT,
        FLUX_11_PRO_KEY,
        'FLUX 1.1 [pro]'
    );
    results.push({ model: 'FLUX 1.1 [pro]', success: flux11Result });

    // Test FLUX.1 Kontext [pro]
    const fluxKontextResult = await testAzureFluxEndpoint(
        FLUX_KONTEXT_PRO_ENDPOINT,
        FLUX_KONTEXT_PRO_KEY,
        'FLUX.1 Kontext [pro]'
    );
    results.push({ model: 'FLUX.1 Kontext [pro]', success: fluxKontextResult });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    results.forEach(({ model, success }) => {
        console.log(`${success ? '✅' : '❌'} ${model}: ${success ? 'PASSED' : 'FAILED'}`);
    });

    const allPassed = results.every(r => r.success);
    console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
    
    process.exit(allPassed ? 0 : 1);
}

main();
