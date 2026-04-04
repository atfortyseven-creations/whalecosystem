const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Sovereign Network - Telegram Channel Engine
// Absolute Perfection: High-Fidelity Alert Format

export async function sendTelegramAlert(chatId: string, event: any) {
    if (!TELEGRAM_TOKEN || !chatId) return;

    const { hash, usdValue, token, action, tier, dex } = event;
    const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdValue);
    
    const message = `
🔱 *SOVEREIGN NETWORK — WHALE ALERT*
────────────────────────
🏦 *Tier:* \`${tier}\`
💰 *Value:* \`${formattedValue}\`
💎 *Asset:* \`${token}\`
⚡ *Action:* \`${action}\`
🌐 *Network:* \`Ethereum Mainnet\`
🏛️ *Execution:* \`${dex}\`

🔗 *Tx Hash:*
[View Full Audit](https://whalecosystem.vercel.app/network/tx/${hash})

_Sovereign Network Pro • Artificial Intelligence_
    `.trim();

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
            })
        });
        console.log(`📡 [Telegram] Dispatcher Sent to ${chatId}`);
    } catch (err) {
        console.error("❌ [Telegram] Error sending alert", err);
    }
}
