"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-black/[0.02] border border-black/10">
        <CheckCircle2 size={48} className="text-[#00C076] mb-6" />
        <h3 className="font-serif text-[24px] text-black mb-2">Application Secured</h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60 max-w-md mx-auto leading-relaxed">
          Your dossier for the {role} mandate has been cryptographically received. Our institutional core team will evaluate your profile and contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h2 className="text-[20px] font-serif text-black mb-2">Initialize Handshake</h2>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/50">
          Submit your cryptographic identity and portfolio for the {role} position.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={16} />
            <span className="font-mono text-[10px] uppercase tracking-widest">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Sovereign Name</label>
            <input 
              required
              id="name"
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Satoshi Nakamoto"
              className="w-full bg-[#fdfbf6] border border-black/20 p-3.5 font-sans text-[13px] outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Comms Vector (Email)</label>
            <input 
              required
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="satoshi@genesis.block"
              className="w-full bg-[#fdfbf6] border border-black/20 p-3.5 font-sans text-[13px] outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="portfolio" className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">On-Chain Portfolio / GitHub</label>
          <input 
            required
            id="portfolio"
            name="portfolio"
            type="url" 
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://github.com/..."
            className="w-full bg-[#fdfbf6] border border-black/20 p-3.5 font-sans text-[13px] outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="motivation" className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/60">Academic Directive (Cover Letter)</label>
          <textarea 
            required
            id="motivation"
            name="motivation"
            rows={5}
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Detail your experience in Web3 education and why you align with the Sovereign Terminal architecture..."
            className="w-full bg-[#fdfbf6] border border-black/20 p-3.5 font-sans text-[13px] outline-none focus:border-black transition-colors resize-y min-h-[120px]"
          />
        </div>

        <div className="flex justify-end mt-4">
          <button 
            type="submit"
            disabled={status === 'submitting'}
            className="group relative flex items-center gap-3 bg-black text-[#FDFCF8] px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Validating Proof...
              </>
            ) : (
              <>
                Transmit Protocol
                <Send size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
