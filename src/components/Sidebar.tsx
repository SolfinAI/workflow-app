import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, ListTodo, Settings, Plus, X } from 'lucide-react'
import { WORKFLOW_TEMPLATES } from '../lib/templates'
import type { Project } from '../types'

interface Props {
  projects: Project[]
  open: boolean
  onClose: () => void
  onNewProject: () => void
}

export default function Sidebar({ projects, open, onClose, onNewProject }: Props) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 left-0 bottom-0 w-64 bg-surface-1 border-r border-white/5 z-40
          flex flex-col transition-transform duration-300 safe-bottom
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <NavLink to="/" end className={navClass} onClick={onClose}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navClass} onClick={onClose}>
            <FolderOpen size={18} />
            All Projects
          </NavLink>
          <NavLink to="/tasks" className={navClass} onClick={onClose}>
            <ListTodo size={18} />
            All Tasks
          </NavLink>

          {/* Workflow categories */}
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workflows</p>
            {WORKFLOW_TEMPLATES.map(t => (
              <NavLink
                key={t.category}
                to={`/projects?category=${t.category}`}
                className={navClass}
                onClick={onClose}
              >
                <span className="text-base">{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Recent projects */}
          {projects.length > 0 && (
            <div className="pt-4 pb-1">
              <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent</p>
              {projects.slice(0, 5).map(p => {
                const tpl = WORKFLOW_TEMPLATES.find(t => t.category === p.workflow_category)
                return (
                  <NavLink
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={navClass}
                    onClick={onClose}
                  >
                    <span className="text-base">{tpl?.icon ?? '📁'}</span>
                    <span className="truncate">{p.title}</span>
                  </NavLink>
                )
              })}
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => { onNewProject(); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              bg-brand-500 hover:bg-brand-600 text-white transition-colors"
          >
            <Plus size={18} />
            New Project
          </button>
          <NavLink to="/settings" className={navClass} onClick={onClose}>
            <Settings size={18} />
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  )
}
