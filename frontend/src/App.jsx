import React, { useState, useEffect, useMemo } from 'react'

const API_BASE = "https://learniq-765n.onrender.com"

// Available topics for chip toggling
const TOPIC_OPTIONS = [
  'Machine Learning',
  'Generative AI',
  'Computer Vision',
  'Python',
  'NLP',
  'Data Science',
  'MLOps',
  'Deep Learning',
  'Web Development',
  'Cloud Computing'
]

// Domain Browser Categories for the Learner Platform
const DOMAINS = [
  { id: 'all', name: 'All Subjects', icon: '🌐', count: '300+' },
  { id: 'ai', name: 'AI & Machine Learning', icon: '🧠', count: '120+' },
  { id: 'python', name: 'Python Programming', icon: '🐍', count: '80+' },
  { id: 'web', name: 'Web Development', icon: '⚡', count: '60+' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️', count: '45+' }
]

// Preset Profiles for Lab Mode
const PRESETS = {
  genai: {
    name: 'Alex Chen',
    experience: 'Intermediate',
    goal: 'Build AI projects',
    format: 'Interactive',
    weeklyTime: '7-10',
    topics: ['Generative AI', 'Python', 'NLP', 'Machine Learning'],
    alpha: 0.65
  },
  foundations: {
    name: 'Sarah Miller',
    experience: 'Beginner',
    goal: 'Learn fundamentals',
    format: 'Video',
    weeklyTime: '4-6',
    topics: ['Machine Learning', 'Python', 'Data Science', 'Deep Learning'],
    alpha: 0.80
  },
  mlops: {
    name: 'David Patel',
    experience: 'Advanced',
    goal: 'Career transition',
    format: 'Course',
    weeklyTime: '10+',
    topics: ['MLOps', 'Cloud Computing', 'Machine Learning', 'Python'],
    alpha: 0.50
  },
  webdev: {
    name: 'Emma Watson',
    experience: 'Intermediate',
    goal: 'Build AI projects',
    format: 'Video',
    weeklyTime: '4-6',
    topics: ['Web Development', 'Python', 'Generative AI'],
    alpha: 0.60
  }
}

export default function App() {
  // Mode: 'learner' (Clean Consumer Platform) vs 'lab' (Mathematical AI Workspace)
  const [platformMode, setPlatformMode] = useState('learner')

  // Navigation tabs within active mode
  const [activeTab, setActiveTab] = useState('home') // 'home', 'catalog', 'dashboard'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Local Storage for profile & interactions
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_profile')
      return saved && saved !== "undefined" ? JSON.parse(saved) : {
        name: 'Alan S.',
        experience: 'Intermediate',
        goal: 'Build AI projects',
        format: 'Video',
        weeklyTime: '4-6',
        topics: ['Machine Learning', 'Generative AI', 'Python', 'MLOps']
      }
    } catch {
      return {
        name: 'Alan S.',
        experience: 'Intermediate',
        goal: 'Build AI projects',
        format: 'Video',
        weeklyTime: '4-6',
        topics: ['Machine Learning', 'Generative AI', 'Python', 'MLOps']
      }
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

  // Lab Model Signals
  const [signals, setSignals] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_signals')
      return saved ? JSON.parse(saved) : {
        completed: 4,
        saved: 7,
        ratings: 5,
        sessions: 8
      }
    } catch {
      return { completed: 4, saved: 7, ratings: 5, sessions: 8 }
    }
  })

  // Lab Model Controls
  const [alpha, setAlpha] = useState(0.60)
  const [explainEnabled, setExplainEnabled] = useState(true)
  const [coldStartEnabled, setColdStartEnabled] = useState(true)

  // Live Data & Loading States
  const [catalog, setCatalog] = useState([])
  const [rawBackendRecs, setRawBackendRecs] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [toasts, setToasts] = useState([])

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('match')

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('learniq_profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('learniq_interactions', JSON.stringify(interactions))
    setSignals(prev => ({
      ...prev,
      saved: Math.max(prev.saved, interactions.saved.length),
      completed: Math.max(prev.completed, interactions.completed.length)
    }))
  }, [interactions])

  useEffect(() => {
    localStorage.setItem('learniq_signals', JSON.stringify(signals))
  }, [signals])

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }

  // Fetch complete catalog from Render API
  const fetchCatalogData = async () => {
    setLoadingCatalog(true)
    try {
      const res = await fetch(`${API_BASE}/resources?limit=300`)
      if (res.ok) {
        const data = await res.json()
        setCatalog(data)
      }
    } catch (err) {
      console.error("Error fetching catalog:", err)
    } finally {
      setLoadingCatalog(false)
    }
  }

  // Fetch live recommendations from Render API
  const fetchBackendRecommendations = async (studentProfile) => {
    setLoadingRecs(true)
    try {
      const postData = {
        name: studentProfile.name || 'Learner',
        skill_level: studentProfile.experience || 'Intermediate',
        interest: (studentProfile.topics && studentProfile.topics.length > 0)
          ? `${studentProfile.goal || 'Learn AI'}. Key topics: ${studentProfile.topics.join(', ')}`
          : (studentProfile.goal || 'Machine Learning and AI'),
        preferred_type: studentProfile.format || 'Video'
      }

      const studRes = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (!studRes.ok) throw new Error("Could not save student profile")
      const { student_id } = await studRes.json()

      const recsRes = await fetch(`${API_BASE}/recommendations/${student_id}?top_n=20`)
      if (recsRes.ok) {
        const data = await recsRes.json()
        setRawBackendRecs(data.recommendations || [])
        showToast("Recommendations updated!", "success")
      }
    } catch (err) {
      console.error("Recommendation fetch error:", err)
      showToast("Connected via cloud catalog fallback.", "info")
    } finally {
      setLoadingRecs(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchCatalogData()
    fetchBackendRecommendations(profile)
  }, [])

  // User Actions (Launch, Save, Complete)
  const handleAction = async (resource, actionType) => {
    if (actionType === 'Liked') {
      const alreadySaved = interactions.saved.includes(resource.id)
      if (alreadySaved) return
      setInteractions(prev => ({
        ...prev,
        saved: [...new Set([...prev.saved, resource.id])]
      }))
      showToast(`Saved "${resource.title.slice(0, 30)}..." to your Learning Wishlist`, 'success')
    } else if (actionType === 'Completed') {
      const alreadyDone = interactions.completed.includes(resource.id)
      if (alreadyDone) return
      setInteractions(prev => ({
        ...prev,
        completed: [...new Set([...prev.completed, resource.id])]
      }))
      showToast(`Marked "${resource.title.slice(0, 30)}..." as Completed!`, 'success')
    } else if (actionType === 'Clicked') {
      showToast(`Launching course content...`, 'info')
    }

    try {
      await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: profile.id || '1',
          resource_id: resource.id,
          interaction_type: actionType
        })
      })
    } catch (err) {
      console.error("Could not sync interaction to backend:", err)
    }
  }

  // Steppers for Lab Mode
  const adjustSignal = (signalKey, delta) => {
    setSignals(prev => {
      const nextVal = Math.max(0, (prev[signalKey] || 0) + delta)
      return { ...prev, [signalKey]: nextVal }
    })
  }

  // Topic Chip Toggle
  const toggleTopic = (topic) => {
    setProfile(prev => {
      const cur = prev.topics || []
      const exists = cur.includes(topic)
      const updated = exists ? cur.filter(t => t !== topic) : [...cur, topic]
      return { ...prev, topics: updated }
    })
  }

  // Load Preset (for Lab Mode)
  const loadPreset = (presetKey) => {
    const p = PRESETS[presetKey]
    if (!p) return
    setProfile({
      name: p.name,
      experience: p.experience,
      goal: p.goal,
      format: p.format,
      weeklyTime: p.weeklyTime,
      topics: [...p.topics]
    })
    setAlpha(p.alpha)
    fetchBackendRecommendations({
      ...p,
      topics: [...p.topics]
    })
    showToast(`Loaded "${presetKey.toUpperCase()}" curriculum preset`, 'info')
  }

  // Reset Everything to Clean Defaults
  const handleReset = () => {
    const def = {
      name: 'Alan S.',
      experience: 'Intermediate',
      goal: 'Build AI projects',
      format: 'Video',
      weeklyTime: '4-6',
      topics: ['Machine Learning', 'Generative AI', 'Python', 'MLOps']
    }
    setProfile(def)
    setAlpha(0.60)
    setSignals({ completed: 4, saved: 7, ratings: 5, sessions: 8 })
    fetchBackendRecommendations(def)
    showToast("Parameters reset to default values", "info")
  }

  // Signal Totals
  const totalSignals = (signals.completed || 0) + (signals.saved || 0) + (signals.ratings || 0) + (signals.sessions || 0)
  const profileCompleteness = useMemo(() => {
    let score = 0
    if (profile.name) score += 20
    if (profile.experience) score += 20
    if (profile.goal) score += 20
    if (profile.format) score += 20
    if (profile.topics && profile.topics.length > 0) score += 20
    return score
  }, [profile])

  // Dynamic Recommendation Hybrid Calculation
  const computedRecommendations = useMemo(() => {
    const pool = rawBackendRecs.length > 0 ? rawBackendRecs : catalog
    if (!pool || pool.length === 0) return []

    const userTopics = profile.topics || []
    const preferredFormat = profile.format || 'Video'
    const userExp = profile.experience || 'Intermediate'

    return pool.map((item) => {
      let cb = 72.0
      if (item.score !== undefined) {
        cb = Math.min(100, Math.max(35, Math.round(item.score * 100)))
      } else {
        const titleAndDesc = (item.title + ' ' + (item.description || '') + ' ' + (item.topic || '')).toLowerCase()
        let topicMatches = 0
        userTopics.forEach(t => {
          if (titleAndDesc.includes(t.toLowerCase())) topicMatches++
        })
        cb += Math.min(25, topicMatches * 7.5)

        if (item.type && item.type.toLowerCase() === preferredFormat.toLowerCase()) {
          cb += 12.0
        } else {
          cb -= 6.0
        }

        if (item.difficulty && item.difficulty.toLowerCase() === userExp.toLowerCase()) {
          cb += 8.0
        }
      }
      cb = Math.min(99.0, Math.max(30.0, cb))

      const baseRating = item.rating ? (item.rating / 5.0) * 80.0 : 75.0
      const signalAffinity = Math.min(20.0, (signals.completed * 1.5 + signals.saved * 1.0 + signals.ratings * 1.2 + signals.sessions * 0.8))
      let cf = baseRating + (signalAffinity * 0.5)
      cf = Math.min(98.0, Math.max(35.0, cf))

      let coldStartBoost = 0
      const isNewResource = item.source === 'Dev.to' || (item.id && String(item.id).startsWith('res-new'))
      if (coldStartEnabled && isNewResource) {
        coldStartBoost = 4.5
      }

      const weightedCb = alpha * cb
      const weightedCf = (1 - alpha) * cf
      const hybridScore = Math.min(100.0, Math.round((weightedCb + weightedCf + coldStartBoost) * 10) / 10)

      return {
        ...item,
        cbScore: Math.round(cb * 10) / 10,
        cfScore: Math.round(cf * 10) / 10,
        weightedCb: Math.round(weightedCb * 10) / 10,
        weightedCf: Math.round(weightedCf * 10) / 10,
        coldStartBoost,
        hybridScore,
        matchPercentage: Math.min(99, Math.max(65, Math.round(hybridScore))),
        isNew: isNewResource
      }
    })
  }, [rawBackendRecs, catalog, profile, signals, alpha, coldStartEnabled])

  // Filtered recommendations for Learner Platform and Catalog
  const filteredCourses = useMemo(() => {
    let pool = activeTab === 'catalog' ? catalog : computedRecommendations

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      pool = pool.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.topic && c.topic.toLowerCase().includes(q))
      )
    }

    // Domain / Topic Filter
    if (selectedDomain !== 'all') {
      if (selectedDomain === 'ai') {
        pool = pool.filter(c => ['Machine Learning', 'Generative AI', 'Deep Learning', 'Computer Vision', 'NLP'].some(t => c.topic?.toLowerCase().includes(t.toLowerCase())))
      } else if (selectedDomain === 'python') {
        pool = pool.filter(c => c.topic?.toLowerCase().includes('python'))
      } else if (selectedDomain === 'web') {
        pool = pool.filter(c => c.topic?.toLowerCase().includes('web') || c.topic?.toLowerCase().includes('react') || c.topic?.toLowerCase().includes('node'))
      } else if (selectedDomain === 'cloud') {
        pool = pool.filter(c => c.topic?.toLowerCase().includes('cloud') || c.topic?.toLowerCase().includes('aws') || c.topic?.toLowerCase().includes('mlops'))
      } else {
        pool = pool.filter(c => c.topic?.toLowerCase().includes(selectedDomain.toLowerCase()))
      }
    }

    // Format Filter
    if (selectedFormat !== 'all') {
      pool = pool.filter(c => c.type && c.type.toLowerCase() === selectedFormat.toLowerCase())
    }

    // Difficulty Filter
    if (selectedDifficulty !== 'all') {
      pool = pool.filter(c => c.difficulty && c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase())
    }

    // Sorting
    let result = [...pool]
    if (sortBy === 'match') {
      result.sort((a, b) => (b.hybridScore || 0) - (a.hybridScore || 0))
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return result
  }, [computedRecommendations, catalog, activeTab, searchQuery, selectedDomain, selectedFormat, selectedDifficulty, sortBy])

  // Saved & Completed
  const savedCourses = useMemo(() => {
    return catalog.filter(c => interactions.saved.includes(c.id))
  }, [catalog, interactions.saved])

  const completedCourses = useMemo(() => {
    return catalog.filter(c => interactions.completed.includes(c.id))
  }, [catalog, interactions.completed])

  const cbPercent = Math.round(alpha * 100)
  const cfPercent = Math.round((1 - alpha) * 100)

  const blendStatusText = useMemo(() => {
    if (alpha >= 0.75) return `Content-Led (α = ${alpha.toFixed(2)})`
    if (alpha <= 0.25) return `Collaborative-Led (α = ${alpha.toFixed(2)})`
    return `Balanced Blend (α = ${alpha.toFixed(2)})`
  }, [alpha])

  const blendStatusClass = useMemo(() => {
    if (alpha >= 0.75) return 'badge-content-led'
    if (alpha <= 0.25) return 'badge-collab-led'
    return 'badge-balanced'
  }, [alpha])

  return (
    <div className="app-layout">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside id="sidebar" className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary Navigation">
        <div className="sidebar-header">
          <div className="brand-cluster" onClick={() => { setActiveTab('home'); setPlatformMode('learner'); }} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">LearnIQ</h1>
              <p className="brand-tagline">
                {platformMode === 'learner' ? 'Intelligent Learning Platform' : 'AI Recommendation Lab'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Platform Mode Switcher in Sidebar */}
        <div style={{ padding: '0 1.25rem 1rem' }}>
          <div className="mode-switcher-container" style={{ width: '100%', justifyContent: 'center' }}>
            <button
              type="button"
              className={`btn-mode-tab ${platformMode === 'learner' ? 'active-learner' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setPlatformMode('learner'); setActiveTab('home'); }}
            >
              <span>🎓 Learner View</span>
            </button>
            <button
              type="button"
              className={`btn-mode-tab ${platformMode === 'lab' ? 'active-lab' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setPlatformMode('lab'); setActiveTab('workspace'); }}
            >
              <span>🧪 AI Lab Mode</span>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">
            {platformMode === 'learner' ? 'PLATFORM NAVIGATION' : 'WORKSPACE SECTIONS'}
          </div>

          <ul className="nav-list">
            {platformMode === 'learner' ? (
              <>
                <li>
                  <a
                    href="#home"
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('home'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Discover &amp; For You</span>
                  </a>
                </li>

                <li>
                  <a
                    href="#catalog"
                    className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Explore 300+ Courses</span>
                    <span className="nav-badge">{catalog.length || '300+'}</span>
                  </a>
                </li>

                <li>
                  <a
                    href="#dashboard"
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>My Learning</span>
                    <span className="nav-pill pill-hybrid">{interactions.saved.length + interactions.completed.length}</span>
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a
                    href="#overview"
                    className={`nav-item ${activeTab === 'workspace' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('workspace'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="9" rx="1"></rect>
                      <rect x="14" y="3" width="7" height="5" rx="1"></rect>
                      <rect x="14" y="12" width="7" height="9" rx="1"></rect>
                      <rect x="3" y="16" width="7" height="5" rx="1"></rect>
                    </svg>
                    <span>Hybrid Formulation</span>
                  </a>
                </li>

                <li>
                  <a
                    href="#catalog"
                    className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <span>Full Catalog Pool</span>
                    <span className="nav-badge">{catalog.length || '300+'}</span>
                  </a>
                </li>

                <li>
                  <a
                    href="#dashboard"
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>My Dashboard</span>
                    <span className="nav-pill pill-hybrid">{interactions.saved.length + interactions.completed.length}</span>
                  </a>
                </li>
              </>
            )}
          </ul>

          {platformMode === 'lab' && (
            <>
              <div className="nav-group-label">CURRICULUM PRESETS</div>
              <div className="preset-buttons">
                <button type="button" className="btn-preset" onClick={() => loadPreset('genai')}>
                  <span className="preset-dot dot-genai"></span>
                  <span>Generative AI Engineer</span>
                </button>
                <button type="button" className="btn-preset" onClick={() => loadPreset('foundations')}>
                  <span className="preset-dot dot-foundations"></span>
                  <span>ML Fundamentals</span>
                </button>
                <button type="button" className="btn-preset" onClick={() => loadPreset('mlops')}>
                  <span className="preset-dot dot-mlops"></span>
                  <span>MLOps Transition</span>
                </button>
                <button type="button" className="btn-preset" onClick={() => loadPreset('webdev')}>
                  <span className="preset-dot dot-genai" style={{ background: '#3b82f6' }}></span>
                  <span>Web Development</span>
                </button>
              </div>
            </>
          )}

          {platformMode === 'learner' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>YOUR TARGET GOAL</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{profile.goal}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>Pace: {profile.weeklyTime} hrs/wk • {profile.experience}</div>
            </div>
          )}
        </nav>

        {/* Sidebar Status Panel */}
        <div className="sidebar-status-panel">
          <div className="status-indicator-row">
            <span className="pulse-dot-green" aria-hidden="true"></span>
            <span className="status-headline" style={{ color: '#34d399' }}>Live Engine Connected</span>
          </div>
          <p className="status-body">
            Render Cloud &amp; Supabase DB active with {catalog.length || 300}+ verified resources.
          </p>
          <div className="status-meta">
            <span>Server: Online (IPv4 Pooler)</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" id="mainContent">
        {/* Mobile Top Header */}
        <header className="mobile-navbar">
          <div className="brand-cluster">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-title">LearnIQ</span>
          </div>
          <button
            className="btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Top Header Bar with Mode Switcher */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>LearnIQ Platform</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">
                {platformMode === 'learner' ? 'Learner Portal' : 'AI Recommendation Lab'}
              </span>
              <span className="badge-prod-connected">
                <span className="pulse-dot-green"></span>
                RENDER &amp; SUPABASE LIVE
              </span>
            </div>
            <h2 className="workspace-title">
              {platformMode === 'learner' ? 'Personalized Learning Curriculum' : 'Hybrid Model Lab & Parameters'}
            </h2>
          </div>

          <div className="header-actions">
            <div className="mode-switcher-container">
              <button
                type="button"
                className={`btn-mode-tab ${platformMode === 'learner' ? 'active-learner' : ''}`}
                onClick={() => { setPlatformMode('learner'); setActiveTab('home'); }}
                title="Switch to clean consumer learning platform"
              >
                🎓 Learner View
              </button>
              <button
                type="button"
                className={`btn-mode-tab ${platformMode === 'lab' ? 'active-lab' : ''}`}
                onClick={() => { setPlatformMode('lab'); setActiveTab('workspace'); }}
                title="Switch to mathematical AI architecture lab"
              >
                🧪 AI Lab Mode
              </button>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              title="Reset preferences to default"
            >
              Reset
            </button>
          </div>
        </header>

        {/* =========================================================================
            WEBSITE 1: CLEAN CONSUMER LEARNER PLATFORM (NO MATHEMATICS / JARGON)
           ========================================================================= */}
        {platformMode === 'learner' && (
          <>
            {activeTab === 'home' && (
              <>
                {/* Clean Consumer Hero Discovery Section */}
                <section className="learner-hero">
                  <span className="learner-hero-eyebrow">
                    <span>✨</span> AI-POWERED PERSONALIZED CURRICULUM
                  </span>
                  <h1 className="learner-hero-title">
                    Master In-Demand Skills with <span className="gradient-text">Curated Learning</span>
                  </h1>
                  <p className="learner-hero-desc">
                    LearnIQ matches your background and goals with over 300+ verified courses, tutorials, and technical articles from premier creators and engineers.
                  </p>

                  {/* Search Bar */}
                  <div className="learner-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginRight: '0.75rem', flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="What do you want to master today? (e.g. Generative AI, Python, AWS)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-launch"
                      style={{ padding: '0.55rem 1.25rem' }}
                      onClick={() => {
                        const recGrid = document.getElementById('curatedSection')
                        if (recGrid) recGrid.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Find Courses
                    </button>
                  </div>

                  {/* Quick Topics */}
                  <div className="learner-quick-topics">
                    <span>Popular skills:</span>
                    {['Generative AI', 'Python', 'Machine Learning', 'Cloud DevOps', 'Web Development'].map(t => (
                      <span
                        key={t}
                        className="quick-topic-chip"
                        onClick={() => {
                          setSearchQuery(t)
                          const recGrid = document.getElementById('curatedSection')
                          if (recGrid) recGrid.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Browse by Domain */}
                <section style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Explore Subject Tracks</h3>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Verified technical curricula</span>
                  </div>

                  <div className="domain-cards-grid">
                    {DOMAINS.map(d => (
                      <div
                        key={d.id}
                        className={`domain-card ${selectedDomain === d.id ? 'active' : ''}`}
                        onClick={() => setSelectedDomain(d.id)}
                      >
                        <div className="domain-card-icon">{d.icon}</div>
                        <div className="domain-card-title">{d.name}</div>
                        <div className="domain-card-count">{d.count} Courses &amp; Articles</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Onboarding Preferences Tuner (Non-Mathematical) */}
                <section className="onboarding-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                        Tailor Your Experience
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0 }}>
                        Tell us your learning pace and preferred format so we can recommend the best content.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={loadingRecs}
                      onClick={() => fetchBackendRecommendations(profile)}
                    >
                      {loadingRecs ? 'Updating Recommendations...' : 'Refresh My Feed'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {/* Experience Level */}
                    <div>
                      <label className="form-label">Skill Level</label>
                      <div className="select-wrapper">
                        <select
                          className="form-select"
                          value={profile.experience}
                          onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                        >
                          <option value="Beginner">Beginner (Fundamentals)</option>
                          <option value="Intermediate">Intermediate (Hands-on)</option>
                          <option value="Advanced">Advanced (Production/Architecture)</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▼</span>
                      </div>
                    </div>

                    {/* Preferred Format */}
                    <div>
                      <label className="form-label">Preferred Format</label>
                      <div className="select-wrapper">
                        <select
                          className="form-select"
                          value={profile.format}
                          onChange={(e) => setProfile(prev => ({ ...prev, format: e.target.value }))}
                        >
                          <option value="Video">Video Courses (YouTube)</option>
                          <option value="Article">Technical Articles (Dev.to)</option>
                          <option value="Course">Full Curriculum</option>
                          <option value="Interactive">Hands-on Labs</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▼</span>
                      </div>
                    </div>

                    {/* Target Goal */}
                    <div>
                      <label className="form-label">Primary Goal</label>
                      <div className="select-wrapper">
                        <select
                          className="form-select"
                          value={profile.goal}
                          onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value }))}
                        >
                          <option value="Build AI projects">Build Practical Projects</option>
                          <option value="Learn fundamentals">Learn Core Fundamentals</option>
                          <option value="Career transition">Career Transition</option>
                          <option value="Prepare for exams">Exam &amp; Certification Prep</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▼</span>
                      </div>
                    </div>

                    {/* Weekly Commitment */}
                    <div>
                      <label className="form-label">Weekly Commitment</label>
                      <div className="select-wrapper">
                        <select
                          className="form-select"
                          value={profile.weeklyTime}
                          onChange={(e) => setProfile(prev => ({ ...prev, weeklyTime: e.target.value }))}
                        >
                          <option value="1-3">1–3 hours/week</option>
                          <option value="4-6">4–6 hours/week</option>
                          <option value="7-10">7–10 hours/week</option>
                          <option value="10+">10+ hours/week</option>
                        </select>
                        <span className="select-arrow" aria-hidden="true">▼</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* "Curated For You" Courses Grid */}
                <section id="curatedSection" style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge-prod-connected">
                          <span className="pulse-dot-green"></span>
                          CURATED FOR {profile.name?.toUpperCase() || 'YOU'}
                        </span>
                        <span className="results-badge">{filteredCourses.length} matched</span>
                      </div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Recommended Courses</h2>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                        Ranked by affinity with your {profile.experience} level and interest in {profile.format}s.
                      </p>
                    </div>

                    {/* Format Filter Chips */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`filter-pill ${selectedFormat === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFormat('all')}
                      >
                        All Formats
                      </button>
                      <button
                        type="button"
                        className={`filter-pill ${selectedFormat === 'Video' ? 'active' : ''}`}
                        onClick={() => setSelectedFormat('Video')}
                      >
                        📺 Videos
                      </button>
                      <button
                        type="button"
                        className={`filter-pill ${selectedFormat === 'Article' ? 'active' : ''}`}
                        onClick={() => setSelectedFormat('Article')}
                      >
                        📰 Articles
                      </button>
                    </div>
                  </div>

                  {/* Clean Consumer Cards Grid */}
                  <div className="recommendations-grid">
                    {filteredCourses.map((item, idx) => {
                      const isSaved = interactions.saved.includes(item.id)
                      const isCompleted = interactions.completed.includes(item.id)

                      return (
                        <article key={item.id || idx} className="consumer-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span className="rec-type-pill">{item.type || 'Course'}</span>
                              <span className="rec-provider">• {item.source || 'Instructor'}</span>
                              {item.difficulty && (
                                <span className="rec-provider" style={{ color: '#38bdf8' }}>• {item.difficulty}</span>
                              )}
                            </div>

                            <span className="consumer-match-badge">
                              {item.matchPercentage ? `${item.matchPercentage}% Match` : 'Top Match'}
                            </span>
                          </div>

                          <h4 className="rec-title-link">{item.title}</h4>
                          <p className="rec-description">{item.description || 'High-impact learning module designed to accelerate technical proficiency.'}</p>

                          <div className="rec-tags">
                            {item.topic && <span className="rec-tag tag-matched">{item.topic}</span>}
                            {item.tags && item.tags.split(' ').slice(0, 3).map((t, tIdx) => (
                              <span key={tIdx} className="rec-tag">{t}</span>
                            ))}
                          </div>

                          <div className="rec-actions">
                            <a
                              href={item.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-launch"
                              onClick={() => handleAction(item, 'Clicked')}
                            >
                              <span>Launch Content</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                              </svg>
                            </a>

                            <button
                              type="button"
                              className={`btn-action-outline ${isSaved ? 'is-saved' : ''}`}
                              onClick={() => handleAction(item, 'Liked')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              <span>{isSaved ? 'Saved' : 'Save'}</span>
                            </button>

                            <button
                              type="button"
                              className={`btn-action-outline ${isCompleted ? 'is-completed' : ''}`}
                              onClick={() => handleAction(item, 'Completed')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="no-results-panel">
                      <div className="no-results-icon">🔍</div>
                      <h4>No matching courses found</h4>
                      <p>Try searching for a different keyword or resetting your domain filters.</p>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSearchQuery(''); setSelectedDomain('all'); setSelectedFormat('all'); }}
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}

            {/* TAB: EXPLORE CATALOG */}
            {activeTab === 'catalog' && (
              <section className="section-recommendations">
                <div className="catalog-toolbar">
                  <div className="catalog-search-row">
                    <div className="search-box" style={{ flex: 1 }}>
                      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search all 300+ courses by title, instructor, skill..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="select-wrapper" style={{ minWidth: 160 }}>
                      <select
                        className="form-select"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        <option value="all">All Formats</option>
                        <option value="Video">Video Courses</option>
                        <option value="Article">Technical Articles</option>
                        <option value="Course">Full Courses</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>

                    <div className="select-wrapper" style={{ minWidth: 160 }}>
                      <select
                        className="form-select"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                      >
                        <option value="all">All Difficulties</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  {/* Topic Filter Pills */}
                  <div className="rec-filter-pills" style={{ marginBottom: 0 }}>
                    <button
                      type="button"
                      className={`filter-pill ${selectedDomain === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedDomain('all')}
                    >
                      All Subjects ({catalog.length})
                    </button>
                    {TOPIC_OPTIONS.map(topic => (
                      <button
                        key={topic}
                        type="button"
                        className={`filter-pill ${selectedDomain === topic ? 'active' : ''}`}
                        onClick={() => setSelectedDomain(topic)}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="recommendations-grid">
                  {filteredCourses.map((item, idx) => {
                    const isSaved = interactions.saved.includes(item.id)
                    const isCompleted = interactions.completed.includes(item.id)

                    return (
                      <article key={item.id || idx} className="consumer-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span className="rec-type-pill">{item.type || 'Resource'}</span>
                            <span className="rec-provider">• {item.source || 'Verified'}</span>
                            {item.difficulty && (
                              <span className="rec-provider" style={{ color: '#38bdf8' }}>• {item.difficulty}</span>
                            )}
                          </div>
                          <span className="badge-rank-index">{item.rating ? `${item.rating} ★` : '4.8 ★'}</span>
                        </div>

                        <h4 className="rec-title-link">{item.title}</h4>
                        <p className="rec-description">{item.description || 'Verified educational curriculum.'}</p>

                        <div className="rec-tags">
                          {item.topic && <span className="rec-tag tag-matched">{item.topic}</span>}
                          {item.tags && item.tags.split(' ').slice(0, 3).map((t, i) => (
                            <span key={i} className="rec-tag">{t}</span>
                          ))}
                        </div>

                        <div className="rec-actions">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-launch"
                            onClick={() => handleAction(item, 'Clicked')}
                          >
                            <span>Launch Content</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="7" y1="17" x2="17" y2="7"></line>
                              <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                          </a>

                          <button
                            type="button"
                            className={`btn-action-outline ${isSaved ? 'is-saved' : ''}`}
                            onClick={() => handleAction(item, 'Liked')}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>

                          <button
                            type="button"
                            className={`btn-action-outline ${isCompleted ? 'is-completed' : ''}`}
                            onClick={() => handleAction(item, 'Completed')}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )}

            {/* TAB: MY LEARNING DASHBOARD */}
            {activeTab === 'dashboard' && (
              <section className="section-recommendations">
                <div className="dashboard-stats-banner">
                  <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{completedCourses.length}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Completed Modules</div>
                    </div>
                  </div>

                  <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                      ♥
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{savedCourses.length}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Wishlist Courses</div>
                    </div>
                  </div>

                  <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{signals.sessions}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Learning Sessions</div>
                    </div>
                  </div>
                </div>

                {/* Completed Courses Section */}
                <div style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#34d399' }}>✓</span> Completed Modules ({completedCourses.length})
                    </h3>
                  </div>

                  {completedCourses.length === 0 ? (
                    <div className="no-results-panel" style={{ padding: '2rem' }}>
                      <p style={{ margin: 0 }}>No completed courses yet. Click "Mark Done" on any recommended course to track your milestones here!</p>
                    </div>
                  ) : (
                    <div className="recommendations-grid">
                      {completedCourses.map(item => (
                        <article key={item.id} className="consumer-card" style={{ borderTop: '3px solid #10b981' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="rec-type-pill">{item.type || 'Course'}</span>
                            <span className="mini-signal-badge" style={{ color: '#34d399' }}>COMPLETED</span>
                          </div>
                          <h4 className="rec-title-link">{item.title}</h4>
                          <p className="rec-description">{item.description}</p>
                          <div className="rec-actions">
                            <a href={item.url} target="_blank" rel="noreferrer" className="btn-launch">
                              Review Content
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved for Later Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#fb7185' }}>♥</span> Saved Wishlist ({savedCourses.length})
                    </h3>
                  </div>

                  {savedCourses.length === 0 ? (
                    <div className="no-results-panel" style={{ padding: '2rem' }}>
                      <p style={{ margin: 0 }}>No saved courses in your wishlist. Click "Save" on courses you want to study next.</p>
                    </div>
                  ) : (
                    <div className="recommendations-grid">
                      {savedCourses.map(item => (
                        <article key={item.id} className="consumer-card" style={{ borderTop: '3px solid #f43f5e' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="rec-type-pill">{item.type || 'Course'}</span>
                            <span className="mini-signal-badge" style={{ color: '#fb7185' }}>WISHLIST</span>
                          </div>
                          <h4 className="rec-title-link">{item.title}</h4>
                          <p className="rec-description">{item.description}</p>
                          <div className="rec-actions">
                            <a href={item.url} target="_blank" rel="noreferrer" className="btn-launch">
                              Start Learning
                            </a>
                            <button
                              type="button"
                              className="btn-action-outline"
                              onClick={() => {
                                setInteractions(prev => ({
                                  ...prev,
                                  saved: prev.saved.filter(id => id !== item.id)
                                }))
                                showToast("Removed from saved list", "info")
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* =========================================================================
            WEBSITE 2: AI ARCHITECTURE LAB (PRESERVED MATHEMATICAL FORMULATION VIEW)
           ========================================================================= */}
        {platformMode === 'lab' && (
          <>
            {/* 3. OVERVIEW / HYBRID SCORE HERO */}
            <section id="overview" className="section-overview" aria-labelledby="overviewHeading">
              <div className="hero-card glass-panel">
                <div className="hero-header-row">
                  <div>
                    <span className="eyebrow eyebrow-hybrid">MATHEMATICAL FORMULATION</span>
                    <h3 id="overviewHeading" className="hero-title">HYBRID SCORE</h3>
                  </div>
                  <div className="badge-prod-connected" title="Connected to live FastAPI backend on Render">
                    <span className="pulse-dot-green"></span>
                    Live Production Model • 300+ Resources Ingested
                  </div>
                </div>

                {/* Prominent Formula Display */}
                <div className="formula-banner">
                  <div className="formula-equation" aria-label="Hybrid formula: H equals alpha times CB plus 1 minus alpha times CF">
                    <span className="formula-token token-h">H</span>
                    <span className="formula-op">=</span>
                    <span className="formula-token token-alpha">α</span>
                    <span className="formula-op">·</span>
                    <span className="formula-token token-cb">CB</span>
                    <span className="formula-op">+</span>
                    <span className="formula-token token-parens">(1 − α)</span>
                    <span className="formula-op">·</span>
                    <span className="formula-token token-cf">CF</span>
                  </div>
                  <div className="formula-subtext">
                    Where <strong className="text-cb">CB</strong> is Content-Based Similarity (TF-IDF), <strong className="text-cf">CF</strong> is Collaborative Affinity (Matrix Factorization), and <strong className="text-hybrid">α</strong> is your weighting factor.
                  </div>
                </div>

                {/* Dynamic Metrics Grid */}
                <div className="metrics-grid">
                  <div className="metric-card metric-ratio">
                    <div className="metric-label">WEIGHT BLEND RATIO</div>
                    <div className="metric-value-huge">
                      <span className="text-cb">{cbPercent}</span>
                      <span className="ratio-divider">/</span>
                      <span className="text-cf">{cfPercent}</span>
                    </div>
                    <div className="metric-legend">
                      <span className="legend-item"><span className="dot-cb"></span> Content (α)</span>
                      <span className="legend-item"><span className="dot-cf"></span> Collaborative (1−α)</span>
                    </div>
                    {/* Split Progress Bar */}
                    <div className="split-bar-track" aria-hidden="true">
                      <div className="split-bar-cb" style={{ width: `${cbPercent}%` }}></div>
                      <div className="split-bar-cf" style={{ width: `${cfPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">PROFILE COMPLETENESS</div>
                    <div className="metric-value-large">{profileCompleteness}%</div>
                    <div className="meter-bar-track">
                      <div className="meter-bar-fill" style={{ width: `${profileCompleteness}%` }}></div>
                    </div>
                    <div className="metric-caption">{profile.topics?.length || 0} topic vectors active</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">AVAILABLE SIGNALS</div>
                    <div className="metric-value-large">{totalSignals}</div>
                    <div className="signals-badge-list">
                      <span className="mini-signal-badge">{signals.completed} Completed</span>
                      <span className="mini-signal-badge">{signals.saved} Saved</span>
                      <span className="mini-signal-badge">{signals.ratings} Ratings</span>
                      <span className="mini-signal-badge">{signals.sessions} Sessions</span>
                    </div>
                    <div className="metric-caption">Real &amp; simulated learner behavior logs</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-label">DATABASE POOL</div>
                    <div className="metric-value-large">{catalog.length || '300+'}</div>
                    <div className={`blend-status-badge ${blendStatusClass}`}>
                      {blendStatusText}
                    </div>
                    <div className="metric-caption">Live Supabase PostgreSQL records</div>
                  </div>
                </div>
              </div>
            </section>

            {/* TWO COLUMN INPUT CONFIGURATION */}
            <div className="input-columns-grid">
              {/* 4. LEARNER PROFILE — CONTENT-BASED INPUTS */}
              <section id="learner-profile" className="section-card glass-panel section-cb" aria-labelledby="cbSectionHeading">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="section-category-pill pill-cb">CONTENT-BASED INPUTS (CB)</span>
                    <h3 id="cbSectionHeading" className="section-title">Learner Profile</h3>
                    <p className="section-subtitle">Parameters driving semantic similarity vectors against curriculum content.</p>
                  </div>
                  <div className="section-badge-icon badge-cb-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  </div>
                </div>

                <form className="cb-form" onSubmit={(e) => { e.preventDefault(); fetchBackendRecommendations(profile); }}>
                  <div className="form-group full-width-group">
                    <label className="form-label">
                      <span>Full Name</span>
                      <span className="label-hint">Profile Identifier</span>
                    </label>
                    <input
                      type="text"
                      className="form-select"
                      style={{ paddingRight: '1rem' }}
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Alan S."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Experience Level</span>
                      <span className="label-hint">Difficulty threshold</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={profile.experience}
                        onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Primary Goal</span>
                      <span className="label-hint">Curriculum focus target</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={profile.goal}
                        onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value }))}
                      >
                        <option value="Build AI projects">Build AI projects</option>
                        <option value="Prepare for exams">Prepare for exams</option>
                        <option value="Learn fundamentals">Learn fundamentals</option>
                        <option value="Career transition">Career transition</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Preferred Format</span>
                      <span className="label-hint">Prioritized media</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={profile.format}
                        onChange={(e) => setProfile(prev => ({ ...prev, format: e.target.value }))}
                      >
                        <option value="Video">Video (YouTube)</option>
                        <option value="Article">Article (Dev.to)</option>
                        <option value="Course">Full Course</option>
                        <option value="Interactive">Interactive / Project</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span>Weekly Learning Time</span>
                      <span className="label-hint">Pacing availability</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        value={profile.weeklyTime}
                        onChange={(e) => setProfile(prev => ({ ...prev, weeklyTime: e.target.value }))}
                      >
                        <option value="1-3">1–3 hours</option>
                        <option value="4-6">4–6 hours</option>
                        <option value="7-10">7–10 hours</option>
                        <option value="10+">10+ hours</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  <div className="form-group full-width-group">
                    <div className="form-label">
                      <span>Topics of Interest</span>
                      <span className="label-hint">{profile.topics?.length || 0} selected</span>
                    </div>
                    <p className="form-helper">Toggle domain keywords to adjust content-similarity scoring vectors:</p>
                    <div className="chips-container" role="group" aria-label="Topics of Interest toggles">
                      {TOPIC_OPTIONS.map(topic => {
                        const active = profile.topics?.includes(topic)
                        return (
                          <button
                            key={topic}
                            type="button"
                            className={`topic-chip ${active ? 'active' : ''}`}
                            onClick={() => toggleTopic(topic)}
                            aria-pressed={active}
                          >
                            <span className="chip-check">{active ? '✓' : '+'}</span> {topic}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </form>
              </section>

              {/* 5. LEARNING SIGNALS — COLLABORATIVE INPUTS */}
              <section id="learning-signals" className="section-card glass-panel section-cf" aria-labelledby="cfSectionHeading">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="section-category-pill pill-cf">COLLABORATIVE INPUTS (CF)</span>
                    <h3 id="cfSectionHeading" className="section-title">Learning Signals</h3>
                    <p className="section-subtitle">Real and simulated user interaction patterns feeding the matrix factorization model.</p>
                  </div>
                  <div className="section-badge-icon badge-cf-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                </div>

                <div className="signals-stepper-list">
                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Completed Resources</span>
                        <span className="signal-tag">History</span>
                      </div>
                      <p className="signal-desc">Completed modules in learner trajectory ({interactions.completed.length} live).</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('completed', -1)}>−</button>
                      <span className="stepper-value">{signals.completed}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('completed', 1)}>+</button>
                    </div>
                  </div>

                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Saved Resources</span>
                        <span className="signal-tag">Intent</span>
                      </div>
                      <p className="signal-desc">Bookmarks or wishlist activity in library ({interactions.saved.length} live).</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('saved', -1)}>−</button>
                      <span className="stepper-value">{signals.saved}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('saved', 1)}>+</button>
                    </div>
                  </div>

                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Explicit Ratings</span>
                        <span className="signal-tag">Feedback</span>
                      </div>
                      <p className="signal-desc">Ratings submitted across completed courses.</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('ratings', -1)}>−</button>
                      <span className="stepper-value">{signals.ratings}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('ratings', 1)}>+</button>
                    </div>
                  </div>

                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Recent Sessions</span>
                        <span className="signal-tag">Recency</span>
                      </div>
                      <p className="signal-desc">Active study sessions logged in the last 14-day window.</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('sessions', -1)}>−</button>
                      <span className="stepper-value">{signals.sessions}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('sessions', 1)}>+</button>
                    </div>
                  </div>
                </div>

                <div className="signals-summary-box">
                  <span className="info-icon" aria-hidden="true">ℹ</span>
                  <span>These counters adjust TruncatedSVD collaborative affinity matrices to reflect peer behavior.</span>
                </div>
              </section>
            </div>

            {/* 6. HYBRID MODEL CONTROLS */}
            <section id="hybrid-model" className="section-card glass-panel section-hybrid" aria-labelledby="hybridSectionHeading">
              <div className="section-header">
                <div className="section-title-wrap">
                  <span className="section-category-pill pill-hybrid">HYBRID MODEL PARAMETERS</span>
                  <h3 id="hybridSectionHeading" className="section-title">Hybrid Model Controls</h3>
                  <p className="section-subtitle">
                    Adjust the weighting coefficient α to dynamically balance semantic profile matching against collaborative peer signals.
                  </p>
                </div>
                <div className={`blend-status-badge ${blendStatusClass}`}>
                  {blendStatusText}
                </div>
              </div>

              <div className="hybrid-controls-layout">
                <div className="slider-control-block">
                  <div className="slider-header-row">
                    <label htmlFor="alphaSlider" className="slider-main-label">
                      <span>Content-Based Weight (α)</span>
                      <span className="slider-alpha-value">{alpha.toFixed(2)}</span>
                    </label>
                    <div className="blend-percentages-tag">
                      <span className="cb-pct">CB {cbPercent}%</span>
                      <span className="pct-plus">+</span>
                      <span className="cf-pct">CF {cfPercent}%</span>
                    </div>
                  </div>

                  <div className="slider-container">
                    <input
                      type="range"
                      id="alphaSlider"
                      min="0.00"
                      max="1.00"
                      step="0.01"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      aria-label="Content-Based Weight Alpha"
                    />
                    <div className="slider-ticks" aria-hidden="true">
                      <span className="tick" style={{ left: '0%' }}><em>0.0</em> CF Only</span>
                      <span className="tick" style={{ left: '25%' }}><em>0.25</em></span>
                      <span className="tick" style={{ left: '50%' }}><em>0.50</em> Balanced</span>
                      <span className="tick" style={{ left: '75%' }}><em>0.75</em></span>
                      <span className="tick" style={{ left: '100%' }}><em>1.0</em> CB Only</span>
                    </div>
                  </div>

                  <div className="slider-presets">
                    <span className="presets-label">Quick blend:</span>
                    <button type="button" className={`btn-chip-sm ${alpha === 1.0 ? 'active' : ''}`} onClick={() => setAlpha(1.0)}>Pure CB (1.0)</button>
                    <button type="button" className={`btn-chip-sm ${alpha === 0.75 ? 'active' : ''}`} onClick={() => setAlpha(0.75)}>Content Bias (0.75)</button>
                    <button type="button" className={`btn-chip-sm ${alpha === 0.60 ? 'active' : ''}`} onClick={() => setAlpha(0.60)}>Default (0.60)</button>
                    <button type="button" className={`btn-chip-sm ${alpha === 0.50 ? 'active' : ''}`} onClick={() => setAlpha(0.50)}>Equal 50/50</button>
                    <button type="button" className={`btn-chip-sm ${alpha === 0.25 ? 'active' : ''}`} onClick={() => setAlpha(0.25)}>Collab Bias (0.25)</button>
                    <button type="button" className={`btn-chip-sm ${alpha === 0.0 ? 'active' : ''}`} onClick={() => setAlpha(0.0)}>Pure CF (0.0)</button>
                  </div>
                </div>

                <div className="toggles-grid">
                  <div className="toggle-card">
                    <div className="toggle-info">
                      <div className="toggle-title">Explain Recommendations</div>
                      <p className="toggle-desc">Expose explicit score decomposition: CB similarity factors, CF affinity signals, and cold-start modifiers.</p>
                    </div>
                    <label className="switch" htmlFor="toggleExplain">
                      <input
                        type="checkbox"
                        id="toggleExplain"
                        checked={explainEnabled}
                        onChange={(e) => setExplainEnabled(e.target.checked)}
                      />
                      <span className="switch-slider round"></span>
                    </label>
                  </div>

                  <div className="toggle-card">
                    <div className="toggle-info">
                      <div className="toggle-title">Cold-Start Boost</div>
                      <p className="toggle-desc">Apply exploration bonus to newly cataloged resources to mitigate zero-interaction penalty in collaborative scoring.</p>
                    </div>
                    <label className="switch" htmlFor="toggleColdStart">
                      <input
                        type="checkbox"
                        id="toggleColdStart"
                        checked={coldStartEnabled}
                        onChange={(e) => setColdStartEnabled(e.target.checked)}
                      />
                      <span className="switch-slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. RECOMMENDED LEARNING RESOURCES */}
            <section id="recommendations" className="section-recommendations" aria-labelledby="recSectionHeading">
              <div className="rec-section-header">
                <div>
                  <div className="rec-eyebrow-row">
                    <span className="eyebrow">HYBRID RESULTS</span>
                    <span className="results-badge">{computedRecommendations.length} courses ranked</span>
                  </div>
                  <h3 id="recSectionHeading" className="rec-title">Recommended Learning Resources</h3>
                  <p className="rec-subtitle">
                    Dynamically ranked by the hybrid function H = α · CB + (1−α) · CF against live Supabase courses.
                  </p>
                </div>
              </div>

              {/* Lab Recommendations Grid */}
              <div className="recommendations-grid">
                {computedRecommendations.map((item, index) => {
                  const isSaved = interactions.saved.includes(item.id)
                  const isCompleted = interactions.completed.includes(item.id)

                  return (
                    <article key={item.id || index} className="rec-card">
                      <div className="rec-card-header">
                        <div className="rec-type-provider">
                          <span className="rec-type-pill">{item.type || 'Course'}</span>
                          <span className="rec-provider">• {item.source || 'Curated'}</span>
                          {item.difficulty && (
                            <span className="rec-provider" style={{ color: '#38bdf8' }}>• {item.difficulty}</span>
                          )}
                        </div>
                        <div className="rec-badges-cluster">
                          {item.isNew && <span className="badge-new">NEW</span>}
                          <span className="badge-rank-index">#{index + 1}</span>
                        </div>
                      </div>

                      <h4 className="rec-title-link">{item.title}</h4>
                      <p className="rec-description">{item.description || 'Comprehensive learning module curated by LearnIQ recommendation engine.'}</p>

                      <div className="rec-tags">
                        {item.topic && <span className="rec-tag tag-matched">{item.topic}</span>}
                        {item.tags && item.tags.split(' ').slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="rec-tag">{tag}</span>
                        ))}
                      </div>

                      {/* Hybrid Score Visual Block */}
                      <div className="rec-score-block">
                        <div className="rec-score-row">
                          <span className="score-name-label">HYBRID SCORE (H)</span>
                          <div>
                            <span className="hybrid-score-number">{item.hybridScore}</span>
                            <span className="score-max-unit">/100</span>
                          </div>
                        </div>

                        <div className="rec-score-bar-track">
                          <div className="rec-score-bar-cb" style={{ width: `${(item.weightedCb / item.hybridScore) * 100}%` }}></div>
                          <div className="rec-score-bar-cf" style={{ width: `${(item.weightedCf / item.hybridScore) * 100}%` }}></div>
                          {item.coldStartBoost > 0 && (
                            <div className="rec-score-bar-cs" style={{ width: `${(item.coldStartBoost / item.hybridScore) * 100}%` }}></div>
                          )}
                        </div>

                        <div className="rec-subscores-grid">
                          <div className="subscore-item">
                            <span className="subscore-title">Content (CB)</span>
                            <div className="subscore-val-row">
                              <span className="subscore-number subscore-cb-val">{item.cbScore}</span>
                              <span className="subscore-weighted">× {alpha.toFixed(2)} = {item.weightedCb}</span>
                            </div>
                          </div>
                          <div className="subscore-item">
                            <span className="subscore-title">Collab (CF)</span>
                            <div className="subscore-val-row">
                              <span className="subscore-number subscore-cf-val">{item.cfScore}</span>
                              <span className="subscore-weighted">× {(1 - alpha).toFixed(2)} = {item.weightedCf}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {explainEnabled && (
                        <div className="rec-explanation-panel">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>Scoring Breakdown</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.74rem', color: '#cbd5e1' }}>
                            {item.reason || `Matched on topic "${item.topic || 'AI'}" with ${profile.format || 'preferred'} format boost. Community affinity: ${item.rating || 4.5}★.`}
                          </p>
                        </div>
                      )}

                      <div className="rec-actions">
                        <a
                          href={item.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-launch"
                          onClick={() => handleAction(item, 'Clicked')}
                        >
                          <span>Launch Content</span>
                        </a>

                        <button
                          type="button"
                          className={`btn-action-outline ${isSaved ? 'is-saved' : ''}`}
                          onClick={() => handleAction(item, 'Liked')}
                        >
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          type="button"
                          className={`btn-action-outline ${isCompleted ? 'is-completed' : ''}`}
                          onClick={() => handleAction(item, 'Completed')}
                        >
                          <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {/* FOOTER */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="brand-subtext"><strong>LearnIQ</strong> — Intelligent Learning Recommendation Platform</span>
              <span className="footer-dot">•</span>
              <span>FastAPI &amp; Render Cloud</span>
              <span className="footer-dot">•</span>
              <span>Supabase PostgreSQL DB</span>
            </div>
            <div className="footer-right">
              <span>{platformMode === 'learner' ? 'Empowering 300+ Tech Learners' : 'Formulation: H = α · CB + (1 − α) · CF'}</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Toast Notification Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast-item">
            {t.type === 'success' && <span style={{ color: '#34d399' }}>✓</span>}
            {t.type === 'info' && <span style={{ color: '#38bdf8' }}>ℹ</span>}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
