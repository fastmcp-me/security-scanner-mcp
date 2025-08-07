import { spawn } from 'child_process';

console.log('Testing Security Scanner MCP Server...\n');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send initialization request
const initRequest = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  },
  id: 1
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Handle responses
server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString());
});

// Give it a moment then close
setTimeout(() => {
  server.stdin.end();
  process.exit(0);
}, 2000);