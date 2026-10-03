import React, { useState, useEffect, useMemo } from 'react'

const API_BASE = "https://learniq-765n.onrender.com"

// --------------------------------------------------------------------------
// 1. COMPREHENSIVE LOCAL DATASET (24+ High-Impact Industry Resources)
// --------------------------------------------------------------------------
const DEMO_CATALOG = [
  {
    id: 'lr-1',
    title: 'Machine Learning Specialization',
    provider: 'DeepLearning.AI & Stanford',
    type: 'Course',
    topic: 'Machine Learning',
    difficulty: 'Beginner',
    duration: '10 hours',
    rating: 4.9,
    learnerCount: '340k learners',
    tags: ['Machine Learning', 'Python', 'Algorithms', 'Supervised Learning'],
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    description: 'A foundational, industry-standard program taught by Andrew Ng covering supervised learning, neural networks, decision trees, and best practices.',
    outcomes: [
      'Build and train supervised machine learning models for prediction and binary classification.',
      'Understand core optimization concepts including gradient descent, cost functions, and regularization.',
      'Apply decision trees, random forests, and gradient boosting to real-world datasets.'
    ],
    prerequisites: 'Basic Python programming syntax and high school algebra.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-2',
    title: 'Generative AI with Large Language Models',
    provider: 'AWS & DeepLearning.AI',
    type: 'Course',
    topic: 'Generative AI',
    difficulty: 'Intermediate',
    duration: '8 hours',
    rating: 4.8,
    learnerCount: '190k learners',
    tags: ['Generative AI', 'LLMs', 'Transformers', 'Fine-Tuning', 'RLHF'],
    url: 'https://www.deeplearning.ai/courses/generative-ai-with-llms/',
    description: 'Deep dive into the transformer architecture, pre-training objectives, instruction fine-tuning, PEFT/LoRA, and Reinforcement Learning from Human Feedback.',
    outcomes: [
      'Describe the key steps in a generative AI model lifecycle from data selection to deployment.',
      'Fine-tune open-source models using Parameter-Efficient Fine-Tuning (PEFT) and LoRA.',
      'Evaluate model hallucinations, alignment, and quantify performance using ROUGE and BLEU metrics.'
    ],
    prerequisites: 'Solid Python skills and foundational understanding of deep learning concepts.',
    isFree: false,
    hasCert: true
  },
  {
    id: 'lr-3',
    title: 'CS50\'s Introduction to Artificial Intelligence with Python',
    provider: 'Harvard University',
    type: 'Course',
    topic: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    duration: '12 hours',
    rating: 4.9,
    learnerCount: '520k learners',
    tags: ['Artificial Intelligence', 'Search Algorithms', 'Optimization', 'Knowledge Graphs'],
    url: 'https://cs50.harvard.edu/ai/',
    description: 'Explore the concepts and algorithms at the foundation of modern AI, diving into graph search, classification, optimization, and reinforcement learning.',
    outcomes: [
      'Implement classical AI algorithms including A* search, adversarial game tree search, and constraint satisfaction.',
      'Construct probabilistic reasoning models and Markov decision processes from scratch.',
      'Design neural network pipelines for natural language processing and computer vision.'
    ],
    prerequisites: 'Prior experience in Python programming and basic algorithmic data structures.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-4',
    title: 'PyTorch for Deep Learning & Neural Networks Bootcamp',
    provider: 'freeCodeCamp & Daniel Bourke',
    type: 'Video',
    topic: 'Deep Learning',
    difficulty: 'Beginner',
    duration: '6 hours',
    rating: 4.9,
    learnerCount: '410k learners',
    tags: ['Deep Learning', 'PyTorch', 'Computer Vision', 'Tensors', 'Neural Networks'],
    url: 'https://www.youtube.com/watch?v=V_xro1bcAuA',
    description: 'Step-by-step hands-on guide to PyTorch tensors, autograd, building convolutional neural networks, custom datasets, and computer vision classification.',
    outcomes: [
      'Master PyTorch tensor operations, GPU acceleration, and backward propagation.',
      'Build custom convolutional neural networks (CNNs) from scratch and train on image data.',
      'Save, export, and load trained model checkpoints for web inference.'
    ],
    prerequisites: 'Basic Python syntax; no prior machine learning experience required.',
    isFree: true,
    hasCert: false
  },
  {
    id: 'lr-5',
    title: 'Hugging Face NLP Course: Transformers & Pipelines',
    provider: 'Hugging Face Official',
    type: 'Interactive lesson',
    topic: 'Natural Language Processing',
    difficulty: 'Intermediate',
    duration: '7 hours',
    rating: 4.9,
    learnerCount: '275k learners',
    tags: ['NLP', 'Transformers', 'BERT', 'Tokenization', 'Hugging Face'],
    url: 'https://huggingface.co/learn/nlp-course',
    description: 'Learn how to use Hugging Face transformers, datasets, tokenizers, and accelerate libraries for state-of-the-art NLP classification, summarization, and QA.',
    outcomes: [
      'Understand subword tokenization (BPE, WordPiece) and pipeline abstractions.',
      'Fine-tune pre-trained transformer backbones (BERT, RoBERTa) on domain-specific corpora.',
      'Deploy interactive model demos directly onto Hugging Face Spaces with Gradio.'
    ],
    prerequisites: 'Intermediate Python, familiarity with PyTorch or TensorFlow tensors.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-6',
    title: 'Full Stack MLOps: Production Pipeline Engineering',
    provider: 'Made With ML',
    type: 'Tutorial',
    topic: 'MLOps',
    difficulty: 'Advanced',
    duration: '9 hours',
    rating: 4.9,
    learnerCount: '145k learners',
    tags: ['MLOps', 'CI/CD', 'Docker', 'FastAPI', 'Model Monitoring', 'Ray'],
    url: 'https://madewithml.com/',
    description: 'Take machine learning from exploratory Jupyter notebooks into distributed production microservices with CI/CD testing, tracking, and drift monitoring.',
    outcomes: [
      'Design reproducible data pipelines with versioning, testing, and continuous delivery.',
      'Package model inference endpoints inside production Docker containers served with FastAPI.',
      'Implement real-time model telemetry, data drift detection, and automated retraining triggers.'
    ],
    prerequisites: 'Strong Python background, Docker fundamentals, and basic ML experience.',
    isFree: true,
    hasCert: false
  },
  {
    id: 'lr-7',
    title: 'Building Autonomous AI Agents with LangChain & LangGraph',
    provider: 'DeepLearning.AI',
    type: 'Interactive lesson',
    topic: 'AI Agents',
    difficulty: 'Intermediate',
    duration: '4 hours',
    rating: 4.8,
    learnerCount: '160k learners',
    tags: ['AI Agents', 'LangChain', 'Tool Calling', 'State Machines', 'LLMs'],
    url: 'https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/',
    description: 'Construct agentic workflows that utilize tools, loop through self-correction cycles, maintain persistent conversation state, and coordinate multi-agent teams.',
    outcomes: [
      'Create cyclic decision graphs that allow agents to reflect, retry, and branch based on tool outputs.',
      'Equip LLMs with structured external APIs, SQL databases, and search tool integrations.',
      'Build human-in-the-loop validation checkpoints before critical autonomous tool execution.'
    ],
    prerequisites: 'Python knowledge and experience with OpenAI or Anthropic API endpoints.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-8',
    title: 'Practical Deep Learning for Coders',
    provider: 'Fast.ai',
    type: 'Course',
    topic: 'Deep Learning',
    difficulty: 'Beginner',
    duration: '14 hours',
    rating: 4.9,
    learnerCount: '620k learners',
    tags: ['Deep Learning', 'Computer Vision', 'PyTorch', 'NLP', 'Tabular'],
    url: 'https://course.fast.ai/',
    description: 'A top-down, hands-on masterclass designed to get programmers training state-of-the-art deep learning models for vision, text, and tabular data on day one.',
    outcomes: [
      'Train high-accuracy computer vision classifiers in less than 5 lines of code.',
      'Understand the architecture of stochastic gradient descent, learning rate finders, and data augmentation.',
      'Clean noisy real-world data and ship web-based inference applications.'
    ],
    prerequisites: 'At least one year of programming experience in any language (Python preferred).',
    isFree: true,
    hasCert: false
  },
  {
    id: 'lr-9',
    title: 'Python for Data Science & Machine Learning Bootcamp',
    provider: 'Udemy & Jose Portilla',
    type: 'Course',
    topic: 'Python',
    difficulty: 'Beginner',
    duration: '16 hours',
    rating: 4.7,
    learnerCount: '890k learners',
    tags: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Data Science'],
    url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
    description: 'Comprehensive guide to NumPy arrays, Pandas data manipulation, Seaborn data visualization, and foundational Scikit-Learn machine learning algorithms.',
    outcomes: [
      'Process, filter, and aggregate multi-gigabyte datasets with Pandas vectorized routines.',
      'Create publication-quality visualizations, heatmaps, and statistical plots.',
      'Train linear regressions, logistic regressions, decision trees, and K-Means clustering.'
    ],
    prerequisites: 'None; suitable for complete beginners to Python and data science.',
    isFree: false,
    hasCert: true
  },
  {
    id: 'lr-10',
    title: 'Computer Vision: Image Processing & Object Detection',
    provider: 'OpenCV University',
    type: 'Course',
    topic: 'Computer Vision',
    difficulty: 'Intermediate',
    duration: '8 hours',
    rating: 4.8,
    learnerCount: '130k learners',
    tags: ['Computer Vision', 'OpenCV', 'YOLO', 'Object Detection', 'Image Processing'],
    url: 'https://opencv.org/university/',
    description: 'Hands-on computer vision covering spatial filtering, thresholding, contour extraction, feature matching, and real-time YOLO object detection.',
    outcomes: [
      'Apply image filtering, morphological transforms, and edge detection kernels.',
      'Fine-tune real-time YOLO object detectors on custom bounding box datasets.',
      'Track objects across live video streams with OpenCV and DeepSORT.'
    ],
    prerequisites: 'Intermediate Python and elementary linear algebra.',
    isFree: false,
    hasCert: true
  },
  {
    id: 'lr-11',
    title: 'Responsible AI & Model Ethics in Practice',
    provider: 'Google Cloud & Coursera',
    type: 'Article',
    topic: 'Responsible AI',
    difficulty: 'Beginner',
    duration: '2 hours',
    rating: 4.7,
    learnerCount: '85k learners',
    tags: ['Responsible AI', 'Ethics', 'Bias Detection', 'Explainability', 'Governance'],
    url: 'https://cloud.google.com/responsible-ai',
    description: 'Critical analysis of algorithmic fairness, demographic parity, SHAP/LIME explainability tools, and governance frameworks for ethical AI deployment.',
    outcomes: [
      'Detect and mitigate societal and statistical biases in machine learning training sets.',
      'Generate local and global feature attribution explanations using SHAP and LIME.',
      'Establish organizational guardrails for data privacy, consent, and safety compliance.'
    ],
    prerequisites: 'General interest in technology ethics; no coding required.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-12',
    title: 'End-to-End Enterprise Recommendation System Capstone',
    provider: 'GitHub Open Source Lab',
    type: 'Project',
    topic: 'Machine Learning',
    difficulty: 'Advanced',
    duration: '10 hours',
    rating: 4.9,
    learnerCount: '95k learners',
    tags: ['Machine Learning', 'Recommendation Systems', 'FastAPI', 'PostgreSQL', 'Capstone'],
    url: 'https://github.com',
    description: 'Architect a production recommendation platform combining content metadata matching, implicit interaction signals, and live cloud deployment.',
    outcomes: [
      'Synthesize intelligent ranking signals combining profile attributes with real-world engagement patterns.',
      'Build persistent RESTful endpoints in FastAPI backed by PostgreSQL relational storage.',
      'Deploy responsive front-end dashboard interfaces with live telemetry on cloud hosting.'
    ],
    prerequisites: 'Experience with Python, SQL, REST APIs, and front-end architectures.',
    isFree: true,
    hasCert: false
  },
  {
    id: 'lr-13',
    title: 'Cloud Computing Foundations for AI Engineers',
    provider: 'Google Cloud Training',
    type: 'Course',
    topic: 'Cloud Computing',
    difficulty: 'Intermediate',
    duration: '7 hours',
    rating: 4.8,
    learnerCount: '210k learners',
    tags: ['Cloud Computing', 'GCP', 'Docker', 'Kubernetes', 'Storage'],
    url: 'https://cloud.google.com/training',
    description: 'Master cloud storage buckets, container registries, managed compute instances, and Kubernetes clusters for training and scaling AI models.',
    outcomes: [
      'Provision scalable cloud compute instances and configure GPU drivers efficiently.',
      'Deploy containerized applications to distributed clusters with auto-scaling policies.',
      'Manage secure IAM credentials, API gateways, and cloud observability metrics.'
    ],
    prerequisites: 'Basic command-line terminal skills and containerization awareness.',
    isFree: true,
    hasCert: true
  },
  {
    id: 'lr-14',
    title: 'Data Science & Statistical Inference with Python',
    provider: 'MIT OpenCourseWare',
    type: 'Video',
    topic: 'Data Science',
    difficulty: 'Intermediate',
    duration: '9 hours',
    rating: 4.9,
    learnerCount: '380k learners',
    tags: ['Data Science', 'Statistics', 'Hypothesis Testing', 'Probability', 'Python'],
    url: 'https://ocw.mit.edu',
    description: 'Rigorous introduction to probability theory, Central Limit Theorem, Monte Carlo simulations, hypothesis testing, and statistical machine learning.',
    outcomes: [
      'Formulate and execute rigorous hypothesis tests, p-value calculations, and A/B test experiments.',
      'Simulate stochastic random processes using Monte Carlo techniques in Python.',
      'Interpret statistical confidence intervals and variance decomposition in predictive models.'
    ],
    prerequisites: 'Calculus and basic Python programming.',
    isFree: true,
    hasCert: false
  }
]

