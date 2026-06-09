import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase'

interface Props {
  onMenuToggle: () => void
  menuOpen: boolean
}

export default function Header({ onMenuToggle, menuOpen }: Props) {
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-1/95 backdrop-blur border-b border-white/5 safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors md:hidden"
          >
            {menuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">WorkFlow<span className="text-brand-400">Pro</span></span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!isSupabaseConfigured && (
            <Link
              to="/settings"
              className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
            >
              Connect Cloud
            </Link>
          )}
          {isSupabaseConfigured && (
            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              ● Synced
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
