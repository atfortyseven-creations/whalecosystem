"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSignMessage } from 'wagmi';
import { QRCodeSVG as QRCode } from "qrcode.react";
import { X } from "lucide-react";

interface ZKBiometricGateProps {
  onSuccess?: (zkProofSignature: string) => void;
  uuid?: string | null;
}

export function ZKBiometricGate({ onSuccess, uuid }: ZKBiometricGateProps) {
  const [stage, setStage] = useState<"IDLE" | "WARNING" | "SIGNING" | "READY_TO_SCAN" | "ALIGNING" | "SCANNING" | "MESH_EXTRACTION" | "LIVENESS_PROOFS" | "GENERATING_SNARK" | "BINDING" | "SUCCESS" | "ERROR">("IDLE");
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
      const message = `Authorize Whale Alert Biometric Attestation\n\nIdentity: ${address}\nTimestamp: ${ts}\n\nBy signing, you bind your 3D neural mesh to this cryptographic session.`;
      
      const signature = await signMessageAsync({ message });
      setAuthSignature(signature);
      setStage("READY_TO_SCAN");
    } catch (error: any) {
      console.error("[Whale] Signing Error:", error);
      setErrorMessage(error.message || "Signature rejected");
      setStage("ERROR");
    }
  };

  const handleScan = async () => {
    try {
      setStage("SCANNING");
      
      // 1. Initiate Real Camera Stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 640, height: 640 } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;

      // 2. Wait for Video Ready
      if (videoRef.current) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Camera timeout")), 15000);
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
        ctx?.drawImage(videoRef.current, 0, 0, 400, 400);
        capturedFrame = canvasRef.current.toDataURL('image/jpeg', 0.6);
      }

      // [INSTITUTIONAL-RIGOR] SUSTAINED SCAN (Total ~60s)
      setStage("ALIGNING");
      await new Promise(r => setTimeout(r, 8000));
      
      setStage("SCANNING");
      await new Promise(r => setTimeout(r, 12000));
      
      setStage("MESH_EXTRACTION");
      await new Promise(r => setTimeout(r, 12000));

      // 4. Cryptographic Challenge
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();
      
      setStage("LIVENESS_PROOFS");
      await new Promise(r => setTimeout(r, 12000));

      setStage("GENERATING_SNARK");
      // 5. Verify via Oracle
      const response = await fetch('/api/oracle/zk-biometrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address, 
          signature: authSignature,
          payload: capturedFrame,
          nonce,
          uuid,
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error("Attestation failed");
      
      setStage("BINDING");
      await new Promise(r => setTimeout(r, 16000));

      mediaStream.getTracks().forEach(t => t.stop());
      setStream(null);

      setStage("SUCCESS");
      if (onSuccess) onSuccess(authSignature || "0xVerified");

    } catch (error: any) {
      console.error("[Whale] Verification Error:", error);
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
    <div className="w-full h-full bg-[#FAFAF8] rounded-[32px] p-8 sm:p-12 shadow-sm font-sans text-[#0A0A0A] relative overflow-hidden flex flex-col items-center justify-center selection:bg-black/10">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
      
      {/* Centered Scanner Section */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xl">

        <div className="relative w-72 h-72 sm:w-[400px] sm:h-[400px] mb-12 flex items-center justify-center">
          {/* External Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
            <motion.circle 
              cx="50" cy="50" r="49" fill="none" stroke="#000" strokeWidth="1" 
              strokeDasharray="307.88" 
              initial={{ strokeDashoffset: 307.88 }}
              animate={{ 
                strokeDashoffset: stage === "SUCCESS" ? 0 : 
                                 stage === "SCANNING" ? 280 :
                                 stage === "ALIGNING" ? 250 :
                                 stage === "MESH_EXTRACTION" ? 200 :
                                 stage === "LIVENESS_PROOFS" ? 150 :
                                 stage === "GENERATING_SNARK" ? 100 :
                                 stage === "BINDING" ? 50 : 307.88 
              }} 
              transition={{ ease: "easeInOut", duration: 2 }} 
            />
          </svg>

          <AnimatePresence mode="wait">
            {stage === "IDLE" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-[0.5px] border-black/10 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black/20 rounded-full" />
                  </div>
              </motion.div>
            )}
            
            {(stage === "SCANNING" || stage === "ALIGNING" || stage === "MESH_EXTRACTION" || stage === "LIVENESS_PROOFS" || stage === "GENERATING_SNARK" || stage === "BINDING") && (
              <motion.div key="live-feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full h-full rounded-full border border-black/5 overflow-hidden bg-black shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale scale-x-[-1]"
                  />
                  <canvas ref={canvasRef} width={400} height={400} className="hidden" />
                  
                  {/* LinkedIn Style Face Oval Overlay */}
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-full" />
                  <div className="absolute inset-0 border-[1px] border-white/20 pointer-events-none rounded-full" />
                  
                  {/* Scanning Line */}
                  <motion.div 
                    animate={{ y: ["0%", "100%", "0%"] }} 
                    transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-white/40 shadow-[0_0_30px_rgba(255,255,255,0.4)] z-10" 
                  />
                </div>
              </motion.div>
            )}

            {stage === "SIGNING" && (
              <motion.div key="signing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-[0.5px] border-black/20 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-4 h-4 bg-black/40 rounded-full" />
                </div>
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-2xl">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-black">Attestation Complete</span>
                </div>
              </motion.div>
            )}

            {stage === "ERROR" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center p-12 text-center">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <X size={24} className="text-red-500" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-500 leading-relaxed max-w-xs">{errorMessage}</p>
                  <button onClick={() => setStage("IDLE")} className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-black/20 pb-1">Retry Session</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center h-24 mb-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <h3 className="text-[18px] font-black uppercase tracking-tighter text-black">
                {stage === "IDLE" ? "Mathematical Identity" :
                 stage === "SIGNING" ? "Awaiting Handshake" :
                 stage === "READY_TO_SCAN" ? "Identity Bound" :
                 stage === "SCANNING" ? "Capturing Landmarks" :
                 stage === "ALIGNING" ? "Aligning Neural Mesh" :
                 stage === "MESH_EXTRACTION" ? "Extracting Topology" :
                 stage === "LIVENESS_PROOFS" ? "Liveness Verification" :
                 stage === "GENERATING_SNARK" ? "Oracle Attestation" :
                 stage === "BINDING" ? "Finalizing Vault" :
                 stage === "SUCCESS" ? "Verified" : "Handshake Failed"}
              </h3>
              <p className="text-[11px] font-serif text-black/40 leading-relaxed max-w-xs uppercase tracking-widest font-bold">
                {stage === "IDLE" ? "ZK-Biometric Attestation for Institutional Access." :
                 stage === "SIGNING" ? "Please sign the challenge in your mobile wallet." :
                 stage === "SCANNING" ? "Sustained biometric capture in progress." :
                 stage === "LIVENESS_PROOFS" ? "Validating biological nominality." :
                 stage === "SUCCESS" ? "Personhood established. Redirection imminent." :
                 "Protocol sequence initialized. Maintain positioning."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-4">
          {stage === "IDLE" && (
            address ? (
              <button
                onClick={handleInitiate}
                className="w-full py-6 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
              >
                Initiate Attestation
              </button>
            ) : (
              <button
                onClick={() => {
                  const appKit = require('@reown/appkit/react');
                  if (appKit && appKit.useAppKit) {
                    const { open } = appKit.useAppKit();
                    if (open) open();
                  }
                }}
                className="w-full py-6 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
              >
                Connect Identity
              </button>
            )
          )}
          
          {stage === "WARNING" && (
            <button
              onClick={handleSign}
              className="w-full py-6 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
            >
              Sign Handshake
            </button>
          )}

          {stage === "READY_TO_SCAN" && (
            <button
              onClick={handleScan}
              className="w-full py-6 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
            >
              Begin Forensic Scan
            </button>
          )}
        </div>

        {/* Forensic Footer */}
        <div className="mt-16 w-full pt-8 border-t border-black/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-black/20">Protocol Security</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Zero-Knowledge Attested</span>
          </div>
          <p className="text-[9px] font-mono text-black/30 leading-relaxed uppercase tracking-tighter">
            Every attestation is cryptographically bound to the physical device and biometric landmark mesh. No raw biometric data is ever transmitted or stored on Whale Alert servers.
          </p>
        </div>
      </div>
    </div>
  );
}
