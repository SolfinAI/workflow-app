import { useState, useEffect, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
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

    // Debounce realtime bursts (creating a project fires ~10 row events at once)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const debouncedLoad = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(load, 300)
    }

    // Each hook instance gets its own uniquely-named channel — sharing one
    // channel topic across components throws "cannot add postgres_changes
    // callbacks after subscribe()".
    let channel: RealtimeChannel | null = null
    if (supabase) {
      channel = supabase
        .channel(`workflow_sync_${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, debouncedLoad)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stages' }, debouncedLoad)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, debouncedLoad)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, debouncedLoad)
        .subscribe()
    }

    // Refetch when the app regains focus (critical for iOS home-screen apps)
    const onFocus = () => load()
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    // Polling fallback in case the realtime socket drops
    const poll = window.setInterval(load, 30000)

    return () => {
      unsub()
      if (debounceTimer) clearTimeout(debounceTimer)
      if (supabase && channel) supabase.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(poll)
    }
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
