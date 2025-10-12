#!/usr/bin/env node
"use strict";

/**
 * Flux Diagnostics Tool
 * ---------------------
 * Consolidated diagnostics for the Azure Flux integration.
 * - Remote checks: exercise Azure Flux endpoints via HTTPS requests
 * - Local checks: verify helper logic (base64 conversion, filenames, filters, rate limits)
 *
 * Usage:
 *   node scripts/azure/flux-diagnostics.js [options]
 *
 * Options:
 *   --remote-only   Run just the remote API checks
 *   --local-only    Run just the local logic checks
 *   --verbose       Print additional request/response context
 *   --help          Display this help message
 */

require("dotenv").config();

const { nanoid } = require("nanoid");

const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  magenta: (text) => `\x1b[35m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
};

const CHECK = colors.green("✅");
const CROSS = colors.red("❌");
const WARN = colors.yellow("⚠️");

const args = new Set(process.argv.slice(2));
const wantsHelp = args.has("--help") || args.has("-h");
const verbose = args.has("--verbose");
const remoteOnly = args.has("--remote-only");
const localOnly = args.has("--local-only");

if (wantsHelp) {
  printBanner();
  printHelp();
  process.exit(0);
}

const runRemoteChecks = !localOnly;
const runLocalChecks = !remoteOnly;

(async function main() {
  printBanner();
  const summaries = [];

  if (runRemoteChecks) {
    const remoteSummary = await runRemoteDiagnostics();
    summaries.push(...remoteSummary);
  }

  if (runLocalChecks) {
    const localSummary = runLocalDiagnostics();
    summaries.push(...localSummary);
  }

  if (!runRemoteChecks && !runLocalChecks) {
    console.log(colors.yellow("No checks were selected. Use --help for options."));
    process.exit(1);
  }

  printSummary(summaries);

  const failed = summaries.filter((item) => !item.success);
  process.exit(failed.length === 0 ? 0 : 1);
})();

function printBanner() {
  console.log(colors.bold("\nFlux Diagnostics"));
  console.log(colors.cyan("=================="));
}

function printHelp() {
  console.log(`
Usage: node scripts/azure/flux-diagnostics.js [options]

