'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send, Paperclip, Smile, Mic, MicOff, Timer,
  X, Reply, Square, Flame
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export type AutoDestructPreset = 'off' | '1m' | '1h' | '24h' | '7d';

interface ChatInputProps {
  onSendText:    (text: string) => void;
  onSendVoice:   (blob: Blob, durationMs: number) => void;
  onSendFile:    (file: File) => void;
  onSendEmoji:   (emoji: string) => void;
  replyingTo?:   { id: string; preview: string };
  onCancelReply: () => void;
  autoDestruct:  AutoDestructPreset;
  disabled?: boolean;
}

// ── Emoji Set (minimal curated subset) ────────────────────────────────────

const EMOJI_GRID = [
  '😀','😂','🥹','😎','🤯','🫡','🔥','💎',
  '🐳','🚀','📊','⚡','✅','❌','💰','🌊',
  '🧠','🏆','🎯','🔐','⛓️','🌐','🦾','🤖',
];

// ── Component ──────────────────────────────────────────────────────────────

export default function ChatInput({
  onSendText, onSendVoice, onSendFile, onSendEmoji,
  replyingTo, onCancelReply, autoDestruct, disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDestruct, setShowDestruct] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);

  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const mediaRef  = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const durationMs = recordingMs;
        stream.getTracks().forEach(t => t.stop());
        onSendVoice(blob, durationMs);
        setRecordingMs(0);
      };
      recorder.start(100);
      mediaRef.current = recorder;
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingMs(p => p + 100), 100);
    } catch {
      console.error('Microphone access denied.');
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.ondataavailable = null;
      mediaRef.current.onstop = null;
      mediaRef.current.stop();
      mediaRef.current.stream?.getTracks().forEach(t => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingMs(0);
  };

  // ── File picker ───────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSendFile(file);
    e.target.value = '';
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;
  };

  const DESTRUCT_OPTS: { value: AutoDestructPreset; label: string }[] = [
    { value: 'off', label: 'Off' }, { value: '1m', label: '1 min' },
    { value: '1h', label: '1 hr' }, { value: '24h', label: '24 hrs' }, { value: '7d', label: '7 d' },
  ];

  return (
    <div className="border-t border-white/5 bg-black/40 backdrop-blur-xl px-4 py-3">

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply size={13} className="text-[#00C076] shrink-0" />
            <p className="text-[11px] font-mono text-white/50 truncate">{replyingTo.preview}</p>
          </div>
          <button onClick={onCancelReply} className="text-white/30 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Auto-destruct indicator */}
      {autoDestruct !== 'off' && (
        <div className="flex items-center gap-2 text-[10px] font-mono text-red-400 mb-2 px-1">
          <Flame size={11} /> Messages self-destruct after {autoDestruct}
        </div>
      )}

      {/* Voice recording UI */}
      {isRecording ? (
        <div className="flex items-center gap-3">
          <button onClick={cancelRecording} className="text-white/30 hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[13px] text-white">{formatDuration(recordingMs)}</span>
            <span className="font-mono text-[10px] text-white/30 ml-auto">Recording…</span>
          </div>
          <button
            onClick={stopRecording}
            className="w-12 h-12 rounded-xl bg-[#00C076] flex items-center justify-center text-black shadow-lg"
          >
            <Square size={18} fill="black" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* Attachments */}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
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
              placeholder="Encrypted message…"
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[14px] font-mono text-white resize-none focus:outline-none focus:border-[#00C076]/40 placeholder:text-white/20 transition-colors pr-12 leading-relaxed"
            />
            {/* Emoji button inside input */}
            <button
              onClick={() => { setShowEmoji(p => !p); setShowDestruct(false); }}
              className="absolute right-3 bottom-3 text-white/30 hover:text-white transition-colors"
            >
              <Smile size={18} />
            </button>
          </div>

          {/* Self-destruct toggle */}
          <button
            onClick={() => { setShowDestruct(p => !p); setShowEmoji(false); }}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              autoDestruct !== 'off'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/5 border-white/10 text-white/30 hover:text-white hover:bg-white/10'
            }`}
          >
            <Timer size={18} />
          </button>

          {/* Send / Mic */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black disabled:opacity-30 hover:bg-white/90 transition-all shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="mt-2 bg-[#111] border border-white/10 rounded-2xl p-3 grid grid-cols-8 gap-1.5">
          {EMOJI_GRID.map(e => (
            <button
              key={e}
              onClick={() => { onSendEmoji(e); setShowEmoji(false); }}
              className="w-9 h-9 text-[18px] rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
