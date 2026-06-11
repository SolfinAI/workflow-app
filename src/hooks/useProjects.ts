import { useState, useEffect, useCallback } from 'react'
import type { Project, WorkflowCategory } from '../types'
import * as storage from '../lib/storage'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await storage.getProjects()
    setProjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const unsub = storage.onSyncMessage((msg) => {
      if (['project_created','project_updated','project_deleted',
           'stage_added','stage_updated','stage_deleted',
           'task_added','task_updated','task_moved','task_deleted'].includes(msg.type)) {
        load()
      }
    })
    return unsub
  }, [load])

  const createProject = async (category: WorkflowCategory, title: string, description?: string) => {
    const project = await storage.createProject(category, title, description)
    setProjects(prev => [project, ...prev])
    return project
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await storage.updateProject(id, updates)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProject = async (id: string) => {
    await storage.deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return { projects, loading, reload: load, createProject, updateProject, deleteProject }
}

export function useProject(id: string | undefined) {
  const { projects, loading, reload, updateProject, deleteProject } = useProjects()
  const project = projects.find(p => p.id === id)
  return { project, loading, reload, updateProject, deleteProject }
}
