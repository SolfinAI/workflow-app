import { useState } from 'react'
import { Plus, MoreHorizontal, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { Stage, Task } from '../types'
import TaskCard from './TaskCard'
import * as storage from '../lib/storage'

interface Props {
  stage: Stage
  projectId: string
  allStages: Stage[]
  onTaskClick: (task: Task, stage: Stage) => void
  onNewTask: (stage: Stage) => void
  onUpdated: () => void
  compact?: boolean
}

export default function StageColumn({ stage, projectId, allStages, onTaskClick, onNewTask, onUpdated, compact }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(stage.title)

  const done = stage.tasks.filter(t => t.status === 'done').length
  const total = stage.tasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== stage.title) {
      await storage.updateStage(projectId, stage.id, { title: editTitle.trim() })
      onUpdated()
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete stage "${stage.title}" and all its tasks?`)) return
    await storage.deleteStage(projectId, stage.id)
    onUpdated()
    setMenuOpen(false)
  }

  return (
    <div className={`bg-surface-2 rounded-2xl border border-white/5 flex flex-col ${compact ? 'min-w-[280px] max-w-[280px]' : 'w-full'}`}>
      {/* Stage header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-white transition-colors">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />

          {editing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="flex-1 bg-surface-3 border border-brand-500/60 rounded-lg px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
            />
          ) : (
            <h3 className="flex-1 text-sm font-semibold text-white truncate">{stage.title}</h3>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-slate-500 font-medium">{total}</span>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-7 bg-surface-4 border border-white/10 rounded-xl shadow-xl z-20 w-40 py-1">
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <Edit2 size={13} /> Rename
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{done}/{total} done</span>
              <span className="text-xs text-slate-500">{pct}%</span>
            </div>
            <div className="h-1 bg-surface-4 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: stage.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[60vh]">
          {stage.tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task, stage)} />
          ))}

          <button
            onClick={() => onNewTask(stage)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-500
              hover:text-white hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 transition-all"
          >
            <Plus size={14} />
            Add task
          </button>
        </div>
      )}
    </div>
  )
}
