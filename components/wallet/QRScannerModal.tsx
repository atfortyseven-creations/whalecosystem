"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan?: (data: string) => void;
  address?: string;
  initialScanData?: string | null;
}

import jsQR from 'jsqr';
import { useSecureCamera } from '@/hooks/useSecureCamera';

// ── File/gallery scanner (fallback for restricted camera environments) ────────
async function scanFileForQR(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No context'));
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        if (code) resolve(code.data);
        else reject(new Error('No QR code found'));
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

// ─── Perimeter scan-line animation ───────────────────────────────────────────
// The line travels: right → down → left → up (full perimeter), once per cycle.
// SIZE: the pixel side length of the viewfinder square.
const VIEWFINDER_SIZE = 240;
const STROKE = 3;
const PERIMETER = VIEWFINDER_SIZE * 4;

function ScanLine({ active }: { active: boolean }) {
  if (!active) return null;

  // SVG path of the perimeter square (clockwise starting from top-left)
  const path = `
    M 0 0
    L ${VIEWFINDER_SIZE} 0
    L ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE}
    L 0 ${VIEWFINDER_SIZE}
    Z
  `.trim();

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: VIEWFINDER_SIZE,
        height: VIEWFINDER_SIZE,
        zIndex: 20,
        overflow: 'visible',
      }}
      viewBox={`0 0 ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE}`}
    >
      {/* Dim border — always visible when scanning */}
      <path
        d={path}
        fill="none"
        stroke="rgba(34,197,94,0.18)"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />

      {/* Animated scan line — travels the full perimeter */}
      <path
        d={path}
        fill="none"
        stroke="#22c55e"
        strokeWidth={STROKE}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={`${PERIMETER * 0.22} ${PERIMETER * 0.78}`}
        style={{
          animation: `qr-perimeter-scan 1.8s linear infinite`,
        }}
      />

      {/* Corner accents */}
      {[
        // top-left
        `M 0 20 L 0 0 L 20 0`,
        // top-right
        `M ${VIEWFINDER_SIZE - 20} 0 L ${VIEWFINDER_SIZE} 0 L ${VIEWFINDER_SIZE} 20`,
        // bottom-right
        `M ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE - 20} L ${VIEWFINDER_SIZE} ${VIEWFINDER_SIZE} L ${VIEWFINDER_SIZE - 20} ${VIEWFINDER_SIZE}`,
        // bottom-left
        `M 20 ${VIEWFINDER_SIZE} L 0 ${VIEWFINDER_SIZE} L 0 ${VIEWFINDER_SIZE - 20}`,
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#22c55e"
          strokeWidth={STROKE + 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <style>{`
        @keyframes qr-perimeter-scan {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -${PERIMETER}; }
        }
      `}</style>
    </svg>
  );
}

// ─── Elegant "Scanned!" success overlay ──────────────────────────────────────
function ScannedOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 flex items-center justify-center z-30"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.05 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Animated checkmark ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 0.9, repeat: 1, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full border-2 border-emerald-400"
          />
          {/* Check circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
            style={{ boxShadow: '0 0 0 6px rgba(34,197,94,0.08)' }}
          >
            {/* SVG checkmark with draw animation */}
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7"
              fill="none"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center space-y-0.5"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600">
            Scanned!
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-black/50">
            Syncing session…
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRScannerModal({ isOpen, onClose, onScan, address: externalAddress, initialScanData }: QRScannerModalProps) {
  const { address } = useAccount();

  const [status, setStatus]   = useState<'idle' | 'scanning' | 'success' | 'error' | 'signing'>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const [tab, setTab]         = useState<'camera' | 'file'>('camera');
  const [fileLoading, setFileLoading] = useState(false);

  // ── Stable refs for callbacks — NEVER go into useEffect dep array ──────────
  const addressRef  = useRef(address || externalAddress);
  const extAddrRef  = useRef(externalAddress);
  const onCloseRef  = useRef(onClose);
  const onScanRef   = useRef(onScan);
  useEffect(() => { addressRef.current = address || externalAddress; },  [address, externalAddress]);
  useEffect(() => { extAddrRef.current = externalAddress; }, [externalAddress]);
  useEffect(() => { onCloseRef.current = onClose; },  [onClose]);
  useEffect(() => { onScanRef.current  = onScan;  },  [onScan]);

  const initTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitingRef  = useRef(false);
  const hasScannedRef = useRef(false);
  const handleSuccessRef = useRef<any>(null);

  // ─── useSecureCamera Integration ─────────────────────────────────────────
  const { videoRef, canvasRef, hasPermission, isInitializing, error: camError, startCamera, stopCamera } = useSecureCamera({
    facingMode: 'environment',
    onFrame: useCallback((canvas: HTMLCanvasElement) => {
      if (hasScannedRef.current || !handleSuccessRef.current) return;
      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code && code.data) {
          handleSuccessRef.current(code.data);
        }
      } catch (e) {
        // ignore frame errors
      }
    }, [])
  });

  // ─── Core cleanup ─────────────────────────────────────────────────────────
  const destroyScanner = useCallback(async () => {
    isInitingRef.current = false;
    hasScannedRef.current = false;
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    stopCamera();
  }, [stopCamera]);

  // ─── Successful scan handler ───────────────────────────────────────────────
  const handleSuccess = useCallback(async (decodedText: string) => {
    // ATOMIC LOCK: first call wins, all subsequent calls from the camera loop are ignored
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    await destroyScanner();
    setStatus('success');

    const addr = addressRef.current || extAddrRef.current ||
      (() => {
        // Cookie fallback — reads sovereign_handshake set after wallet sign
        if (typeof document !== 'undefined') {
          const m = document.cookie.match(/sovereign_handshake=(0x[a-fA-F0-9]{40})/i);
          return m?.[1] ?? null;
        }
        return null;
      })();

    try {
      // ── Step 1: Parse QR — support BOTH URL format (new) and JSON (legacy) ──
      let uuid: string | null = null;
      let ephemeralPub: string | null = null;
      let isECDH = false;

      // Try URL format first (new — native camera compatible)
      try {
        const url = new URL(decodedText);
        uuid = url.searchParams.get('uuid');
        const rawPub = url.searchParams.get('pub');
        ephemeralPub = rawPub ? decodeURIComponent(rawPub) : null;
        isECDH = url.searchParams.get('ecdh') === '1';

        // Expiry check
        const exp = url.searchParams.get('exp');
        if (exp && Date.now() > parseInt(exp, 10)) {
          setErrMsg('QR code expired. Refresh it on the desktop terminal.');
          setStatus('error');
          hasScannedRef.current = false;
          return;
        }
      } catch {
        // Not a URL — try legacy JSON format
        try {
          const parsed = JSON.parse(decodedText);
          uuid = parsed.uuid ?? null;
          ephemeralPub = parsed.ephemeralPub ?? null;
          isECDH = parsed.isECDH ?? false;
        } catch {
          setErrMsg('QR code not recognized. Make sure you scan the Whale Alert Network desktop QR.');
          setStatus('error');
          hasScannedRef.current = false;
          return;
        }
      }

      if (!uuid || !ephemeralPub) {
        setErrMsg('Invalid QR code: missing session data. Please refresh the desktop QR.');
        setStatus('error');
        hasScannedRef.current = false;
        return;
      }

      // ── Step 2: Generate mobile ephemeral keypair ──────────────────────────
      const { generateX25519KeyPair, deriveSharedSecret, encryptAESGCM } = await import('@/lib/web-crypto');
      const mobilePair = await generateX25519KeyPair();

      // ── Step 3: Derive shared secret and get a JWT to encrypt ─────────────
      // The JWT we send to the desktop proves mobile's identity.
      // We derive sharedSecret = X25519(mobile.priv, desktop.pub)
      // Desktop will decrypt using X25519(desktop.priv, mobile.pub) — same secret.
      const shared = await deriveSharedSecret(mobilePair.privateKey, ephemeralPub, isECDH);

      // ── Step 3b: Try to get an existing JWT from human_session cookie ────
      // If the mobile already has a session (returning user), we re-use it.
      // Otherwise, qr-mobile-link will mint a fresh JWT server-side from
      // the sovereign_handshake cookie (set after wallet connection + sign).
      let jwt: string | null = null;

      try {
        const exportRes = await fetch('/api/auth/export-jwt', { credentials: 'include' });
        if (exportRes.ok) {
          const exportData = await exportRes.json();
          jwt = exportData.jwt ?? null;
        }
      } catch {
        // Network error — fall through to server-side mint path
      }

      // ── Step 4: Build the POST payload ────────────────────────────────────
      // PATH A — Client has JWT: encrypt it with the shared ECDH secret.
      // PATH B — No JWT yet: send isServerMint=true so the backend mints one
      //          from sovereign_handshake and stores it as serverJwt in Redis.
      //          Do NOT send placeholder strings — they corrupt the Redis entry
      //          and cause the desktop's AES-GCM decryption to throw every time.
      let postBody: Record<string, unknown>;

      if (jwt) {
        // PATH A: encrypt JWT client-side
        const encrypted = await encryptAESGCM(shared, jwt);
        postBody = {
          uuid,
          encryptedPayload: encrypted.encryptedPayload,
          iv: encrypted.iv,
          tag: encrypted.tag,
          mobilePub: mobilePair.publicKey,
          isServerMint: false,
        };
      } else {
        // PATH B: tell server to mint JWT and store as serverJwt only
        postBody = {
          uuid,
          mobilePub: mobilePair.publicKey,
          isServerMint: true,
          // Still send mobilePub so desktop poll can include it in the payload
          // for future ECDH decryption if server later supports encrypt-at-rest.
        };
      }

      // ── Step 5: POST to backend to complete the handshake ─────────────────
      const res = await fetch('/api/auth/qr-mobile-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
        credentials: 'include',
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const errText = errBody.error || 'Handshake failed';

        if (res.status === 401) {
          setErrMsg('Wallet not connected. Connect your wallet first, then scan the QR code.');
        } else {
          setErrMsg(`${errText}. Refresh the QR on your desktop and try again.`);
        }
        setStatus('error');
        hasScannedRef.current = false;
        return;
      }

      // Browser auto-stores human_session cookie from response (credentials:include)
      setStatus('success');

      // ── [EXPERT-SYNC] Receive XMTP Seed from Desktop ──────────────────────
      // We poll for a few seconds to see if the desktop pushed an identity seed.
      // If we get it, the user can enter chat without a signature.
      let seedAttempts = 0;
      const pollSeed = setInterval(async () => {
          seedAttempts++;
          if (seedAttempts > 10) { clearInterval(pollSeed); return; } // Timeout after 10s

          try {
              const sRes = await fetch(`/api/auth/qr-sync-seed?uuid=${uuid}`);
              if (sRes.ok) {
                  const sData = await sRes.json();
                  if (sData.encryptedSeed && sData.iv) {
                      clearInterval(pollSeed);
                      const { decryptAESGCM } = await import('@/lib/web-crypto');
                       const decryptedRaw = await decryptAESGCM(shared, sData.encryptedSeed, sData.iv);
                       try {
                           const payload = JSON.parse(decryptedRaw);
                           const finalAddr = addr || addressRef.current || extAddrRef.current;
                           if (finalAddr) {
                               const normAddr = finalAddr.toLowerCase();
                               if (payload.seed) localStorage.setItem(`whale_chat_seed_${normAddr}`, payload.seed);
                               if (payload.vault) localStorage.setItem("sovereign_vault_v1", payload.vault);
                               console.log("[Sovereign:Sync] Full identity synchronized (0-signature active).");
                           }
                       } catch (e) {
                           const finalAddr = addr || addressRef.current || extAddrRef.current;
                           if (finalAddr) localStorage.setItem(`whale_chat_seed_${finalAddr.toLowerCase()}`, decryptedRaw);
                       }
                  }
              }
          } catch (e) {
              console.warn("[Sovereign:Sync] Seed sync error:", e);
          }
      }, 1000);

    } catch (e: any) {
      console.error('[QRScanner] Unexpected error:', e);
      setErrMsg('An unexpected error occurred. Please try again.');
      setStatus('error');
      hasScannedRef.current = false;
      return;
    }

    onScanRef.current?.(decodedText);
    setTimeout(() => onCloseRef.current(), 1400);
  }, [destroyScanner]);

  // ─── Initialize camera scanner ────────────────────────────────────────────
  const initScanner = useCallback(async () => {
    if (isInitingRef.current) return;
    isInitingRef.current = true;
    try {
      await startCamera();
      setStatus('scanning');
    } catch (e) {
      // handled by useEffect watching camError
    } finally {
      isInitingRef.current = false;
    }
  }, [startCamera]);

  useEffect(() => {
    if (camError && tab === 'camera') {
      setErrMsg(camError);
      setStatus('error');
    }
  }, [camError, tab]);

  useEffect(() => {
    handleSuccessRef.current = handleSuccess;
  }, [handleSuccess]);

  // ─── Effect: reacts to isOpen only ───────────────────────────────────────
  useEffect(() => {

    if (!isOpen) {
      destroyScanner();
      setStatus('idle');
      setErrMsg('');
      setTab('camera');
      return;
    }

    if (initialScanData) {
      setStatus('scanning');
      hasScannedRef.current = false;
      handleSuccess(initialScanData);
      return;
    }

    setStatus('idle');
    initTimerRef.current = setTimeout(() => { initScanner(); }, 350);

    return () => { destroyScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialScanData]);

  // ─── Tab switch effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (tab === 'file') {
      destroyScanner();
      setStatus('idle');
    } else if (tab === 'camera') {
      setStatus('idle');
      initTimerRef.current = setTimeout(() => { initScanner(); }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ─── File scan handler ───────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    let tmp = document.getElementById('qr-reader-file-tmp');
    if (!tmp) {
      tmp = document.createElement('div');
      tmp.id = 'qr-reader-file-tmp';
      tmp.style.display = 'none';
      document.body.appendChild(tmp);
    }
    try {
      const decoded = await scanFileForQR(file);
      await handleSuccess(decoded);
    } catch {
      setErrMsg('No valid QR code detected in the image.');
      setStatus('error');
    } finally {
      setFileLoading(false);
      e.target.value = '';
    }
  }, [handleSuccess]);

  const handleRetry = useCallback(async () => {
    await destroyScanner();
    setErrMsg('');
    setStatus('idle');
    initTimerRef.current = setTimeout(() => { initScanner(); }, 300);
  }, [destroyScanner, initScanner]);

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="qr-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#FAF9F6] overflow-y-auto py-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] right-6 p-3 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-all z-50 border border-black/10"
            aria-label="Close scanner"
          >
            <X size={22} />
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.95, opacity: 0, y: 20  }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm flex flex-col items-center px-6 relative will-change-transform"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <img src="/official-whale-monochrome.png" className="w-7 h-7 opacity-90" alt="Whale" />
              <h2 className="font-sans text-lg font-black text-[#050505] tracking-tighter uppercase">
                Link Session
              </h2>
            </div>

            {/* Tab switcher: Camera | Gallery */}
            <div className="w-full flex gap-2 mb-4">
              <button
                onClick={() => setTab('camera')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  tab === 'camera'
                    ? 'bg-[#050505] text-white border-[#050505]'
                    : 'bg-white text-black/40 border-black/10 hover:border-black/20'
                }`}
              >
                <Camera size={13} /> Camera
              </button>
              <button
                onClick={() => setTab('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  tab === 'file'
                    ? 'bg-[#050505] text-white border-[#050505]'
                    : 'bg-white text-black/40 border-black/10 hover:border-black/20'
                }`}
              >
                <Upload size={13} /> Gallery
              </button>
            </div>

            {/* Main scanner card */}
            <div className="relative w-full min-h-[340px] bg-white border border-black/8 rounded-[28px] overflow-hidden shadow-2xl flex flex-col items-center justify-start pt-5 px-4">

              {/* ── CAMERA TAB ─────────────────────────────────────────── */}
              {tab === 'camera' && (
                <>
                  <div className="relative w-full h-[320px] rounded-[20px] overflow-hidden bg-black flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ display: status === 'error' || status === 'success' || status === 'signing' ? 'none' : 'block' }}
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Animated perimeter scan line */}
                    <ScanLine active={status === 'scanning'} />

                    {/* Loading state absolute centering */}
                    {status === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-10">
                        <Loader2 size={28} className="animate-spin text-white/40 mb-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                          Initializing camera...
                        </span>
                      </div>
                    )}

                    {/* Address Badge Over Camera (Visibility Fix) */}
                    {addressRef.current && status === 'scanning' && (
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-center gap-3 shadow-2xl">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="font-mono text-[11px] font-black text-white uppercase tracking-widest">
                             {addressRef.current.slice(0, 8)}...{addressRef.current.slice(-6)}
                           </span>
                        </div>
                      </div>
                    )}
                  </div>



                  {/* Success overlay */}
                  <AnimatePresence>
                    {status === 'success' && <ScannedOverlay />}
                  </AnimatePresence>

                  {/* Error overlay */}
                  {status === 'error' && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col p-8 text-center justify-center gap-4">
                      <Shield size={30} className="mx-auto text-red-500" />
                      <p className="text-red-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                        {errMsg}
                      </p>
                      <button
                        onClick={handleRetry}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 bg-black text-white rounded-full mx-auto mt-2 hover:bg-black/80 transition-colors shadow-lg"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ── GALLERY TAB ────────────────────────────────────────── */}
              {tab === 'file' && (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[280px] gap-5 p-6">
                  <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center">
                    <Upload size={28} className="text-black/30" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[12px] font-black uppercase tracking-widest text-[#050505]">
                      Upload QR Image
                    </p>
                    <p className="text-[10px] text-black/40 font-medium leading-relaxed max-w-[200px]">
                      Select a screenshot of the QR code from your desktop terminal.
                    </p>
                  </div>

                  <label className="relative cursor-pointer">
                    <span className="flex items-center gap-2 px-6 py-3 bg-[#050505] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black/80 transition-colors">
                      {fileLoading ? (
                        <><Loader2 size={13} className="animate-spin" /> Processing...</>
                      ) : (
                        <><Upload size={13} /> Select Image</>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={fileLoading}
                    />
                  </label>

                  <AnimatePresence>
                    {status === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle size={14} className="text-emerald-500" />
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                          ¡ Scanned !
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {status === 'error' && (
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-500 text-center">
                      {errMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center space-y-1">
              <p className="text-[11px] text-[#050505]/50 leading-relaxed font-semibold max-w-[280px]">
                {tab === 'camera'
                  ? 'Point your camera at the QR code shown on the desktop terminal to sync instantly.'
                  : 'Take a screenshot of the QR on your PC and upload it here if the camera is unavailable.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
