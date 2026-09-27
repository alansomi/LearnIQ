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

// Preset Profiles
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
  // Navigation: 'workspace', 'catalog', 'dashboard'
  const [activeTab, setActiveTab] = useState('workspace')
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

  // Simulated & Real Signals
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

  // Hybrid Model Weights & Toggles
  const [alpha, setAlpha] = useState(0.60) // 0.0 to 1.0 (Content-Based Weight)
  const [explainEnabled, setExplainEnabled] = useState(true)
  const [coldStartEnabled, setColdStartEnabled] = useState(true)

  // Live Data & Loading
  const [catalog, setCatalog] = useState([])
  const [rawBackendRecs, setRawBackendRecs] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [toasts, setToasts] = useState([])

  // Search & Filters in Recommendations and Catalog
  const [recSearch, setRecSearch] = useState('')
  const [recTopicFilter, setRecTopicFilter] = useState('all')
  const [recSortBy, setRecSortBy] = useState('hybrid')

  const [catSearch, setCatSearch] = useState('')
  const [catTopicFilter, setCatTopicFilter] = useState('all')
  const [catTypeFilter, setCatTypeFilter] = useState('all')
  const [catDifficultyFilter, setCatDifficultyFilter] = useState('all')

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('learniq_profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('learniq_interactions', JSON.stringify(interactions))
    // Keep signals in sync with real actions
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
      // 1. Ensure student profile exists in backend DB
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

      // 2. Query recommendations endpoint
      const recsRes = await fetch(`${API_BASE}/recommendations/${student_id}?top_n=20`)
      if (recsRes.ok) {
        const data = await recsRes.json()
        setRawBackendRecs(data.recommendations || [])
        showToast("AI Recommendations updated from live model!", "success")
      }
    } catch (err) {
      console.error("Recommendation fetch error:", err)
      showToast("Live engine sleeping or reconnecting. Using catalog fallback.", "info")
    } finally {
      setLoadingRecs(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchCatalogData()
    fetchBackendRecommendations(profile)
  }, [])

  // Log action (Launch Content, Save, Mark Done)
  const handleAction = async (resource, actionType) => {
    if (actionType === 'Liked') {
      const alreadySaved = interactions.saved.includes(resource.id)
      if (alreadySaved) return
      setInteractions(prev => ({
        ...prev,
        saved: [...new Set([...prev.saved, resource.id])]
      }))
      showToast(`Saved "${resource.title.slice(0, 30)}..." to your Dashboard`, 'success')
    } else if (actionType === 'Completed') {
      const alreadyDone = interactions.completed.includes(resource.id)
      if (alreadyDone) return
      setInteractions(prev => ({
        ...prev,
        completed: [...new Set([...prev.completed, resource.id])]
      }))
      showToast(`Marked "${resource.title.slice(0, 30)}..." as Completed!`, 'success')
    } else if (actionType === 'Clicked') {
      showToast(`Opening course external content...`, 'info')
    }

    // Push interaction to live Render backend
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

  // Handle Steppers
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

  // Load Preset
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

  // DYNAMIC RECOMMENDATIONS HYBRID SCORING ENGINE (H = α · CB + (1 − α) · CF)
  const computedRecommendations = useMemo(() => {
    // If backend recommendations are available, we enrich them; otherwise we score the catalog directly
    const pool = rawBackendRecs.length > 0 ? rawBackendRecs : catalog

    if (!pool || pool.length === 0) return []

    const userTopics = profile.topics || []
    const preferredFormat = profile.format || 'Video'
    const userExp = profile.experience || 'Intermediate'

    return pool.map((item, idx) => {
      // 1. Content-Based Score (CB): 0 to 100
      let cb = 70.0 // baseline
      if (item.score !== undefined) {
        cb = Math.min(100, Math.max(35, Math.round(item.score * 100)))
      } else {
        // Deterministic content matching against profile facets
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

      // 2. Collaborative Filtering Score (CF): 0 to 100
      // Based on item rating and peer learning signals
      const baseRating = item.rating ? (item.rating / 5.0) * 80.0 : 75.0
      const signalAffinity = Math.min(20.0, (signals.completed * 1.5 + signals.saved * 1.0 + signals.ratings * 1.2 + signals.sessions * 0.8))
      let cf = baseRating + (signalAffinity * 0.5)
      cf = Math.min(98.0, Math.max(35.0, cf))

      // 3. Cold Start Modifier
      let coldStartBoost = 0
      const isNewResource = item.source === 'Dev.to' || (item.id && String(item.id).startsWith('res-new'))
      if (coldStartEnabled && isNewResource) {
        coldStartBoost = 4.5
      }

      // 4. Mathematical Hybrid Score: H = α · CB + (1 − α) · CF + ColdStart
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
        isNew: isNewResource
      }
    })
  }, [rawBackendRecs, catalog, profile, signals, alpha, coldStartEnabled])

  // Filter & Sort Recommendations
  const filteredRecommendations = useMemo(() => {
    let result = [...computedRecommendations]

    // Search query filter
    if (recSearch.trim()) {
      const q = recSearch.toLowerCase()
      result = result.filter(r =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.topic && r.topic.toLowerCase().includes(q)) ||
        (r.tags && r.tags.toLowerCase().includes(q))
      )
    }

    // Topic pill filter
    if (recTopicFilter !== 'all') {
      result = result.filter(r =>
        (r.topic && r.topic.toLowerCase() === recTopicFilter.toLowerCase()) ||
        (r.tags && r.tags.toLowerCase().includes(recTopicFilter.toLowerCase()))
      )
    }

    // Sorting
    if (recSortBy === 'hybrid') {
      result.sort((a, b) => b.hybridScore - a.hybridScore)
    } else if (recSortBy === 'cb') {
      result.sort((a, b) => b.cbScore - a.cbScore)
    } else if (recSortBy === 'cf') {
      result.sort((a, b) => b.cfScore - a.cfScore)
    }

    return result
  }, [computedRecommendations, recSearch, recTopicFilter, recSortBy])

  // Filtered Catalog Items
  const filteredCatalog = useMemo(() => {
    let list = [...catalog]

    if (catSearch.trim()) {
      const q = catSearch.toLowerCase()
      list = list.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.topic && c.topic.toLowerCase().includes(q))
      )
    }

    if (catTopicFilter !== 'all') {
      list = list.filter(c => c.topic && c.topic.toLowerCase().includes(catTopicFilter.toLowerCase()))
    }

    if (catTypeFilter !== 'all') {
      list = list.filter(c => c.type && c.type.toLowerCase() === catTypeFilter.toLowerCase())
    }

    if (catDifficultyFilter !== 'all') {
      list = list.filter(c => c.difficulty && c.difficulty.toLowerCase() === catDifficultyFilter.toLowerCase())
    }

    return list
  }, [catalog, catSearch, catTopicFilter, catTypeFilter, catDifficultyFilter])

  // Saved & Completed Lists
  const savedCourses = useMemo(() => {
    return catalog.filter(c => interactions.saved.includes(c.id))
  }, [catalog, interactions.saved])

  const completedCourses = useMemo(() => {
    return catalog.filter(c => interactions.completed.includes(c.id))
  }, [catalog, interactions.completed])

  const cbPercent = Math.round(alpha * 100)
  const cfPercent = Math.round((1 - alpha) * 100)

  // Blend Badge Text
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
          <div className="brand-cluster" onClick={() => setActiveTab('workspace')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">LearnIQ</h1>
              <p className="brand-tagline">AI Recommendation Lab</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-label">WORKSPACE</div>
          <ul className="nav-list">
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
                <span>Hybrid Workspace</span>
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
                <span>Full Catalog</span>
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
          </ul>

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
        </nav>

        {/* Sidebar Status Panel */}
        <div className="sidebar-status-panel">
          <div className="status-indicator-row">
            <span className="pulse-dot-green" aria-hidden="true"></span>
            <span className="status-headline" style={{ color: '#34d399' }}>Live Engine Connected</span>
          </div>
          <p className="status-body">
            Render FastAPI &amp; Supabase PostgreSQL are active with {catalog.length || 300}+ verified resources. Recommendations blend semantic TF-IDF with Collaborative TruncatedSVD.
          </p>
          <div className="status-meta">
            <span>Model: Hybrid v2.4 (Joblib)</span>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="main-content" id="mainContent">
        {/* Top Mobile Navbar */}
        <header className="mobile-navbar">
          <div className="brand-cluster">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-title">LearnIQ</span>
            <span className="badge-subtle">PRO</span>
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

        {/* WORKSPACE HEADER */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>LearnIQ System</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">
                {activeTab === 'workspace' && 'Recommendation Engine'}
                {activeTab === 'catalog' && 'Full Resource Catalog'}
                {activeTab === 'dashboard' && 'Learner Dashboard'}
              </span>
              <span className="badge-prod-connected">
                <span className="pulse-dot-green"></span>
                RENDER &amp; SUPABASE LIVE
              </span>
            </div>
            <h2 className="workspace-title">
              {activeTab === 'workspace' && 'Hybrid Recommendation Workspace'}
              {activeTab === 'catalog' && 'Live Course & Article Catalog'}
              {activeTab === 'dashboard' && 'Personal Learning Dashboard'}
            </h2>
            <p className="workspace-description">
              {activeTab === 'workspace' && 'Configure learner attributes, calibrate peer behavioral signals, and interactively explore hybrid rankings.'}
              {activeTab === 'catalog' && `Explore all ${catalog.length} curated resources from YouTube and Dev.to currently stored in your live cloud database.`}
              {activeTab === 'dashboard' && 'Track your saved reading list, completed learning modules, and personal milestones.'}
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              title="Restore all parameters to their initial default values"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              <span>Reset</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={loadingRecs}
              onClick={() => {
                fetchBackendRecommendations(profile)
                const recSec = document.getElementById('recommendations')
                if (recSec) recSec.scrollIntoView({ behavior: 'smooth' })
              }}
              title="Query the live model and update recommendations"
            >
              <svg className={loadingRecs ? "spinner-spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>{loadingRecs ? 'Running Model...' : 'Generate Recommendations'}</span>
            </button>
          </div>
        </header>

        {/* TAB 1: WORKSPACE VIEW */}
        {activeTab === 'workspace' && (
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
                  {/* Name Input */}
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

                  {/* Experience Level */}
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

                  {/* Primary Goal */}
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

                  {/* Preferred Format */}
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

                  {/* Weekly Learning Time */}
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

                  {/* Topics of Interest */}
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
                  {/* Signal 1: Completed Resources */}
                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Completed Resources</span>
                        <span className="signal-tag">History</span>
                      </div>
                      <p className="signal-desc">Completed modules in learner trajectory ({interactions.completed.length} live).</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>−</button>
                      <span className="stepper-value">{signals.completed}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>+</button>
                    </div>
                  </div>

                  {/* Signal 2: Saved Resources */}
                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Saved Resources</span>
                        <span className="signal-tag">Intent</span>
                      </div>
                      <p className="signal-desc">Bookmarks or wishlist activity in library ({interactions.saved.length} live).</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>−</button>
                      <span className="stepper-value">{signals.saved}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>+</button>
                    </div>
                  </div>

                  {/* Signal 3: Explicit Ratings */}
                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Explicit Ratings</span>
                        <span className="signal-tag">Feedback</span>
                      </div>
                      <p className="signal-desc">Ratings submitted across completed courses.</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>−</button>
                      <span className="stepper-value">{signals.ratings}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>+</button>
                    </div>
                  </div>

                  {/* Signal 4: Recent Sessions */}
                  <div className="signal-card">
                    <div className="signal-info">
                      <div className="signal-label-row">
                        <span className="signal-title">Recent Sessions</span>
                        <span className="signal-tag">Recency</span>
                      </div>
                      <p className="signal-desc">Active study sessions logged in the last 14-day window.</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>−</button>
                      <span className="stepper-value">{signals.sessions}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal()}>+</button>
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
                {/* Alpha Slider Block */}
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

                  {/* Custom Slider Track */}
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

                  {/* Quick Blend Presets */}
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

                {/* Feature Toggles */}
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
                    <span className="results-badge">{filteredRecommendations.length} courses ranked</span>
                  </div>
                  <h3 id="recSectionHeading" className="rec-title">Recommended Learning Resources</h3>
                  <p className="rec-subtitle">
                    Dynamically ranked by the hybrid function H = α · CB + (1−α) · CF against live Supabase courses.
                  </p>
                </div>

                {/* Toolbar */}
                <div className="rec-controls-toolbar">
                  <div className="search-box">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter by title, topic..."
                      value={recSearch}
                      onChange={(e) => setRecSearch(e.target.value)}
                    />
                  </div>

                  <div className="sort-control-group">
                    <label className="sort-label">Sort by:</label>
                    <div className="select-wrapper">
                      <select
                        className="form-select form-select-sm"
                        value={recSortBy}
                        onChange={(e) => setRecSortBy(e.target.value)}
                      >
                        <option value="hybrid">Hybrid Score (H) ↓</option>
                        <option value="cb">Content Score (CB) ↓</option>
                        <option value="cf">Collaborative Score (CF) ↓</option>
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic Filter Pills */}
              <div className="rec-filter-pills" role="toolbar">
                <button
                  type="button"
                  className={`filter-pill ${recTopicFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setRecTopicFilter('all')}
                >
                  All Topics
                </button>
                {TOPIC_OPTIONS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    className={`filter-pill ${recTopicFilter === topic ? 'active' : ''}`}
                    onClick={() => setRecTopicFilter(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Recommendations Grid */}
              <div className="recommendations-grid">
                {filteredRecommendations.map((item, index) => {
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

                        {/* Progress Bar showing CB and CF contribution */}
                        <div className="rec-score-bar-track">
                          <div className="rec-score-bar-cb" style={{ width: `${(item.weightedCb / item.hybridScore) * 100}%` }}></div>
                          <div className="rec-score-bar-cf" style={{ width: `${(item.weightedCf / item.hybridScore) * 100}%` }}></div>
                          {item.coldStartBoost > 0 && (
                            <div className="rec-score-bar-cs" style={{ width: `${(item.coldStartBoost / item.hybridScore) * 100}%` }}></div>
                          )}
                        </div>

                        {/* Sub-scores */}
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

                      {/* Explanation Accordion */}
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

                      {/* Action Buttons */}
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

              {filteredRecommendations.length === 0 && (
                <div className="no-results-panel">
                  <div className="no-results-icon">🔍</div>
                  <h4>No matching recommendations found</h4>
                  <p>Try clearing your search query or selecting "All Topics" to see active recommendations.</p>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setRecSearch(''); setRecTopicFilter('all'); }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* TAB 2: FULL CATALOG VIEW */}
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
                    placeholder="Search 300+ courses by title, topic, keywords..."
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                  />
                </div>

                <div className="select-wrapper" style={{ minWidth: 160 }}>
                  <select
                    className="form-select"
                    value={catTypeFilter}
                    onChange={(e) => setCatTypeFilter(e.target.value)}
                  >
                    <option value="all">All Formats</option>
                    <option value="Video">Videos</option>
                    <option value="Article">Articles</option>
                    <option value="Course">Courses</option>
                    <option value="Tutorial">Tutorials</option>
                  </select>
                  <span className="select-arrow" aria-hidden="true">▼</span>
                </div>

                <div className="select-wrapper" style={{ minWidth: 160 }}>
                  <select
                    className="form-select"
                    value={catDifficultyFilter}
                    onChange={(e) => setCatDifficultyFilter(e.target.value)}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <span className="select-arrow" aria-hidden="true">▼</span>
                </div>
              </div>

              {/* Topic Filters */}
              <div className="rec-filter-pills" style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  className={`filter-pill ${catTopicFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCatTopicFilter('all')}
                >
                  All Topics ({catalog.length})
                </button>
                {TOPIC_OPTIONS.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    className={`filter-pill ${catTopicFilter === topic ? 'active' : ''}`}
                    onClick={() => setCatTopicFilter(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {loadingCatalog && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                <div className="spinner-spin" style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                <p style={{ marginTop: '1rem' }}>Loading verified resources from Supabase...</p>
              </div>
            )}

            {!loadingCatalog && (
              <div className="recommendations-grid">
                {filteredCatalog.map((item, idx) => {
                  const isSaved = interactions.saved.includes(item.id)
                  const isCompleted = interactions.completed.includes(item.id)

                  return (
                    <article key={item.id || idx} className="rec-card">
                      <div className="rec-card-header">
                        <div className="rec-type-provider">
                          <span className="rec-type-pill">{item.type || 'Resource'}</span>
                          <span className="rec-provider">• {item.source || 'Verified'}</span>
                          {item.difficulty && (
                            <span className="rec-provider" style={{ color: '#38bdf8' }}>• {item.difficulty}</span>
                          )}
                        </div>
                        <span className="badge-rank-index">{item.rating ? `${item.rating} ★` : '4.8 ★'}</span>
                      </div>

                      <h4 className="rec-title-link">{item.title}</h4>
                      <p className="rec-description">{item.description || 'Comprehensive learning content from verified instructors.'}</p>

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
            )}
          </section>
        )}

        {/* TAB 3: DASHBOARD VIEW */}
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
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Saved for Later</div>
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
                  <span style={{ color: '#34d399' }}>✓</span> Completed Courses ({completedCourses.length})
                </h3>
              </div>

              {completedCourses.length === 0 ? (
                <div className="no-results-panel" style={{ padding: '2rem' }}>
                  <p style={{ margin: 0 }}>No completed courses yet. Click "Mark Done" on any recommended course to track it here!</p>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {completedCourses.map(item => (
                    <article key={item.id} className="rec-card" style={{ borderTop: '3px solid #10b981' }}>
                      <div className="rec-card-header">
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
                  <span style={{ color: '#fb7185' }}>♥</span> Saved for Later ({savedCourses.length})
                </h3>
              </div>

              {savedCourses.length === 0 ? (
                <div className="no-results-panel" style={{ padding: '2rem' }}>
                  <p style={{ margin: 0 }}>No saved courses in your wishlist. Click "Save" on courses you want to study next.</p>
                </div>
              ) : (
                <div className="recommendations-grid">
                  {savedCourses.map(item => (
                    <article key={item.id} className="rec-card" style={{ borderTop: '3px solid #f43f5e' }}>
                      <div className="rec-card-header">
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

        {/* FOOTER */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="brand-subtext"><strong>LearnIQ</strong> — Production AI Learning Resource Recommendation Platform</span>
              <span className="footer-dot">•</span>
              <span>FastAPI &amp; Render Cloud</span>
              <span className="footer-dot">•</span>
              <span>Supabase PostgreSQL DB</span>
            </div>
            <div className="footer-right">
              <span>Formulation: H = α · CB + (1 − α) · CF</span>
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
