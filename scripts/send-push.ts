const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return {};
    
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    
    for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    }
    return env;
}

async function sendTo(botToken, chatId, message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            }),
        });
        const result = await response.json();
        if (response.ok) {
            console.log(`✅ Success: Message sent to ${chatId}`);
            return true;
        } else {
            console.error(`❌ Failed: ${chatId} ->`, result.description || result);
            return false;
        }
    } catch (e) {
        console.error(`❌ Critical Error for ${chatId}:`, e.message);
        return false;
    }
}

async function broadcastUpdate() {
    const env = loadEnv();
    const botToken = env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error("❌ TELEGRAM_BOT_TOKEN missing in .env");
        return;
    }

    const message = `
🚀 *SISTEMA ESTABILIZADO: WHALE ALERT V3 ONLINE* 🐋⚡

We have completed Elite-grade optimization for our whale monitor.

✅ *Full Multi-Chain*: Active monitoring on *Ethereum*, *BSC*, and *Base* simultaneously.
✅ *Extreme Resilience*: The system now features automatic failover and critical error recovery.
✅ *Resource Optimization*: Ultra-efficient scanning designed to operate 24/7 without interruptions.

The alert matrix is fully operational and shielded. The legendary monitoring continues. 🏁🛡️
    `.trim();

    console.log("📤 Initiating legendary broadcast...");

    const targets = ["@HumanidFi", "7247569356"];
    
    for (const target of targets) {
        await sendTo(botToken, target, message);
    }
}

broadcastUpdate();
