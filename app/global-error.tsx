
'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ background: '#0a0a0a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
                <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '440px', width: '100%' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1rem' }}>Terminal Error</h2>

                    <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        A critical error has interrupted the Sovereign Terminal. Reinitializing...
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ fontSize: '0.7rem', textAlign: 'left', color: '#fca5a5', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', maxHeight: 160, marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {error.message}
                        </pre>
                    )}

                    <button
                        onClick={() => reset()}
                        style={{ padding: '0.75rem 1.5rem', background: '#ffffff', color: '#0a0a0a', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', width: '100%', fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                        Reinitialize Terminal
                    </button>
                </div>
            </body>
        </html>
    );
}
