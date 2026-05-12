"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Send, ShieldCheck } from 'lucide-react';

interface ApplicationFormProps {
  role: string;
}

export function ApplicationForm({ role }: ApplicationFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolio: '',
    motivation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }
      
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during submission.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-black/10 rounded-[32px] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#00C076]/10 flex items-center justify-center mb-6">
           <CheckCircle2 size={32} className="text-[#00C076]" />
        </div>
        <h3 className="font-sans text-[28px] font-black tracking-tight text-[#050505] mb-4">Application Secured</h3>
        <p className="font-serif text-[15px] text-[#050505]/70 max-w-md mx-auto leading-relaxed">
          Your dossier for the <strong className="font-sans font-bold text-[#050505]">{role}</strong> mandate has been cryptographically received. Our institutional core team will evaluate your profile and establish contact shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white border border-black/10 p-8 sm:p-12 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
      <div className="mb-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#00C076] mb-2">
           <ShieldCheck size={16} />
           <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">Secure Gateway</span>
        </div>
        <h2 className="text-[28px] font-black tracking-tight text-[#050505]">Initialize Handshake</h2>
        <p className="font-serif text-[15px] text-[#050505]/60 max-w-lg">
          Submit your professional identity and portfolio for the <strong className="font-sans font-bold text-[#050505]">{role}</strong> position.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={18} />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="name" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/60">Sovereign Name</label>
            <input 
              required
              id="name"
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Satoshi Nakamoto"
              className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-4 font-sans text-[14px] outline-none focus:border-black/40 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="email" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/60">Comms Vector (Email)</label>
            <input 
              required
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="satoshi@genesis.block"
              className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-4 font-sans text-[14px] outline-none focus:border-black/40 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="portfolio" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/60">On-Chain Portfolio / GitHub</label>
          <input 
            required
            id="portfolio"
            name="portfolio"
            type="url" 
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://github.com/..."
            className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-4 font-sans text-[14px] outline-none focus:border-black/40 focus:bg-white transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="motivation" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/60">Academic Directive (Cover Letter)</label>
          <textarea 
            required
            id="motivation"
            name="motivation"
            rows={5}
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Detail your experience in Web3 education and why you align with the Sovereign Terminal architecture..."
            className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl p-4 font-sans text-[14px] outline-none focus:border-black/40 focus:bg-white transition-all resize-y min-h-[140px] shadow-sm leading-relaxed"
          />
        </div>

        <div className="flex justify-end mt-2">
          <button 
            type="submit"
            disabled={status === 'submitting'}
            className="group relative flex items-center justify-center gap-3 bg-[#050505] text-[#FAF9F6] px-10 py-4 rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-[#1A1A1A] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg w-full sm:w-auto"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Validating Proof...
              </>
            ) : (
              <>
                Transmit Protocol
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
