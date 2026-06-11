import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar, Check, ChevronRight } from 'lucide-react'
import type { Project, Stage, Task } from '../types'
import { WORKFLOW_TEMPLATES, PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/templates'
import { format, isPast, parseISO } from 'date-fns'
import * as storage from '../lib/storage'

interface Props {
  projects: Project[]
  reload: () => void
}

interface FlatTask {
  task: Task
  stage: Stage
  project: Project
}

const FILTERS = [
  { key: null,          label: 'All' },
  { key: 'todo',        label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'overdue',     label: 'Overdue' },
  { key: 'done',        label: 'Completed' },
] as const

function isOverdue(t: Task) {
  return !!t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date))
}

export default function Tasks({ projects, reload }: Props) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter')

  const all: FlatTask[] = projects.flatMap(p =>
    p.stages.flatMap(s => s.tasks.map(task => ({ task, stage: s, project: p })))
  )

  const counts: Record<string, number> = {
    all: all.length,
    todo: all.filter(f => f.task.status === 'todo').length,
    in_progress: all.filter(f => f.task.status === 'in_progress').length,
    overdue: all.filter(f => isOverdue(f.task)).length,
    done: all.filter(f => f.task.status === 'done').length,
  }

  const filtered = all.filter(f => {
    if (!filter) return true
    if (filter === 'overdue') return isOverdue(f.task)
    return f.task.status === filter
  }).sort((a, b) => {
    // Overdue first, then nearest due date, then newest
    const ao = isOverdue(a.task) ? 0 : 1
    const bo = isOverdue(b.task) ? 0 : 1
    if (ao !== bo) return ao - bo
    if (a.task.due_date && b.task.due_date) return a.task.due_date.localeCompare(b.task.due_date)
    if (a.task.due_date) return -1
    if (b.task.due_date) return 1
    return b.task.created_at.localeCompare(a.task.created_at)
  })

  const toggleDone = async (e: React.MouseEvent, f: FlatTask) => {
    e.stopPropagation()
    const newStatus = f.task.status === 'done' ? 'todo' : 'done'
    await storage.updateTask(f.project.id, f.stage.id, f.task.id, { status: newStatus })
    reload()
  }

  return (
    <div className="space-y-5">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const active = filter === f.key || (!filter && f.key === null)
          const count = counts[f.key ?? 'all']
          return (
            <button
              key={f.label}
              onClick={() => setSearchParams(f.key ? { filter: f.key } : {})}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                active
                  ? 'bg-brand-500/20 border-brand-500/30 text-brand-400'
                  : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              {f.label} <span className="opacity-60 ml-1">{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">{filter === 'overdue' ? '🎉' : '📋'}</p>
          <p className="text-slate-400 text-sm">
            {filter === 'overdue' ? 'Nothing overdue — great work!' : 'No tasks here yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => {
            const tpl = WORKFLOW_TEMPLATES.find(t => t.category === f.project.workflow_category)
            const overdue = isOverdue(f.task)
            const p = PRIORITY_CONFIG[f.task.priority]
            const done = f.task.status === 'done'
            return (
              <div
                key={f.task.id}
                onClick={() => navigate(`/projects/${f.project.id}`)}
                className="group bg-surface-2 hover:bg-surface-3 border border-white/5 hover:border-brand-500/20
                  rounded-2xl p-4 transition-all flex items-center gap-3 cursor-pointer"
              >
                {/* Quick-complete toggle */}
                <button
                  onClick={e => toggleDone(e, f)}
                  title={done ? 'Mark as to do' : 'Mark as done'}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    done
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-white/20 hover:border-emerald-400'
                  }`}
                >
                  {done && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-slate-500' : 'text-white'}`}>
                    {f.task.title}
                  </p>
                  <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">{tpl?.icon} {f.project.title}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{f.stage.title}</span>
                    {f.task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                        <Calendar size={11} />
                        {format(parseISO(f.task.due_date), 'MMM d')}
                        {overdue && ' — overdue'}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ color: p.color, backgroundColor: `${p.color}20` }}>
                  {p.label}
                </span>
                <ChevronRight size={15} className="text-slate-600 group-hover:text-brand-400 transition-colors shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
