"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useSignMessage } from 'wagmi';
import { QRCodeSVG as QRCode } from "qrcode.react";
import { X, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const MobileKYCPage = dynamic(() => import("../../app/mobile-kyc/page"), { ssr: false });


// AES-GCM Crypto Helpers for E2EE Decryption
async function decryptPayload(ciphertextBase64: string, hexKey: string): Promise<string> {
  const enc = new TextDecoder();
  const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
  );
  
  const rawData = new Uint8Array(atob(ciphertextBase64).split("").map(c => c.charCodeAt(0)));
  const iv = rawData.slice(0, 12);
  const data = rawData.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv }, cryptoKey, data
  );
  return enc.decode(decrypted);
}

// Generate Random Hex for AES Key
function generateEphemeralKey() {
  const array = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUUID() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ZKBiometricGateProps {
  onSuccess?: (zkProofSignature: string) => void;
  uuid?: string | null;
}

export function ZKBiometricGate({ onSuccess, uuid: propUuid }: ZKBiometricGateProps) {
  const [stage, setStage] = useState<"IDLE" | "GENERATING_TUNNEL" | "QR_HANDOFF" | "VERIFYING_PAYLOAD" | "SUCCESS" | "ERROR" | "MOBILE_INLINE">("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // E2EE Session State
  const [sessionData, setSessionData] = useState<{ id: string, ekey: string, url: string } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || '';
      const isUaMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      setIsMobile(isUaMobile || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initiateSecureTunnel = async () => {
    if (!address) {
      setErrorMsg("Wallet not connected. Connect to proceed.");
      setStage("ERROR");
      return;
    }

    setStage("GENERATING_TUNNEL");

    if (isMobile) {
      // If already on mobile, run inline
      setStage("MOBILE_INLINE");
      return;
    }

    // Generate PC-to-Mobile Handoff
    const sessionId = generateUUID();
    const ekey = generateEphemeralKey();
    const origin = window.location.origin;
    const url = `${origin}/mobile-kyc?session=${sessionId}&ekey=${ekey}`;
    
    setSessionData({ id: sessionId, ekey, url });
    setStage("QR_HANDOFF");
  };

  const handleInlineSuccess = async () => {
    try {
      const ts = Date.now();
      const message = `Humanity Ledger Attestation\n\nIdentity: ${address}\nTimestamp: ${ts}\nSession: INLINE_MOBILE\nLiveness: Verified`;
      const signature = await signMessageAsync({ message });
      setStage("SUCCESS");
      if (onSuccess) onSuccess(signature);
    } catch (err: any) {
      setErrorMsg("Signature Failed.");
      setStage("ERROR");
    }
  };

  // High-Frequency Polling Effect (Backoff)
  useEffect(() => {
    if (stage !== "QR_HANDOFF" || !sessionData) return;

    let isActive = true;
    let pollCount = 0;

    const poll = async () => {
      if (!isActive) return;
      try {
        const res = await fetch(`/api/auth/kyc-qr-poll?uuid=${sessionData.id}`);
        if (!res.ok) {
           if (res.status === 408 || res.status === 429) {
             // Just retry on timeouts or rate limit
             setTimeout(poll, 2000);
             return;
           }
           throw new Error("Polling Error");
        }
        
        const data = await res.json();
        
        if (data.status === "SUCCESS" && data.ciphertext) {
           setStage("VERIFYING_PAYLOAD");
           
           try {
             // 1. Decrypt locally (Zero-Knowledge)
             const decryptedStr = await decryptPayload(data.ciphertext, sessionData.ekey);
             const proofObj = JSON.parse(decryptedStr);
             
             if (proofObj.verified) {
               // 2. Final Signature Binding
               const ts = Date.now();
               const message = `Humanity Ledger Attestation\n\nIdentity: ${address}\nTimestamp: ${ts}\nSession: ${sessionData.id}\nLiveness: Verified`;
               const signature = await signMessageAsync({ message });
               
               setStage("SUCCESS");
               if (onSuccess) onSuccess(signature);
             } else {
               throw new Error("Payload verification failed.");
             }
           } catch (decErr) {
             console.error(decErr);
             setErrorMsg("Cryptographic Decryption Failed. Possible Tampering.");
             setStage("ERROR");
           }
           return;
        }

        // Si sigue PENDING y llevamos menos de 120 intentos (~120s), seguir haciendo polling.
        pollCount++;
        if (pollCount > 60) { // 2 minutes approx
           setErrorMsg("Session Expired. 120s TTL Reached.");
           setStage("ERROR");
           return;
        }

        setTimeout(poll, 2000); // Poll every 2 seconds
      } catch (err) {
        if (isActive) setTimeout(poll, 3000);
      }
    };

    poll();

    return () => { isActive = false; };
  }, [stage, sessionData, address, signMessageAsync, onSuccess]);

  return (
    <div className="w-full h-full bg-white rounded-[24px] p-8 shadow-sm font-mono text-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center border border-black/5">
      
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm text-center">
        
        {/* Header */}
        <div className="mb-10 flex flex-col items-center">
           <h2 className="text-[14px] font-bold uppercase tracking-[0.4em] text-[#0a0a0a]">Humanity Ledger™ KYC</h2>
           <p className="text-[9px] text-black/40 uppercase tracking-widest mt-2">Zero-Knowledge Biometric Protocol</p>
        </div>

        <div className="h-64 flex items-center justify-center w-full mb-8">
          <AnimatePresence mode="wait">
            
            {stage === "IDLE" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
                 <p className="text-[11px] text-black/60 leading-relaxed mb-8 uppercase tracking-[0.1em]">
                   Absolute privacy guaranteed. Your facial telemetry is processed locally on your hardware and transmitted via E2EE ephemeral tunnels.
                 </p>
                 <button 
                   onClick={initiateSecureTunnel}
                   className="w-full py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                 >
                   {isMobile ? "Launch Sensors" : "Generate Secure Handoff"}
                 </button>
              </motion.div>
            )}

            {stage === "GENERATING_TUNNEL" && (
              <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                 <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
                 <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold">Negotiating AES-GCM Tunnel...</p>
              </motion.div>
            )}

            {stage === "QR_HANDOFF" && sessionData && (
              <motion.div key="qr" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-black/5 relative overflow-hidden group mb-6">
                    <QRCode value={sessionData.url} size={180} fgColor="#050505" bgColor="#ffffff" level="H" />
                 </div>
                 
                 <div className="flex items-center gap-2 text-[#0a0a0a] mb-2">
                   <Smartphone size={16} />
                   <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Scan to Verify</p>
                 </div>
                 <p className="text-[8px] text-black/40 uppercase tracking-widest">Awaiting ZK-Payload Transmission...</p>
              </motion.div>
            )}

            {stage === "VERIFYING_PAYLOAD" && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                 <div className="w-10 h-10 border-2 border-emerald-500/20 border-l-emerald-500 rounded-full animate-spin mb-4" />
                 <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold">Decrypting Payload...</p>
                 <p className="text-[7px] text-white/30 uppercase tracking-widest mt-2">Finalizing EIP-191 Signature</p>
              </motion.div>
            )}

            {stage === "SUCCESS" && (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                 <div className="w-16 h-16 bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-sm mb-6">
                   <CheckCircle2 size={24} className="text-white" />
                 </div>
                 <h3 className="text-[12px] font-bold text-[#0a0a0a] uppercase tracking-[0.3em] mb-2">Identity Verified</h3>
                 <p className="text-[9px] text-black/40 uppercase tracking-widest">Sovereign Terminal Unlocked</p>
              </motion.div>
            )}

            {stage === "ERROR" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                   <X size={24} className="text-red-500" />
                 </div>
                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed mb-6">{errorMsg}</p>
                 <button onClick={() => setStage("IDLE")} className="text-[9px] text-black/50 hover:text-black uppercase tracking-[0.2em] border-b border-black/20 pb-1">
                   Retry Tunnel
                 </button>
              </motion.div>
            )}

            {stage === "MOBILE_INLINE" && (
               <motion.div key="inline-kyc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50">
                   <MobileKYCPage isInline={true} onInlineSuccess={handleInlineSuccess} />
               </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* E2EE Footer */}
        <div className="w-full pt-6 border-t border-white/10 flex flex-col gap-2">
          <div className="flex justify-between w-full">
             <span className="text-[8px] text-white/30 uppercase tracking-widest">Encryption</span>
             <span className="text-[8px] text-emerald-500/60 uppercase tracking-widest font-bold">AES-GCM-256</span>
          </div>
          <div className="flex justify-between w-full">
             <span className="text-[8px] text-white/30 uppercase tracking-widest">Telemetry</span>
             <span className="text-[8px] text-emerald-500/60 uppercase tracking-widest font-bold">Liveness Edge</span>
          </div>
        </div>

      </div>
    </div>
  );
}
