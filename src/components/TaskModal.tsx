import { useState } from 'react'
import { X, Calendar, DollarSign, AlertCircle, User, FileText, Trash2 } from 'lucide-react'
import type { Task, Stage, Priority, TaskStatus } from '../types'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/templates'
import * as storage from '../lib/storage'

interface Props {
  task: Task | null
  stage: Stage
  projectId: string
  stages: Stage[]
  onClose: () => void
  onUpdated: () => void
}

export default function TaskModal({ task, stage, projectId, stages, onClose, onUpdated }: Props) {
  const isNew = !task
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0,10) ?? '')
  const [amount, setAmount] = useState(task?.amount?.toString() ?? '')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [moveStage, setMoveStage] = useState(stage.id)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const updates = {
      title: title.trim(),
      description: description.trim() || undefined,
      status, priority,
      due_date: dueDate || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      notes: notes.trim() || undefined,
    }
    if (isNew) {
      await storage.addTask(projectId, stage.id, title.trim(), updates)
    } else {
      await storage.updateTask(projectId, stage.id, task!.id, updates)
      if (moveStage !== stage.id) {
        await storage.moveTask(projectId, task!.id, stage.id, moveStage)
      }
    }
    onUpdated()
    onClose()
  }

  const handleDelete = async () => {
    if (!task) return
    if (!confirm('Delete this task?')) return
    await storage.deleteTask(projectId, stage.id, task.id)
    onUpdated()
    onClose()
  }

  const inputClass = "w-full bg-surface-3 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 text-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-surface-2 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">{isNew ? 'New Task' : 'Edit Task'}</h2>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title..."
                className={`${inputClass} text-base font-medium`}
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className={inputClass}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className={inputClass}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Move to stage */}
            {!isNew && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Stage</label>
                <select
                  value={moveStage}
                  onChange={e => setMoveStage(e.target.value)}
                  className={inputClass}
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Due date + Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <Calendar size={12} /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                  <DollarSign size={12} /> Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Add details..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> Notes
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Internal notes..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <div className="px-6 pb-6 pt-0 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
            >
              {saving ? 'Saving…' : isNew ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