// Available Topic Chips
const TOPIC_CHIPS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Generative AI',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Data Science',
  'Python',
  'Data Analytics',
  'MLOps',
  'AI Agents',
  'Responsible AI',
  'Cloud Computing'
]

// --------------------------------------------------------------------------
// 2. MAIN APPLICATION COMPONENT & STATE ENGINE
// --------------------------------------------------------------------------

// LocalStorage Multi-User Helpers
const ACCOUNTS_STORAGE_KEY = 'learniq_accounts'
const SESSION_STORAGE_KEY = 'learniq_session_user'

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch (e) {
    console.error('Failed to save accounts to localStorage', e)
  }
}

function getActiveSessionUsername() {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY) || null
  } catch {
    return null
  }
}

let toastCounter = 0
function getNextToastId() {
  return ++toastCounter
}

function getEventTimestamp() {
  return Date.now()
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') return tags.trim().split(/\s+/).filter(Boolean)
  return []
}

function getInitials(name, fallback = 'LQ') {
  const cleanName = (name || '').trim()
  if (!cleanName) return fallback
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return cleanName.slice(0, 2).toUpperCase()
}

function normalizeActivity(act) {
  const a = act || {}
  return {
    completedIds: Array.isArray(a.completedIds) ? a.completedIds : [],
    savedIds: Array.isArray(a.savedIds) ? a.savedIds : [],
    ratings: (a.ratings && typeof a.ratings === 'object') ? a.ratings : {},
    sessionsCount: typeof a.sessionsCount === 'number' ? a.sessionsCount : 0,
    streakDays: typeof a.streakDays === 'number' ? a.streakDays : 0,
    hoursSpent: typeof a.hoursSpent === 'number' ? a.hoursSpent : 0,
    recentEvents: Array.isArray(a.recentEvents) ? a.recentEvents : []
  }
}

