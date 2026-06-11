import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('App crash caught by ErrorBoundary:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
          <div className="bg-surface-2 border border-white/10 rounded-2xl p-8 max-w-md text-center">
            <p className="text-3xl mb-3">⚡</p>
            <h1 className="text-lg font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-2">The app hit an unexpected error. Tap below to reload.</p>
            <p className="text-xs text-slate-500 font-mono mb-6 break-all">{this.state.error.message}</p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-xl text-white font-semibold text-sm transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
