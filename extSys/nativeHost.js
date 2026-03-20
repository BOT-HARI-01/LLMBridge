import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, 'debug.log');

function log(msg) {
  const time = new Date().toISOString();
  const logMessage = `[${time}] ${msg}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error('Failed to write to log:', err);
  }
}

process.on('uncaughtException', (err) => {
  log(`CRITICAL CRASH: ${err.message}\n${err.stack}`);
  process.exit(1);
});

log("--- Native Host Started ---");

let lastPing = Date.now();
setInterval(() => {
  if (Date.now() - lastPing > 15000) {
    log("Heartbeat lost. Chrome disconnected. Shutting down server.");
    process.exit(0);
  }
}, 5000);

let pendingRequests = [];

function sendMessageToChrome(msg) {
  try {
    const msgStr = JSON.stringify(msg);
    const buf = Buffer.alloc(4 + Buffer.byteLength(msgStr));
    buf.writeUInt32LE(Buffer.byteLength(msgStr), 0);
    buf.write(msgStr, 4);
    process.stdout.write(buf);
    log(`Sent to Chrome: ${msgStr}`);
  } catch (err) {
    log(`Failed to send to Chrome: ${err.message}`);
  }
}

let inputBuffer = Buffer.alloc(0);
process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  
  while (inputBuffer.length >= 4) {
    const msgLen = inputBuffer.readUInt32LE(0);
    if (inputBuffer.length >= 4 + msgLen) {
      const msgBuf = inputBuffer.slice(4, 4 + msgLen);
      const msg = JSON.parse(msgBuf.toString('utf-8'));

      if (!msg) {
        log("Received null message from Chrome. Ignoring.");
        inputBuffer = inputBuffer.slice(4 + msgLen);
        continue; 
      }
      if (msg.type === "PING") {
        lastPing = Date.now(); 
      } else {
        log(`Received from Chrome: ${JSON.stringify(msg)}`);
        if (pendingRequests.length > 0) {
          const res = pendingRequests.shift();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(msg));
        }
      }
      
      inputBuffer = inputBuffer.slice(4 + msgLen);
    } else {
      break;
    }
  }
});


process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') {
    log("EPIPE Error: Chrome closed the pipe. Shutting down.");
    process.exit(0);
  }
});

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/prompt') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString() });
    req.on('end', () => {
      try {
        log(`Received HTTP Request: ${body}`);
        const data = JSON.parse(body);
        pendingRequests.push(res);
        sendMessageToChrome({ type: "PROMPT", prompt: data.prompt });
      } catch (e) {
        log(`HTTP Parse Error: ${e.message}`);
        res.writeHead(400).end("Bad Request");
      }
    });
  } else {
    res.writeHead(404).end("Not Found");
  }
});

server.listen(3000, () => {
  log("Server listening on port 3000");
});

process.stdin.on('end', () => {
  process.exit();
});