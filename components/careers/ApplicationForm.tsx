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
      <div className="flex flex-col items-center justify-center p-16 text-center bg-white/40 backdrop-blur-xl border border-black/5 rounded-[32px]">
        <div className="w-16 h-16 rounded-full bg-[#00C076]/10 flex items-center justify-center mb-6">
           <CheckCircle2 size={32} className="text-[#00C076]" />
        </div>
        <h3 className="font-sans text-[28px] font-black tracking-tight text-black mb-4">Application Received</h3>
        <p className="font-serif text-[15px] text-black/60 max-w-md mx-auto leading-relaxed">
          Your application for the <strong className="font-sans font-bold text-black">{role}</strong> position has been received. Our team will review your profile and reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white/40 backdrop-blur-3xl border border-black/5 p-8 sm:p-12 rounded-[32px]">
      <div className="mb-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#00C076] mb-2">
           <ShieldCheck size={16} />
           <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em]">Secure Submission</span>
        </div>
        <h2 className="text-[28px] font-black tracking-tight text-black">Submit Application</h2>
        <p className="font-serif text-[15px] text-black/50 max-w-lg">
          Submit your profile for the <strong className="font-sans font-bold text-black">{role}</strong> position.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {status === 'error' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="name" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Full Name</label>
            <input
              required
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Satoshi Nakamoto"
              className="w-full bg-black/5 border border-black/10 rounded-xl p-4 font-sans text-[14px] text-black placeholder:text-black/30 outline-none focus:border-black/30 focus:bg-black/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="email" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Email Address</label>
            <input
              required
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="satoshi@genesis.block"
              className="w-full bg-black/5 border border-black/10 rounded-xl p-4 font-sans text-[14px] text-black placeholder:text-black/30 outline-none focus:border-black/30 focus:bg-black/10 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="portfolio" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Portfolio / GitHub URL</label>
          <input
            required
            id="portfolio"
            name="portfolio"
            type="url"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://github.com/..."
            className="w-full bg-black/5 border border-black/10 rounded-xl p-4 font-sans text-[14px] text-black placeholder:text-black/30 outline-none focus:border-black/30 focus:bg-black/10 transition-all"
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="motivation" className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-black/50">Cover Letter</label>
          <textarea
            required
            id="motivation"
            name="motivation"
            rows={5}
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Detail your experience in Web3 and why you align with the Whale Alert Network mission..."
            className="w-full bg-black/5 border border-black/10 rounded-xl p-4 font-sans text-[14px] text-black placeholder:text-black/30 outline-none focus:border-black/30 focus:bg-black/10 transition-all resize-y min-h-[140px] leading-relaxed"
          />
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="group relative flex items-center justify-center gap-3 bg-[#0a0a0a] text-white px-10 py-4 rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-black/80 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg w-full sm:w-auto"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Send Application
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
