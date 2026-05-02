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
  signMessageAsync?: any;
}

// ─── css injected once into <head> so it never re-runs ───────────────────────
const QR_STYLES = `
  #qr-reader { border: none !important; width: 100% !important; height: 100% !important; background: #000; overflow: hidden; }
  #qr-reader video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
`;

// ── inject styles once ────────────────────────────────────────────────────────
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = QR_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ── File/gallery scanner (fallback for restricted camera environments) ────────
async function scanFileForQR(file: File): Promise<string> {
  const { Html5Qrcode } = await import('html5-qrcode');
  const reader = new Html5Qrcode('qr-reader-file-tmp');
  try {
    const result = await reader.scanFile(file, true);
    return result;
  } finally {
    try { reader.clear(); } catch {}
    const tmp = document.getElementById('qr-reader-file-tmp');
    if (tmp) tmp.remove();
  }
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
          <p className="text-[9px] font-medium uppercase tracking-widest text-black/30">
            Syncing terminal…
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRScannerModal({ isOpen, onClose, onScan, address: externalAddress, signMessageAsync }: QRScannerModalProps) {
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

  // ── Scanner instance ref ───────────────────────────────────────────────────
  const scannerRef    = useRef<any>(null);
  const initTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitingRef  = useRef(false);
  // CRITICAL LOCK: prevents handleSuccess from firing multiple times at 4fps
  // html5-qrcode fires the success callback on every frame that contains a valid
  // QR code. Without this guard, the user receives 3-4 signature prompts before
  // destroyScanner() resolves asynchronously and stops the camera loop.
  const hasScannedRef = useRef(false);

  // ─── Core cleanup ─────────────────────────────────────────────────────────
  const destroyScanner = useCallback(async () => {
    isInitingRef.current = false;
    hasScannedRef.current = false; // reset so scanner can be reused after closing and reopening
    if (initTimerRef.current) {
      clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    if (scannerRef.current) {
      try { await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  // ─── Successful scan handler ───────────────────────────────────────────────
  const handleSuccess = useCallback(async (decodedText: string) => {
    // ATOMIC LOCK: first call wins, all subsequent calls from the camera loop are ignored
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;

    await destroyScanner();
    setStatus('success');

    let addr = addressRef.current || extAddrRef.current;
    
    // Cookie fallback
    if (!addr && typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )sovereign_session=([^;]+)'));
      if (match) {
        try { addr = JSON.parse(decodeURIComponent(match[2])).address; } catch {}
      }
    }

    try {
      const url       = new URL(decodedText);
      const sessionId = url.searchParams.get('session');

      if (sessionId && addr) {
        let signature: string | undefined;
        let message: string | undefined;

        if (signMessageAsync) {
          try {
            setStatus('signing');
            
            message = [
              '═══════════════════════════════',
              '  Whale Alert Network',
              '  SOVEREIGN ACCESS PROTOCOL',
              '═══════════════════════════════',
              '',
              `Identity: ${addr.toLowerCase()}`,
              `Nonce: ${Date.now()}`,
              `Network: WHALE_TERMINAL_V4`,
              '',
              'By signing you confirm that',
              'you are the sole owner of this',
              'address and authorize access',
              'to the institutional terminal.',
              '═══════════════════════════════',
            ].join('\n');

            signature = await signMessageAsync({ message });
          } catch (e) {
            setErrMsg('Signature rejected. Please try again.');
            setStatus('error');
            hasScannedRef.current = false;
            return;
          }
        }

        // The API validates identity via the signature if provided, else falls back to cookie.
        const res = await fetch(`/api/auth/qr-session?id=${sessionId}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ address: addr, signature, message }),
        });
        if (!res.ok) {
          setErrMsg('Handshake failed. Refresh the QR code on your desktop terminal.');
          setStatus('error');
          hasScannedRef.current = false; // allow retry
          return;
        }
        
        setStatus('success');
      } else if (!addr) {
        setErrMsg('Connect your wallet before scanning.');
        setStatus('error');
        hasScannedRef.current = false; // allow retry
        return;
      }
    } catch {
      // Non-handshake QR — pass through anyway
    }

    onScanRef.current?.(decodedText);
    setTimeout(() => onCloseRef.current(), 1400);
  }, [destroyScanner]);

  // ─── Initialize camera scanner ────────────────────────────────────────────
  const initScanner = useCallback(async () => {
    if (isInitingRef.current || scannerRef.current) return;
    isInitingRef.current = true;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 4 }, // optimized for CPU thermal throttling
        (text: string) => { handleSuccess(text); },
        (_err: unknown) => { /* frame errors ignored */ }
      );

      setStatus('scanning');
    } catch {
      try {
        if (scannerRef.current) {
          await scannerRef.current.start(
            { facingMode: "user" },
            { fps: 4 }, // optimized for CPU thermal throttling
            (text: string) => { handleSuccess(text); },
            (_err: unknown) => {}
          );
          setStatus('scanning');
          return;
        }
      } catch (e2) {}

      setErrMsg('Camera permission required for Sovereign Sync.');
      setStatus('error');
      isInitingRef.current = false;
    }
  }, [handleSuccess]);

  // ─── Effect: reacts to isOpen only ───────────────────────────────────────
  useEffect(() => {
    injectStyles();

    if (!isOpen) {
      destroyScanner();
      setStatus('idle');
      setErrMsg('');
      setTab('camera');
      return;
    }

    setStatus('idle');
    initTimerRef.current = setTimeout(() => { initScanner(); }, 350);

    return () => { destroyScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#FAF9F6] overflow-y-auto py-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-full bg-black/5 hover:bg-black/10 text-black/60 transition-all z-50 border border-black/10"
            aria-label="Close scanner"
          >
            <X size={22} />
          </button>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.95, opacity: 0, y: 20  }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm flex flex-col items-center px-6 relative"
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
                      <div
                      id="qr-reader"
                      className="absolute inset-0 w-full h-full"
                      style={{ display: status === 'error' || status === 'success' || status === 'signing' ? 'none' : 'block' }}
                    />

                    {/* Animated perimeter scan line — perfectly centered now */}
                    <ScanLine active={status === 'scanning'} />

                    {/* Loading state absolute centering */}
                    {status === 'idle' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                        <Loader2 size={28} className="animate-spin text-white/40 mb-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                          Initializing camera...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Success overlay */}
                  <AnimatePresence>
                    {status === 'success' && <ScannedOverlay />}
                  </AnimatePresence>

                  {/* Signing overlay */}
                  {status === 'signing' && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col p-8 text-center justify-center gap-4">
                      <Shield size={30} className="mx-auto text-red-400 opacity-60" />
                      <p className="text-red-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                        SIGNATURE REQUIRED TO ESTABLISH THE SECURE TUNNEL. PLEASE APPROVE IN YOUR WALLET.
                      </p>
                      <button
                        onClick={handleRetry}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-black text-white rounded-full mx-auto mt-2 hover:bg-black/80 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Error overlay */}
                  {status === 'error' && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col p-8 text-center justify-center gap-4">
                      <Shield size={30} className="mx-auto text-red-400 opacity-60" />
                      <p className="text-red-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                        {errMsg}
                      </p>
                      <button
                        onClick={handleRetry}
                        className="text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 bg-black text-white rounded-full mx-auto mt-2 hover:bg-black/80 transition-colors"
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
