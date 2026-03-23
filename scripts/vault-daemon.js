const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * SOVEREIGN VAULT DAEMON (V1.0)
 * ----------------------------
 * This is the local receptor for the Whale Alert "Garbage Collector" system.
 * It listens for encrypted payloads from the Railway-Production cloud
 * and secures them in your local D:\ or Windows file system.
 */

const PORT = process.env.VAULT_PORT || 7007;
const SECRET_KEY = process.env.SOVEREIGN_VAULT_SECRET || 'SOVEREIGN_QUANTUM_KEY_777';
const STORAGE_DIR = path.join(__dirname, '..', 'vault-storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
    // CORS & Basic Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/vault/ingest' && req.method === 'POST') {
        // 1. Authorization Check
        const authHeader = req.headers['authorization'];
        if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
            console.warn(`[Vault] ❌ Unauthorized ingress attempt from ${req.socket.remoteAddress}`);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Sovereign Key Invalid' }));
            return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const { payload_type, data, source } = payload;

                const filename = `${payload_type}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
                const filePath = path.join(STORAGE_DIR, filename);

                // 2. Atomic Save to Local Storage
                fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

                console.log(`[Vault] ✅ Ingested ${data.length} records (${payload_type}) from ${source}`);
                console.log(`[Vault] 💾 Stored at: ${filePath}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Payload secured in local cold storage.',
                    vault_path: filePath 
                }));
            } catch (err) {
                console.error('[Vault] 💀 Ingest Error:', err.message);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Malformed Payload' }));
            }
        });
    } else if (req.url === '/vault/status' && req.method === 'GET') {
        const files = fs.readdirSync(STORAGE_DIR);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ACTIVE', 
            storage_path: STORAGE_DIR,
            archived_files: files.length 
        }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🏛️  SOVEREIGN VAULT DAEMON - ONLINE`);
    console.log(`=================================================`);
    console.log(`📡 STATUS: ACTIVE & LISTENING`);
    console.log(`📍 ADDRESS: http://localhost:${PORT}`);
    console.log(`📁 STORAGE: ${STORAGE_DIR}`);
    console.log(`🔐 ACCESS: RESTRICTED VIA QUANTUM SECRET`);
    console.log(`-------------------------------------------------\n`);
    console.log(`Waiting for Railway production to teleport data...`);
});
