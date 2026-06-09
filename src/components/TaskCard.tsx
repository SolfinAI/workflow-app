import { Calendar, DollarSign, AlertCircle } from 'lucide-react'
import type { Task } from '../types'
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../lib/templates'
import { format, isPast, parseISO } from 'date-fns'

interface Props {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: Props) {
  const p = PRIORITY_CONFIG[task.priority]
  const s = STATUS_CONFIG[task.status]
  const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date))

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-3 hover:bg-surface-4 border border-white/5 hover:border-brand-500/20
        rounded-xl p-3.5 transition-all group animate-fade-in"
    >
      <div className="flex items-start gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
        <p className={`text-sm font-medium leading-snug flex-1 ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap ml-4">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${
          task.priority === 'critical' ? 'bg-red-500/15 border-red-500/30 text-red-400' :
          task.priority === 'high'     ? 'bg-orange-500/15 border-orange-500/30 text-orange-400' :
          task.priority === 'medium'   ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' :
                                          'bg-slate-700/50 border-white/10 text-slate-500'
        }`}>
          {p.label}
        </span>

        {task.due_date && (
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            <Calendar size={11} />
            {format(parseISO(task.due_date), 'MMM d')}
          </span>
        )}

        {task.amount && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <DollarSign size={11} />
            {task.amount.toLocaleString()}
          </span>
        )}

        {task.notes && <AlertCircle size={12} className="text-amber-500/60" />}
      </div>
    </button>
  )
}
