import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import NewProjectModal from './components/NewProjectModal'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Settings from './pages/Settings'
import { useProjects } from './hooks/useProjects'
import type { WorkflowCategory } from './types'

function AppInner() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const { projects, loading, createProject, deleteProject } = useProjects()
  const location = useLocation()

  const handleCreate = async (category: WorkflowCategory, title: string, description?: string) => {
    await createProject(category, title, description)
  }

  const isProjectDetail = /^\/projects\/[^/]+/.test(location.pathname)

  const pageTitle = () => {
    if (location.pathname === '/') return 'Dashboard'
    if (location.pathname === '/projects') return 'Projects'
    if (location.pathname === '/settings') return 'Settings'
    return 'Project'
  }

  return (
    <div className="min-h-screen bg-surface-0 text-white font-sans">
      <Header onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />

      <Sidebar
        projects={projects}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNewProject={() => setShowNewProject(true)}
      />

      <main className="md:pl-64 pt-14">
        <div className="px-4 sm:px-6 py-6 max-w-7xl">
          {!isProjectDetail && (
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">{pageTitle()}</h1>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Dashboard projects={projects} onNewProject={() => setShowNewProject(true)} />
              } />
              <Route path="/projects" element={
                <Projects
                  projects={projects}
                  onNewProject={() => setShowNewProject(true)}
                  onDeleteProject={deleteProject}
                />
              } />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          )}
        </div>
      </main>

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
