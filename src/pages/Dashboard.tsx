import { Link } from 'react-router-dom'
import { Plus, TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowRight, ListTodo, Send, Trophy } from 'lucide-react'
import type { Project } from '../types'
import { WORKFLOW_TEMPLATES, PROJECT_STATUS_CONFIG } from '../lib/templates'
import { parseISO, isPast } from 'date-fns'

interface Props {
  projects: Project[]
  onNewProject: () => void
}

function ProjectCard({ project }: { project: Project }) {
  const tpl = WORKFLOW_TEMPLATES.find(t => t.category === project.workflow_category)
  const allTasks = project.stages.flatMap(s => s.tasks)
  const done = allTasks.filter(t => t.status === 'done').length
  const total = allTasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const overdue = allTasks.filter(t => t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date))).length
  const currentStage = project.stages.find(s => s.tasks.some(t => t.status === 'in_progress'))
    ?? project.stages.find(s => s.tasks.some(t => t.status === 'todo'))

  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <div className="bg-surface-2 hover:bg-surface-3 border border-white/5 hover:border-brand-500/20 rounded-2xl p-5 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{tpl?.icon}</span>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight">{project.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{tpl?.label}</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-600 group-hover:text-brand-400 transition-colors mt-0.5" />
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{done} of {total} tasks</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-surface-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: tpl?.color }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          {currentStage && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={11} />
              {currentStage.title}
            </span>
          )}
          {overdue > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <AlertTriangle size={11} />
              {overdue} overdue
            </span>
          )}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${PROJECT_STATUS_CONFIG[project.status]?.classes ?? 'bg-slate-700/50 text-slate-500'}`}>
            {PROJECT_STATUS_CONFIG[project.status]?.label ?? project.status}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard({ projects, onNewProject }: Props) {
  const activeProjects = projects.filter(p => p.status === 'active')
  const allTasks = projects.flatMap(p => p.stages.flatMap(s => s.tasks))
  const overdueCount = allTasks.filter(t => t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date))).length
  const doneCount = allTasks.filter(t => t.status === 'done').length
  const bidCount = projects.filter(p => ['bid_submitted', 'won', 'lost'].includes(p.status)).length
  const wonCount = projects.filter(p => p.status === 'won').length

  const byCategory = WORKFLOW_TEMPLATES.map(tpl => ({
    ...tpl,
    count: projects.filter(p => p.workflow_category === tpl.category).length,
  }))

  return (
    <div className="space-y-8">
      {/* Stats — each card links to its filtered view */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: 'Active Projects', value: activeProjects.length, icon: TrendingUp, color: 'text-brand-400', to: '/projects?status=active' },
          { label: 'Total Tasks', value: allTasks.length, icon: ListTodo, color: 'text-emerald-400', to: '/tasks' },
          { label: 'Overdue', value: overdueCount, icon: AlertTriangle, color: overdueCount > 0 ? 'text-red-400' : 'text-slate-500', to: '/tasks?filter=overdue' },
          { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'text-blue-400', to: '/tasks?filter=done' },
          { label: 'Projects Bid', value: bidCount, icon: Send, color: 'text-sky-400', to: '/projects?status=bid' },
          { label: 'Bids Won', value: wonCount, icon: Trophy, color: 'text-yellow-300', to: '/projects?status=won' },
        ].map(stat => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-surface-2 hover:bg-surface-3 border border-white/5 hover:border-brand-500/30 rounded-2xl p-4 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={18} className={stat.color} />
              <ArrowRight size={13} className="text-slate-700 group-hover:text-brand-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Workflow categories */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Workflow Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {byCategory.map(tpl => (
            <Link
              key={tpl.category}
              to={`/projects?category=${tpl.category}`}
              className="bg-surface-2 hover:bg-surface-3 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tpl.icon}</span>
                <span className="text-xs text-slate-500">{tpl.count} projects</span>
              </div>
              <p className="font-semibold text-sm text-white">{tpl.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tpl.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Projects</h2>
          <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all</Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-surface-2 border border-dashed border-white/10 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-3">🚀</p>
            <p className="text-white font-semibold mb-1">No projects yet</p>
            <p className="text-slate-400 text-sm mb-5">Create your first workflow project to get started</p>
            <button
              onClick={onNewProject}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold text-sm transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
