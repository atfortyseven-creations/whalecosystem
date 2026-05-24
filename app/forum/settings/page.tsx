"use client";

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SIWEPanel } from '@/components/auth/SIWEAuthGate';

//  Types 
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

//  API helpers 
async function apiForum(action: string, payload: object) {
  const res = await fetch('/api/forum/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

//  Tiny status banner 
function Banner({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-black ${ok ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}>
      {msg}
    </div>
  );
}

//  Section wrapper 
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="pb-3 border-b border-black/10">
        <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

//  Label + input helper 
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-black uppercase tracking-widest text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl text-base font-mono outline-none transition-all focus:ring-1 bg-white border border-slate-200 text-slate-900";

// 
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

  //  Load data 
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

  //  Profile save 
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const r = await apiForum('update_profile', {
      displayName: profile.displayName || null,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl?.trim() || null, // null if empty  field is optional
      notifyOnReply: profile.notifyOnReply,
      notifyOnMention: profile.notifyOnMention,
    });
    setSaving(false);
    r.ok ? flash('Profile saved.') : flash(r.error || 'Error saving profile.', false);
  };

  //  Category helpers 
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

  //  Global save 
  const saveGlobal = async () => {
    if (!global) return;
    const r = await apiForum('update_global', global);
    r.ok ? flash('Forum settings saved.') : flash(r.error || 'Error.', false);
  };

  //  Render 
  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3 text-slate-400">
      <Loader2 size={24} className="animate-spin" />
      <span className="text-base font-mono">Loading forum settings</span>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 w-full">
      <SIWEPanel inline onAuthenticated={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="w-full max-w-[860px] mx-auto py-10 px-4 flex flex-col gap-12">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Forum Settings
          </h1>
          <p className="text-base mt-2 text-slate-500">
            Configure your forum identity, notifications, and {isAdmin ? 'community parameters.' : 'personal preferences.'}
          </p>
        </div>
        {isAdmin && (
          <span className="px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest bg-slate-100 text-slate-900 border border-slate-200">
            Administrator
          </span>
        )}
      </div>

      {banner && <Banner msg={banner.msg} ok={banner.ok} />}

      {/*  SECTION 1: IDENTITY  */}
      <Section title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Display Name">
            <input
              className={inputCls}
              value={profile.displayName ?? ''}
              placeholder="Your name"
              onChange={e => setProfile(p => p && ({ ...p, displayName: e.target.value }))}
            />
          </Field>
          <Field label="Avatar URL">
            <input
              className={inputCls}
              value={profile.avatarUrl ?? ''}
              placeholder="https://example.com/avatar.png"
              onChange={e => setProfile(p => p && ({ ...p, avatarUrl: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            className={inputCls}
            style={{ resize: 'vertical', minHeight: 120 }}
            value={profile.bio ?? ''}
            placeholder="Short description about you"
            onChange={e => setProfile(p => p && ({ ...p, bio: e.target.value }))}
          />
        </Field>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            Tier: <strong className="text-slate-900">{profile.tier ?? 'STANDARD'}</strong>
          </span>
          {profile.isPro && (
            <span className="text-sm font-black px-4 py-2 rounded-full bg-slate-100 text-slate-900 border border-slate-200"> PRO</span>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Identity
          </button>
        </div>
      </Section>

      {/*  SECTION 2: NOTIFICATIONS  */}
      <Section title="Notifications">
        <div className="flex flex-col gap-4">
          {[
            { key: 'notifyOnReply', label: 'Notify me when someone replies to my topics', desc: 'Receive a notification when someone responds to your posts.' },
            { key: 'notifyOnMention', label: 'Notify me when someone mentions me', desc: 'Receive a notification when someone mentions your name.' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors hover:bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 rounded accent-slate-900 shrink-0"
                checked={!!(profile as any)[key]}
                onChange={e => setProfile(p => p && ({ ...p, [key]: e.target.checked }))}
              />
              <div>
                <p className="text-base font-black text-slate-900">{label}</p>
                <p className="text-sm mt-1 text-slate-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Notifications
          </button>
        </div>
      </Section>

      {/*  ADMIN SECTIONS  */}
      {isAdmin && (
        <>
          {/* SECTION 3: CATEGORIES */}
          <Section title="Categories">
            <div className="flex flex-col gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="color"
                      value={cat.color}
                      className="w-10 h-10 rounded-lg cursor-pointer shrink-0 border-0 p-0"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c))}
                    />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <input
                        className={inputCls}
                        value={cat.name}
                        placeholder="Category name"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                      />
                      <input
                        className={inputCls}
                        value={cat.description}
                        placeholder="Short description"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, description: e.target.value } : c))}
                      />
                    </div>
                    <input
                      type="number"
                      className={inputCls + " w-20"}
                      value={cat.orderIndex}
                      title="Order index"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, orderIndex: Number(e.target.value) } : c))}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono text-slate-500">{cat._count?.topics ?? 0} topics</span>
                    <button onClick={() => saveCategory(cat)} className="px-4 py-2 rounded-lg text-sm font-black bg-slate-900 text-white hover:bg-slate-800 transition-all">
                      Save
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="px-4 py-2 rounded-lg text-sm font-black bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New category form */}
            <div className="flex flex-col gap-4 p-6 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-sm font-black uppercase tracking-widest text-slate-600">New Category</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <input className={inputCls} value={newCat.name} placeholder="Governance" onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field label="Slug (URL)">
                  <input className={inputCls} value={newCat.slug} placeholder="governance" onChange={e => setNewCat(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                </Field>
              </div>
              <Field label="Description">
                <input className={inputCls} value={newCat.description} placeholder="Brief description" onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} />
              </Field>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-black uppercase tracking-widest text-slate-600">Color</label>
                  <input type="color" value={newCat.color} className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))} />
                </div>
                <Field label="Order">
                  <input type="number" className={inputCls + " w-24"} value={newCat.orderIndex} onChange={e => setNewCat(p => ({ ...p, orderIndex: Number(e.target.value) }))} />
                </Field>
                <button
                  onClick={createCategory}
                  disabled={addingCat}
                  className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800"
                >
                  {addingCat ? <Loader2 size={16} className="animate-spin" /> : null}
                  Add Category
                </button>
              </div>
            </div>
          </Section>

          {/* SECTION 4: MODERATION & GLOBAL */}
          {global && (
            <Section title="Moderation & Global">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Site Name">
                  <input className={inputCls} value={global.siteName} onChange={e => setGlobal(p => p && ({ ...p, siteName: e.target.value }))} />
                </Field>
                <Field label="Moderation Mode">
                  <select
                    className={`${inputCls} appearance-none`}
                    value={global.moderationMode}
                    onChange={e => setGlobal(p => p && ({ ...p, moderationMode: e.target.value }))}
                  >
                    <option value="OPEN">OPEN  Posts publish instantly</option>
                    <option value="STRICT">STRICT  All posts require approval</option>
                    <option value="LOCKED">LOCKED  No new posts allowed</option>
                  </select>
                </Field>
              </div>
              <Field label="Welcome Message">
                <textarea
                  className={`${inputCls} resize-y min-h-[100px]`}
                  value={global.welcomeMessage}
                  onChange={e => setGlobal(p => p && ({ ...p, welcomeMessage: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Max Topics / Day">
                  <input type="number" className={inputCls} value={global.maxTopicsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxTopicsPerDay: Number(e.target.value) }))} />
                </Field>
                <Field label="Max Posts / Day">
                  <input type="number" className={inputCls} value={global.maxPostsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxPostsPerDay: Number(e.target.value) }))} />
                </Field>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'allowGuestRead', label: 'Allow guests to read topics without connecting wallet' },
                  { key: 'requireApproval', label: 'Require admin approval before new topics are published' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded accent-slate-900"
                      checked={!!(global as any)[key]}
                      onChange={e => setGlobal(p => p && ({ ...p, [key]: e.target.checked }))}
                    />
                    <span className="text-base text-slate-900">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveGlobal}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save Forum Config
                </button>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
