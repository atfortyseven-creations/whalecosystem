"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Bell, Tag, Settings, Plus, Trash2, Save, Loader2, Check, AlertTriangle } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Category {
  id: string; name: string; slug: string; description: string;
  color: string; orderIndex: number; _count?: { topics: number };
}
interface UserProfile {
  displayName: string | null; bio: string | null; avatarUrl: string | null;
  notifyOnReply: boolean; notifyOnMention: boolean;
  tier: string; isPro: boolean; isAdmin: boolean;
}
interface GlobalSettings {
  siteName: string; welcomeMessage: string; moderationMode: string;
  allowGuestRead: boolean; requireApproval: boolean;
  maxTopicsPerDay: number; maxPostsPerDay: number;
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiForum(action: string, payload: object) {
  const res = await fetch('/api/forum/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

// ─── Tiny status banner ──────────────────────────────────────────────────────
function Banner({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {ok ? <Check size={14} /> : <AlertTriangle size={14} />}
      {msg}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid var(--forum-border)' }}>
        <span style={{ color: 'var(--forum-text-muted)' }}>{icon}</span>
        <h2 className="text-[16px] font-black uppercase tracking-widest" style={{ color: 'var(--forum-text)' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Label + input helper ────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg text-[14px] font-mono outline-none transition-all focus:ring-1";
const inputStyle = { backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text)' };

// ════════════════════════════════════════════════════════════════════════════
export default function ForumSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);

  // profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', color: '#6366f1', orderIndex: 99 });
  const [addingCat, setAddingCat] = useState(false);

  // global settings
  const [global, setGlobal] = useState<GlobalSettings | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/forum/settings')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoading(false); return; }
        setProfile(d.user);
        setCategories(d.categories || []);
        setGlobal(d.globalSettings);
        setIsAdmin(d.user?.isAdmin ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const flash = (msg: string, ok = true) => {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 3500);
  };

  // ── Profile save ───────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const r = await apiForum('update_profile', {
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      notifyOnReply: profile.notifyOnReply,
      notifyOnMention: profile.notifyOnMention,
    });
    setSaving(false);
    r.ok ? flash('Profile saved.') : flash(r.error || 'Error saving profile.', false);
  };

  // ── Category helpers ───────────────────────────────────────────────────────
  const saveCategory = async (cat: Category) => {
    const r = await apiForum('update_category', { id: cat.id, name: cat.name, description: cat.description, color: cat.color, orderIndex: cat.orderIndex });
    r.ok ? flash('Category updated.') : flash(r.error || 'Error.', false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? All its topics will be uncategorized.')) return;
    const r = await apiForum('delete_category', { id });
    r.ok ? (flash('Category deleted.'), setCategories(p => p.filter(c => c.id !== id))) : flash(r.error || 'Error.', false);
  };

  const createCategory = async () => {
    if (!newCat.name.trim() || !newCat.slug.trim()) { flash('Name and slug are required.', false); return; }
    setAddingCat(true);
    const r = await apiForum('create_category', newCat);
    setAddingCat(false);
    if (r.ok) {
      setCategories(p => [...p, r.category]);
      setNewCat({ name: '', slug: '', description: '', color: '#6366f1', orderIndex: 99 });
      flash('Category created.');
    } else flash(r.error || 'Error.', false);
  };

  // ── Global save ────────────────────────────────────────────────────────────
  const saveGlobal = async () => {
    if (!global) return;
    const r = await apiForum('update_global', global);
    r.ok ? flash('Forum settings saved.') : flash(r.error || 'Error.', false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3" style={{ color: 'var(--forum-text-muted)' }}>
      <Loader2 size={24} className="animate-spin" />
      <span className="text-[14px] font-mono">Loading forum settings…</span>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <ShieldCheck size={48} style={{ color: 'var(--forum-text-muted)' }} />
      <p className="text-[15px] font-bold" style={{ color: 'var(--forum-text)' }}>Connect your wallet to access settings.</p>
    </div>
  );

  return (
    <div className="w-full max-w-[860px] mx-auto py-10 px-4 flex flex-col gap-12">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight" style={{ color: 'var(--forum-text)' }}>
            Forum Settings
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--forum-text-muted)' }}>
            Configure your forum identity, notifications, and {isAdmin ? 'community parameters.' : 'personal preferences.'}
          </p>
        </div>
        {isAdmin && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck size={12} /> Administrator
          </span>
        )}
      </div>

      {banner && <Banner msg={banner.msg} ok={banner.ok} />}

      {/* ── SECTION 1: IDENTITY ─────────────────────────────────────────── */}
      <Section icon={<User size={18} />} title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Display Name">
            <input
              className={inputCls}
              style={inputStyle}
              value={profile.displayName ?? ''}
              placeholder="e.g. SovereignTrader"
              onChange={e => setProfile(p => p && ({ ...p, displayName: e.target.value }))}
            />
          </Field>
          <Field label="Avatar URL">
            <input
              className={inputCls}
              style={inputStyle}
              value={profile.avatarUrl ?? ''}
              placeholder="https://…/avatar.png"
              onChange={e => setProfile(p => p && ({ ...p, avatarUrl: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            className={inputCls}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
            value={profile.bio ?? ''}
            placeholder="Short bio visible on your forum profile…"
            onChange={e => setProfile(p => p && ({ ...p, bio: e.target.value }))}
          />
        </Field>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-mono px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)', color: 'var(--forum-text-muted)' }}>
            Tier: <strong style={{ color: 'var(--forum-text)' }}>{profile.tier ?? 'STANDARD'}</strong>
          </span>
          {profile.isPro && (
            <span className="text-[12px] font-black px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">⚡ PRO</span>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Identity
          </button>
        </div>
      </Section>

      {/* ── SECTION 2: NOTIFICATIONS ────────────────────────────────────── */}
      <Section icon={<Bell size={18} />} title="Notifications">
        <div className="flex flex-col gap-4">
          {[
            { key: 'notifyOnReply', label: 'Notify me when someone replies to my topics', desc: 'Receive an in-platform notification for every new reply.' },
            { key: 'notifyOnMention', label: 'Notify me when I am @mentioned', desc: 'Triggered when another user mentions your wallet or display name.' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors hover:bg-[var(--forum-hover)]" style={{ border: '1px solid var(--forum-border)' }}>
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded accent-purple-600 shrink-0"
                checked={!!(profile as any)[key]}
                onChange={e => setProfile(p => p && ({ ...p, [key]: e.target.checked }))}
              />
              <div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--forum-text)' }}>{label}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--forum-text-muted)' }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Notifications
          </button>
        </div>
      </Section>

      {/* ── ADMIN SECTIONS ──────────────────────────────────────────────── */}
      {isAdmin && (
        <>
          {/* SECTION 3: CATEGORIES */}
          <Section icon={<Tag size={18} />} title="Categories">
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--forum-surface)', border: '1px solid var(--forum-border)' }}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="color"
                      value={cat.color}
                      className="w-8 h-8 rounded-lg cursor-pointer shrink-0 border-0 p-0"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c))}
                    />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <input
                        className={inputCls + " text-[13px]"}
                        style={inputStyle}
                        value={cat.name}
                        placeholder="Category name"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                      />
                      <input
                        className={inputCls + " text-[12px]"}
                        style={{ ...inputStyle, opacity: 0.75 }}
                        value={cat.description}
                        placeholder="Short description…"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, description: e.target.value } : c))}
                      />
                    </div>
                    <input
                      type="number"
                      className={inputCls + " text-[13px] w-16"}
                      style={inputStyle}
                      value={cat.orderIndex}
                      title="Order index"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, orderIndex: Number(e.target.value) } : c))}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono" style={{ color: 'var(--forum-text-muted)' }}>{cat._count?.topics ?? 0} topics</span>
                    <button onClick={() => saveCategory(cat)} className="p-1.5 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all" title="Save">
                      <Save size={13} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New category form */}
            <div className="flex flex-col gap-3 p-4 rounded-xl" style={{ border: '2px dashed var(--forum-border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>New Category</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <input className={inputCls} style={inputStyle} value={newCat.name} placeholder="Governance" onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field label="Slug (URL)">
                  <input className={inputCls} style={inputStyle} value={newCat.slug} placeholder="governance" onChange={e => setNewCat(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                </Field>
              </div>
              <Field label="Description">
                <input className={inputCls} style={inputStyle} value={newCat.description} placeholder="Brief description…" onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} />
              </Field>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--forum-text-muted)' }}>Color</label>
                  <input type="color" value={newCat.color} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))} />
                </div>
                <Field label="Order">
                  <input type="number" className={inputCls + " w-20"} style={inputStyle} value={newCat.orderIndex} onChange={e => setNewCat(p => ({ ...p, orderIndex: Number(e.target.value) }))} />
                </Field>
                <button
                  onClick={createCategory}
                  disabled={addingCat}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
                >
                  {addingCat ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Category
                </button>
              </div>
            </div>
          </Section>

          {/* SECTION 4: MODERATION & GLOBAL */}
          {global && (
            <Section icon={<Settings size={18} />} title="Moderation & Global">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Site Name">
                  <input className={inputCls} style={inputStyle} value={global.siteName} onChange={e => setGlobal(p => p && ({ ...p, siteName: e.target.value }))} />
                </Field>
                <Field label="Moderation Mode">
                  <select
                    className={inputCls}
                    style={{ ...inputStyle, appearance: 'none' }}
                    value={global.moderationMode}
                    onChange={e => setGlobal(p => p && ({ ...p, moderationMode: e.target.value }))}
                  >
                    <option value="OPEN">OPEN — Posts publish instantly</option>
                    <option value="STRICT">STRICT — All posts require approval</option>
                    <option value="LOCKED">LOCKED — No new posts allowed</option>
                  </select>
                </Field>
              </div>
              <Field label="Welcome Message">
                <textarea
                  className={inputCls}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={global.welcomeMessage}
                  onChange={e => setGlobal(p => p && ({ ...p, welcomeMessage: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Max Topics / Day">
                  <input type="number" className={inputCls} style={inputStyle} value={global.maxTopicsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxTopicsPerDay: Number(e.target.value) }))} />
                </Field>
                <Field label="Max Posts / Day">
                  <input type="number" className={inputCls} style={inputStyle} value={global.maxPostsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxPostsPerDay: Number(e.target.value) }))} />
                </Field>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { key: 'allowGuestRead', label: 'Allow guests to read topics without connecting wallet' },
                  { key: 'requireApproval', label: 'Require admin approval before new topics are published' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-purple-600"
                      checked={!!(global as any)[key]}
                      onChange={e => setGlobal(p => p && ({ ...p, [key]: e.target.checked }))}
                    />
                    <span className="text-[14px]" style={{ color: 'var(--forum-text)' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveGlobal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all"
                  style={{ backgroundColor: 'var(--forum-button-bg)', color: 'var(--forum-button-text)' }}
                >
                  <Save size={14} /> Save Forum Config
                </button>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
