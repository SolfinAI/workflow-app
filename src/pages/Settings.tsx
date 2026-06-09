import { useState } from 'react'
import { Save, Database, Smartphone, Globe, CheckCircle2, ExternalLink } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Settings() {
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Values are set via .env file — show instructions
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass = "w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 font-mono text-sm"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Configure your WorkFlow Pro app</p>
      </div>

      {/* Sync status */}
      <div className={`rounded-2xl border p-5 ${isSupabaseConfigured ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Database size={20} className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'} />
          <h2 className="font-semibold text-white">{isSupabaseConfigured ? 'Cloud Sync Active' : 'Local Storage Only'}</h2>
        </div>
        <p className="text-sm text-slate-400">
          {isSupabaseConfigured
            ? 'Your data syncs in real-time across all devices via Supabase.'
            : 'Data is stored locally on this device. Connect Supabase to sync across iPhone, iPad, and all your devices.'}
        </p>
      </div>

      {/* Supabase setup */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">Supabase Configuration</h2>
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
            className="ml-auto text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            supabase.com <ExternalLink size={12} />
          </a>
        </div>

        <div className="bg-surface-3 rounded-xl p-4 border border-white/5 space-y-3 text-sm text-slate-400">
          <p className="font-medium text-white text-sm">Setup steps:</p>
          <ol className="space-y-1.5 list-decimal list-inside text-xs">
            <li>Create a free account at <span className="text-brand-400">supabase.com</span></li>
            <li>Create a new project</li>
            <li>Go to Project Settings → API</li>
            <li>Copy your Project URL and anon key</li>
            <li>Create a <code className="text-brand-400">.env</code> file in your project folder with:
              <pre className="bg-surface-4 rounded-lg p-2.5 mt-1.5 text-xs text-emerald-400 overflow-x-auto">{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}</pre>
            </li>
            <li>Run the SQL schema (see below) in your Supabase SQL editor</li>
            <li>Restart the dev server</li>
          </ol>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Database Schema (run in Supabase SQL editor)</p>
          <pre className="bg-surface-3 border border-white/5 rounded-xl p-4 text-xs text-slate-300 overflow-x-auto">
{`create table projects (
  id uuid primary key,
  workflow_category text not null,
  title text not null,
  description text,
  status text default 'active',
  due_date date,
  value numeric,
  agency text,
  solicitation_number text,
  naics_code text,
  set_aside text,
  bond_required boolean,
  bond_amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table stages (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  color text default '#6366f1',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key,
  stage_id uuid references stages(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date date,
  amount numeric,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table contacts (
  id uuid primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  type text default 'other',
  notes text,
  created_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table stages;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table contacts;`}
          </pre>
        </div>
      </div>

      {/* PWA install instructions */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={18} className="text-brand-400" />
          <h2 className="font-semibold text-white">Install on iPhone / iPad</h2>
        </div>
        <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
          <li>Host this app (deploy to Vercel, Netlify, or any host)</li>
          <li>Open the URL in <span className="text-white">Safari</span> on your iPhone or iPad</li>
          <li>Tap the <span className="text-white">Share</span> button (box with arrow)</li>
          <li>Tap <span className="text-white">"Add to Home Screen"</span></li>
          <li>The app installs like a native app with offline support</li>
        </ol>
        <div className="mt-4 bg-surface-3 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-slate-400">
            <span className="text-white font-medium">Recommended hosting:</span> Deploy to{' '}
            <a href="https://vercel.com" target="_blank" rel="noopener" className="text-brand-400 hover:underline">Vercel</a>
            {' '}(free) — push your project to GitHub, connect to Vercel, and you'll get a shareable HTTPS URL in minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
