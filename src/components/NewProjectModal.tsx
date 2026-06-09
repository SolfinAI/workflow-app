import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { WORKFLOW_TEMPLATES } from '../lib/templates'
import type { WorkflowCategory } from '../types'

interface Props {
  onClose: () => void
  onCreate: (category: WorkflowCategory, title: string, description?: string) => Promise<void>
}

export default function NewProjectModal({ onClose, onCreate }: Props) {
  const [step, setStep] = useState<'category' | 'details'>('category')
  const [category, setCategory] = useState<WorkflowCategory | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const selected = WORKFLOW_TEMPLATES.find(t => t.category === category)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !title.trim()) return
    setSaving(true)
    await onCreate(category, title.trim(), description.trim() || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-surface-2 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl animate-slide-up">
        {/* Handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {step === 'category' ? 'Choose Workflow Type' : 'Project Details'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'category' ? (
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {WORKFLOW_TEMPLATES.map(t => (
              <button
                key={t.category}
                onClick={() => { setCategory(t.category); setStep('details') }}
                className="w-full text-left p-4 rounded-xl bg-surface-3 hover:bg-surface-4 border border-white/5
                  hover:border-brand-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {selected && (
              <div className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl border border-white/5 mb-2">
                <span className="text-xl">{selected.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{selected.label}</p>
                  <button
                    type="button"
                    onClick={() => setStep('category')}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={category === 'gov_contracting' ? 'e.g., USAF IT Support Contract FY26' : 'e.g., ABC Corp Funding Round'}
                className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white
                  placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30"
              />
            </div>

            {category === 'gov_contracting' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Solicitation Number</label>
                <input
                  placeholder="e.g., FA8726-24-R-0001"
                  className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white
                    placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief overview of this project..."
                className="w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-3 text-white
                  placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('category')}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!title.trim() || saving}
                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40
                  text-white font-semibold text-sm transition-colors"
              >
                {saving ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
