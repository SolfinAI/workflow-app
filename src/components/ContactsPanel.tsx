import { useState } from 'react'
import { Plus, X, Phone, Mail, Building2, User, Trash2 } from 'lucide-react'
import type { Project, Contact } from '../types'
import * as storage from '../lib/storage'

interface Props {
  project: Project
  onUpdated: () => void
}

const CONTACT_TYPES = ['supplier', 'subcontractor', 'lender', 'agency', 'other'] as const

export default function ContactsPanel({ project, onUpdated }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', role: '', email: '', phone: '',
    type: 'supplier' as Contact['type'], notes: '',
  })
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    await storage.addContact(project.id, { ...form, name: form.name.trim() })
    setForm({ name: '', company: '', role: '', email: '', phone: '', type: 'supplier', notes: '' })
    setShowForm(false)
    onUpdated()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this contact?')) return
    await storage.deleteContact(project.id, id)
    onUpdated()
  }

  const inputClass = "w-full bg-surface-3 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 text-sm"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Contacts & Vendors</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          <Plus size={14} />
          Add Contact
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-surface-3 rounded-xl p-4 border border-white/10 space-y-3 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Name *" className={inputClass} />
            <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Company" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="Role / Title" className={inputClass} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Contact['type'] }))}
              className={inputClass}>
              {CONTACT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email" type="email" className={inputClass} />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone" type="tel" className={inputClass} />
          </div>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes..." rows={2} className={`${inputClass} resize-none`} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!form.name.trim() || saving}
              className="flex-1 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold text-sm transition-colors">
              Add
            </button>
          </div>
        </form>
      )}

      {project.contacts.length === 0 && !showForm && (
        <p className="text-sm text-slate-500 text-center py-4">No contacts yet</p>
      )}

      <div className="space-y-2">
        {project.contacts.map(c => (
          <div key={c.id} className="bg-surface-3 rounded-xl p-3.5 border border-white/5 group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-white">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    c.type === 'supplier'       ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' :
                    c.type === 'subcontractor'  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' :
                    c.type === 'lender'         ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    c.type === 'agency'         ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                                                  'bg-slate-700/50 border-white/10 text-slate-400'
                  }`}>
                    {c.type}
                  </span>
                </div>
                {c.company && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Building2 size={10} />{c.company}</p>}
                {c.role && <p className="text-xs text-slate-500">{c.role}</p>}
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                      <Mail size={11} />{c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                      <Phone size={11} />{c.phone}
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {c.notes && <p className="text-xs text-slate-500 mt-2 border-t border-white/5 pt-2">{c.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
