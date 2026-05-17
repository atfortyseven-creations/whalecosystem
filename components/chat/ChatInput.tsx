'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Paperclip, Smile, Mic, Timer,
  X, Reply, Square, Flame
} from 'lucide-react';

export type AutoDestructPreset = 'off' | '1m' | '1h' | '24h' | '7d';

interface ChatInputProps {
  onSendText:    (text: string) => void;
  onSendVoice:   (blob: Blob, durationMs: number) => void;
  onSendFile:    (file: File) => void;
  onSendEmoji:   (emoji: string) => void;
  replyingTo?:   { id: string; preview: string };
  onCancelReply: () => void;
  autoDestruct:  AutoDestructPreset;
  onAutoDestructChange: (val: AutoDestructPreset) => void;
  disabled?: boolean;
}

const EMOJI_GRID = [
  '😀','😂','🥹','😎','🤯','🫡','🔥','💎',
  '🐳','🚀','📊','⚡','✅','❌','💰','🌊',
  '🧠','🏆','🎯','🔐','⛓️','🌐','🦾','🤖',
];

// Pick best supported mime type
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    '',
  ];
  for (const t of types) {
    if (!t || MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

export default function ChatInput({
  onSendText, onSendVoice, onSendFile, onSendEmoji,
  replyingTo, onCancelReply, autoDestruct, onAutoDestructChange, disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDestruct, setShowDestruct] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const mediaRef    = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<BlobPart[]>([]);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef<number>(0); // ← fix: use ref so onstop always has latest value
  const fileRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Voice recording ──────────────────────────────────────────────────────

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mimeType = getSupportedMimeType();
      const opts: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, opts);

      chunksRef.current  = [];
      durationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Use durationRef — immune to stale closure
        const finalMs = durationRef.current;
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        onSendVoice(blob, finalMs);
        setRecordingMs(0);
        durationRef.current = 0;
      };

      // timeslice=250ms ensures ondataavailable fires regularly
      recorder.start(250);
      mediaRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingMs(p => {
          const next = p + 100;
          durationRef.current = next;
          return next;
        });
      }, 100);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setMicError('Microphone access denied. Allow mic in browser settings.');
      } else {
        setMicError('Could not start recording: ' + msg);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.ondataavailable = null;
      mediaRef.current.onstop = null;
      mediaRef.current.stop();
      (mediaRef.current as any).stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    }
    chunksRef.current = [];
    durationRef.current = 0;
    setIsRecording(false);
    setRecordingMs(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSendFile(file);
    e.target.value = '';
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const DESTRUCT_OPTS: { value: AutoDestructPreset; label: string }[] = [
    { value: 'off', label: 'Off' }, { value: '1m', label: '1 min' },
    { value: '1h', label: '1 hr' }, { value: '24h', label: '24 hrs' }, { value: '7d', label: '7 d' },
  ];

  return (
    <div className="border-t border-black/6 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0">

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-black/[0.03] border border-black/8 rounded-xl px-4 py-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply size={13} className="text-black/40 shrink-0" />
            <p className="text-[11px] font-mono text-black/50 truncate">{replyingTo.preview}</p>
          </div>
          <button onClick={onCancelReply} className="text-black/30 hover:text-black transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Auto-destruct indicator */}
      {autoDestruct !== 'off' && (
        <div className="flex items-center gap-2 text-[10px] font-mono text-red-500 mb-2 px-1">
          <Flame size={11} /> Messages self-destruct after {autoDestruct}
        </div>
      )}

      {/* Mic error */}
      {micError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-2">
          <p className="text-[11px] font-mono text-red-600 flex-1">{micError}</p>
          <button onClick={() => setMicError(null)}><X size={13} className="text-red-400" /></button>
        </div>
      )}

      {/* Recording UI */}
      {isRecording ? (
        <div className="flex items-center gap-3">
          <button onClick={cancelRecording} className="text-black/30 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[13px] text-black font-bold">{formatDuration(recordingMs)}</span>
            <span className="font-mono text-[10px] text-black/35 ml-auto">Recording…</span>
          </div>
          <button
            onClick={stopRecording}
            className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow"
          >
            <Square size={18} fill="white" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* File picker */}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach file"
            className="w-10 h-10 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.06] transition-all shrink-0"
          >
            <Paperclip size={18} />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              disabled={disabled}
              placeholder={disabled ? 'Connecting…' : 'Encrypted message…'}
              rows={1}
              className="w-full bg-black/[0.025] border border-black/10 rounded-xl px-4 py-3 text-[14px] font-mono text-black resize-none focus:outline-none focus:border-black/30 placeholder:text-black/25 transition-colors pr-12 leading-relaxed disabled:opacity-40"
            />
            <button
              onClick={() => { setShowEmoji(p => !p); setShowDestruct(false); }}
              className="absolute right-3 bottom-3 text-black/25 hover:text-black transition-colors"
            >
              <Smile size={18} />
            </button>
          </div>

          {/* Self-destruct toggle */}
          <button
            onClick={() => { setShowDestruct(p => !p); setShowEmoji(false); }}
            title="Auto-destruct"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              autoDestruct !== 'off'
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-black/[0.03] border-black/8 text-black/30 hover:text-black hover:bg-black/[0.06]'
            }`}
          >
            <Timer size={18} />
          </button>

          {/* Send / Mic */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-all shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              title="Record voice"
              className="w-12 h-12 rounded-xl bg-black/[0.03] border border-black/8 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.06] transition-all shrink-0"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      )}

      {/* Self-destruct selector */}
      {showDestruct && !isRecording && (
        <div className="mt-2 bg-white border border-black/8 rounded-2xl p-3 flex gap-2 flex-wrap shadow-sm">
          {DESTRUCT_OPTS.map(o => (
            <button
              key={o.value}
              onClick={() => { onAutoDestructChange(o.value); setShowDestruct(false); }}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all ${
                autoDestruct === o.value
                  ? 'bg-black text-white border-black'
                  : 'bg-black/[0.03] border-black/8 text-black/50 hover:text-black'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="mt-2 bg-white border border-black/8 rounded-2xl p-3 grid grid-cols-8 gap-1.5 shadow-sm">
          {EMOJI_GRID.map(e => (
            <button
              key={e}
              onClick={() => { onSendEmoji(e); setShowEmoji(false); }}
              className="w-9 h-9 text-[18px] rounded-xl hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
