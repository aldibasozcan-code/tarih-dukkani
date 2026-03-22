#!/usr/bin/env node
// Simple HTTP server for Tarih Dükkanı (no npm needed)
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dir, '.');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = req.url.split('?')[0].split('#')[0];
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = join(ROOT, urlPath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    const ext = extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // SPA fallback: serve index.html for all routes
      try {
        const data = await readFile(join(ROOT, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('Not found');
      }
    } else {
      res.writeHead(500); res.end(err.message);
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Tarih Dükkanı çalışıyor!`);
  console.log(`   → http://localhost:${server.address().port}\n`);
});
