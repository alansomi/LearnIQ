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

// Fallback catalog pool for instant zero-delay roadmap hydration
const FALLBACK_CATALOG = [
  { id: 'fb-1', title: 'Foundational Programming & Computational Logic', difficulty: 'Beginner', type: 'Course', topic: 'Python', rating: 4.8, url: 'https://developer.mozilla.org' },
  { id: 'fb-2', title: 'Mathematics, Linear Algebra & Probability Fundamentals', difficulty: 'Beginner', type: 'Video', topic: 'Machine Learning', rating: 4.9, url: 'https://khanacademy.org' },
  { id: 'fb-3', title: 'Applied Algorithms & Core Engineering Frameworks', difficulty: 'Intermediate', type: 'Course', topic: 'Software Engineering', rating: 4.8, url: 'https://github.com' },
  { id: 'fb-4', title: 'Data Pipelines, API Integration & Service Architecture', difficulty: 'Intermediate', type: 'Article', topic: 'Data Science', rating: 4.7, url: 'https://fastapi.tiangolo.com' },
  { id: 'fb-5', title: 'Advanced Scalable Architectures & Deep Systems Optimization', difficulty: 'Advanced', type: 'Course', topic: 'Systems Engineering', rating: 4.9, url: 'https://pytorch.org' },
  { id: 'fb-6', title: 'High-Performance Production Distributed Systems & Cloud Infrastructure', difficulty: 'Advanced', type: 'Video', topic: 'Cloud Computing', rating: 4.8, url: 'https://kubernetes.io' },
  { id: 'fb-7', title: 'End-to-End Enterprise Production Capstone Project', difficulty: 'Advanced', type: 'Course', topic: 'Machine Learning', rating: 4.9, url: 'https://github.com' },
  { id: 'fb-8', title: 'Automated CI/CD Delivery Pipeline & Production Deployment', difficulty: 'Advanced', type: 'Course', topic: 'DevOps', rating: 4.8, url: 'https://docs.docker.com' }
]

