import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import React from 'react'
import {
  ChevronLeft, Plus, Users, LayoutGrid, List,
  Edit2, Save, X, Trash2
} from 'lucide-react'
import type { Task, Stage } from '../types'
import { useProjects } from '../hooks/useProjects'
import { WORKFLOW_TEMPLATES, STAGE_COLORS } from '../lib/templates'
import StageColumn from '../components/StageColumn'
import TaskModal from '../components/TaskModal'
import ContactsPanel from '../components/ContactsPanel'
import * as storage from '../lib/storage'
import { isPast, parseISO } from 'date-fns'

type View = 'board' | 'list' | 'contacts'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { projects, loading, reload, updateProject, deleteProject } = useProjects()
  const navigate = useNavigate()
  const project = projects.find(p => p.id === id)

  const [view, setView] = useState<View>('board')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [newTaskStage, setNewTaskStage] = useState<Stage | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAddStage, setShowAddStage] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [newStageColor, setNewStageColor] = useState(STAGE_COLORS[0])
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const handleTaskClick = useCallback((task: Task, stage: Stage) => {
    setEditingTask(task)
    setEditingStage(stage)
    setNewTaskStage(null)
    setShowTaskModal(true)
  }, [])

  const handleNewTask = useCallback((stage: Stage) => {
    setEditingTask(null)
    setEditingStage(stage)
    setNewTaskStage(stage)
    setShowTaskModal(true)
  }, [])

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStageName.trim() || !project) return
    await storage.addStage(project.id, newStageName.trim(), newStageColor, undefined, project.stages.length)
    setNewStageName('')
    setShowAddStage(false)
    reload()
  }

  const handleDelete = async () => {
    if (!project) return
    if (!confirm(`Delete "${project.title}" and all its data?`)) return
    await deleteProject(project.id)
    navigate('/projects')
  }

  const handleTitleSave = async () => {
    if (!project || !titleDraft.trim()) return
    await updateProject(project.id, { title: titleDraft.trim() })
    setEditingTitle(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white">Loading project…</div>
  if (!project) return (
    <div className="text-center py-16">
      <p className="text-slate-400 mb-4">Project not found (ID: {id})</p>
      <Link to="/projects" className="text-brand-400 hover:underline">← Back to Projects</Link>
    </div>
  )

  if (!project.stages || project.stages.length === 0) return (
    <div className="text-center py-16">
      <p className="text-slate-400 mb-4">No stages found for this project</p>
      <p className="text-xs text-slate-500 mb-4">Project: {project.title}</p>
      <Link to="/projects" className="text-brand-400 hover:underline">← Back to Projects</Link>
    </div>
  )

  const tpl = WORKFLOW_TEMPLATES.find(t => t.category === project.workflow_category)
  const allTasks = project.stages.flatMap(s => s.tasks)
  const done = allTasks.filter(t => t.status === 'done').length
  const inProgress = allTasks.filter(t => t.status === 'in_progress').length
  const overdue = allTasks.filter(t => t.due_date && t.status !== 'done' && isPast(parseISO(t.due_date))).length
  const pct = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0

  return (
    <div className="flex flex-col h-full">
      {/* Project header */}
      <div className="bg-surface-2 border border-white/5 rounded-2xl p-5 mb-5">
        <div className="flex items-start gap-3 mb-4">
          <Link to="/projects" className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{tpl?.icon}</span>
              {editingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTitleSave()}
                    className="flex-1 bg-surface-3 border border-brand-500/60 rounded-xl px-3 py-1.5 text-white font-bold text-lg focus:outline-none"
                  />
                  <button onClick={handleTitleSave} className="p-1.5 text-brand-400 hover:text-brand-300"><Save size={16} /></button>
                  <button onClick={() => setEditingTitle(false)} className="p-1.5 text-slate-500 hover:text-white"><X size={16} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white leading-tight">{project.title}</h1>
                  <button onClick={() => { setTitleDraft(project.title); setEditingTitle(true) }}
                    className="p-1.5 text-slate-500 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 ml-7">{tpl?.label}</p>
          </div>
          <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total', value: allTasks.length, color: 'text-white' },
            { label: 'In Progress', value: inProgress, color: 'text-brand-400' },
            { label: 'Done', value: done, color: 'text-emerald-400' },
            { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-400' : 'text-slate-500' },
          ].map(s => (
            <div key={s.label} className="text-center bg-surface-3 rounded-xl py-2.5 px-2">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Overall Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-surface-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: tpl?.color }}
            />
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 mt-4 bg-surface-3 rounded-xl p-1 w-fit">
          {([['board', LayoutGrid, 'Board'], ['list', List, 'List'], ['contacts', Users, 'Contacts']] as [string, React.ElementType, string][]).map(([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                view === v ? 'bg-surface-1 text-white shadow' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Board view */}
      {view === 'board' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {project.stages.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                projectId={project.id}
                allStages={project.stages}
                onTaskClick={handleTaskClick}
                onNewTask={handleNewTask}
                onUpdated={reload}
                compact
              />
            ))}

            {/* Add stage */}
            {showAddStage ? (
              <form onSubmit={handleAddStage} className="min-w-[280px] bg-surface-2 rounded-2xl border border-brand-500/30 p-4 space-y-3 self-start">
                <input
                  autoFocus
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  placeholder="Stage name..."
                  className="w-full bg-surface-3 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/60"
                />
                <div className="flex flex-wrap gap-1.5">
                  {STAGE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewStageColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${newStageColor === c ? 'scale-125 ring-2 ring-white/50' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddStage(false)}
                    className="flex-1 py-2 border border-white/10 rounded-xl text-slate-400 text-xs hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={!newStageName.trim()}
                    className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-white text-xs font-semibold disabled:opacity-40 transition-colors">
                    Add Stage
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddStage(true)}
                className="min-w-[200px] h-fit flex items-center justify-center gap-2 p-4 bg-surface-2 border border-dashed border-white/10 hover:border-white/20 rounded-2xl text-slate-500 hover:text-white text-sm transition-all self-start"
              >
                <Plus size={16} /> Add Stage
              </button>
            )}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-4">
          {project.stages.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              projectId={project.id}
              allStages={project.stages}
              onTaskClick={handleTaskClick}
              onNewTask={handleNewTask}
              onUpdated={reload}
              compact={false}
            />
          ))}
          <button
            onClick={() => setShowAddStage(true)}
            className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/10 hover:border-white/20 rounded-2xl text-slate-500 hover:text-white text-sm transition-all"
          >
            <Plus size={16} /> Add Stage
          </button>
        </div>
      )}

      {/* Contacts view */}
      {view === 'contacts' && (
        <div className="bg-surface-2 border border-white/5 rounded-2xl p-5">
          <ContactsPanel project={project} onUpdated={reload} />
        </div>
      )}

      {/* Task modal */}
      {showTaskModal && editingStage && (
        <TaskModal
          task={editingTask}
          stage={editingStage}
          projectId={project.id}
          stages={project.stages}
          onClose={() => setShowTaskModal(false)}
          onUpdated={reload}
        />
      )}
    </div>
  )
}
