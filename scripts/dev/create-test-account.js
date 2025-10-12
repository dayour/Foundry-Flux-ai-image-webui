#!/usr/bin/env node
"use strict";

/**
 * Development helper to create a seeded test account via the local API.
 *
 * Usage:
 *   node scripts/dev/create-test-account.js [--email user@example.com] [--password secret] [--username handle]
 */

const DEFAULT_EMAIL = "darbot@timelarp.com";
const DEFAULT_USERNAME = "darbot";
const DEFAULT_PASSWORD = "darbot";
const DEFAULT_ENDPOINT = "http://localhost:3000/api/auth/signup";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.replace(/^--/, "");
    const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
    if (value === true) {
      options[key] = value;
    } else {
      options[key] = value;
      i += 1;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  const email = options.email || DEFAULT_EMAIL;
  const username = options.username || DEFAULT_USERNAME;
  const password = options.password || DEFAULT_PASSWORD;
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;

  console.log("Creating test account with:");
  console.log(`  Email: ${email}`);
  console.log(`  Username: ${username}`);
  console.log("  Password: ******");
  console.log(`  Endpoint: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
      console.error("\n❌ Account creation failed:", data?.message || response.statusText);
      process.exit(1);
    }

    console.log("\n✅ Account created successfully!");
    console.log("Use these credentials to sign in during local testing.");
  } catch (error) {
    console.error("\n❌ Error while creating account:", error.message);
    process.exit(1);
  }
}

main();
