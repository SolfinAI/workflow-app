import { v4 as uuidv4 } from 'uuid'
import type { Project, Stage, Task, Contact, WorkflowCategory } from '../types'
import { WORKFLOW_TEMPLATES } from './templates'
import { supabase, isSupabaseConfigured } from './supabase'

// ─── Local storage helpers ───────────────────────────────────────────────────

const LS_KEY = 'workflow_pro_data'

function loadLocal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocal(projects: Project[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(projects))
}

// ─── Broadcast channel for same-device tab sync ──────────────────────────────

const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('workflow_sync') : null

function broadcast(type: string, payload?: unknown) {
  bc?.postMessage({ type, payload })
}

export function onSyncMessage(handler: (msg: { type: string; payload?: unknown }) => void) {
  if (!bc) return () => {}
  bc.onmessage = (e) => handler(e.data)
  return () => { bc.onmessage = null }
}

// ─── Project CRUD ─────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select(`*, stages(*, tasks(*)), contacts(*)`)
      .order('created_at', { ascending: false })
    if (!error && data) return data as Project[]
  }
  return loadLocal()
}

export async function createProject(
  category: WorkflowCategory,
  title: string,
  description?: string
): Promise<Project> {
  const template = WORKFLOW_TEMPLATES.find(t => t.category === category)!
  const now = new Date().toISOString()
  const projectId = uuidv4()

  const stages: Stage[] = template.defaultStages.map((s, i) => ({
    id: uuidv4(),
    project_id: projectId,
    title: s.title,
    description: s.description,
    color: s.color,
    sort_order: i,
    tasks: [],
    created_at: now,
  }))

  const project: Project = {
    id: projectId,
    workflow_category: category,
    title,
    description,
    status: 'active',
    stages,
    contacts: [],
    created_at: now,
    updated_at: now,
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error: projectError } = await supabase.from('projects').insert({
        id: project.id, workflow_category: category, title, description,
        status: 'active', created_at: now, updated_at: now,
      })
      if (projectError) console.error('Project insert error:', projectError)

      for (const s of stages) {
        const { error: stageError } = await supabase.from('stages').insert({
          id: s.id, project_id: projectId, title: s.title,
          description: s.description, color: s.color, sort_order: s.sort_order, created_at: now,
        })
        if (stageError) console.error('Stage insert error:', stageError)
      }
    } catch (err) {
      console.error('Supabase error:', err)
    }
  } else {
    console.log('Supabase not configured, using local storage')
    const projects = loadLocal()
    projects.unshift(project)
    saveLocal(projects)
  }
  broadcast('project_created', project)
  return project
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const now = new Date().toISOString()
  if (isSupabaseConfigured && supabase) {
    await supabase.from('projects').update({ ...updates, updated_at: now }).eq('id', id)
  } else {
    const projects = loadLocal()
    const idx = projects.findIndex(p => p.id === id)
    if (idx !== -1) projects[idx] = { ...projects[idx], ...updates, updated_at: now }
    saveLocal(projects)
  }
  broadcast('project_updated', { id, updates })
}

export async function deleteProject(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('projects').delete().eq('id', id)
  } else {
    saveLocal(loadLocal().filter(p => p.id !== id))
  }
  broadcast('project_deleted', { id })
}

// ─── Stage CRUD ───────────────────────────────────────────────────────────────

export async function addStage(projectId: string, title: string, color: string, description?: string): Promise<Stage> {
  const now = new Date().toISOString()
  const projects = loadLocal()
  const project = projects.find(p => p.id === projectId)
  const sortOrder = project ? project.stages.length : 0

  const stage: Stage = {
    id: uuidv4(), project_id: projectId, title, description, color,
    sort_order: sortOrder, tasks: [], created_at: now,
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('stages').insert({
      id: stage.id, project_id: projectId, title, description, color,
      sort_order: sortOrder, created_at: now,
    })
  } else {
    if (project) { project.stages.push(stage); saveLocal(projects) }
  }
  broadcast('stage_added', stage)
  return stage
}

