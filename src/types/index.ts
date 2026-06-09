export type WorkflowCategory =
  | 'business_funding'
  | 'gov_contracting'
  | 'custom'

export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived'

export interface Contact {
  id: string
  name: string
  company?: string
  role?: string
  email?: string
  phone?: string
  type: 'supplier' | 'subcontractor' | 'lender' | 'agency' | 'other'
  notes?: string
  project_id: string
  created_at: string
}

export interface Task {
  id: string
  stage_id: string
  project_id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  due_date?: string
  assigned_to?: string
  contact_id?: string
  amount?: number
  notes?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  project_id: string
  title: string
  description?: string
  color: string
  sort_order: number
  tasks: Task[]
  created_at: string
}

export interface Project {
  id: string
  workflow_category: WorkflowCategory
  title: string
  description?: string
  status: ProjectStatus
  due_date?: string
  value?: number
  agency?: string
  solicitation_number?: string
  naics_code?: string
  set_aside?: string
  bond_required?: boolean
  bond_amount?: number
  stages: Stage[]
  contacts: Contact[]
  created_at: string
  updated_at: string
}

export interface WorkflowTemplate {
  category: WorkflowCategory
  label: string
  description: string
  icon: string
  color: string
  defaultStages: { title: string; description: string; color: string }[]
}