Options:
  --remote-only   Run just the remote API checks
  --local-only    Run just the local helper checks
  --verbose       Print additional request/response context
  --help          Display this message
  `);
}

async function runRemoteDiagnostics() {
  console.log(colors.magenta("\nRemote API Checks"));
  console.log(colors.magenta("-----------------"));

  const tests = [
    {
      model: "FLUX 1.1 [pro]",
      endpoint: process.env.AZURE_FLUX_11_PRO_ENDPOINT,
      apiKey: process.env.AZURE_FLUX_11_PRO_API_KEY,
      request: {
        prompt: "A beautiful battery with lightning bolts and energy, high quality, detailed",
        n: 1,
        size: "1024x1024",
        quality: "hd",
      },
    },
    {
      model: "FLUX.1 Kontext [pro]",
      endpoint: process.env.AZURE_FLUX_KONTEXT_PRO_ENDPOINT,
      apiKey: process.env.AZURE_FLUX_KONTEXT_PRO_API_KEY,
      request: {
        prompt: "A beautiful battery with lightning bolts and energy, high quality, detailed",
        n: 1,
        size: "1024x1024",
      },
    },
  ];

  const results = [];

  for (const test of tests) {
    if (!test.endpoint || !test.apiKey) {
      console.log(`${CROSS} ${test.model}: missing endpoint or API key`);
      results.push({
        name: `${test.model} endpoint configured`,
        success: false,
        details: "Set the corresponding environment variables before running remote checks.",
      });
      continue;
    }

    console.log(`\n${colors.bold(test.model)}`);
    console.log(`Endpoint: ${test.endpoint}`);
    console.log(`API Key: ${maskKey(test.apiKey)}`);

    if (verbose) {
      console.log("Request Body:");
      console.log(JSON.stringify(test.request, null, 2));
    }

    try {
      const outcome = await exerciseEndpoint(test.endpoint, test.apiKey, test.request, test.model);
      results.push(outcome);
    } catch (error) {
      console.error(`${CROSS} ${test.model}: ${error.message}`);
      if (error.responseBody && verbose) {
        console.error("Response Body:");
        console.error(error.responseBody);
      }
      results.push({
        name: `${test.model} API call`,
        success: false,
        details: error.message,
      });
    }
  }

  return results;
}

async function exerciseEndpoint(endpoint, apiKey, payload, model) {
  console.log("Sending request...");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  console.log(`Response Status: ${response.status} ${response.statusText}`);

  const rawText = await response.text();
  if (verbose) {
    console.log("Response Body:");
    console.log(rawText);
  }

  if (!response.ok) {
    const error = new Error(`Endpoint returned ${response.status}`);
    error.responseBody = rawText;
    throw error;
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (parseError) {
    const error = new Error("Unable to parse JSON response");
    error.responseBody = rawText;
    throw error;
  }

  const imagePayload = data?.data?.[0];
  if (!imagePayload) {
    return {
      name: `${model} response payload`,
      success: false,
      details: "Unexpected response structure: missing data array.",
    };
  }

  if (imagePayload.url) {
    console.log(`${CHECK} Image URL: ${imagePayload.url}`);
    return {
      name: `${model} image URL`,
      success: true,
      details: "Image URL returned successfully.",
    };
  }

  if (imagePayload.b64_json) {
    console.log(`${CHECK} Image returned as base64 data (${imagePayload.b64_json.length} chars)`);
    return {
      name: `${model} base64 data`,
      success: true,
      details: "Base64 image data returned successfully.",
    };
  }

  return {
    name: `${model} image payload`,
    success: false,
    details: "No image URL or base64 payload in response.",
  };
}

function runLocalDiagnostics() {
  console.log(colors.magenta("\nLocal Logic Checks"));
  console.log(colors.magenta("-------------------"));

  const results = [];

  // Base64 conversion
  const sampleBase64 = "/9j/4AAQSkZJRgABAQEAYABgAAD";
  try {
    const buffer = Buffer.from(sampleBase64, "base64");
    const isValid = Buffer.isBuffer(buffer) && buffer.length > 0;
    logResult("Base64 conversion", isValid, `${buffer.length} bytes produced.`);
    results.push({
      name: "Base64 conversion logic",
      success: isValid,
      details: isValid ? "Sample base64 payload converted to a buffer." : "Buffer conversion failed.",
    });
  } catch (error) {
    logResult("Base64 conversion", false, error.message);
    results.push({
      name: "Base64 conversion logic",
      success: false,
      details: error.message,
    });
  }

  // Filename generation
  const userId = "test-user-123";
  const model = "azure-flux-1.1-pro";
  const timestamp = Date.now();
  const objectKey = `generated/${userId}/${model}-${timestamp}-${nanoid(8)}.jpg`;
  const filenameChecks = [
    objectKey.includes(userId),
    objectKey.includes(model),
    objectKey.includes(String(timestamp)),
    objectKey.endsWith(".jpg"),
  ];
  const filenameSuccess = filenameChecks.every(Boolean);
  logResult("Filename generation", filenameSuccess, objectKey);
  results.push({
    name: "Filename pattern",
    success: filenameSuccess,
    details: filenameSuccess ? "Object key contains user, model, timestamp, and .jpg extension." : objectKey,
  });

  // Content safety checks
  const safeResponse = {
    data: [
      {
        content_filter_results: {
          sexual: { filtered: false, severity: "safe" },
          violence: { filtered: false, severity: "safe" },
          hate: { filtered: false, severity: "safe" },
          self_harm: { filtered: false, severity: "safe" },
          profanity: { filtered: false, detected: false },
          jailbreak: { filtered: false, detected: false },
        },
      },
    ],
  };

  const filteredResponse = {
    data: [
      {
        content_filter_results: {
          sexual: { filtered: false, severity: "safe" },
          violence: { filtered: true, severity: "medium" },
          hate: { filtered: false, severity: "safe" },
          self_harm: { filtered: false, severity: "safe" },
          profanity: { filtered: false, detected: false },
          jailbreak: { filtered: false, detected: false },
        },
      },
    ],
  };

  const safeCheck = checkContentFilters(safeResponse);
  const filteredCheck = checkContentFilters(filteredResponse);
  const safetySuccess = !safeCheck.filtered && filteredCheck.filtered;
  logResult("Content safety gating", safetySuccess, `Safe=${safeCheck.filtered}, Filtered=${filteredCheck.filtered}`);
  results.push({
    name: "Content safety filters",
    success: safetySuccess,
    details: safetySuccess
      ? "Safe content passes, filtered content is blocked as expected."
      : `Safe filter: ${JSON.stringify(safeCheck)}, Blocked filter: ${JSON.stringify(filteredCheck)}`,
  });

  // Rate limiter behaviour
  const limiterResult = evaluateRateLimiter();
  const rateSuccess = limiterResult.allowedRequests === 10 && limiterResult.blocked === 1;
  logResult(
    "Rate limiting",
    rateSuccess,
    `${limiterResult.allowedRequests} allowed, ${limiterResult.blocked} blocked`
  );
  results.push({
    name: "Rate limiting guard",
    success: rateSuccess,
    details: rateSuccess
      ? "First 10 requests allowed, 11th request blocked."
      : `Allowed ${limiterResult.allowedRequests}, blocked ${limiterResult.blocked}`,
  });

  return results;
}

function checkContentFilters(azureResponse) {
  const contentFilters = azureResponse?.data?.[0]?.content_filter_results;
  if (!contentFilters) {
    return { filtered: false };
  }

  const categories = ["sexual", "violence", "hate", "self_harm"];
  for (const category of categories) {
    const entry = contentFilters[category];
    if (entry?.filtered) {
      return {
        filtered: true,
        reason: `Filtered due to ${category} (severity: ${entry.severity})`,
      };
    }
  }

  const triggered = [];
  if (contentFilters.profanity?.detected) triggered.push("profanity");
  if (contentFilters.jailbreak?.detected) triggered.push("jailbreak");

  if (triggered.length > 0) {
    return {
      filtered: true,
      reason: `Filtered due to ${triggered.join(" and ")}`,
    };
  }

  return { filtered: false };
}

function evaluateRateLimiter() {
  const RATE_LIMIT_WINDOW = 60_000;
  const RATE_LIMIT_MAX_REQUESTS = 10;
  const rateLimiter = new Map();
  const userId = "rate-test-user";
  const now = Date.now();

  const checkRateLimit = (id) => {
    const current = rateLimiter.get(id);
    if (!current || now > current.resetAt) {
      rateLimiter.set(id, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      return true;
    }

    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    current.count += 1;
    return true;
  };

  let allowed = 0;
  for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i += 1) {
    if (checkRateLimit(userId)) {
      allowed += 1;
    }
  }

  const blocked = checkRateLimit(userId) ? 0 : 1;
  return { allowedRequests: allowed, blocked };
}

function logResult(label, success, details) {
  const symbol = success ? CHECK : CROSS;
  console.log(`${symbol} ${label}${details ? ` — ${details}` : ""}`);
}

function maskKey(key) {
  if (!key) return "NOT SET";
  if (key.length <= 8) return `${key}...`;
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

function printSummary(results) {
  console.log(colors.cyan("\nSummary"));
  console.log(colors.cyan("-------"));

  results.forEach((result) => {
    const symbol = result.success ? CHECK : CROSS;
    console.log(`${symbol} ${result.name}${result.details ? ` — ${result.details}` : ""}`);
  });

  const passed = results.filter((item) => item.success).length;
  const failed = results.length - passed;

  console.log("\n" + (failed === 0 ? colors.green("All checks passed!") : colors.red(`${failed} check(s) failed.`)));
}
