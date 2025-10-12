#!/usr/bin/env node
/**
 * Kill processes running on ports 3000-3002
 * Ensures dev server always starts on port 3000
 */

const { execSync } = require('child_process');
const os = require('os');

const PORTS_TO_FREE = [3000, 3001, 3002];

function killPortsWindows() {
  console.log('🔍 Checking for processes on ports 3000-3002...\n');
  
  for (const port of PORTS_TO_FREE) {
    try {
      // Find process on port
      const output = execSync(`netstat -ano | findstr :${port}`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Extract PIDs
      const lines = output.split('\n').filter(line => line.includes('LISTENING'));
      const pids = new Set();
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid)) {
          pids.add(pid);
        }
      }
      
      // Kill each process
      for (const pid of pids) {
        try {
          console.log(`⚡ Terminating process on port ${port} (PID: ${pid})...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`✅ Port ${port} freed successfully.\n`);
        } catch (err) {
          // Process might have already exited
        }
      }
    } catch (err) {
      // Port is already free
    }
  }
}

function killPortsUnix() {
  console.log('🔍 Checking for processes on ports 3000-3002...\n');
  
  for (const port of PORTS_TO_FREE) {
    try {
      // Find process on port
      const output = execSync(`lsof -ti:${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const pids = output.trim().split('\n').filter(pid => pid);
      
      for (const pid of pids) {
        try {
          console.log(`⚡ Terminating process on port ${port} (PID: ${pid})...`);
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`✅ Port ${port} freed successfully.\n`);
        } catch (err) {
          // Process might have already exited
        }
      }
    } catch (err) {
      // Port is already free
    }
  }
}

// Main execution
try {
  if (os.platform() === 'win32') {
    killPortsWindows();
  } else {
    killPortsUnix();
  }
  
  console.log('✨ All ports cleared. Starting dev server...\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Error clearing ports:', error.message);
  // Don't fail - let dev server handle port conflicts
  process.exit(0);
}
