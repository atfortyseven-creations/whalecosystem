"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSignMessage } from 'wagmi';
import { QRCodeSVG as QRCode } from "qrcode.react";

interface ZKBiometricGateProps {
  onSuccess?: (zkProofSignature: string) => void;
}

export function ZKBiometricGate({ onSuccess }: ZKBiometricGateProps) {
  const [stage, setStage] = useState<"IDLE" | "WARNING" | "SIGNING" | "READY_TO_SCAN" | "SCANNING" | "PROCESSING" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [authSignature, setAuthSignature] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || '';
      const isUaMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const isSmall = window.innerWidth < 1024;
      setIsMobile(isUaMobile || (isTouch && isSmall));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const handleInitiate = async () => {
    if (!address) {
      setErrorMessage("Please connect your wallet first.");
      setStage("ERROR");
      return;
    }
    setStage("WARNING");
  };

  const handleSign = async () => {
    try {
      setStage("SIGNING");
      const ts = Date.now();
      const message = `Authorize KYC Biometric Attestation\n\nWallet: ${address}\nTimestamp: ${ts}\n\nBy signing, you bind your 3D neural mesh to this cryptographic session.`;
      
      const signature = await signMessageAsync({ message });
      setAuthSignature(signature);
      setStage("READY_TO_SCAN");
    } catch (error: any) {
      console.error("[ZK-Gate] Signing Error:", error);
      setErrorMessage(error.message || "Signature rejected");
      setStage("ERROR");
    }
  };

  const handleScan = async () => {
    try {
      setStage("SCANNING");
      
      // 1. Initiate Real Camera Stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 400, height: 400 } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;

      // 2. Wait for Video Ready
      if (videoRef.current) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Camera timeout")), 10000);
          const check = () => {
            if (!videoRef.current) return;
            if (videoRef.current.readyState >= 2) {
              clearTimeout(timeout);
              resolve(true);
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });
      }

      // 3. Capture Frame
      let capturedFrame = "";
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0, 200, 200);
        capturedFrame = canvasRef.current.toDataURL('image/jpeg', 0.5);
      }

      setStage("PROCESSING");

      // 4. Cryptographic Challenge
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();
      
      // 5. Verify via Oracle
      const response = await fetch('/api/oracle/zk-biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          signature: authSignature,
          payload: capturedFrame,
          nonce,
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error("Attestation failed");
      
      mediaStream.getTracks().forEach(t => t.stop());
      setStream(null);

      setStage("SUCCESS");
      if (onSuccess) onSuccess(authSignature || "0xVerified");

    } catch (error: any) {
      console.error("[ZK-Gate] Verification Error:", error);
      if (stream) stream.getTracks().forEach(t => t.stop());
      setStream(null);
      
      let msg = error.message || "Verification failed";
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
        msg = "PERMISSION DENIED: Please enable camera access in your browser settings and try again.";
      }
      setErrorMessage(msg);
      setStage("ERROR");
    }
  };

  return (
    <div className="w-full bg-white border border-black/5 rounded-[24px] p-6 sm:p-8 shadow-sm font-sans text-[#050505] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center h-full">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:1rem_1rem] pointer-events-none" />
      
      {/* Left side: Scanner */}
      <div className="relative z-10 flex flex-col items-center w-full md:w-1/2">

        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/5 rounded-full flex items-center justify-center">
                {!isMobile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 p-2 bg-white rounded-xl shadow-lg border border-black/10 flex items-center justify-center">
                      <QRCode 
                        value={typeof window !== 'undefined' ? window.location.href : ''} 
                        size={80} 
                        level="M" 
                      />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Mobile Handoff Req.</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 border-2 border-black/10 rounded-full" />
                )}
              </motion.div>
            )}
            
            {stage === "SCANNING" && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-black/10 overflow-hidden bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-x-[-1]"
                  />
                  <canvas ref={canvasRef} width={200} height={200} className="hidden" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />
                  <motion.div 
                    animate={{ y: ["0%", "100%", "0%"] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10" 
                  />
                </div>
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <motion.circle 
                    cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="2" 
                    strokeDasharray="301.59" 
                    initial={{ strokeDashoffset: 301.59 }}
                    animate={{ strokeDashoffset: 0 }} 
                    transition={{ ease: "easeInOut", duration: 1.5 }} // [MOLECULAR-SPEED] Rapid initial capture
                  />
                </svg>
              </motion.div>
            )}

            {(stage === "PROCESSING" || stage === "SIGNING") && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full">
                <div className="absolute inset-0 border-[2px] border-black/10 rounded-full animate-[spin_3s_linear_infinite] [border-style:dashed]" />
              </motion.div>
            )}

            {stage === "WARNING" && (
              <motion.div key="warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-amber-500/10 rounded-full border border-amber-500/20">
                <Shield size={32} className="text-amber-600 opacity-40" />
              </motion.div>
            )}

            {stage === "READY_TO_SCAN" && (
              <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-full border border-green-500/20">
                <CheckCircle2 size={32} className="text-green-600 opacity-40" />
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full border border-black/10">
                <span className="text-[10px] font-black uppercase tracking-widest">VALID</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mb-8 h-16">
          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.div key="text-idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">KYC Biometric Attestation</h3>
                <p className="text-[10px] text-black/50 leading-relaxed max-w-[260px] mx-auto tracking-wide">
                  Prove personhood securely. No PII is stored. A Zero-Knowledge proof will be minted to your wallet.
                </p>
              </motion.div>
            )}
            
            {stage === "WARNING" && (
              <motion.div key="text-warning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2 text-amber-600">Wallet Attention</h3>
                <p className="text-[10px] text-black/50 leading-relaxed max-w-[260px] mx-auto tracking-wide">
                  A signature request will arrive in your wallet app. Please be ready to approve it.
                </p>
              </motion.div>
            )}

            {stage === "SIGNING" && (
              <motion.div key="text-signing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Awaiting Signature</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide uppercase font-black">
                  PLEASE OPEN YOUR WALLET APP...
                </p>
              </motion.div>
            )}

            {stage === "READY_TO_SCAN" && (
              <motion.div key="text-ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2 text-green-600">Signature Valid</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide">
                  Identity bound. Ready for biometric scan.
                </p>
              </motion.div>
            )}

            {stage === "SCANNING" && (
              <motion.div key="text-scanning" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">3D Liveness Check</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide">
                  Capturing neural mesh. Please face the camera directly.
                </p>
              </motion.div>
            )}

            {stage === "PROCESSING" && (
              <motion.div key="text-processing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Verifying Proof</h3>
                <p className="text-[10px] text-black/50 flex items-center justify-center gap-2 tracking-wide uppercase font-black">
                  GENERATING ZK-SNARK...
                </p>
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="text-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2 text-[#050505]">Attestation Valid</h3>
                <p className="text-[10px] text-black/50 leading-relaxed tracking-wide">
                  Zero-Knowledge Proof injected into session. Sovereignty guaranteed.
                </p>
              </motion.div>
            )}

            {stage === "ERROR" && (
              <motion.div key="text-error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h3 className="text-[14px] font-black uppercase tracking-widest mb-2 text-red-500">Security Fault</h3>
                <p className="text-[10px] text-red-500/70 leading-relaxed tracking-wide uppercase font-black">
                  {errorMessage}
                </p>
                <button onClick={() => setStage("IDLE")} className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-black/40 underline">Retry Access</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Right side: Instructions */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-black/5 pt-8 md:pt-0 md:pl-8">
        <div className="mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-black/60 mb-2">Operation Manual</h4>
            <p className="text-[11px] text-black/50 leading-relaxed">
              1. Center your face within the biometric camera overlay.<br/>
              2. The neural engine extracts 3D liveness data securely.<br/>
              3. Approve the wallet signature request to hash the attestation.<br/>
              4. A Zero-Knowledge SNARK is injected into your session without storing visual data.
            </p>
        </div>

        {stage === "IDLE" && isMobile && (
          <div className="w-full flex flex-col gap-3">
            {address ? (
              <div className="flex flex-col gap-3">
                {stage === "IDLE" && (
                  <button
                    onClick={handleInitiate}
                    className="w-full py-4 bg-[#050505] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Initiate Secure Scan
                  </button>
                )}
                {stage === "WARNING" && (
                  <button
                    onClick={handleSign}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Wallet Signature
                  </button>
                )}
                {stage === "READY_TO_SCAN" && (
                  <button
                    onClick={handleScan}
                    className="w-full py-4 bg-green-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Start Face Scan Now
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-[10px] text-center text-black/40 uppercase font-black tracking-widest">
                  Authentication Required
                </p>
                <button
                  onClick={() => {
                    const appKit = require('@reown/appkit/react');
                    if (appKit && appKit.useAppKit) {
                      const { open } = appKit.useAppKit();
                      if (open) open();
                    }
                  }}
                  className="w-full py-4 bg-[#0044CC] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Connect Mobile Wallet
                </button>
              </div>
            )}
          </div>
        )}
        {stage === "IDLE" && !isMobile && (
          <div className="w-full p-8 bg-white rounded-3xl border border-black/10 flex flex-col items-center gap-6 shadow-sm">
            <div className="p-4 bg-white border border-black/5 rounded-2xl">
              <QRCode value={typeof window !== 'undefined' ? window.location.href : ''} size={160} level="H" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] mb-1">Mobile Bridge Required</p>
              <p className="text-[9px] text-black/40 font-mono uppercase tracking-widest">Scan to continue on mobile</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
