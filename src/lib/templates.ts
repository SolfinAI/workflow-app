import type { WorkflowTemplate } from '../types'

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    category: 'business_funding',
    label: 'Business Funding & Credit',
    description: 'Full roadmap to establish business credit and secure funding',
    icon: '🏦',
    color: '#10b981',
    defaultStages: [
      {
        title: 'Entity Setup & Compliance',
        description: 'Form legal entity, register with state, get necessary licenses',
        color: '#6366f1',
      },
      {
        title: 'EIN & Business Banking',
        description: 'Obtain EIN from IRS, open dedicated business bank account',
        color: '#8b5cf6',
      },
      {
        title: 'Business Identity',
        description: 'D-U-N-S number, DUNS, listings on 411, Google Business, etc.',
        color: '#a855f7',
      },
      {
        title: 'Starter Credit Accounts',
        description: 'Net-30 vendor accounts, store credit — building initial credit profile',
        color: '#ec4899',
      },
      {
        title: 'Business Credit Building',
        description: 'Revolving credit, business credit cards, grow Paydex score',
        color: '#f43f5e',
      },
      {
        title: 'Financial Documentation',
        description: 'P&L, balance sheet, tax returns, bank statements, projections',
        color: '#f97316',
      },
      {
        title: 'Funding Application',
        description: 'SBA loans, lines of credit, business loans, investors',
        color: '#eab308',
      },
      {
        title: 'Credit Monitoring & Growth',
        description: 'Monitor scores, dispute errors, grow credit limits',
        color: '#10b981',
      },
    ],
  },
  {
    category: 'gov_contracting',
    label: 'Government Contracting',
    description: 'End-to-end bid process from opportunity discovery to award',
    icon: '🏛️',
    color: '#3b82f6',
    defaultStages: [
      {
        title: 'Contract Discovery',
        description: 'SAM.gov, USASpending, GovWin — find matching opportunities',
        color: '#6366f1',
      },
      {
        title: 'Eligibility & Go/No-Go',
        description: 'NAICS check, set-aside eligibility, capacity assessment',
        color: '#3b82f6',
      },
      {
        title: 'RFP Analysis',
        description: 'Review solicitation, PWS/SOW, evaluation criteria, amendments',
        color: '#0ea5e9',
      },
      {
        title: 'Supplier Outreach & Pricing',
        description: 'Contact suppliers, request quotes, compare pricing',
        color: '#06b6d4',
      },
      {
        title: 'Subcontractor Bids',
        description: 'Identify subs, request bids, negotiate, execute teaming agreements',
        color: '#14b8a6',
      },
      {
        title: 'Performance Bond',
        description: 'Determine if required, contact surety, obtain bond',
        color: '#10b981',
      },
      {
        title: 'Proposal Writing',
        description: 'Technical volume, management approach, past performance, price',
        color: '#84cc16',
      },
      {
        title: 'Proposal Review',
        description: 'Internal review, compliance check, red team, final edits',
        color: '#eab308',
      },
      {
        title: 'Bid Submission',
        description: 'Submit via SAM/email/portal, confirm receipt, log submission',
        color: '#f97316',
      },
      {
        title: 'Post-Submission',
        description: 'Award tracking, debriefs, protest window, contract negotiation',
        color: '#ef4444',
      },
    ],
  },
  {
    category: 'custom',
    label: 'Custom Workflow',
    description: 'Build your own workflow from scratch with custom stages',
    icon: '⚙️',
    color: '#6366f1',
    defaultStages: [
      { title: 'Stage 1', description: 'Define your first stage', color: '#6366f1' },
      { title: 'Stage 2', description: 'Define your second stage', color: '#8b5cf6' },
      { title: 'Stage 3', description: 'Define your third stage', color: '#a855f7' },
    ],
  },
]

export const STAGE_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#14b8a6', '#3b82f6',
  '#0ea5e9', '#06b6d4', '#84cc16', '#ef4444', '#64748b',
]

export const PRIORITY_CONFIG = {
  low:      { label: 'Low',      color: '#64748b', bg: 'bg-slate-700' },
  medium:   { label: 'Medium',   color: '#eab308', bg: 'bg-yellow-900/50' },
  high:     { label: 'High',     color: '#f97316', bg: 'bg-orange-900/50' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'bg-red-900/50' },
}

export const PROJECT_STATUS_CONFIG = {
  active:        { label: 'Active',        classes: 'bg-emerald-500/15 text-emerald-400' },
  on_hold:       { label: 'On Hold',       classes: 'bg-amber-500/15 text-amber-400' },
  bid_submitted: { label: 'Bid Submitted', classes: 'bg-sky-500/15 text-sky-400' },
  won:           { label: 'Bid Won',       classes: 'bg-yellow-500/15 text-yellow-300' },
  lost:          { label: 'Bid Lost',      classes: 'bg-red-500/15 text-red-400' },
  completed:     { label: 'Completed',     classes: 'bg-blue-500/15 text-blue-400' },
  archived:      { label: 'Archived',      classes: 'bg-slate-700/50 text-slate-500' },
} as const

export const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: '#64748b', dot: 'bg-slate-500' },
  in_progress: { label: 'In Progress', color: '#6366f1', dot: 'bg-indigo-500' },
  blocked:     { label: 'Blocked',     color: '#ef4444', dot: 'bg-red-500' },
  done:        { label: 'Done',        color: '#10b981', dot: 'bg-emerald-500' },
}