// Function to dynamically build a 4-stage Career Roadmap with REAL courses and live completion tracking
function buildDynamicRoadmap(targetTopic, catalog = [], completedIds = []) {
  const clean = targetTopic?.trim() || 'Machine Learning'
  const goalLower = clean.toLowerCase()
  const activePool = catalog && catalog.length > 0 ? catalog : FALLBACK_CATALOG

  // Search matching courses by topic, title, or description
  let matched = activePool.filter(c => {
    const t = (c.topic || '').toLowerCase()
    const title = (c.title || '').toLowerCase()
    const desc = (c.description || '').toLowerCase()
    return t.includes(goalLower) || title.includes(goalLower) || desc.includes(goalLower)
  })

  // Backfill if fewer than 8 matching
  if (matched.length < 8) {
    const matchedIds = new Set(matched.map(c => c.id))
    const backfill = activePool.filter(c => !matchedIds.has(c.id))
    matched = [...matched, ...backfill]
  }

  // Difficulty pools
  const beginnerPool = matched.filter(c => (c.difficulty || '').toLowerCase() === 'beginner')
  const interPool = matched.filter(c => (c.difficulty || '').toLowerCase() === 'intermediate')
  const advPool = matched.filter(c => (c.difficulty || '').toLowerCase() === 'advanced')

  const usedIds = new Set()
  const pickCourses = (primary, fallbacks, count = 2) => {
    const picked = []
    for (const c of primary) {
      if (picked.length >= count) break
      if (!usedIds.has(c.id)) {
        usedIds.add(c.id)
        picked.push(c)
      }
    }
    for (const fb of fallbacks) {
      if (picked.length >= count) break
      for (const c of fb) {
        if (picked.length >= count) break
        if (!usedIds.has(c.id)) {
          usedIds.add(c.id)
          picked.push(c)
        }
      }
    }
    return picked
  }

  const stage1Courses = pickCourses(beginnerPool, [matched, activePool], 2)
  const stage2Courses = pickCourses(interPool, [matched, activePool], 2)
  const stage3Courses = pickCourses(advPool, [matched, activePool], 2)
  const stage4Courses = pickCourses(
    matched.filter(c => c.type === 'Course' || (c.title || '').toLowerCase().includes('project') || (c.title || '').toLowerCase().includes('capstone')),
    [advPool, interPool, matched, activePool],
    2
  )

  const rawStages = [
    {
      id: 1,
      title: `Stage 1: ${clean} Core Foundations`,
      desc: `Master essential principles, foundational syntax, and core algorithms required for ${clean}.`,
      skills: [`${clean} Basics`, 'Environment Setup', 'Core Syntax'],
      courses: stage1Courses,
      topic: clean
    },
    {
      id: 2,
      title: `Stage 2: Applied ${clean} & Industry Tooling`,
      desc: `Hands-on frameworks, standard libraries, API integration, and real-world coding implementations.`,
      skills: ['Frameworks', 'Hands-on Practice', 'Standard Libraries'],
      courses: stage2Courses,
      topic: clean
    },
    {
      id: 3,
      title: `Stage 3: Advanced Architectures & Production Scaling`,
      desc: `Deep dive into system optimization, scalable architectures, and production-grade techniques.`,
      skills: ['Performance Optimization', 'System Design', 'Scaling Patterns'],
      courses: stage3Courses,
      topic: clean
    },
    {
      id: 4,
      title: `Stage 4: Portfolio Capstone & Cloud Deployment`,
      desc: `Synthesize skills in an end-to-end industry capstone with CI/CD deployment and performance testing.`,
      skills: ['Capstone Project', 'Cloud Deployment', 'Production Standards'],
      courses: stage4Courses,
      topic: clean
    }
  ]

  let prevCompleted = true
  const steps = rawStages.map((st) => {
    const totalCount = st.courses.length
    const completedCount = st.courses.filter(c => completedIds.includes(c.id)).length
    const isCompleted = totalCount > 0 && completedCount === totalCount
    const isInProgress = !isCompleted && (completedCount > 0 || prevCompleted)
    const status = isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'upcoming'
    prevCompleted = isCompleted

    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    return {
      ...st,
      totalCount,
      completedCount,
      percent,
      status
    }
  })

  const totalRoadmapCourses = steps.reduce((acc, st) => acc + st.totalCount, 0)
  const completedRoadmapCourses = steps.reduce((acc, st) => acc + st.completedCount, 0)
  const overallPercent = totalRoadmapCourses > 0 ? Math.round((completedRoadmapCourses / totalRoadmapCourses) * 100) : 0

  return {
    title: `${clean} Career Roadmap`,
    description: `A customized 4-stage technical roadmap dynamically synthesized for ${clean} with live course tracking.`,
    steps,
    totalRoadmapCourses,
    completedRoadmapCourses,
    overallPercent
  }
}


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
  const [activeTab, setActiveTab] = useState('home') // 'home', 'catalog', 'dashboard', 'roadmap'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth & Student Account State (ZERO default sample user)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState('register') // 'login' or 'register'
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authFullName, setAuthFullName] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Current logged in user (null by default for new students)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_auth_session')
      // If legacy default 'alan_s' was stored, clear it to start clean
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.username !== 'alan_s') return parsed
      }
      return null
    } catch {
      return null
    }
  })

  // Learner Profile Attributes (clean by default)
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_profile')
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved)
        if (parsed.name && parsed.name !== 'Alan S.') return parsed
      }
      return {
        name: '',
        experience: 'Beginner',
        goal: '',
        format: 'Video',
        weeklyTime: '4-6',
        topics: []
      }
    } catch {
      return { name: '', experience: 'Beginner', goal: '', format: 'Video', weeklyTime: '4-6', topics: [] }
    }
  })

  // Interactions (Saved Wishlist & Completed Modules - ZERO samples by default)
  const [interactions, setInteractions] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_interactions')
      const parsed = saved && saved !== "undefined" ? JSON.parse(saved) : null
      return parsed && parsed.saved && parsed.completed ? parsed : { saved: [], completed: [] }
    } catch {
      return { saved: [], completed: [] }
    }
  })

  // Active "Continue Learning" Course (ZERO sample progress by default!)
  const [activeCourse, setActiveCourse] = useState(() => {
    try {
      const saved = localStorage.getItem('learniq_active_course')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Active Topic / Goal typed by the user (drives recommendations & roadmap)
  const [activeSkillGoal, setActiveSkillGoal] = useState(() => {
    return profile.goal || 'Machine Learning'
  })

  // Lab Model Signals (starts from real interactions)
  const [signals, setSignals] = useState(() => ({
    completed: interactions.completed.length,
    saved: interactions.saved.length,
    ratings: 0,
    sessions: 1
  }))

  // Lab Model Controls
  const [alpha, setAlpha] = useState(0.60)
  const [explainEnabled, setExplainEnabled] = useState(true)
  const [coldStartEnabled, setColdStartEnabled] = useState(true)

  // Live Data & Loading States
  const [catalog, setCatalog] = useState([])
  const [rawBackendRecs, setRawBackendRecs] = useState([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [toasts, setToasts] = useState([])

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('learniq_profile', JSON.stringify(profile))
      localStorage.setItem('learniq_auth_session', JSON.stringify(currentUser))
    }
  }, [profile, currentUser])

  useEffect(() => {
    if (activeCourse) {
      localStorage.setItem('learniq_active_course', JSON.stringify(activeCourse))
    } else {
      localStorage.removeItem('learniq_active_course')
    }
  }, [activeCourse])

  useEffect(() => {
    localStorage.setItem('learniq_interactions', JSON.stringify(interactions))
    setSignals(prev => ({
      ...prev,
      saved: interactions.saved.length,
      completed: interactions.completed.length
    }))
  }, [interactions])

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
    try {
      const res = await fetch(`${API_BASE}/resources?limit=300`)
      if (res.ok) {
        const data = await res.json()
        setCatalog(data)
      }
    } catch (err) {
      console.error("Error fetching catalog:", err)
    }
  }

  // Fetch live recommendations from Render API for a target topic/skill
  const fetchRecommendationsForGoal = async (targetGoal, userExp, userFormat) => {
    setLoadingRecs(true)
    try {
      const postData = {
        name: currentUser?.name || 'Student',
        skill_level: userExp || profile.experience || 'Beginner',
        interest: targetGoal || 'Machine Learning',
        preferred_type: userFormat || profile.format || 'Video'
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
        showToast(`Curated learning paths for "${targetGoal}"!`, "success")
      }
    } catch (err) {
      console.error("Recommendation fetch error:", err)
    } finally {
      setLoadingRecs(false)
    }
  }

  // Initial load: Fetch Catalog
  useEffect(() => {
    fetchCatalogData()
    if (activeSkillGoal) {
      fetchRecommendationsForGoal(activeSkillGoal, profile.experience, profile.format)
    }
  }, [])

  // User Action: Search for a skill to learn
  const handleSkillSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const newGoal = searchQuery.trim()
    setActiveSkillGoal(newGoal)
    setProfile(prev => ({ ...prev, goal: newGoal }))
    fetchRecommendationsForGoal(newGoal, profile.experience, profile.format)

    const recSec = document.getElementById('curatedSection')
    if (recSec) recSec.scrollIntoView({ behavior: 'smooth' })
  }

  // User Actions (Launch, Save, Complete, Set Active)
  const handleAction = async (resource, actionType) => {
    if (actionType === 'Liked') {
      const alreadySaved = interactions.saved.includes(resource.id)
      if (alreadySaved) return
      setInteractions(prev => ({
        ...prev,
        saved: [...new Set([...prev.saved, resource.id])]
      }))
      showToast(`Saved "${resource.title.slice(0, 30)}..." to your Wishlist`, 'success')
    } else if (actionType === 'Completed' || actionType === 'ToggleComplete') {
      const alreadyDone = interactions.completed.includes(resource.id)
      if (alreadyDone && actionType === 'ToggleComplete') {
        setInteractions(prev => ({
          ...prev,
          completed: prev.completed.filter(id => id !== resource.id)
        }))
        showToast(`Unmarked "${resource.title.slice(0, 30)}..."`, 'info')
        return
      }
      if (!alreadyDone) {
        setInteractions(prev => ({
          ...prev,
          completed: [...new Set([...prev.completed, resource.id])]
        }))
        if (activeCourse && activeCourse.id === resource.id) {
          setActiveCourse(prev => ({ ...prev, progress: 100, currentLesson: 'Completed ✓' }))
        }
        showToast(`Marked "${resource.title.slice(0, 30)}..." as Completed!`, 'success')
      }
    } else if (actionType === 'Clicked') {
      // ONLY set as active in-progress course when user explicitly clicks Launch!
      setActiveCourse({
        ...resource,
        progress: 25,
        currentLesson: 'Module 1: Introduction & Principles'
      })
      showToast(`Started course: "${resource.title.slice(0, 25)}..."`, 'info')
    }

    try {
      await fetch(`${API_BASE}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: currentUser?.username || 'guest_student',
          resource_id: resource.id,
          interaction_type: actionType === 'ToggleComplete' ? 'Completed' : actionType
        })
      })
    } catch (err) {
      console.error("Could not sync interaction to backend:", err)
    }
  }

  // One-click demo student instant access
  const handleInstantDemoLogin = () => {
    const demoUser = {
      username: 'alex_demo',
      name: 'Alex Morgan',
      role: 'Verified Scholar',
      email: 'alex.morgan@learniq.edu'
    }
    const accountsDb = JSON.parse(localStorage.getItem('learniq_accounts_db') || '{}')
    if (!accountsDb['alex_demo']) {
      accountsDb['alex_demo'] = {
        ...demoUser,
        goal: activeSkillGoal || 'Machine Learning',
        saved: [],
        completed: [],
        activeCourse: null
      }
      localStorage.setItem('learniq_accounts_db', JSON.stringify(accountsDb))
    }
    const account = accountsDb['alex_demo']
    setCurrentUser(demoUser)
    setProfile(prev => ({ ...prev, name: 'Alex Morgan', goal: account.goal || activeSkillGoal || 'Machine Learning' }))
    setInteractions({ saved: account.saved || [], completed: account.completed || [] })
    if (account.activeCourse) setActiveCourse(account.activeCourse)
    localStorage.setItem('learniq_auth_session', JSON.stringify(demoUser))
    setAuthModalOpen(false)
    showToast("Signed in as Demo Student (Alex Morgan). Welcome to LearnIQ!", "success")
    fetchRecommendationsForGoal(account.goal || activeSkillGoal || 'Machine Learning', profile.experience, profile.format)
  }

  // Handle Authentication Submission (Clean account isolation!)
  const handleAuthSubmit = (e) => {
    e.preventDefault()
    if (!authUsername.trim() || !authPassword.trim()) {
      showToast("Please enter both username and password.", "info")
      return
    }

    const cleanUser = authUsername.toLowerCase().trim()
    const accountsDb = JSON.parse(localStorage.getItem('learniq_accounts_db') || '{}')

    if (authTab === 'register') {
      // Create new clean account with 0 sample data
      const newAccount = {
        username: cleanUser,
        name: authFullName.trim() || cleanUser,
        role: 'Verified Student',
        password: authPassword,
        goal: activeSkillGoal,
        saved: [],
        completed: [],
        activeCourse: null
      }
      accountsDb[cleanUser] = newAccount
      localStorage.setItem('learniq_accounts_db', JSON.stringify(accountsDb))
      localStorage.setItem('learniq_auth_session', JSON.stringify(newAccount))

      setCurrentUser(newAccount)
      setProfile(prev => ({ ...prev, name: newAccount.name, goal: activeSkillGoal }))
      setInteractions({ saved: [], completed: [] })
      setActiveCourse(null)
      setAuthModalOpen(false)
      showToast(`Welcome, ${newAccount.name}! Your account is registered and saved.`, 'success')
      fetchRecommendationsForGoal(activeSkillGoal, profile.experience, profile.format)
    } else {
      // Sign In
      const existing = accountsDb[cleanUser]
      if (existing && existing.password === authPassword) {
        setCurrentUser(existing)
        setProfile(prev => ({ ...prev, name: existing.name, goal: existing.goal || activeSkillGoal }))
        setInteractions({ saved: existing.saved || [], completed: existing.completed || [] })
        setActiveCourse(existing.activeCourse || null)
        if (existing.goal) setActiveSkillGoal(existing.goal)
        localStorage.setItem('learniq_auth_session', JSON.stringify(existing))
        setAuthModalOpen(false)
        showToast(`Welcome back, ${existing.name}!`, 'success')
        fetchRecommendationsForGoal(existing.goal || activeSkillGoal, profile.experience, profile.format)
      } else {
        // Allow instant sign-in for demonstration
        const fallbackUser = { username: cleanUser, name: authFullName.trim() || cleanUser, role: 'Verified Student' }
        setCurrentUser(fallbackUser)
        localStorage.setItem('learniq_auth_session', JSON.stringify(fallbackUser))
        setAuthModalOpen(false)
        showToast(`Signed in as ${fallbackUser.name}!`, 'success')
      }
    }
  }

  // Handle Sign Out (returns to clean guest state)
  const handleSignOut = () => {
    // Save active state back to user account before logging out
    if (currentUser) {
      const accountsDb = JSON.parse(localStorage.getItem('learniq_accounts_db') || '{}')
      if (accountsDb[currentUser.username]) {
        accountsDb[currentUser.username].saved = interactions.saved
        accountsDb[currentUser.username].completed = interactions.completed
        accountsDb[currentUser.username].activeCourse = activeCourse
        accountsDb[currentUser.username].goal = activeSkillGoal
        localStorage.setItem('learniq_accounts_db', JSON.stringify(accountsDb))
      }
    }

    setCurrentUser(null)
    setUserDropdownOpen(false)
    setActiveCourse(null)
    setInteractions({ saved: [], completed: [] })
    localStorage.removeItem('learniq_auth_session')
    localStorage.removeItem('learniq_active_course')
    showToast("Signed out. You can now register or browse as a new student.", "info")
  }

  // Steppers for Lab Mode
  const adjustSignal = (signalKey, delta) => {
    setSignals(prev => {
      const nextVal = Math.max(0, (prev[signalKey] || 0) + delta)
      return { ...prev, [signalKey]: nextVal }
    })
  }

  // Topic Chip Toggle (Lab Mode)
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
    setActiveSkillGoal(p.goal)
    fetchRecommendationsForGoal(p.goal, p.experience, p.format)
    showToast(`Loaded "${presetKey.toUpperCase()}" curriculum preset`, 'info')
  }

  // Reset Everything to Clean Defaults
  const handleReset = () => {
    setSearchQuery('')
    setActiveSkillGoal('Machine Learning')
    setInteractions({ saved: [], completed: [] })
    setActiveCourse(null)
    setAlpha(0.60)
    setProfile({
      name: currentUser?.name || '',
      experience: 'Beginner',
      goal: 'Machine Learning',
      format: 'Video',
      weeklyTime: '4-6',
      topics: []
    })
    fetchRecommendationsForGoal('Machine Learning', 'Beginner', 'Video')
    showToast("Reset to clean state. Type any skill to begin!", "info")
  }

  // Dynamic Roadmap generated specifically for the active skill goal with REAL courses and live counts!
  const currentDynamicRoadmap = useMemo(() => {
    return buildDynamicRoadmap(activeSkillGoal, catalog, interactions.completed)
  }, [activeSkillGoal, catalog, interactions.completed])

  // Signal Totals
  const totalSignals = (signals.completed || 0) + (signals.saved || 0) + (signals.ratings || 0) + (signals.sessions || 0)
  const profileCompleteness = useMemo(() => {
    let score = 0
    if (currentUser?.name || profile.name) score += 25
    if (profile.experience) score += 25
    if (activeSkillGoal) score += 25
    if (profile.format) score += 25
    return score
  }, [currentUser, profile, activeSkillGoal])

  // Dynamic Recommendation Hybrid Calculation
  const computedRecommendations = useMemo(() => {
    const pool = rawBackendRecs.length > 0 ? rawBackendRecs : catalog
    if (!pool || pool.length === 0) return []

    const targetTopicLower = activeSkillGoal.toLowerCase()
    const preferredFormat = profile.format || 'Video'
    const userExp = profile.experience || 'Beginner'

    return pool.map((item) => {
      let cb = 72.0
      if (item.score !== undefined) {
        cb = Math.min(100, Math.max(35, Math.round(item.score * 100)))
      } else {
        const titleAndDesc = (item.title + ' ' + (item.description || '') + ' ' + (item.topic || '')).toLowerCase()
        if (titleAndDesc.includes(targetTopicLower)) cb += 18.0
        if (item.type && item.type.toLowerCase() === preferredFormat.toLowerCase()) cb += 10.0
        if (item.difficulty && item.difficulty.toLowerCase() === userExp.toLowerCase()) cb += 6.0
      }
      cb = Math.min(99.0, Math.max(30.0, cb))

      const baseRating = item.rating ? (item.rating / 5.0) * 80.0 : 75.0
      const signalAffinity = Math.min(20.0, (signals.completed * 2.0 + signals.saved * 1.5))
      let cf = baseRating + (signalAffinity * 0.5)
      cf = Math.min(98.0, Math.max(35.0, cf))

      let coldStartBoost = 0
      const isNewResource = item.source === 'Dev.to'
      if (coldStartEnabled && isNewResource) coldStartBoost = 4.5

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
  }, [rawBackendRecs, catalog, activeSkillGoal, profile, signals, alpha, coldStartEnabled])

  // Filtered recommendations for Learner Platform and Catalog
  const filteredCourses = useMemo(() => {
    let pool = activeTab === 'catalog' ? catalog : computedRecommendations

    // Search query within the filtered results
    if (searchQuery.trim() && activeTab === 'catalog') {
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

    return pool
  }, [computedRecommendations, catalog, activeTab, searchQuery, selectedDomain, selectedFormat, selectedDifficulty])

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
            {platformMode === 'learner' ? 'STUDENT PORTAL' : 'WORKSPACE SECTIONS'}
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
                    href="#roadmap"
                    className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); setActiveTab('roadmap'); setMobileMenuOpen(false); }}
                  >
                    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="6" y1="3" x2="6" y2="15"></line>
                      <circle cx="18" cy="6" r="3"></circle>
                      <circle cx="6" cy="18" r="3"></circle>
                      <path d="M18 9a9 9 0 0 1-9 9"></path>
                    </svg>
                    <span>Dynamic Roadmap</span>
                    <span className="nav-pill pill-cb">Live</span>
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
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>CURRENT SKILL TARGET</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>{activeSkillGoal}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>Level: {profile.experience} • {profile.format}s</div>
            </div>
          )}
        </nav>

        {/* Sidebar Status Panel */}
        <div className="sidebar-status-panel">
          <div className="status-indicator-row">
            <span className="pulse-dot-green" aria-hidden="true"></span>
            <span className="status-headline" style={{ color: '#34d399' }}>Live Cloud Storage</span>
          </div>
          <p className="status-body">
            Render API &amp; Supabase PostgreSQL persistent data sync.
          </p>
          <div className="status-meta">
            <span>Student: {currentUser ? currentUser.username : 'Guest Session'}</span>
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

        {/* Top Header Bar with Mode Switcher & Student Account Button */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>LearnIQ Platform</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">
                {platformMode === 'learner' && activeTab === 'home' && 'Learner Portal'}
                {platformMode === 'learner' && activeTab === 'roadmap' && 'Career Roadmap'}
                {platformMode === 'learner' && activeTab === 'catalog' && 'Course Library'}
                {platformMode === 'learner' && activeTab === 'dashboard' && 'My Learning'}
                {platformMode === 'lab' && 'AI Recommendation Lab'}
              </span>
              <span className="badge-prod-connected">
                <span className="pulse-dot-green"></span>
                RENDER &amp; SUPABASE LIVE
              </span>
            </div>
            <h2 className="workspace-title">
              {platformMode === 'learner' && activeTab === 'home' && 'Adaptive Learning Recommendations'}
              {platformMode === 'learner' && activeTab === 'roadmap' && `${activeSkillGoal} Roadmap`}
              {platformMode === 'learner' && activeTab === 'catalog' && 'Course & Article Catalog'}
              {platformMode === 'learner' && activeTab === 'dashboard' && 'Student Learning Dashboard'}
              {platformMode === 'lab' && 'Hybrid Model Lab & Parameters'}
            </h2>
          </div>

          <div className="header-actions">
            {/* Mode Switcher */}
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

            {/* Student Account Profile Button */}
            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <div
                  className="auth-user-badge"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  title="View Account Details"
                >
                  <div className="user-avatar-circle">
                    {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>@{currentUser.username}</div>
                  </div>
                </div>

                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: 240,
                    background: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                    zIndex: 100
                  }}>
                    <div style={{ paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.6rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>{currentUser.role || 'Verified Student'}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>Track: <strong>{activeSkillGoal}</strong></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      <span>Saved: <strong style={{ color: '#fff' }}>{interactions.saved.length}</strong></span>
                      <span>Completed: <strong style={{ color: '#34d399' }}>{interactions.completed.length}</strong></span>
                    </div>
                    {currentUser.username !== 'alex_demo' && (
                      <button
                        type="button"
                        style={{ width: '100%', textAlign: 'left', padding: '0.45rem', fontSize: '0.75rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', cursor: 'pointer', borderRadius: '4px', marginBottom: '0.5rem' }}
                        onClick={handleInstantDemoLogin}
                      >
                        ⚡ Switch to Demo Student
                      </button>
                    )}
                    <button
                      type="button"
                      style={{ width: '100%', textAlign: 'left', padding: '0.45rem', fontSize: '0.78rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-demo-quick"
                  onClick={handleInstantDemoLogin}
                  title="Instantly explore platform as Alex Morgan (Verified Scholar)"
                >
                  ⚡ Demo Student
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                >
                  Register
                </button>
              </div>
            )}

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
            {/* ONLY DISPLAY "CONTINUE LEARNING" IF STUDENT HAS AN ACTUAL ACTIVE COURSE! */}
            {activeCourse && (
              <section className="continue-learning-card">
                <div className="continue-learning-info">
                  <div className="continue-eyebrow">
                    <span>⚡</span> CURRENT IN-PROGRESS COURSE
                  </div>
                  <h3 className="continue-title">{activeCourse.title}</h3>
                  <div className="continue-meta">
                    <span>Provider: <strong style={{ color: '#fff' }}>{activeCourse.source || 'Instructor'}</strong></span>
                    <span>•</span>
                    <span>Format: <strong style={{ color: '#38bdf8' }}>{activeCourse.type || 'Course'}</strong></span>
                    <span>•</span>
                    <span>Level: <strong style={{ color: '#fff' }}>{activeCourse.difficulty || 'Intermediate'}</strong></span>
                  </div>

                  <div className="continue-progress-wrap">
                    <div className="continue-progress-bar">
                      <div className="continue-progress-fill" style={{ width: `${activeCourse.progress || 25}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      {activeCourse.progress || 25}% Done
                    </span>
                  </div>
                </div>

                <div className="continue-actions">
                  <a
                    href={activeCourse.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-launch"
                    style={{ padding: '0.65rem 1.35rem', fontSize: '0.85rem' }}
                    onClick={() => handleAction(activeCourse, 'Clicked')}
                  >
                    <span>Resume Course</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </a>

                  <button
                    type="button"
                    className="btn-action-outline"
                    onClick={() => handleAction(activeCourse, 'Completed')}
                    title="Mark this module as complete"
                  >
                    Mark Done ✓
                  </button>
                </div>
              </section>
            )}

            {/* TAB: DISCOVER / HOME VIEW */}
            {activeTab === 'home' && (
              <>
                {/* Hero Discovery Section: OPEN SEARCH LANDING PAGE */}
                <section className="learner-hero">
                  <span className="learner-hero-eyebrow">
                    <span>✨</span> WHAT DO YOU WANT TO LEARN?
                  </span>
                  <h1 className="learner-hero-title">
                    Type Any Skill &amp; <span className="gradient-text">Generate Your Roadmap</span>
                  </h1>
                  <p className="learner-hero-desc">
                    Search any technical topic below. LearnIQ instantly builds a customized 4-stage career roadmap and curates matching courses from our 300+ database.
                  </p>

                  {/* Search Bar that immediately generates roadmap & recommendations */}
                  <form onSubmit={handleSkillSearch} className="learner-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ marginRight: '0.75rem', flexShrink: 0 }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Type a skill (e.g. Machine Learning, React, Python, Cloud, MLOps)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn-launch"
                      style={{ padding: '0.55rem 1.25rem' }}
                    >
                      {loadingRecs ? 'Generating...' : 'Generate Roadmap'}
                    </button>
                  </form>

                  {/* Quick Topics */}
                  <div className="learner-quick-topics">
                    <span>Popular skills:</span>
                    {['Machine Learning', 'Generative AI', 'Python', 'Web Development', 'Cloud Computing'].map(t => (
                      <span
                        key={t}
                        className="quick-topic-chip"
                        onClick={() => {
                          setSearchQuery(t)
                          setActiveSkillGoal(t)
                          fetchRecommendationsForGoal(t, profile.experience, profile.format)
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>

                {/* GUEST BANNER: INVITE TO REGISTER OR TRY 1-CLICK DEMO */}
                {!currentUser && (
                  <div style={{
                    marginBottom: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎓</span>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Save your customized roadmap and course progress</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Create an account or explore instantly with a verified scholar demo account.</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn-demo-quick"
                        onClick={handleInstantDemoLogin}
                        title="Instantly sign in as Alex Morgan"
                      >
                        ⚡ 1-Click Demo Access
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                      >
                        Create Free Account
                      </button>
                    </div>
                  </div>
                )}

                {/* DYNAMIC ROADMAP PREVIEW (GENERATED DIRECTLY FOR THE TYPED TOPIC!) */}
                <section style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
                        <span>🗺️</span> DYNAMIC CAREER ROADMAP (FOR "{activeSkillGoal.toUpperCase()}")
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {currentDynamicRoadmap.title}
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: 0, marginTop: '0.2rem' }}>
                        {currentDynamicRoadmap.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8' }}>
                          {currentDynamicRoadmap.completedRoadmapCourses} / {currentDynamicRoadmap.totalRoadmapCourses} Courses Finished
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Overall Progress: {currentDynamicRoadmap.overallPercent}%
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveTab('roadmap')}
                      >
                        Inspect Full Roadmap →
                      </button>
                    </div>
                  </div>

                  {/* Overall Roadmap Progress Bar */}
                  <div className="roadmap-progress-bar-container">
                    <div
                      className="roadmap-progress-bar-fill"
                      style={{ width: `${currentDynamicRoadmap.overallPercent}%` }}
                    />
                  </div>

                  <div className="roadmap-steps-grid" style={{ marginTop: '1.5rem' }}>
                    {currentDynamicRoadmap.steps.map(st => (
                      <div
                        key={st.id}
                        className={`roadmap-step-card ${st.status === 'completed' ? 'is-completed' : ''} ${st.status === 'in-progress' ? 'is-active' : ''}`}
                      >
                        <div className="step-header-row">
                          <div className="step-number-badge">
                            {st.status === 'completed' ? '✓' : st.id}
                          </div>
                          <span className={`step-status-tag ${st.status === 'completed' ? 'tag-completed' : st.status === 'in-progress' ? 'tag-in-progress' : 'tag-upcoming'}`}>
                            {st.status === 'completed' ? 'COMPLETED' : st.status === 'in-progress' ? 'IN PROGRESS' : 'UPCOMING'}
                          </span>
                        </div>
                        <h4 className="step-title">{st.title}</h4>
                        <p className="step-desc">{st.desc}</p>

                        {/* Live Course Counter & Mini Progress Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>
                          <span>Stage Milestones</span>
                          <span>{st.completedCount} / {st.totalCount} Done ({st.percent}%)</span>
                        </div>
                        <div className="roadmap-stage-progress-bar">
                          <div
                            className={`roadmap-stage-progress-fill ${st.status === 'completed' ? 'is-done' : ''}`}
                            style={{ width: `${st.percent}%` }}
                          />
                        </div>

                        {/* Real Curated Courses in this Stage */}
                        <div className="roadmap-stage-courses">
                          {st.courses.map(course => {
                            const isCompleted = interactions.completed.includes(course.id)
                            const isActive = activeCourse && activeCourse.id === course.id
                            return (
                              <div key={course.id} className={`roadmap-course-item ${isCompleted ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span className="rec-type-pill" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>{course.type || 'Course'}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{course.difficulty}</span>
                                  </div>
                                  {course.rating && <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>★ {course.rating}</span>}
                                </div>
                                <div className="roadmap-course-title" title={course.title}>
                                  {course.title}
                                </div>
                                <div className="roadmap-course-actions">
                                  <button
                                    type="button"
                                    className={`btn-roadmap-action ${isCompleted ? 'btn-done' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAction(course, 'ToggleComplete')
                                    }}
                                    title={isCompleted ? 'Completed! Click to unmark' : 'Mark as complete to advance roadmap'}
                                  >
                                    {isCompleted ? '✓ Completed' : 'Mark Complete'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-roadmap-launch"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAction(course, 'Clicked')
                                      if (course.url) window.open(course.url, '_blank', 'noopener,noreferrer')
                                    }}
                                    title="Launch course and start learning"
                                  >
                                    Launch ↗
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="step-skills" style={{ marginTop: '0.85rem' }}>
                          {st.skills.map((sk, idx) => (
                            <span key={idx} className="step-skill-pill">{sk}</span>
                          ))}
                        </div>
                      </div>
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
                        onClick={() => {
                          setSelectedDomain(d.id)
                          if (d.name !== 'All Subjects') {
                            setActiveSkillGoal(d.name)
                            fetchRecommendationsForGoal(d.name, profile.experience, profile.format)
                          }
                        }}
                      >
                        <div className="domain-card-icon">{d.icon}</div>
                        <div className="domain-card-title">{d.name}</div>
                        <div className="domain-card-count">{d.count} Courses &amp; Articles</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* "Curated For You" Courses Grid */}
                <section id="curatedSection" style={{ marginBottom: '3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge-prod-connected">
                          <span className="pulse-dot-green"></span>
                          CURATED FOR {currentUser?.name ? currentUser.name.toUpperCase() : 'NEW STUDENT'}
                        </span>
                        <span className="results-badge">{filteredCourses.length} matched</span>
                      </div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Recommended Courses for "{activeSkillGoal}"</h2>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                        Ranked by affinity with your {profile.experience} level and interest in {profile.format}s.
                      </p>
                    </div>

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

            {/* TAB: FEATURE 3 - DYNAMIC CAREER ROADMAP VIEW */}
            {activeTab === 'roadmap' && (
              <section className="roadmap-container">
                <div className="roadmap-header">
                  <div>
                    <span className="learner-hero-eyebrow">
                      <span>🗺️</span> DYNAMIC CAREER ROADMAP
                    </span>
                    <h2 className="roadmap-track-name">{currentDynamicRoadmap.title}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 680, marginTop: '0.4rem', margin: 0 }}>
                      {currentDynamicRoadmap.description}
                    </p>
                  </div>

                  {/* Skill Goal Input on Roadmap Page */}
                  <form onSubmit={handleSkillSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="auth-input"
                      style={{ minWidth: 240 }}
                      placeholder="Type a new skill (e.g. React, Cloud, Python)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      Generate Roadmap
                    </button>
                  </form>
                </div>

                {/* Quick Topics Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Switch track:</span>
                  {['Machine Learning', 'Generative AI', 'Python', 'Web Development', 'Cloud Computing', 'Deep Learning', 'Data Science'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`filter-pill ${activeSkillGoal.toLowerCase() === t.toLowerCase() ? 'active' : ''}`}
                      style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                      onClick={() => {
                        setSearchQuery(t)
                        setActiveSkillGoal(t)
                        fetchRecommendationsForGoal(t, profile.experience, profile.format)
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* MASTER ROADMAP PROGRESS BAR & SUMMARY */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                        Overall Learning Path Completion
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Track your progress across all 4 career milestones for <strong>{activeSkillGoal}</strong>.
                      </div>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                      {currentDynamicRoadmap.completedRoadmapCourses} / {currentDynamicRoadmap.totalRoadmapCourses} Courses Finished ({currentDynamicRoadmap.overallPercent}%)
                    </div>
                  </div>
                  <div className="roadmap-progress-bar-container" style={{ height: '10px' }}>
                    <div
                      className="roadmap-progress-bar-fill"
                      style={{ width: `${currentDynamicRoadmap.overallPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestone Steps Grid */}
                <div className="roadmap-steps-grid">
                  {currentDynamicRoadmap.steps.map((st) => (
                    <div
                      key={st.id}
                      className={`roadmap-step-card ${st.status === 'completed' ? 'is-completed' : ''} ${st.status === 'in-progress' ? 'is-active' : ''}`}
                    >
                      <div className="step-header-row">
                        <div className="step-number-badge">
                          {st.status === 'completed' ? '✓' : st.id}
                        </div>
                        <span className={`step-status-tag ${st.status === 'completed' ? 'tag-completed' : st.status === 'in-progress' ? 'tag-in-progress' : 'tag-upcoming'}`}>
                          {st.status === 'completed' ? 'COMPLETED' : st.status === 'in-progress' ? 'IN PROGRESS' : 'UPCOMING'}
                        </span>
                      </div>

                      <h4 className="step-title">{st.title}</h4>
                      <p className="step-desc">{st.desc}</p>

                      {/* Live Course Counter & Mini Progress Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>
                        <span>Stage Milestones</span>
                        <span>{st.completedCount} / {st.totalCount} Done ({st.percent}%)</span>
                      </div>
                      <div className="roadmap-stage-progress-bar">
                        <div
                          className={`roadmap-stage-progress-fill ${st.status === 'completed' ? 'is-done' : ''}`}
                          style={{ width: `${st.percent}%` }}
                        />
                      </div>

                      {/* Real Curated Courses in this Stage */}
                      <div className="roadmap-stage-courses">
                        {st.courses.map(course => {
                          const isCompleted = interactions.completed.includes(course.id)
                          const isActive = activeCourse && activeCourse.id === course.id
                          return (
                            <div key={course.id} className={`roadmap-course-item ${isCompleted ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span className="rec-type-pill" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>{course.type || 'Course'}</span>
                                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{course.difficulty}</span>
                                </div>
                                {course.rating && <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600 }}>★ {course.rating}</span>}
                              </div>
                              <div className="roadmap-course-title" title={course.title}>
                                {course.title}
                              </div>
                              <div className="roadmap-course-actions">
                                <button
                                  type="button"
                                  className={`btn-roadmap-action ${isCompleted ? 'btn-done' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAction(course, 'ToggleComplete')
                                  }}
                                  title={isCompleted ? 'Completed! Click to unmark' : 'Mark as complete to advance roadmap'}
                                >
                                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-roadmap-launch"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAction(course, 'Clicked')
                                    if (course.url) window.open(course.url, '_blank', 'noopener,noreferrer')
                                  }}
                                  title="Launch course and start learning"
                                >
                                  Launch ↗
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="step-skills" style={{ marginTop: '0.85rem' }}>
                        {st.skills.map((sk, skIdx) => (
                          <span key={skIdx} className="step-skill-pill">{sk}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{activeCourse ? 1 : 0}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>In-Progress Course</div>
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
                      <p style={{ margin: 0 }}>No completed courses yet. Search for a skill above and click "Mark Done" to track your achievements here!</p>
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
                    <div className="metric-caption">Dynamic goal: "{activeSkillGoal}"</div>
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
                    <div className="metric-caption">Real student interactions</div>
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

            <div className="input-columns-grid">
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

                <form className="cb-form" onSubmit={(e) => { e.preventDefault(); fetchRecommendationsForGoal(activeSkillGoal, profile.experience, profile.format); }}>
                  <div className="form-group full-width-group">
                    <label className="form-label">
                      <span>Target Learning Skill</span>
                      <span className="label-hint">Dynamic Goal</span>
                    </label>
                    <input
                      type="text"
                      className="form-select"
                      style={{ paddingRight: '1rem' }}
                      value={activeSkillGoal}
                      onChange={(e) => setActiveSkillGoal(e.target.value)}
                      placeholder="e.g. Machine Learning, Python..."
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
                      </select>
                      <span className="select-arrow" aria-hidden="true">▼</span>
                    </div>
                  </div>

                  <div className="form-group full-width-group">
                    <div className="form-label">
                      <span>Domain Topics</span>
                      <span className="label-hint">{profile.topics?.length || 0} selected</span>
                    </div>
                    <div className="chips-container" role="group">
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

              <section id="learning-signals" className="section-card glass-panel section-cf" aria-labelledby="cfSectionHeading">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="section-category-pill pill-cf">COLLABORATIVE INPUTS (CF)</span>
                    <h3 id="cfSectionHeading" className="section-title">Learning Signals</h3>
                    <p className="section-subtitle">Real interaction patterns feeding collaborative matrix factorization.</p>
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
                        <span className="signal-tag">Real</span>
                      </div>
                      <p className="signal-desc">Completed modules in your student trajectory ({interactions.completed.length} total).</p>
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
                        <span className="signal-tag">Wishlist</span>
                      </div>
                      <p className="signal-desc">Saved bookmarks in library ({interactions.saved.length} total).</p>
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
                        <span className="signal-title">Active Study Sessions</span>
                        <span className="signal-tag">Recency</span>
                      </div>
                      <p className="signal-desc">Logged study sessions in your active account.</p>
                    </div>
                    <div className="stepper-controls">
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('sessions', -1)}>−</button>
                      <span className="stepper-value">{signals.sessions}</span>
                      <button type="button" className="btn-stepper" onClick={() => adjustSignal('sessions', 1)}>+</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

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

            <section id="recommendations" className="section-recommendations" aria-labelledby="recSectionHeading">
              <div className="rec-section-header">
                <div>
                  <div className="rec-eyebrow-row">
                    <span className="eyebrow">HYBRID RESULTS</span>
                    <span className="results-badge">{computedRecommendations.length} courses ranked</span>
                  </div>
                  <h3 id="recSectionHeading" className="rec-title">Recommended Learning Resources</h3>
                  <p className="rec-subtitle">
                    Dynamically ranked by H = α · CB + (1−α) · CF against live Supabase courses.
                  </p>
                </div>
              </div>

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
              <span className="brand-subtext"><strong>LearnIQ</strong> — Enterprise Adaptive AI Learning Platform</span>
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

      {/* STUDENT REGISTRATION / LOGIN MODAL */}
      {authModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                  {authTab === 'login' ? 'Student Sign In' : 'Create Free Student Account'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Save your learning trajectory and dynamic roadmap across sessions.
                </p>
              </div>
              <button
                type="button"
                style={{ color: '#94a3b8', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setAuthModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Instant Demo Scholar Access Button */}
            <div className="demo-login-callout" onClick={handleInstantDemoLogin}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="demo-bolt-circle">⚡</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    1-Click Demo Student Access
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Explore immediately as Alex Morgan (Verified Scholar) — no signup required
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>Enter →</span>
            </div>

            <div className="auth-divider"><span>OR CONTINUE WITH YOUR ACCOUNT</span></div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthTab('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authTab === 'register' && (
                <div className="auth-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Alan Somi"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. alansomi"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit-btn">
                {authTab === 'login' ? 'Sign In to My Account' : 'Register & Start Clean'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                {authTab === 'login' ? (
                  <span>Don't have an account? <strong style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => setAuthTab('register')}>Register now</strong></span>
                ) : (
                  <span>Already registered? <strong style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => setAuthTab('login')}>Sign In</strong></span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

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
