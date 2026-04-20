export async function register() {
    const { enforceBootIntegrity } = await import('./lib/security/vault-sentinel');
    enforceBootIntegrity();

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initializeBackgroundServices } = await import('./lib/services/init');
        initializeBackgroundServices();
    }
}