export default function App() {
  // ------------------------------------------------------------------------
  // Active User & Authentication State (Default: Clean Guest, No Demo Account)
  // ------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(() => {
    const activeUsername = getActiveSessionUsername()
    if (activeUsername) {
      const accounts = getStoredAccounts()
      return accounts[activeUsername] || null
    }
    return null
  })

  // Navigation State: 'overview', 'roadmap', 'recommendations', 'profile', 'preferences', 'activity', 'saved', 'progress', 'settings'
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register') // 'signin' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', username: '', password: '', targetSkill: '' })
  const [authError, setAuthError] = useState('')

  // ------------------------------------------------------------------------
  // Learner Profile State (Derived from logged in account or clean Guest)
  // ------------------------------------------------------------------------
  const [profile, setProfile] = useState(() => {
    if (currentUser && currentUser.profile) {
      return currentUser.profile
    }
    return {
      name: 'Guest Explorer',
      role: 'Learner',
      experience: 'Beginner',
      goal: 'Discover Learning Paths',
      targetSkill: '',
      interests: [],
      format: 'Course',
      weeklyTime: '5-10 hours',
      studySchedule: 'Flexible / Self-paced'
    }
  })

  // Target Skill for Dynamic Roadmap
  const [targetSkill, setTargetSkill] = useState(() => {
    if (currentUser && currentUser.targetSkill) return currentUser.targetSkill
    return profile.targetSkill || ''
  })
  const [skillInput, setSkillInput] = useState('')

  // ------------------------------------------------------------------------
  // Learning Preferences State (Personalization dials)
  // ------------------------------------------------------------------------
  const [preferences, setPreferences] = useState(() => {
    if (currentUser && currentUser.preferences) {
      return currentUser.preferences
    }
    return {
      handsOnTheory: 70, // 0 = Pure Theory, 100 = Pure Hands-on Code
      projectBased: 80,   // 0 = Academic, 100 = Project-Driven
      contentLength: 'Medium (3-10 hrs)',
      adaptiveDifficulty: true,
      freeOnly: false,
      certificationTrack: true
    }
  })

  // ------------------------------------------------------------------------
  // Learning Activity & Signals State (CLEAN for new users, 0 sample progress!)
  // ------------------------------------------------------------------------
  const [activity, setActivity] = useState(() => {
    if (currentUser && currentUser.activity) {
      return normalizeActivity(currentUser.activity)
    }
    return {
      completedIds: [],
      savedIds: [],
      ratings: {},
      sessionsCount: 0,
      streakDays: 0,
      hoursSpent: 0,
      recentEvents: []
    }
  })

  // Active in-progress course (null by default for new students!)
  const [activeCourse, setActiveCourse] = useState(() => {
    if (currentUser && currentUser.activeCourse) {
      return currentUser.activeCourse
    }
    return null
  })

  // Live Cloud Catalog (augmented with 300+ courses from Render if online)
  const [cloudCatalog, setCloudCatalog] = useState([])
  const [cloudConnected, setCloudConnected] = useState(false)
  const [cloudWakingUp, setCloudWakingUp] = useState(false)

  // Filters & Sorting for Recommendations
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [selectedPricing, setSelectedPricing] = useState('all') // 'all', 'free'
  const [sortBy, setSortBy] = useState('relevance') // 'relevance', 'rating', 'duration'

  // Modal State for Resource Details
  const [modalResource, setModalResource] = useState(null)

  // Notifications & UI states
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // ------------------------------------------------------------------------
  // Sync Active User State back into accounts database in localStorage
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (currentUser && currentUser.username) {
      const accounts = getStoredAccounts()
      if (accounts[currentUser.username]) {
        accounts[currentUser.username].name = currentUser.name || profile.name
        accounts[currentUser.username].profile = profile
        accounts[currentUser.username].preferences = preferences
        accounts[currentUser.username].activity = activity
        accounts[currentUser.username].activeCourse = activeCourse
        accounts[currentUser.username].targetSkill = targetSkill
        saveStoredAccounts(accounts)
      }
    }
  }, [profile, preferences, activity, activeCourse, targetSkill, currentUser])

  // Toast Trigger Helper
  const showToast = (message, type = 'info') => {
    const id = getNextToastId()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(curr => curr.filter(t => t.id !== id))
    }, 3500)
  }

  // ------------------------------------------------------------------------
  // Fetch live courses from Render API with cold-start detector
  // ------------------------------------------------------------------------
  useEffect(() => {
    let timer = setTimeout(() => setCloudWakingUp(true), 2500)
    fetch(`${API_BASE}/resources?limit=300`)
      .then(res => {
        if (!res.ok) throw new Error('Render database waking up')
        return res.json()
      })
      .then(data => {
        clearTimeout(timer)
        setCloudWakingUp(false)
        if (Array.isArray(data) && data.length > 0) {
          const transformed = data.filter(Boolean).map(item => ({
            id: `cloud-${item.id}`,
            title: item.title,
            provider: item.source || item.instructor || 'Online Academy',
            type: item.type || 'Course',
            topic: item.topic || 'Machine Learning',
            difficulty: item.difficulty || 'Intermediate',
            duration: item.duration || '6 hours',
            rating: item.rating ? Number(item.rating) : 4.8,
            learnerCount: `${Math.floor(12 + Math.random() * 85)}k learners`,
            tags: normalizeTags(item.tags).length > 0
              ? normalizeTags(item.tags)
              : [item.topic || 'Machine Learning', item.difficulty || 'Intermediate', 'Verified Course'],
            url: item.url || 'https://www.coursera.org',
            description: item.description || `Comprehensive curriculum designed to build practical mastery in ${item.topic || 'this subject'}.`,
            outcomes: [
              `Master key concepts and practical pipelines in ${item.topic || 'this domain'}.`,
              'Build hands-on code exercises and portfolio assets.',
              'Apply industry-standard workflows to solve real engineering problems.'
            ],
            prerequisites: `Basic familiarity with ${item.topic || 'computer science'} fundamentals.`,
            isFree: item.is_free !== undefined ? Boolean(item.is_free) : true,
            hasCert: true
          }))
          setCloudCatalog(transformed)
          setCloudConnected(true)
        }
      })
      .catch(() => {
        clearTimeout(timer)
        setCloudWakingUp(false)
        // Cold start or offline: Seamless local fallback
        setCloudConnected(false)
      })
    return () => clearTimeout(timer)
  }, [])

  // Combined Catalog
  const allResources = useMemo(() => {
    if (cloudConnected && cloudCatalog.length > 0) {
      const extraCloud = cloudCatalog.filter(c => !DEMO_CATALOG.some(d => (d.title || '').toLowerCase() === (c.title || '').toLowerCase()))
      return [...DEMO_CATALOG, ...extraCloud]
    }
    return DEMO_CATALOG
  }, [cloudCatalog, cloudConnected])

  // ------------------------------------------------------------------------
  // Authentication Actions (Register, Login, Logout)
  // ------------------------------------------------------------------------
  const handleRegister = (name, username, password, chosenSkill) => {
    const cleanUsername = (username || '').trim().toLowerCase()
    if (!cleanUsername || !(password || '').trim()) {
      setAuthError('Please enter a valid username and password.')
      return
    }
    const accounts = getStoredAccounts()
    if (accounts[cleanUsername]) {
      setAuthError('Username already taken. Please choose another or sign in.')
      return
    }

    const resolvedSkill = chosenSkill?.trim() || ''
    const newAccount = {
      username: cleanUsername,
      password: password.trim(),
      name: (name || '').trim() || cleanUsername,
      role: 'Learner',
      targetSkill: resolvedSkill,
      profile: {
        name: (name || '').trim() || cleanUsername,
        role: 'Learner',
        experience: 'Beginner',
        goal: resolvedSkill ? `Master ${resolvedSkill}` : 'Build Practical AI Skills',
        targetSkill: resolvedSkill,
        interests: resolvedSkill ? [resolvedSkill] : [],
        format: 'Course',
        weeklyTime: '5-10 hours',
        studySchedule: 'Flexible / Self-paced'
      },
      preferences: {
        handsOnTheory: 70,
        projectBased: 80,
        contentLength: 'Medium (3-10 hrs)',
        adaptiveDifficulty: true,
        freeOnly: false,
        certificationTrack: true
      },
      activity: {
        completedIds: [],
        savedIds: [],
        ratings: {},
        sessionsCount: 1,
        streakDays: 1,
        hoursSpent: 0,
        recentEvents: [
          { id: getEventTimestamp(), title: 'Registered LearnIQ Learner Account', time: 'Just now', icon: '👤' }
        ]
      },
      activeCourse: null
    }

    accounts[cleanUsername] = newAccount
    saveStoredAccounts(accounts)
    localStorage.setItem(SESSION_STORAGE_KEY, cleanUsername)

    setCurrentUser(newAccount)
    setProfile(newAccount.profile)
    setPreferences(newAccount.preferences)
    setActivity(newAccount.activity)
    setActiveCourse(null)
    setTargetSkill(resolvedSkill)
    setAuthModalOpen(false)
    setAuthError('')
    setAuthForm({ name: '', username: '', password: '', targetSkill: '' })
    showToast(`Welcome to LearnIQ, ${newAccount.name}! Account registered successfully.`, 'success')

    // Asynchronously log student to backend database if available
    fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newAccount.name,
        skill_level: 'Beginner',
        interest: resolvedSkill || 'Machine Learning',
        preferred_type: 'Course'
      })
    }).catch(() => {})
  }

  const handleLogin = (username, password) => {
    const cleanUsername = (username || '').trim().toLowerCase()
    const accounts = getStoredAccounts()
    const account = accounts[cleanUsername]

    if (!account || account.password !== (password || '').trim()) {
      setAuthError('Invalid username or password. Please verify your credentials.')
      return
    }

    localStorage.setItem(SESSION_STORAGE_KEY, cleanUsername)
    setCurrentUser(account)
    setProfile(account.profile || {
      name: account.name || cleanUsername,
      role: 'Learner',
      experience: 'Beginner',
      goal: account.targetSkill ? `Master ${account.targetSkill}` : 'Build Practical Skills',
      targetSkill: account.targetSkill || '',
      interests: account.targetSkill ? [account.targetSkill] : [],
      format: 'Course',
      weeklyTime: '5-10 hours',
      studySchedule: 'Flexible / Self-paced'
    })
    setPreferences(account.preferences || {
      handsOnTheory: 70,
      projectBased: 80,
      contentLength: 'Medium (3-10 hrs)',
      adaptiveDifficulty: true,
      freeOnly: false,
      certificationTrack: true
    })
    setActivity(normalizeActivity(account.activity || {
      completedIds: [],
      savedIds: [],
      ratings: {},
      sessionsCount: 1,
      streakDays: 1,
      hoursSpent: 0,
      recentEvents: []
    }))
    setActiveCourse(account.activeCourse || null)
    setTargetSkill(account.targetSkill || account.profile?.targetSkill || '')
    setAuthModalOpen(false)
    setAuthError('')
    setAuthForm({ name: '', username: '', password: '', targetSkill: '' })
    showToast(`Welcome back, ${account.name || cleanUsername}!`, 'success')
  }

  const handleLogout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setCurrentUser(null)
    setActiveCourse(null)
    setTargetSkill('')
    setProfile({
      name: 'Guest Explorer',
      role: 'Learner',
      experience: 'Beginner',
      goal: 'Discover Learning Paths',
      targetSkill: '',
      interests: [],
      format: 'Course',
      weeklyTime: '5-10 hours',
      studySchedule: 'Flexible / Self-paced'
    })
    setActivity({
      completedIds: [],
      savedIds: [],
      ratings: {},
      sessionsCount: 0,
      streakDays: 0,
      hoursSpent: 0,
      recentEvents: []
    })
    setUserMenuOpen(false)
    showToast('Signed out successfully. You are now exploring in Guest Mode.', 'info')
  }

  // ------------------------------------------------------------------------
  // DYNAMIC LEARNING ROADMAP GENERATOR (Tailored to Learner's Target Skill)
  // ------------------------------------------------------------------------
  const roadmapStages = useMemo(() => {
    const skill = (targetSkill || searchQuery || 'Machine Learning').trim().toLowerCase()

    // Filter matching resources
    let matches = allResources.filter(r =>
      (r.title || '').toLowerCase().includes(skill) ||
      (r.topic || '').toLowerCase().includes(skill) ||
      normalizeTags(r.tags).some(t => (t || '').toLowerCase().includes(skill))
    )

    if (matches.length < 4) {
      // Complement with high quality related resources so 4 stages are always full
      const other = allResources.filter(r => !matches.some(m => m.id === r.id))
      matches = [...matches, ...other]
    }

    const s1 = matches.filter(r => r.difficulty === 'Beginner').slice(0, 2)
    const s2 = matches.filter(r => r.difficulty === 'Intermediate' && r.type !== 'Project' && !s1.some(x => x.id === r.id)).slice(0, 2)
    const s3 = matches.filter(r => r.difficulty === 'Advanced' && r.type !== 'Project' && !s1.concat(s2).some(x => x.id === r.id)).slice(0, 2)
    const s4 = matches.filter(r => (r.type === 'Project' || normalizeTags(r.tags).some(t => {
      const tagStr = (t || '').toLowerCase()
      return tagStr.includes('project') || tagStr.includes('capstone')
    })) && !s1.concat(s2, s3).some(x => x.id === r.id)).slice(0, 2)

    const pool = matches.filter(r => !new Set([...s1, ...s2, ...s3, ...s4].map(x => x.id)).has(r.id))
    const fill = (arr, count = 2) => {
      while (arr.length < count && pool.length > 0) {
        arr.push(pool.shift())
      }
      return arr
    }

    const displaySkillName = targetSkill || (searchQuery ? searchQuery : 'Core Engineering')

    return [
      {
        id: 'stage-1',
        number: 1,
        title: 'Core Foundations & Principles',
        subtitle: `Essential syntax, algorithms, and core principles for ${displaySkillName}.`,
        courses: fill(s1, 2)
      },
      {
        id: 'stage-2',
        number: 2,
        title: 'Applied Frameworks & Tooling',
        subtitle: `Building practical implementations and mastering key libraries in ${displaySkillName}.`,
        courses: fill(s2, 2)
      },
      {
        id: 'stage-3',
        number: 3,
        title: 'Advanced Architecture & Optimization',
        subtitle: `Production patterns, deep specialization, and scaling strategies.`,
        courses: fill(s3, 2)
      },
      {
        id: 'stage-4',
        number: 4,
        title: 'Capstone Project & Portfolio',
        subtitle: `End-to-end deployed portfolio applications ready for industry presentation.`,
        courses: fill(s4, 1)
      }
    ]
  }, [targetSkill, searchQuery, allResources])

  const roadmapCoursesList = useMemo(() => {
    return roadmapStages.flatMap(s => s.courses)
  }, [roadmapStages])

  const roadmapCompletedCoursesCount = useMemo(() => {
    return roadmapCoursesList.filter(c => (activity.completedIds || []).includes(c.id)).length
  }, [roadmapCoursesList, activity.completedIds])

  const roadmapTotalCoursesCount = roadmapCoursesList.length || 7

  const roadmapProgressPercent = useMemo(() => {
    if (roadmapTotalCoursesCount === 0) return 0
    return Math.min(100, Math.round((roadmapCompletedCoursesCount / roadmapTotalCoursesCount) * 100))
  }, [roadmapCompletedCoursesCount, roadmapTotalCoursesCount])

  const handleSetTargetSkill = (newSkill) => {
    const s = (newSkill || '').trim()
    setTargetSkill(s)
    setProfile(p => ({
      ...p,
      targetSkill: s,
      goal: `Master ${s}`,
      interests: p.interests.includes(s) ? p.interests : [s, ...p.interests]
    }))
    showToast(`Dynamic roadmap generated for ${s}!`, 'success')
  }

  // ------------------------------------------------------------------------
  // DETERMINISTIC PERSONALIZATION & RELEVANCE LOGIC (NO MATH JARGON!)
  // ------------------------------------------------------------------------
  const scoredResources = useMemo(() => {
    const userInterests = (profile.interests || []).map(i => (i || '').toLowerCase())
    const userGoal = (profile.goal || '').toLowerCase()
    const userExp = (profile.experience || 'Beginner').toLowerCase()
    const userFormat = (profile.format || 'Course').toLowerCase()
    const activeSkill = (targetSkill || '').toLowerCase()

    return allResources.map(resource => {
      let relevanceScore = 65 // baseline suitability
      const reasons = []

      // Target Skill Match
      const resTitle = (resource.title || '').toLowerCase()
      const resTopic = (resource.topic || '').toLowerCase()
      if (activeSkill && (resTitle.includes(activeSkill) || resTopic.includes(activeSkill))) {
        relevanceScore += 20
        reasons.push(`Direct match for your target skill: ${targetSkill}`)
      }

      // Topic Match
      const isTopicMatch = userInterests.some(interest => resTopic.includes(interest) || interest.includes(resTopic))
      if (isTopicMatch) {
        relevanceScore += 14
        reasons.push(`Matches your interest in ${resource.topic}`)
      }

      // Experience Level Match
      const resDiff = (resource.difficulty || '').toLowerCase()
      if (resDiff === userExp) {
        relevanceScore += 10
        reasons.push(`Calibrated for your ${profile.experience} level`)
      }

      // Format Match
      const resType = (resource.type || '').toLowerCase()
      if (resType === userFormat || userFormat === 'mixed') {
        relevanceScore += 8
        reasons.push(`Matches your preferred ${profile.format} format`)
      }

      // Preferences (Hands-on Code vs Theory)
      if (preferences.handsOnTheory >= 65 && (resType === 'project' || resType === 'interactive lesson' || resType === 'tutorial')) {
        relevanceScore += 6
        reasons.push(`Aligns with your ${preferences.handsOnTheory}% practical hands-on preference`)
      }

      // Goal Alignment
      if (userGoal.includes('project') && normalizeTags(resource.tags).some(t => (t || '').toLowerCase().includes('project'))) {
        relevanceScore += 5
        reasons.push(`Supports your goal: "${profile.goal}"`)
      }

      const finalScore = Math.min(99, Math.max(68, relevanceScore))
      const primaryExplanation = reasons.length > 0
        ? reasons.slice(0, 2).join(' • ')
        : `Recommended based on your ${profile.experience} journey and interest in ${resource.topic}.`

      return {
        ...resource,
        relevanceScore: finalScore,
        whyRecommended: primaryExplanation
      }
    })
  }, [allResources, profile, preferences, targetSkill])

  // Filtered & Sorted Resources for Recommendation Page
  const displayedRecommendations = useMemo(() => {
    let list = [...scoredResources]

    if ((searchQuery || '').trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r =>
        (r.title || '').toLowerCase().includes(q) ||
        (r.topic || '').toLowerCase().includes(q) ||
        (r.provider || '').toLowerCase().includes(q) ||
        normalizeTags(r.tags).some(t => (t || '').toLowerCase().includes(q))
      )
    }

    if (selectedTopic !== 'all') {
      list = list.filter(r => (r.topic || '').toLowerCase() === (selectedTopic || '').toLowerCase())
    }

    if (selectedDifficulty !== 'all') {
      list = list.filter(r => (r.difficulty || '').toLowerCase() === (selectedDifficulty || '').toLowerCase())
    }

    if (selectedFormat !== 'all') {
      list = list.filter(r => (r.type || '').toLowerCase() === (selectedFormat || '').toLowerCase())
    }

    if (selectedPricing === 'free') {
      list = list.filter(r => r.isFree)
    }

    if (sortBy === 'relevance') {
      list.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'duration') {
      list.sort((a, b) => parseInt(a.duration || '0') - parseInt(b.duration || '0'))
    }

    return list
  }, [scoredResources, searchQuery, selectedTopic, selectedDifficulty, selectedFormat, selectedPricing, sortBy])

  // Saved resources list
  const savedResourcesList = useMemo(() => {
    return allResources.filter(r => (activity.savedIds || []).includes(r.id))
  }, [allResources, activity.savedIds])

  // Real-time Topic Mastery Breakdown
  const topicMasteryData = useMemo(() => {
    const list = [
      { topic: 'Machine Learning', color: '#38bdf8' },
      { topic: 'Generative AI', color: '#a855f7' },
      { topic: 'Python Programming', color: '#10b981' },
      { topic: 'Deep Learning', color: '#f59e0b' },
      { topic: 'Data Science', color: '#06b6d4' }
    ]

    return list.map(item => {
      const targetTopic = (item.topic || '').toLowerCase()
      const count = (activity.completedIds || []).filter(id => {
        const found = allResources.find(r => r.id === id)
        return found && (
          (found.topic || '').toLowerCase().includes(targetTopic) ||
          normalizeTags(found.tags).some(t => (t || '').toLowerCase().includes(targetTopic))
        )
      }).length

      const pct = Math.min(100, count * 33) // 3 modules for 100%
      return {
        ...item,
        completedCount: count,
        progress: pct
      }
    })
  }, [activity.completedIds, allResources])

  // Profile Completeness metric
  const profileCompleteness = useMemo(() => {
    let score = 0
    if (currentUser) score += 20
    if (profile.experience) score += 20
    if (profile.goal) score += 20
    if (targetSkill) score += 20
    if (profile.interests && profile.interests.length >= 1) score += 10
    if (profile.weeklyTime) score += 10
    return Math.min(100, score)
  }, [profile, currentUser, targetSkill])

  // ------------------------------------------------------------------------
  // Handlers & Interactive Actions
  // ------------------------------------------------------------------------
  const toggleInterest = (topic) => {
    setProfile(prev => {
      const cur = prev.interests || []
      const updated = cur.includes(topic)
        ? cur.filter(t => t !== topic)
        : [...cur, topic]
      return { ...prev, interests: updated }
    })
  }

  const toggleSaveResource = (resId, resTitle) => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthModalOpen(true)
      showToast('Please create an account or sign in to bookmark resources.', 'info')
      return
    }

    const isSaved = (activity.savedIds || []).includes(resId)
    const eventMsg = isSaved ? `Removed "${(resTitle || '').slice(0, 28)}..." from library` : `Saved "${(resTitle || '').slice(0, 28)}..."`
    showToast(eventMsg, isSaved ? 'info' : 'success')

    setActivity(prev => {
      const prevSaved = prev.savedIds || []
      const currentlySaved = prevSaved.includes(resId)
      const updatedSaved = currentlySaved
        ? prevSaved.filter(id => id !== resId)
        : [...prevSaved, resId]
      
      return {
        ...prev,
        savedIds: updatedSaved,
        recentEvents: [
          { id: getEventTimestamp(), title: eventMsg, time: 'Just now', icon: isSaved ? '✕' : '🔖' },
          ...(prev.recentEvents || []).slice(0, 5)
        ]
      }
    })
  }

  const toggleCompleteResource = (resId, resTitle) => {
    if (!currentUser) {
      setAuthMode('register')
      setAuthModalOpen(true)
      showToast('Please create an account or sign in to track completed courses.', 'info')
      return
    }

    const isDone = (activity.completedIds || []).includes(resId)
    const eventMsg = isDone ? `Unmarked "${(resTitle || '').slice(0, 28)}..."` : `Completed "${(resTitle || '').slice(0, 28)}..."`
    showToast(eventMsg, isDone ? 'info' : 'success')

    setActivity(prev => {
      const prevDone = prev.completedIds || []
      const currentlyDone = prevDone.includes(resId)
      const updatedDone = currentlyDone
        ? prevDone.filter(id => id !== resId)
        : [...prevDone, resId]

      return {
        ...prev,
        completedIds: updatedDone,
        hoursSpent: currentlyDone ? Math.max(0, (prev.hoursSpent || 0) - 3.5) : (prev.hoursSpent || 0) + 3.5,
        recentEvents: [
          { id: getEventTimestamp(), title: eventMsg, time: 'Just now', icon: '✓' },
          ...(prev.recentEvents || []).slice(0, 5)
        ]
      }
    })
  }

  const handleStartLearning = (resource) => {
    if (!resource) return
    setActiveCourse({
      ...resource,
      progress: 25,
      currentLesson: 'Module 1: Principles & Fundamentals'
    })
    if (currentUser) {
      setActivity(prev => ({
        ...prev,
        sessionsCount: (prev.sessionsCount || 0) + 1,
        recentEvents: [
          { id: getEventTimestamp(), title: `Started learning "${(resource.title || '').slice(0, 28)}..."`, time: 'Just now', icon: '⚡' },
          ...(prev.recentEvents || []).slice(0, 5)
        ]
      }))
    }
    showToast(`Launching "${(resource.title || '').slice(0, 30)}..."`, 'info')
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRateResource = (resId, rating) => {
    if (!currentUser) {
      setAuthMode('signin')
      setAuthModalOpen(true)
      showToast('Please sign in to submit resource ratings.', 'info')
      return
    }

    setActivity(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [resId]: rating }
    }))
    showToast(`Rated course ${rating} stars! Thank you for the feedback.`, 'success')
  }

  const handleGenerateRecommendations = () => {
    setActiveSection('recommendations')
    showToast("Recommendations personalized for your profile!", "success")
  }

  const handleResetPreferences = () => {
    setPreferences({
      handsOnTheory: 70,
      projectBased: 80,
      contentLength: 'Medium (3-10 hrs)',
      adaptiveDifficulty: true,
      freeOnly: false,
      certificationTrack: true
    })
    setSelectedTopic('all')
    setSelectedDifficulty('all')
    setSelectedFormat('all')
    setSelectedPricing('all')
    setSortBy('relevance')
    setSearchQuery('')
    showToast("Preferences restored to initial defaults.", "info")
  }

  const handleDangerZoneReset = () => {
    setPreferences({
      handsOnTheory: 70,
      projectBased: 80,
      contentLength: 'Medium (3-10 hrs)',
      adaptiveDifficulty: true,
      freeOnly: false,
      certificationTrack: true
    })
    setSelectedTopic('all')
    setSelectedDifficulty('all')
    setSelectedFormat('all')
    setSelectedPricing('all')
    setSortBy('relevance')
    setSearchQuery('')
    setActivity({
      completedIds: [],
      savedIds: [],
      ratings: {},
      sessionsCount: 0,
      streakDays: 0,
      hoursSpent: 0,
      recentEvents: []
    })
    setActiveCourse(null)
    showToast("All activity, course progress, and preferences have been reset.", "info")
  }

  return (
    <div className="app-layout">
      {/* --------------------------------------------------------------------
          1. PERSISTENT SIDEBAR NAVIGATION (DESKTOP & MOBILE DRAWER)
          -------------------------------------------------------------------- */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-header">
          <div className="brand-cluster" onClick={() => setActiveSection('overview')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">LearnIQ</h1>
              <p className="brand-tagline">Personalized learning SaaS</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">Core Platform</div>

          <button
            type="button"
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'roadmap' ? 'active' : ''}`}
            onClick={() => { setActiveSection('roadmap'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">🗺️</span>
            <span>Learning Roadmap</span>
            {targetSkill && <span className="nav-badge-pill highlight">{roadmapCompletedCoursesCount}/{roadmapTotalCoursesCount}</span>}
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'recommendations' ? 'active' : ''}`}
            onClick={() => { setActiveSection('recommendations'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">✨</span>
            <span>Recommendations</span>
            <span className="nav-badge-pill highlight">{displayedRecommendations.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveSection('profile'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">👤</span>
            <span>My Profile</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'preferences' ? 'active' : ''}`}
            onClick={() => { setActiveSection('preferences'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">⚙️</span>
            <span>Learning Preferences</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'activity' ? 'active' : ''}`}
            onClick={() => { setActiveSection('activity'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">⚡</span>
            <span>Activity</span>
            <span className="nav-badge-pill">{activity.completedIds.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'saved' ? 'active' : ''}`}
            onClick={() => { setActiveSection('saved'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">🔖</span>
            <span>Saved Resources</span>
            <span className="nav-badge-pill">{activity.savedIds.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
            onClick={() => { setActiveSection('progress'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📈</span>
            <span>Progress</span>
          </button>

          <div className="nav-group-label" style={{ marginTop: '1.25rem' }}>Preferences</div>

          <button
            type="button"
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">🛠️</span>
            <span>Settings</span>
          </button>
        </nav>

        {/* Prototype Environment Status Card */}
        <div className="sidebar-status-panel">
          <div className="status-indicator-row">
            <span className="pulse-dot-green"></span>
            <span className="status-headline">LearnIQ SaaS</span>
          </div>
          <p className="status-body">
            {currentUser ? `Signed in as ${currentUser.name}. Progress is saved to your account.` : 'Exploring as Guest. Create an account to save custom roadmaps.'}
          </p>
          <div className="status-meta">
            <span>Catalog: {cloudConnected ? '300+ Cloud Courses' : 'Local Fast Catalog'}</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* --------------------------------------------------------------------
          2. MAIN APPLICATION CONTENT AREA
          -------------------------------------------------------------------- */}
      <main className="main-content" id="mainContent">
        {/* Mobile Navigation Bar */}
        <header className="mobile-navbar">
          <div className="brand-cluster" onClick={() => setActiveSection('overview')}>
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-title">LearnIQ</span>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Drawer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </header>

        {/* Top Header */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>LearnIQ</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active" style={{ textTransform: 'capitalize' }}>
                {activeSection === 'overview' && 'Overview Dashboard'}
                {activeSection === 'roadmap' && 'Learning Roadmap'}
                {activeSection === 'profile' && 'Learner Profile'}
                {activeSection === 'preferences' && 'Learning Preferences'}
                {activeSection === 'activity' && 'Learning Activity'}
                {activeSection === 'recommendations' && 'Recommendation Workspace'}
                {activeSection === 'saved' && 'Saved Resources Library'}
                {activeSection === 'progress' && 'Progress Dashboard'}
                {activeSection === 'settings' && 'Platform Settings'}
              </span>
            </div>

            <h2 className="workspace-title">
              {activeSection === 'overview' && 'What should you learn next?'}
              {activeSection === 'roadmap' && (targetSkill ? `${targetSkill} Learning Roadmap` : 'Skill Roadmap Builder')}
              {activeSection === 'profile' && 'Your Learning Profile'}
              {activeSection === 'preferences' && 'Personalization Preferences'}
              {activeSection === 'activity' && 'Your Learning Activity'}
              {activeSection === 'recommendations' && 'Recommended for You'}
              {activeSection === 'saved' && 'Your Saved Learning Library'}
              {activeSection === 'progress' && 'Learning Progress & Milestones'}
              {activeSection === 'settings' && 'Account & Application Settings'}
            </h2>
          </div>

          {/* Header Actions & Profile */}
          <div className="header-actions">
            {/* Quick Global Search */}
            <div className="header-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search skills, courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (activeSection !== 'recommendations' && activeSection !== 'roadmap' && e.target.value) {
                    setActiveSection('recommendations')
                  }
                }}
              />
            </div>

            {/* Recommendations CTA */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateRecommendations}
            >
              <span>✨ Recommendations</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setNotificationOpen(!notificationOpen)}
                title="Notifications"
                aria-label="View notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {activity.recentEvents.length > 0 && <span className="notif-dot" />}
              </button>

              {notificationOpen && (
                <div className="dropdown-panel notif-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Recent Activity</span>
                  </div>
                  <div className="dropdown-list">
                    {activity.recentEvents.length > 0 ? (
                      activity.recentEvents.map(evt => (
                        <div key={evt.id} className="dropdown-item">
                          <span style={{ fontSize: '1rem' }}>{evt.icon}</span>
                          <div>
                            <div style={{ fontSize: '0.78rem', color: '#fff' }}>{evt.title}</div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{evt.time}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                        No new notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Header Element: Guest Buttons VS Logged In Avatar */}
            {currentUser ? (
              <div style={{ position: 'relative' }}>
                <div
                  className="auth-user-badge"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title="View Learner Profile"
                >
                  <div className="user-avatar-circle">
                    {getInitials(currentUser.name || currentUser.username, 'LQ')}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>{targetSkill || currentUser.role}</div>
                  </div>
                </div>

                {userMenuOpen && (
                  <div className="dropdown-panel user-dropdown">
                    <div className="dropdown-header">
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>@{currentUser.username}</div>
                      </div>
                    </div>
                    <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.74rem', color: '#cbd5e1', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>Skill Track: <strong>{targetSkill || 'General AI'}</strong></div>
                      <div>Completed: <strong>{activity.completedIds.length}</strong> • Saved: <strong>{activity.savedIds.length}</strong></div>
                    </div>
                    <button
                      type="button"
                      className="dropdown-action-btn"
                      onClick={() => { setActiveSection('roadmap'); setUserMenuOpen(false); }}
                    >
                      🗺️ Learning Roadmap
                    </button>
                    <button
                      type="button"
                      className="dropdown-action-btn"
                      onClick={() => { setActiveSection('profile'); setUserMenuOpen(false); }}
                    >
                      👤 Edit Profile
                    </button>
                    <button
                      type="button"
                      className="dropdown-action-btn"
                      style={{ color: '#f87171' }}
                      onClick={handleLogout}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthModalOpen(true); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '0.42rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => { setAuthMode('register'); setAuthError(''); setAuthModalOpen(true); }}
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Cloud Warmup Banner if Render instance is spinning up */}
        {cloudWakingUp && (
          <div className="cloud-wakeup-banner">
            <div className="pulse-dot-amber" />
            <div>
              <strong>Connecting to cloud catalog...</strong> Service is spinning up (~30s). Local verified courses and dynamic recommendations are ready immediately!
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 1: OVERVIEW DASHBOARD
            ==================================================================== */}
        {activeSection === 'overview' && (
          <div className="dashboard-content">
            {/* Guest Banner if not signed in */}
            {!currentUser && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>🎓</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                      Welcome to LearnIQ!
                    </h3>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                      Register or sign in with your username and password to track course completions, save your library, and generate a dynamic roadmap.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthModalOpen(true); }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { setAuthMode('register'); setAuthError(''); setAuthModalOpen(true); }}
                  >
                    Create Account →
                  </button>
                </div>
              </div>
            )}

            {/* Top 6 KPI Metric Cards */}
            <div className="overview-kpi-grid">
              <div className="kpi-card" onClick={() => setActiveSection('recommendations')}>
                <div className="kpi-icon-wrap bg-blue-subtle">✨</div>
                <div>
                  <div className="kpi-value">{scoredResources.length}</div>
                  <div className="kpi-label">Recommended for You</div>
                </div>
                <span className="kpi-subtext">Curated to your profile</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('roadmap')}>
                <div className="kpi-icon-wrap bg-emerald-subtle">🗺️</div>
                <div>
                  <div className="kpi-value">{roadmapProgressPercent}%</div>
                  <div className="kpi-label">Roadmap Progress</div>
                </div>
                <span className="kpi-subtext">{roadmapCompletedCoursesCount} of {roadmapTotalCoursesCount} modules done</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('profile')}>
                <div className="kpi-icon-wrap bg-purple-subtle">🧠</div>
                <div>
                  <div className="kpi-value">{targetSkill || (profile.interests.length > 0 ? profile.interests[0] : 'All Skills')}</div>
                  <div className="kpi-label">Target Skill Track</div>
                </div>
                <span className="kpi-subtext">Across {profile.experience} level</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('saved')}>
                <div className="kpi-icon-wrap bg-amber-subtle">🔖</div>
                <div>
                  <div className="kpi-value">{activity.savedIds.length}</div>
                  <div className="kpi-label">Saved Resources</div>
                </div>
                <span className="kpi-subtext">In your personal library</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('activity')}>
                <div className="kpi-icon-wrap bg-rose-subtle">🔥</div>
                <div>
                  <div className="kpi-value">{activity.streakDays} Days</div>
                  <div className="kpi-label">Learning Streak</div>
                </div>
                <span className="kpi-subtext">Active momentum</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('profile')}>
                <div className="kpi-icon-wrap bg-cyan-subtle">👤</div>
                <div>
                  <div className="kpi-value">{profileCompleteness}%</div>
                  <div className="kpi-label">Profile Complete</div>
                </div>
                <span className="kpi-subtext">Personalization accuracy</span>
              </div>
            </div>

            {/* In-Progress "Continue Learning" Card OR "Ready to Start Learning" Callout */}
            {activeCourse ? (
              <section className="continue-learning-card">
                <div className="continue-learning-info">
                  <div className="continue-eyebrow">
                    <span>⚡</span> CURRENT IN-PROGRESS RESOURCE
                  </div>
                  <h3 className="continue-title">{activeCourse.title}</h3>
                  <div className="continue-meta">
                    <span>Provider: <strong style={{ color: '#fff' }}>{activeCourse.provider}</strong></span>
                    <span>•</span>
                    <span>Format: <strong style={{ color: '#38bdf8' }}>{activeCourse.type}</strong></span>
                    <span>•</span>
                    <span>Level: <strong style={{ color: '#fff' }}>{activeCourse.difficulty}</strong></span>
                    <span>•</span>
                    <span>Duration: <strong style={{ color: '#cbd5e1' }}>{activeCourse.duration}</strong></span>
                  </div>

                  <div className="continue-progress-wrap">
                    <div className="continue-progress-bar">
                      <div
                        className="continue-progress-fill"
                        style={{ width: `${(activity.completedIds || []).includes(activeCourse.id) ? 100 : (activeCourse.progress || 25)}%` }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      {(activity.completedIds || []).includes(activeCourse.id) ? '100% Completed' : `${activeCourse.progress || 25}% In-Progress`}
                    </span>
                  </div>
                </div>

                <div className="continue-actions">
                  <button
                    type="button"
                    className="btn-launch"
                    onClick={() => handleStartLearning(activeCourse)}
                  >
                    <span>Resume Learning</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-action-outline"
                    onClick={() => toggleCompleteResource(activeCourse.id, activeCourse.title)}
                  >
                    {activity.completedIds.includes(activeCourse.id) ? '✓ Completed' : 'Mark Done'}
                  </button>
                </div>
              </section>
            ) : (
              <section className="continue-learning-card" style={{ background: 'linear-gradient(135deg, rgba(16, 23, 38, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)', borderStyle: 'dashed' }}>
                <div className="continue-learning-info">
                  <div className="continue-eyebrow" style={{ color: '#38bdf8' }}>
                    <span>🎯</span> READY TO START LEARNING
                  </div>
                  <h3 className="continue-title" style={{ fontSize: '1.2rem' }}>
                    {targetSkill ? `Begin your ${targetSkill} learning pathway` : 'Discover your first personalized resource'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 0.75rem', maxWidth: '650px' }}>
                    You do not have any courses currently in progress. Search for a skill to generate a step-by-step roadmap, or explore recommended courses below.
                  </p>
                </div>

                <div className="continue-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveSection('roadmap')}
                  >
                    <span>🗺️ Open Learning Roadmap</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveSection('recommendations')}
                  >
                    <span>Explore Recommendations</span>
                  </button>
                </div>
              </section>
            )}

            {/* Top Recommended Highlights */}
            <div className="section-header-row">
              <div>
                <h3 className="section-title">Top Recommendations for Your Journey</h3>
                <p className="section-subtitle">
                  Curated specifically for <strong>{targetSkill || profile.goal}</strong> and your <strong>{profile.experience}</strong> experience level.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveSection('recommendations')}
              >
                View All ({scoredResources.length}) →
              </button>
            </div>

            <div className="recommendations-grid">
              {scoredResources.slice(0, 3).map((res) => {
                const isSaved = activity.savedIds.includes(res.id)
                const isCompleted = activity.completedIds.includes(res.id)
                return (
                  <article key={res.id} className="saas-card" onClick={() => setModalResource(res)}>
                    <div className="saas-card-header">
                      <div className="card-badge-row">
                        <span className="badge-pill badge-type">{res.type}</span>
                        <span className="badge-pill badge-level">{res.difficulty}</span>
                        <span className="badge-pill badge-topic">{res.topic}</span>
                      </div>
                      <span className="card-match-badge">{res.relevanceScore}% Match</span>
                    </div>

                    <h4 className="card-title">{res.title}</h4>
                    <p className="card-desc">{res.description}</p>

                    {/* Why this resource component */}
                    <div className="why-recommended-box">
                      <span className="why-icon">💡</span>
                      <span>{res.whyRecommended}</span>
                    </div>

                    <div className="card-meta-row">
                      <span>★ {res.rating}</span>
                      <span>•</span>
                      <span>{res.duration}</span>
                      <span>•</span>
                      <span>{res.provider}</span>
                    </div>

                    <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-launch-sm"
                        onClick={() => handleStartLearning(res)}
                      >
                        Start Learning ↗
                      </button>

                      <button
                        type="button"
                        className={`btn-icon-subtle ${isSaved ? 'active-save' : ''}`}
                        onClick={() => toggleSaveResource(res.id, res.title)}
                        title={isSaved ? "Remove from library" : "Save for later"}
                      >
                        {isSaved ? '★ Saved' : '🔖 Save'}
                      </button>

                      <button
                        type="button"
                        className={`btn-icon-subtle ${isCompleted ? 'active-done' : ''}`}
                        onClick={() => toggleCompleteResource(res.id, res.title)}
                        title={isCompleted ? "Completed!" : "Mark completed"}
                      >
                        {isCompleted ? '✓ Done' : 'Complete'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 2: DEDICATED LEARNING ROADMAP (NEW & REFINED)
            ==================================================================== */}
        {activeSection === 'roadmap' && (
          <div className="section-container" id="learningRoadmapSection">
            {/* Roadmap Header & Skill Selector */}
            <div className="form-card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    <span>🗺️</span> DYNAMIC LEARNING PATHWAY
                  </div>
                  <h3 className="form-card-title" style={{ fontSize: '1.4rem' }}>
                    {targetSkill ? `${targetSkill} Career Roadmap` : 'Custom Learning Pathway'}
                  </h3>
                  <p className="form-card-subtitle">
                    {targetSkill 
                      ? `Step-by-step curated curriculum tailored to master ${targetSkill} from beginner fundamentals to portfolio production.`
                      : 'Type any skill below to generate your personalized 4-stage learning pathway.'}
                  </p>
                </div>

                {/* Target Skill Search / Quick Selector */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', minWidth: '220px' }}>
                    <input
                      type="text"
                      className="auth-input"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
                      placeholder="Type skill (e.g. Python, ML, GenAI)..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && skillInput.trim()) {
                          handleSetTargetSkill(skillInput.trim())
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
                    onClick={() => {
                      if (skillInput.trim()) handleSetTargetSkill(skillInput.trim())
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Quick Skill Recommendation Chips */}
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Quick Pathways:</span>
                {['Python', 'Machine Learning', 'Generative AI', 'Deep Learning', 'Data Science', 'MLOps', 'AI Agents'].map(sk => (
                  <button
                    key={sk}
                    type="button"
                    className={`chip ${(targetSkill || '').toLowerCase() === (sk || '').toLowerCase() ? 'selected' : ''}`}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.65rem' }}
                    onClick={() => handleSetTargetSkill(sk)}
                  >
                    {sk}
                  </button>
                ))}
              </div>

              {/* Overall Roadmap Progress Meter */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Overall Roadmap Completion</span>
                  <span style={{ fontWeight: 800, color: roadmapProgressPercent === 100 ? '#10b981' : '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {roadmapCompletedCoursesCount} of {roadmapTotalCoursesCount} Courses Finished ({roadmapProgressPercent}%)
                  </span>
                </div>
                <div className="roadmap-progress-bar-container" style={{ height: '10px' }}>
                  <div
                    className="roadmap-progress-bar-fill"
                    style={{
                      width: `${roadmapProgressPercent}%`,
                      background: roadmapProgressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4 Multi-Stage Visual Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {roadmapStages.map((stage) => {
                const stageDoneCount = stage.courses.filter(c => (activity.completedIds || []).includes(c.id)).length
                const stageTotal = stage.courses.length
                const stagePct = stageTotal > 0 ? Math.round((stageDoneCount / stageTotal) * 100) : 0
                const isStageComplete = stageTotal > 0 && stageDoneCount === stageTotal

                return (
                  <div
                    key={stage.id}
                    className="form-card"
                    style={{
                      borderColor: isStageComplete ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                      background: isStageComplete ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: isStageComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                          border: `1px solid ${isStageComplete ? '#10b981' : '#38bdf8'}`,
                          color: isStageComplete ? '#34d399' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          flexShrink: 0
                        }}>
                          {isStageComplete ? '✓' : stage.number}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                            Stage {stage.number}: {stage.title}
                          </h4>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                            {stage.subtitle}
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: isStageComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          color: isStageComplete ? '#34d399' : '#94a3b8'
                        }}>
                          {stageDoneCount} / {stageTotal} Finished ({stagePct}%)
                        </span>
                      </div>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="roadmap-stage-progress-bar" style={{ marginTop: '0.85rem' }}>
                      <div
                        className={`roadmap-stage-progress-fill ${isStageComplete ? 'is-done' : ''}`}
                        style={{ width: `${stagePct}%` }}
                      />
                    </div>

                    {/* Courses inside this stage */}
                    <div className="roadmap-stage-courses">
                      {stage.courses.map((course) => {
                        const isDone = activity.completedIds.includes(course.id)
                        const isActive = activeCourse && activeCourse.id === course.id

                        return (
                          <div
                            key={course.id}
                            className={`roadmap-course-item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <div>
                                <div className="roadmap-course-title">
                                  {isDone && <span style={{ color: '#34d399', marginRight: '0.4rem' }}>✓</span>}
                                  {course.title}
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', alignItems: 'center' }}>
                                  <span>{course.provider}</span>
                                  <span>•</span>
                                  <span>{course.difficulty}</span>
                                  <span>•</span>
                                  <span>{course.duration}</span>
                                  <span>•</span>
                                  <span style={{ color: '#38bdf8' }}>{course.type}</span>
                                </div>
                              </div>

                              <div className="roadmap-course-actions">
                                <button
                                  type="button"
                                  className="btn-roadmap-launch"
                                  onClick={() => handleStartLearning(course)}
                                  title="Start or resume this course"
                                >
                                  Launch Content ↗
                                </button>

                                <button
                                  type="button"
                                  className={`btn-roadmap-action ${isDone ? 'btn-done' : ''}`}
                                  onClick={() => toggleCompleteResource(course.id, course.title)}
                                  title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                                >
                                  {isDone ? '✓ Completed' : 'Mark Done'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 3: LEARNER PROFILE
            ==================================================================== */}
        {activeSection === 'profile' && (
          <div className="section-container">
            <div className="form-card">
              <h3 className="form-card-title">1. Target Learning Skill</h3>
              <p className="form-card-subtitle">Set your primary technical focus to calibrate your roadmap and recommendation workspace.</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', maxWidth: '480px' }}>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Machine Learning, Python, Generative AI"
                  value={targetSkill}
                  onChange={(e) => setTargetSkill(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSetTargetSkill(targetSkill || 'Machine Learning')}
                >
                  Save Skill
                </button>
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">2. Experience Level</h3>
              <p className="form-card-subtitle">Choose where you are currently starting in your technical journey.</p>
              <div className="button-group-row">
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    className={`btn-choice ${profile.experience === lvl ? 'selected' : ''}`}
                    onClick={() => setProfile(p => ({ ...p, experience: lvl }))}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{lvl}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {lvl === 'Beginner' && 'Foundational principles and syntax'}
                      {lvl === 'Intermediate' && 'Hands-on projects and frameworks'}
                      {lvl === 'Advanced' && 'Distributed systems & optimization'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">3. Primary Learning Goal</h3>
              <p className="form-card-subtitle">Select the main milestone you want LearnIQ to guide you towards.</p>
              <div className="chips-grid">
                {[
                  'Learn AI fundamentals',
                  'Build AI projects',
                  'Prepare for academic studies',
                  'Prepare for interviews',
                  'Career development',
                  'Career transition',
                  'Research and specialization'
                ].map(goal => (
                  <button
                    key={goal}
                    type="button"
                    className={`chip ${profile.goal === goal ? 'selected' : ''}`}
                    onClick={() => setProfile(p => ({ ...p, goal }))}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">4. Areas of Interest (Multi-select)</h3>
              <p className="form-card-subtitle">Select topics that you want prioritized in your recommendations.</p>
              <div className="chips-grid">
                {TOPIC_CHIPS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    className={`chip ${profile.interests.includes(chip) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(chip)}
                  >
                    {profile.interests.includes(chip) ? '✓ ' : '+ '}{chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="two-col-grid">
              <div className="form-card">
                <h3 className="form-card-title">Preferred Resource Format</h3>
                <p className="form-card-subtitle">How do you prefer to absorb new knowledge?</p>
                <select
                  className="saas-select"
                  value={profile.format}
                  onChange={(e) => setProfile(p => ({ ...p, format: e.target.value }))}
                >
                  <option value="Course">Full Comprehensive Courses</option>
                  <option value="Video">Video Walkthroughs &amp; Lectures</option>
                  <option value="Interactive lesson">Interactive Coding Environments</option>
                  <option value="Project">Real-World Portfolio Projects</option>
                  <option value="Tutorial">Concise Step-by-Step Tutorials</option>
                  <option value="mixed">Mixed Formats</option>
                </select>
              </div>

              <div className="form-card">
                <h3 className="form-card-title">Available Weekly Study Time</h3>
                <p className="form-card-subtitle">Calibrate module length to your schedule.</p>
                <select
                  className="saas-select"
                  value={profile.weeklyTime}
                  onChange={(e) => setProfile(p => ({ ...p, weeklyTime: e.target.value }))}
                >
                  <option value="1-3 hours">1–3 hours/week (Light Explorer)</option>
                  <option value="4-6 hours">4–6 hours/week (Consistent Pace)</option>
                  <option value="7-10 hours">7–10 hours/week (Accelerated)</option>
                  <option value="12+ hours">12+ hours/week (Full Immersion)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 4: LEARNING PREFERENCES
            ==================================================================== */}
        {activeSection === 'preferences' && (
          <div className="section-container">
            <div className="form-card">
              <h3 className="form-card-title">Hands-on Code vs. Theory Focus</h3>
              <p className="form-card-subtitle">
                Calibrate whether recommendations should prioritize practical code implementations or foundational theoretical rigor.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  <span>Theoretical Rigor &amp; Concepts (0%)</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800 }}>{preferences.handsOnTheory}% Hands-on Code</span>
                  <span>Pure Projects &amp; Code (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.handsOnTheory}
                  onChange={(e) => setPreferences(p => ({ ...p, handsOnTheory: Number(e.target.value) }))}
                  className="saas-slider"
                />
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">Project-Based vs. Academic Curriculum</h3>
              <p className="form-card-subtitle">
                Balance between university-style lecture courses and building portfolio-ready applications.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  <span>Academic Lectures (0%)</span>
                  <span style={{ color: '#a855f7', fontWeight: 800 }}>{preferences.projectBased}% Portfolio Projects</span>
                  <span>Independent Projects (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.projectBased}
                  onChange={(e) => setPreferences(p => ({ ...p, projectBased: Number(e.target.value) }))}
                  className="saas-slider"
                />
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">Catalog Curation Toggles</h3>
              <p className="form-card-subtitle">Refine the discovery criteria across all recommended courses.</p>

              <div className="toggle-list">
                <div className="toggle-item">
                  <div>
                    <div className="toggle-label">Free Resources Only</div>
                    <div className="toggle-desc">Show only open-access, zero-cost verified courses and tutorials.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.freeOnly}
                      onChange={(e) => setPreferences(p => ({ ...p, freeOnly: e.target.checked }))}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div>
                    <div className="toggle-label">Certification Track</div>
                    <div className="toggle-desc">Highlight courses that provide verifiable credentials, certificates, or university credits.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.certificationTrack}
                      onChange={(e) => setPreferences(p => ({ ...p, certificationTrack: e.target.checked }))}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div>
                    <div className="toggle-label">Adaptive Stretch Challenges</div>
                    <div className="toggle-desc">Occasionally surface advanced modules slightly beyond your current experience level to accelerate mastery.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.adaptiveDifficulty}
                      onChange={(e) => setPreferences(p => ({ ...p, adaptiveDifficulty: e.target.checked }))}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetPreferences}
              >
                Reset Dials
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateRecommendations}
              >
                Apply Preferences &amp; Update Recommendations →
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 5: LEARNING ACTIVITY
            ==================================================================== */}
        {activeSection === 'activity' && (
          <div className="section-container">
            {/* Interactive Activity Signals Dashboard */}
            <div className="activity-stepper-grid">
              <div className="stepper-card">
                <div className="stepper-title">Completed Modules</div>
                <div className="stepper-value-row">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setActivity(p => ({ ...p, completedIds: p.completedIds.slice(0, -1) }))}
                  >
                    -
                  </button>
                  <span className="stepper-number text-emerald">{activity.completedIds.length}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => {
                      const unused = allResources.find(r => !activity.completedIds.includes(r.id))
                      if (unused) toggleCompleteResource(unused.id, unused.title)
                    }}
                  >
                    +
                  </button>
                </div>
                <span className="stepper-subtext">Verified completions</span>
              </div>

              <div className="stepper-card">
                <div className="stepper-title">Saved Library Items</div>
                <div className="stepper-value-row">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setActivity(p => ({ ...p, savedIds: p.savedIds.slice(0, -1) }))}
                  >
                    -
                  </button>
                  <span className="stepper-number text-blue">{activity.savedIds.length}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => {
                      const unused = allResources.find(r => !activity.savedIds.includes(r.id))
                      if (unused) toggleSaveResource(unused.id, unused.title)
                    }}
                  >
                    +
                  </button>
                </div>
                <span className="stepper-subtext">Wishlist bookmarks</span>
              </div>

              <div className="stepper-card">
                <div className="stepper-title">Courses Rated</div>
                <div className="stepper-value-row">
                  <span className="stepper-number text-amber">{Object.keys(activity.ratings).length}</span>
                </div>
                <span className="stepper-subtext">Feedback signals recorded</span>
              </div>

              <div className="stepper-card">
                <div className="stepper-title">Total Study Sessions</div>
                <div className="stepper-value-row">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setActivity(p => ({ ...p, sessionsCount: Math.max(0, p.sessionsCount - 1) }))}
                  >
                    -
                  </button>
                  <span className="stepper-number text-purple">{activity.sessionsCount}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setActivity(p => ({ ...p, sessionsCount: p.sessionsCount + 1 }))}
                  >
                    +
                  </button>
                </div>
                <span className="stepper-subtext">Recorded platform sessions</span>
              </div>
            </div>

            {/* Timeline of Recent Activity */}
            <div className="form-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="form-card-title">Recent Learning Sessions &amp; Milestones</h3>
              <p className="form-card-subtitle">Live log of your activity and actions recorded across LearnIQ.</p>

              <div className="timeline-container">
                {activity.recentEvents.length > 0 ? (
                  activity.recentEvents.map((evt) => (
                    <div key={evt.id} className="timeline-event">
                      <div className="timeline-icon-circle">{evt.icon}</div>
                      <div className="timeline-body">
                        <div className="timeline-title">{evt.title}</div>
                        <div className="timeline-time">{evt.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No activity recorded yet. Start exploring courses or launching your roadmap to record learning milestones.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 6: RECOMMENDATIONS WORKSPACE
            ==================================================================== */}
        {activeSection === 'recommendations' && (
          <div className="section-container" id="recommendationsWorkspace">
            {/* Control & Filter Toolbar */}
            <div className="catalog-toolbar">
              <div className="catalog-search-row">
                <div className="search-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by skill, topic, instructor, or framework..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
                  )}
                </div>

                {/* Filter: Topic */}
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    <option value="all">All Topics</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="Python">Python</option>
                    <option value="Deep Learning">Deep Learning</option>
                    <option value="Natural Language Processing">NLP</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="MLOps">MLOps</option>
                    <option value="AI Agents">AI Agents</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>

                {/* Filter: Difficulty */}
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Filter: Format */}
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                  >
                    <option value="all">All Formats</option>
                    <option value="Course">Full Courses</option>
                    <option value="Video">Video Lessons</option>
                    <option value="Interactive lesson">Interactive</option>
                    <option value="Project">Capstone Projects</option>
                    <option value="Tutorial">Tutorials</option>
                    <option value="Article">Technical Articles</option>
                  </select>
                </div>

                {/* Filter: Sort By */}
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Sort: Most Relevant</option>
                    <option value="rating">Sort: Highest Rated</option>
                    <option value="duration">Sort: Shortest Duration</option>
                  </select>
                </div>
              </div>

              {/* Sub-filters and results summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`filter-pill ${selectedPricing === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedPricing('all')}
                  >
                    All Pricing
                  </button>
                  <button
                    type="button"
                    className={`filter-pill ${selectedPricing === 'free' ? 'active' : ''}`}
                    onClick={() => setSelectedPricing('free')}
                  >
                    Free Only
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                    Showing <strong>{displayedRecommendations.length}</strong> personalized resources
                  </span>

                  {/* Quick roadmap generator from search query */}
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '0.2rem 0.65rem', fontSize: '0.74rem', marginLeft: '0.5rem' }}
                      onClick={() => {
                        handleSetTargetSkill(searchQuery.trim())
                        setActiveSection('roadmap')
                      }}
                    >
                      🗺️ Generate "{searchQuery.trim()}" Roadmap →
                    </button>
                  )}
                </div>

                {(selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedFormat !== 'all' || selectedPricing !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    className="btn-action-outline"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => {
                      setSelectedTopic('all')
                      setSelectedDifficulty('all')
                      setSelectedFormat('all')
                      setSelectedPricing('all')
                      setSearchQuery('')
                    }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="recommendations-grid" style={{ marginTop: '1.5rem' }}>
              {displayedRecommendations.map((res) => {
                const isSaved = activity.savedIds.includes(res.id)
                const isCompleted = activity.completedIds.includes(res.id)
                const currentRating = activity.ratings[res.id] || 0

                return (
                  <article key={res.id} className="saas-card" onClick={() => setModalResource(res)}>
                    <div className="saas-card-header">
                      <div className="card-badge-row">
                        <span className="badge-pill badge-type">{res.type}</span>
                        <span className="badge-pill badge-level">{res.difficulty}</span>
                        <span className="badge-pill badge-topic">{res.topic}</span>
                        {res.isFree && <span className="badge-pill badge-free">Free</span>}
                      </div>
                      <span className="card-match-badge">{res.relevanceScore}% Match</span>
                    </div>

                    <h4 className="card-title">{res.title}</h4>
                    <p className="card-desc">{res.description}</p>

                    {/* Explanatory "Why this is recommended" component */}
                    <div className="why-recommended-box">
                      <span className="why-icon">💡</span>
                      <span>{res.whyRecommended}</span>
                    </div>

                    <div className="card-meta-row">
                      <span>★ {res.rating}</span>
                      <span>•</span>
                      <span>{res.duration}</span>
                      <span>•</span>
                      <span>{res.provider}</span>
                      <span>•</span>
                      <span>{res.learnerCount}</span>
                    </div>

                    <div className="card-tags-row">
                      {normalizeTags(res.tags).slice(0, 3).map((tag, tIdx) => (
                        <span key={tIdx} className="card-tag">{tag}</span>
                      ))}
                    </div>

                    <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-launch-sm"
                        onClick={() => handleStartLearning(res)}
                      >
                        Start Learning ↗
                      </button>

                      <button
                        type="button"
                        className={`btn-icon-subtle ${isSaved ? 'active-save' : ''}`}
                        onClick={() => toggleSaveResource(res.id, res.title)}
                        title={isSaved ? "Remove from saved library" : "Save for later"}
                      >
                        {isSaved ? '★ Saved' : '🔖 Save'}
                      </button>

                      <button
                        type="button"
                        className={`btn-icon-subtle ${isCompleted ? 'active-done' : ''}`}
                        onClick={() => toggleCompleteResource(res.id, res.title)}
                        title={isCompleted ? "Marked as completed" : "Mark as completed"}
                      >
                        {isCompleted ? '✓ Done' : 'Complete'}
                      </button>

                      {/* Interactive 5-star rating */}
                      <div className="star-rating-row" title="Rate this resource">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star-char ${currentRating >= star ? 'star-filled' : ''}`}
                            onClick={() => handleRateResource(res.id, star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Empty State when zero results match filters */}
            {displayedRecommendations.length === 0 && (
              <div className="empty-state-card">
                <div className="empty-icon">🔍</div>
                <h3>No Matching Recommendations</h3>
                <p>No learning resources found matching your active filter criteria. Try broadening your topic or difficulty filters.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedTopic('all')
                    setSelectedDifficulty('all')
                    setSelectedFormat('all')
                    setSelectedPricing('all')
                    setSearchQuery('')
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SECTION 7: SAVED RESOURCES LIBRARY
            ==================================================================== */}
        {activeSection === 'saved' && (
          <div className="section-container">
            <div className="section-header-row">
              <div>
                <h3 className="section-title">Your Saved Library ({savedResourcesList.length})</h3>
                <p className="section-subtitle">Resources bookmarked to explore, practice, or reference later.</p>
              </div>
            </div>

            {savedResourcesList.length > 0 ? (
              <div className="recommendations-grid">
                {savedResourcesList.map(res => (
                  <article key={res.id} className="saas-card" onClick={() => setModalResource(res)}>
                    <div className="saas-card-header">
                      <div className="card-badge-row">
                        <span className="badge-pill badge-type">{res.type}</span>
                        <span className="badge-pill badge-level">{res.difficulty}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon-subtle active-save"
                        onClick={(e) => { e.stopPropagation(); toggleSaveResource(res.id, res.title); }}
                        title="Remove bookmark"
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <h4 className="card-title">{res.title}</h4>
                    <p className="card-desc">{res.description}</p>

                    <div className="card-meta-row">
                      <span>★ {res.rating}</span>
                      <span>•</span>
                      <span>{res.duration}</span>
                      <span>•</span>
                      <span>{res.provider}</span>
                    </div>

                    <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-launch-sm"
                        onClick={() => handleStartLearning(res)}
                      >
                        Launch Content ↗
                      </button>
                      <button
                        type="button"
                        className={`btn-icon-subtle ${(activity.completedIds || []).includes(res.id) ? 'active-done' : ''}`}
                        onClick={() => toggleCompleteResource(res.id, res.title)}
                      >
                        {(activity.completedIds || []).includes(res.id) ? '✓ Completed' : 'Mark Done'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <div className="empty-icon">🔖</div>
                <h3>No saved resources yet</h3>
                <p>Save learning resources you want to explore later by clicking the bookmark button on any recommendation card.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveSection('recommendations')}
                >
                  Explore Recommendations →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            SECTION 8: PROGRESS DASHBOARD
            ==================================================================== */}
        {activeSection === 'progress' && (
          <div className="section-container">
            {/* Overall Progress Stat Banners */}
            <div className="form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 className="form-card-title" style={{ margin: 0 }}>Overall Milestone Progress</h3>
                  <p className="form-card-subtitle" style={{ margin: 0, marginTop: '0.2rem' }}>
                    Track your journey toward mastering <strong>{targetSkill || profile.goal}</strong>.
                  </p>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: roadmapCompletedCoursesCount > 0 ? '#10b981' : '#94a3b8' }}>
                  {roadmapCompletedCoursesCount} / {roadmapTotalCoursesCount} Completed ({roadmapProgressPercent}%)
                </div>
              </div>

              <div className="roadmap-progress-bar-container" style={{ height: '12px' }}>
                <div
                  className="roadmap-progress-bar-fill"
                  style={{ width: `${roadmapProgressPercent}%` }}
                />
              </div>

              <div className="progress-highlights-grid">
                <div className="progress-stat-box">
                  <div className="stat-label">Hours Invested</div>
                  <div className="stat-value">{activity.hoursSpent} hrs</div>
                  <div className="stat-sub">Across {activity.sessionsCount} study sessions</div>
                </div>

                <div className="progress-stat-box">
                  <div className="stat-label">Continuous Streak</div>
                  <div className="stat-value">{activity.streakDays} Days 🔥</div>
                  <div className="stat-sub">Goal: 7 days target</div>
                </div>

                <div className="progress-stat-box">
                  <div className="stat-label">Verified Modules</div>
                  <div className="stat-value">{activity.completedIds.length} Finished</div>
                  <div className="stat-sub">{activity.savedIds.length} Bookmarked</div>
                </div>
              </div>
            </div>

            {/* Dynamic Subject Mastery Progress Bars (Zero fake samples) */}
            <div className="form-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="form-card-title">Subject Mastery Breakdown</h3>
              <p className="form-card-subtitle">Actual proficiency based on completed exercises and courses in each subject.</p>

              <div className="topic-mastery-list">
                {topicMasteryData.map(item => (
                  <div key={item.topic} className="topic-mastery-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
                      <span>{item.topic}</span>
                      <span style={{ color: item.completedCount > 0 ? item.color : '#64748b' }}>
                        {item.progress}% Mastery ({item.completedCount} completed)
                      </span>
                    </div>
                    <div className="topic-bar-track">
                      <div className="topic-bar-fill" style={{ width: `${item.progress}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 9: SETTINGS & ACCOUNT MANAGEMENT
            ==================================================================== */}
        {activeSection === 'settings' && (
          <div className="section-container">
            <div className="form-card">
              <h3 className="form-card-title">Scholar Account Profile</h3>
              <p className="form-card-subtitle">Manage your account credentials and personal display details.</p>

              {currentUser ? (
                <div style={{ marginTop: '1.25rem' }}>
                  <div className="two-col-grid">
                    <div>
                      <label className="auth-label">Full Name</label>
                      <input
                        type="text"
                        className="auth-input"
                        value={profile.name}
                        onChange={(e) => {
                          const newName = e.target.value
                          setProfile(p => ({ ...p, name: newName }))
                          if (currentUser) {
                            setCurrentUser(u => ({ ...u, name: newName }))
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="auth-label">Username</label>
                      <input
                        type="text"
                        className="auth-input"
                        value={currentUser.username}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={handleLogout}
                    >
                      🚪 Sign Out of Account
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1.25rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    You are currently using LearnIQ in Guest Mode. Register with a username and password to keep your courses, roadmap, and preferences synchronized.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                    >
                      Create Account
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setAuthMode('signin'); setAuthModalOpen(true); }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="form-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <h3 className="form-card-title" style={{ color: '#f87171' }}>Reset &amp; Danger Zone</h3>
              <p className="form-card-subtitle">
                Clear all custom preferences, bookmarked resources, and activity logs to restore initial defaults.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  onClick={handleDangerZoneReset}
                >
                  Reset All Settings to Factory Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------
            3. FOOTER
            -------------------------------------------------------------------- */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="brand-subtext"><strong>LearnIQ</strong> — Personalized Learning Platform</span>
              <span className="footer-dot">•</span>
              <span>EdTech SaaS</span>
              <span className="footer-dot">•</span>
              <span>Intelligent Resource Recommendations &amp; Dynamic Roadmap</span>
            </div>
            <div className="footer-right">
              <span>{allResources.length} Curated Technical Modules</span>
            </div>
          </div>
        </footer>
      </main>

      {/* --------------------------------------------------------------------
          4. AUTHENTICATION MODAL (REGISTRATION & SIGN IN)
          -------------------------------------------------------------------- */}
      {authModalOpen && (
        <div className="auth-modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  {authMode === 'signin' ? 'Sign In to LearnIQ' : 'Create Scholar Account'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAuthModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                ⚠️ {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault()
              if (authMode === 'signin') {
                handleLogin(authForm.username, authForm.password)
              } else {
                handleRegister(authForm.name, authForm.username, authForm.password, authForm.targetSkill)
              }
            }}>
              {authMode === 'register' && (
                <div className="auth-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Alex Morgan"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="auth-form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Choose or enter your username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm(p => ({ ...p, username: e.target.value }))}
                  required
                  autoCapitalize="none"
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              {authMode === 'register' && (
                <div className="auth-form-group">
                  <label>Target Learning Skill (Optional)</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Python, Machine Learning, Generative AI"
                    value={authForm.targetSkill}
                    onChange={(e) => setAuthForm(p => ({ ...p, targetSkill: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                    We will immediately construct your 4-stage learning roadmap.
                  </span>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                {authMode === 'signin' ? 'Sign In to Dashboard' : 'Register & Start Learning'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', color: '#94a3b8' }}>
              {authMode === 'signin' ? (
                <span>
                  New to LearnIQ?{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 700 }}
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          5. RESOURCE DETAILS MODAL
          -------------------------------------------------------------------- */}
      {modalResource && (
        <div className="modal-overlay" onClick={() => setModalResource(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-badge-row">
                <span className="badge-pill badge-type">{modalResource.type}</span>
                <span className="badge-pill badge-level">{modalResource.difficulty}</span>
                <span className="badge-pill badge-topic">{modalResource.topic}</span>
                <span className="card-match-badge">{modalResource.relevanceScore}% Match</span>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setModalResource(null)}>×</button>
            </div>

            <h2 className="modal-title">{modalResource.title}</h2>
            <div className="modal-provider-row">
              <span>Offered by <strong>{modalResource.provider}</strong></span>
              <span>•</span>
              <span>Duration: <strong>{modalResource.duration}</strong></span>
              <span>•</span>
              <span>Rating: <strong>★ {modalResource.rating}</strong></span>
            </div>

            <p className="modal-desc">{modalResource.description}</p>

            {/* Why Recommended in modal */}
            <div className="why-recommended-box" style={{ margin: '1.25rem 0' }}>
              <span className="why-icon">💡</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: '#fff', marginBottom: '0.15rem' }}>
                  Why this is recommended for you:
                </strong>
                <span>{modalResource.whyRecommended}</span>
              </div>
            </div>

            <div className="modal-section-title">Key Learning Outcomes</div>
            <ul className="modal-outcomes-list">
              {(modalResource.outcomes || [
                'Master theoretical and applied foundations in this domain.',
                'Build hands-on code examples and portfolio projects.',
                'Follow industry best practices for implementation and performance.'
              ]).map((out, idx) => (
                <li key={idx}>{out}</li>
              ))}
            </ul>

            <div className="modal-section-title" style={{ marginTop: '1rem' }}>Prerequisites</div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              {modalResource.prerequisites || 'Basic familiarity with computer science concepts and Python programming.'}
            </p>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  toggleSaveResource(modalResource.id, modalResource.title)
                }}
              >
                {(activity.savedIds || []).includes(modalResource.id) ? '★ Saved in Library' : '🔖 Bookmark Resource'}
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handleStartLearning(modalResource)
                  setModalResource(null)
                }}
              >
                Start Learning Now ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
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