export async function updateStage(projectId: string, stageId: string, updates: Partial<Stage>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('stages').update(updates).eq('id', stageId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (project) {
      const idx = project.stages.findIndex(s => s.id === stageId)
      if (idx !== -1) project.stages[idx] = { ...project.stages[idx], ...updates }
      saveLocal(projects)
    }
  }
  broadcast('stage_updated', { projectId, stageId, updates })
}

export async function deleteStage(projectId: string, stageId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('stages').delete().eq('id', stageId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (project) {
      project.stages = project.stages.filter(s => s.id !== stageId)
      saveLocal(projects)
    }
  }
  broadcast('stage_deleted', { projectId, stageId })
}

// ─── Task CRUD ────────────────────────────────────────────────────────────────

export async function addTask(
  projectId: string,
  stageId: string,
  title: string,
  extras: Partial<Task> = {}
): Promise<Task> {
  const now = new Date().toISOString()
  const task: Task = {
    id: uuidv4(), stage_id: stageId, project_id: projectId,
    title, status: 'todo', priority: 'medium', sort_order: 0,
    created_at: now, updated_at: now, ...extras,
  }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('tasks').insert(task)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    const stage = project?.stages.find(s => s.id === stageId)
    if (stage) { stage.tasks.push(task); saveLocal(projects) }
  }
  broadcast('task_added', task)
  return task
}

export async function updateTask(projectId: string, stageId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  const now = new Date().toISOString()
  if (isSupabaseConfigured && supabase) {
    await supabase.from('tasks').update({ ...updates, updated_at: now }).eq('id', taskId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    const stage = project?.stages.find(s => s.id === stageId)
    if (stage) {
      const idx = stage.tasks.findIndex(t => t.id === taskId)
      if (idx !== -1) stage.tasks[idx] = { ...stage.tasks[idx], ...updates, updated_at: now }
      saveLocal(projects)
    }
  }
  broadcast('task_updated', { projectId, stageId, taskId, updates })
}

export async function moveTask(projectId: string, taskId: string, fromStageId: string, toStageId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('tasks').update({ stage_id: toStageId }).eq('id', taskId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    const fromStage = project.stages.find(s => s.id === fromStageId)
    const toStage = project.stages.find(s => s.id === toStageId)
    if (!fromStage || !toStage) return
    const taskIdx = fromStage.tasks.findIndex(t => t.id === taskId)
    if (taskIdx === -1) return
    const [task] = fromStage.tasks.splice(taskIdx, 1)
    task.stage_id = toStageId
    toStage.tasks.push(task)
    saveLocal(projects)
  }
  broadcast('task_moved', { projectId, taskId, fromStageId, toStageId })
}

export async function deleteTask(projectId: string, stageId: string, taskId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('tasks').delete().eq('id', taskId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    const stage = project?.stages.find(s => s.id === stageId)
    if (stage) { stage.tasks = stage.tasks.filter(t => t.id !== taskId); saveLocal(projects) }
  }
  broadcast('task_deleted', { projectId, stageId, taskId })
}

// ─── Contact CRUD ─────────────────────────────────────────────────────────────

export async function addContact(projectId: string, contact: Omit<Contact, 'id' | 'project_id' | 'created_at'>): Promise<Contact> {
  const now = new Date().toISOString()
  const newContact: Contact = { id: uuidv4(), project_id: projectId, created_at: now, ...contact }

  if (isSupabaseConfigured && supabase) {
    await supabase.from('contacts').insert(newContact)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (project) { project.contacts.push(newContact); saveLocal(projects) }
  }
  return newContact
}

export async function updateContact(projectId: string, contactId: string, updates: Partial<Contact>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('contacts').update(updates).eq('id', contactId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (project) {
      const idx = project.contacts.findIndex(c => c.id === contactId)
      if (idx !== -1) project.contacts[idx] = { ...project.contacts[idx], ...updates }
      saveLocal(projects)
    }
  }
}

export async function deleteContact(projectId: string, contactId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('contacts').delete().eq('id', contactId)
  } else {
    const projects = loadLocal()
    const project = projects.find(p => p.id === projectId)
    if (project) { project.contacts = project.contacts.filter(c => c.id !== contactId); saveLocal(projects) }
  }
}
