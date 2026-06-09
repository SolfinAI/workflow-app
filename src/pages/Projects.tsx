import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter, ArrowRight, Trash2 } from 'lucide-react'
import type { Project, WorkflowCategory } from '../types'
import { WORKFLOW_TEMPLATES } from '../lib/templates'
import { isPast, parseISO } from 'date-fns'

interface Props {
  projects: Project[]
  onNewProject: () => void
  onDeleteProject: (id: string) => void
}

export default function Projects({ projects, onNewProject, onDeleteProject }: Props) {
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const filterCat = searchParams.get('category') as WorkflowCategory | null

  const filtered = projects.filter(p => {
    const matchCat = !filterCat || p.workflow_category === filterCat
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-surface-2 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 text-sm"
          />
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold text-sm transition-colors shrink-0"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSearchParams({})}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            !filterCat ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
          }`}
        >
          All
        </button>
        {WORKFLOW_TEMPLATES.map(t => (
          <button
            key={t.category}
            onClick={() => setSearchParams({ category: t.category })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
              filterCat === t.category ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No projects found</p>
          <button onClick={onNewProject} className="mt-3 text-brand-400 text-sm hover:text-brand-300">
            + Create one
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const tpl = WORKFLOW_TEMPLATES.find(t => t.category === p.workflow_category)
            const allTasks = p.stages.flatMap(s => s.tasks)
            const done = allTasks.filter(t => t.status === 'done').length
            const total = allTasks.length
            const pct = total > 0 ? Math.round((done / total) * 100) : 0
            const overdue = allTasks.filter(t => t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date))).length

            return (
              <div key={p.id} className="group bg-surface-2 border border-white/5 hover:border-brand-500/20 rounded-2xl p-4 transition-all flex items-center gap-4">
                <Link to={`/projects/${p.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                  <span className="text-2xl shrink-0">{tpl?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-white truncate">{p.title}</h3>
                      {overdue > 0 && (
                        <span className="text-xs text-red-400 shrink-0">⚠ {overdue} overdue</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{tpl?.label} · {total} tasks</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 max-w-[140px] h-1.5 bg-surface-4 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: tpl?.color }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors shrink-0" />
                </Link>
                <button
                  onClick={() => { if (confirm('Delete this project?')) onDeleteProject(p.id) }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
