import { useState, useEffect } from 'react'
import { GraduationCap, User, Play, FileText, Code, Hammer, Book, Zap, Search, Heart, Check, CheckCheck } from 'lucide-react'

const API_BASE = "https://learniq-765n.onrender.com"

export default function App() {
  const [view, setView] = useState('mypath')
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_profile')
      return saved && saved !== "undefined" ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [interactions, setInteractions] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_interactions')
      const parsed = saved && saved !== "undefined" ? JSON.parse(saved) : null
      return parsed && parsed.saved && parsed.completed ? parsed : { saved: [], completed: [] }
    } catch {
      return { saved: [], completed: [] }
    }
  })
  
  // Save interactions to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('learniq_interactions', JSON.stringify(interactions))
  }, [interactions])

  const [recommendations, setRecommendations] = useState([])
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch recommendations automatically if profile exists
  useEffect(() => {
    if (profile && view === 'mypath') {
      fetchRecommendations(profile)
    }
  }, [view])

  const fetchRecommendations = async (studentData) => {
    setLoading(true)
    try {
      // Create/Update user first to get ID
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      })
      const { student_id } = await res.json()
      
      const updatedProfile = { ...studentData, id: student_id }
      setProfile(updatedProfile)
      localStorage.setItem('learniq_profile', JSON.stringify(updatedProfile))

      // Get recs
      const recsRes = await fetch(`${API_BASE}/recommendations/${student_id}?top_n=5`)
      const recsData = await recsRes.json()
      setRecommendations(recsData.recommendations || [])
    } catch (error) {
      console.error(error)
      alert("Failed to connect to the recommendation engine.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCatalog = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/resources?limit=100`)
      const data = await res.json()
      setCatalog(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (view === 'catalog' || view === 'dashboard') {
      fetchCatalog()
    }
  }, [view])

  const logAction = async (resource, type) => {
    if (!profile) return alert("Please create a profile first!")
    
    // Update backend
    try {
      await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: profile.id,
          resource_id: resource.id,
          interaction_type: type
        })
      })
    } catch (error) {
      console.error(error)
    }

    // Update frontend dashboard state
    if (type === 'Liked') {
      setInteractions(prev => ({ ...prev, saved: [...new Set([...prev.saved, resource.id])] }))
    } else if (type === 'Completed') {
      setInteractions(prev => ({ ...prev, completed: [...new Set([...prev.completed, resource.id])] }))
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'Video': return <Play className="text-red-500 w-8 h-8" />
      case 'Article': return <FileText className="text-blue-500 w-8 h-8" />
      case 'Tutorial': return <Code className="text-purple-500 w-8 h-8" />
      case 'Project': return <Hammer className="text-amber-600 w-8 h-8" />
      default: return <Book className="w-8 h-8 text-slate-500" />
    }
  }

  const NavButton = ({ name, id }) => (
    <button 
      onClick={() => setView(id)} 
      className={`px-3 py-2 text-sm font-medium transition ${view === id ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-900'}`}
    >
      {name}
    </button>
  )

  const ResourceCard = ({ rec, matchScore }) => {
    const isSaved = interactions.saved.includes(rec.id)
    const isCompleted = interactions.completed.includes(rec.id)

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col md:flex-row group">
        <div className="w-full md:w-1/4 bg-slate-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100 relative">
          <div className="mb-3 opacity-80 group-hover:scale-110 transition duration-300">
            {getIcon(rec.type)}
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{rec.type}</span>
          
          {matchScore !== undefined && !isNaN(matchScore) && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800">
                {matchScore}% Match
              </span>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{rec.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
              <span className="flex items-center capitalize">{rec.difficulty}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center">{rec.topic}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center">{rec.source || 'Platform'}</span>
            </div>
            <p className="text-slate-600 text-sm mb-5 line-clamp-2">{rec.description}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
            <a href={rec.url} target="_blank" onClick={() => logAction(rec, 'Clicked')} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm">
              Launch Content
            </a>
            
            <button 
              disabled={isSaved || isCompleted}
              onClick={() => logAction(rec, 'Liked')} 
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition shadow-sm ${
                isSaved ? 'text-rose-600 bg-rose-50 border-rose-200 cursor-not-allowed opacity-70' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-rose-600'
              }`}
            >
              <Heart className="w-4 h-4 mr-1.5" /> {isSaved ? 'Saved' : 'Save'}
            </button>

            <button 
              disabled={isCompleted}
              onClick={() => logAction(rec, 'Completed')} 
              className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition shadow-sm ${
                isCompleted ? 'text-emerald-600 bg-emerald-50 border-emerald-200 cursor-not-allowed opacity-70' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-emerald-600'
              }`}
            >
              {isCompleted ? <CheckCheck className="w-4 h-4 mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />} 
              {isCompleted ? 'Completed' : 'Mark Done'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('mypath')}>
              <GraduationCap className="text-brand-600 w-8 h-8 mr-2" />
              <span className="font-bold text-xl tracking-tight text-slate-900">LearnIQ</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
              <NavButton name="My Path" id="mypath" />
              <NavButton name="Catalog" id="catalog" />
              <NavButton name="Dashboard" id="dashboard" />
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }} 
                className="ml-2 md:ml-4 text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-full transition"
                title="Reset Profile"
              >
                Reset Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      {view === 'mypath' && (
        <div className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="md:w-2/3">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Accelerate Your Career</h1>
              <p className="text-lg text-slate-300 max-w-2xl">Tell us your goals, and our intelligent engine will curate a personalized learning path.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 ${view === 'mypath' ? '-mt-8' : 'pt-8'}`}>
        
        {view === 'mypath' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Form */}
            <div className="w-full lg:w-1/3">
              <div className="glass-panel rounded-xl shadow-lg p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-500 rounded-t-xl"></div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Learning Profile</h2>
                <p className="text-sm text-slate-500 mb-6">Customize your educational journey.</p>
                
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.target)
                  fetchRecommendations(Object.fromEntries(fd))
                }}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input name="name" defaultValue={profile?.name || ''} required className="block w-full rounded-lg border-slate-300 shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-2.5" placeholder="e.g. Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expertise</label>
                    <select name="skill_level" defaultValue={profile?.skill_level || 'Beginner'} className="block w-full rounded-lg border-slate-300 shadow-sm focus:ring-brand-500 border p-2.5 bg-white">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
                    <textarea name="interest" defaultValue={profile?.interest || ''} required rows="3" className="block w-full rounded-lg border-slate-300 shadow-sm focus:ring-brand-500 border p-3" placeholder="What specific skills are you trying to master?"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Format</label>
                    <select name="preferred_type" defaultValue={profile?.preferred_type || 'Video'} className="block w-full rounded-lg border-slate-300 shadow-sm focus:ring-brand-500 border p-2.5 bg-white">
                      <option>Video</option>
                      <option>Article</option>
                      <option>Tutorial</option>
                      <option>Project</option>
                    </select>
                  </div>
                  <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition mt-2">
                    {loading ? 'Analyzing...' : 'Discover Content'}
                  </button>
                </form>
              </div>
            </div>

            {/* Recommendations */}
            <div className="w-full lg:w-2/3 mt-8 lg:mt-0 space-y-5">
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{profile ? `${profile.name}'s Curriculum` : 'Curated For You'}</h2>
                <span className="text-sm text-slate-500 flex items-center"><Zap className="text-amber-400 w-4 h-4 mr-1.5 fill-current" /> AI Matched</span>
              </div>
              
              {loading && <div className="h-32 shimmer rounded-xl"></div>}
              
              {!loading && recommendations.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center text-slate-500 flex flex-col items-center">
                  <Search className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">Your feed is empty</h3>
                  <p>Complete your profile on the left to generate recommendations.</p>
                </div>
              )}

              {!loading && recommendations.map(rec => (
                <ResourceCard key={rec.id} rec={rec} matchScore={Math.round(rec.score * 100)} />
              ))}
            </div>
          </div>
        )}

        {/* Catalog View */}
        {view === 'catalog' && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Course Catalog</h2>
            {loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-48 shimmer rounded-xl"></div><div className="h-48 shimmer rounded-xl"></div></div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && catalog.map(rec => (
                <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {getIcon(rec.type)}
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{rec.type}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{rec.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">{rec.topic}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 capitalize">{rec.difficulty}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{rec.description}</p>
                  </div>
                  <a href={rec.url} target="_blank" className="text-center w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium py-2 px-4 rounded-lg transition text-sm">
                    View Content ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">My Dashboard</h2>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><CheckCheck className="text-emerald-500 mr-2" /> Completed Courses</h3>
            <div className="space-y-4 mb-10">
              {catalog.filter(c => interactions.completed.includes(c.id)).length === 0 && <p className="text-slate-500 italic">No courses completed yet.</p>}
              {catalog.filter(c => interactions.completed.includes(c.id)).map(rec => (
                <ResourceCard key={`comp-${rec.id}`} rec={rec} />
              ))}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><Heart className="text-rose-500 mr-2 fill-rose-500" /> Saved for Later</h3>
            <div className="space-y-4">
              {catalog.filter(c => interactions.saved.includes(c.id)).length === 0 && <p className="text-slate-500 italic">No saved courses yet.</p>}
              {catalog.filter(c => interactions.saved.includes(c.id)).map(rec => (
                <ResourceCard key={`save-${rec.id}`} rec={rec} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
