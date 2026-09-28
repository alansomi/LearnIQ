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
// 2. MAIN APPLICATION COMPONENT
// --------------------------------------------------------------------------
export default function App() {
  // Navigation State: 'overview', 'profile', 'preferences', 'activity', 'recommendations', 'saved', 'progress', 'settings'
  const [activeSection, setActiveSection] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ------------------------------------------------------------------------
  // Learner Profile State (Stored in localStorage)
  // ------------------------------------------------------------------------
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ailearn_profile')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      name: 'Alex Morgan',
      role: 'Verified Scholar',
      experience: 'Intermediate',
      goal: 'Build AI projects',
      interests: ['Machine Learning', 'Generative AI', 'Python', 'AI Agents'],
      format: 'Course',
      weeklyTime: '7-10 hours',
      studySchedule: 'Flexible / Self-paced'
    }
  })

  // ------------------------------------------------------------------------
  // Learning Preferences State (Personalization dials)
  // ------------------------------------------------------------------------
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('ailearn_preferences')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      handsOnTheory: 75, // 0 = Pure Theory, 100 = Pure Hands-on Code
      projectBased: 80,   // 0 = Academic, 100 = Project-Driven
      contentLength: 'Medium (3-10 hrs)',
      adaptiveDifficulty: true,
      freeOnly: false,
      certificationTrack: true
    }
  })

  // ------------------------------------------------------------------------
  // Learning Activity & Signals State
  // ------------------------------------------------------------------------
  const [activity, setActivity] = useState(() => {
    try {
      const saved = localStorage.getItem('ailearn_activity')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      completedIds: ['lr-1'],
      savedIds: ['lr-2', 'lr-5', 'lr-7'],
      ratings: { 'lr-1': 5, 'lr-4': 5 },
      sessionsCount: 8,
      streakDays: 5,
      hoursSpent: 16.5,
      recentEvents: [
        { id: 1, title: 'Completed Module: Supervised Learning Foundations', time: 'Yesterday', icon: '✓' },
        { id: 2, title: 'Saved "Generative AI with Large Language Models"', time: '2 days ago', icon: '🔖' },
        { id: 3, title: 'Rated "PyTorch for Deep Learning" 5 Stars', time: '3 days ago', icon: '★' },
        { id: 4, title: 'Achieved 5-Day Continuous Learning Streak', time: '4 days ago', icon: '🔥' }
      ]
    }
  })

  // Active in-progress course ("Continue Learning" Card)
  const [activeCourse, setActiveCourse] = useState(() => {
    try {
      const saved = localStorage.getItem('ailearn_active_course')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEMO_CATALOG[1] // Generative AI with LLMs by default
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
  const [sortBy, setSortBy] = useState('relevance') // 'relevance', 'rating', 'duration', 'learners'

  // Modal State for Resource Details
  const [modalResource, setModalResource] = useState(null)

  // Notifications & UI states
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('ailearn_profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('ailearn_preferences', JSON.stringify(preferences))
  }, [preferences])

  useEffect(() => {
    localStorage.setItem('ailearn_activity', JSON.stringify(activity))
  }, [activity])

  useEffect(() => {
    if (activeCourse) {
      localStorage.setItem('ailearn_active_course', JSON.stringify(activeCourse))
    }
  }, [activeCourse])

  // Toast Trigger Helper
  const showToast = (message, type = 'info') => {
    setToasts(prev => {
      const id = (prev.length > 0 ? prev[prev.length - 1].id + 1 : 1)
      setTimeout(() => {
        setToasts(curr => curr.filter(t => t.id !== id))
      }, 3500)
      return [...prev, { id, message, type }]
    })
  }

  // ------------------------------------------------------------------------
  // Fetch live courses from Render API with cold-start detector
  // ------------------------------------------------------------------------
  useEffect(() => {
    let timer = setTimeout(() => setCloudWakingUp(true), 2500)
    fetch(`${API_BASE}/resources?limit=300`)
      .then(res => {
        if (!res.ok) throw new Error("Cloud catalog offline")
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Format cloud data to match SaaS structure
          const formatted = data.map((item, idx) => ({
            id: item.id || `cloud-${idx}`,
            title: item.title,
            provider: item.source || 'Online Academy',
            type: item.type || 'Course',
            topic: item.topic || 'Machine Learning',
            difficulty: item.difficulty || 'Intermediate',
            duration: '6-8 hours',
            rating: item.rating ? Number(item.rating) : 4.7,
            learnerCount: `${Math.floor(12 + Math.random() * 85)}k learners`,
            tags: item.tags ? item.tags.split(' ') : [item.topic || 'AI'],
            url: item.url || 'https://google.com',
            description: item.description || 'Comprehensive learning module curated for modern software and AI engineers.',
            outcomes: [
              'Build robust technical proficiency in core concepts and methodologies.',
              'Implement hands-on code examples and real-world architectures.',
              'Apply industry-standard tools and deployment workflows.'
            ],
            prerequisites: 'Foundational programming knowledge in Python or modern software tools.',
            isFree: item.source?.toLowerCase().includes('free') || item.source?.toLowerCase().includes('youtube'),
            hasCert: true
          }))
          setCloudCatalog(formatted)
          setCloudConnected(true)
        }
      })
      .catch(() => {
        setCloudConnected(false)
      })
      .finally(() => {
        clearTimeout(timer)
        setCloudWakingUp(false)
      })
  }, [])

  // Combined master catalog
  const allResources = useMemo(() => {
    if (cloudCatalog.length > 0) {
      // Merge unique resources
      const existingIds = new Set(DEMO_CATALOG.map(c => c.id))
      const extraCloud = cloudCatalog.filter(c => !existingIds.has(c.id))
      return [...DEMO_CATALOG, ...extraCloud]
    }
    return DEMO_CATALOG
  }, [cloudCatalog])

  // ------------------------------------------------------------------------
  // 3. DETERMINISTIC PERSONALIZATION & RELEVANCE LOGIC (NO MATH JARGON!)
  // ------------------------------------------------------------------------
  const scoredResources = useMemo(() => {
    const userInterests = (profile.interests || []).map(i => i.toLowerCase())
    const userGoal = (profile.goal || '').toLowerCase()
    const userExp = (profile.experience || 'Beginner').toLowerCase()
    const userFormat = (profile.format || 'Course').toLowerCase()

    return allResources.map(resource => {
      let relevanceScore = 65 // baseline suitability
      const reasons = []

      // 1. Topic Match
      const resTopic = (resource.topic || '').toLowerCase()
      const isTopicMatch = userInterests.some(interest => resTopic.includes(interest) || interest.includes(resTopic))
      if (isTopicMatch) {
        relevanceScore += 16
        reasons.push(`Directly matches your interest in ${resource.topic}`)
      }

      // 2. Experience Level Match
      const resDiff = (resource.difficulty || '').toLowerCase()
      if (resDiff === userExp) {
        relevanceScore += 10
        reasons.push(`Calibrated for your ${profile.experience} background`)
      }

      // 3. Format Match
      const resType = (resource.type || '').toLowerCase()
      if (resType === userFormat || userFormat === 'mixed') {
        relevanceScore += 8
        reasons.push(`Matches your preferred ${profile.format} learning format`)
      }

      // 4. Learning Preferences (Hands-on vs. Theory)
      if (preferences.handsOnTheory >= 65 && (resType === 'project' || resType === 'interactive lesson' || resType === 'tutorial')) {
        relevanceScore += 6
        reasons.push(`Aligns with your ${preferences.handsOnTheory}% hands-on practical focus`)
      }

      // 5. Goal Alignment
      if (userGoal.includes('project') && (resource.tags || []).some(t => t.toLowerCase().includes('project'))) {
        relevanceScore += 5
        reasons.push(`Supports your primary goal: "${profile.goal}"`)
      }

      // 6. Free & Certification filters boost
      if (preferences.freeOnly && resource.isFree) {
        relevanceScore += 4
      }

      // Clamp between 68% and 99% for realistic SaaS perception
      const finalScore = Math.min(99, Math.max(68, relevanceScore))

      // Primary personalized explanation
      const primaryExplanation = reasons.length > 0
        ? reasons.slice(0, 2).join(' • ')
        : `Recommended based on your ${profile.experience} learning path and goal in ${profile.goal}.`

      return {
        ...resource,
        relevanceScore: finalScore,
        whyRecommended: primaryExplanation
      }
    })
  }, [allResources, profile, preferences])

  // Filtered & Sorted Resources for Recommendation Page
  const displayedRecommendations = useMemo(() => {
    let list = [...scoredResources]

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      )
    }

    // Topic Filter
    if (selectedTopic !== 'all') {
      list = list.filter(r => r.topic.toLowerCase() === selectedTopic.toLowerCase())
    }

    // Difficulty Filter
    if (selectedDifficulty !== 'all') {
      list = list.filter(r => r.difficulty.toLowerCase() === selectedDifficulty.toLowerCase())
    }

    // Format Filter
    if (selectedFormat !== 'all') {
      list = list.filter(r => r.type.toLowerCase() === selectedFormat.toLowerCase())
    }

    // Price Filter
    if (selectedPricing === 'free') {
      list = list.filter(r => r.isFree)
    }

    // Sorting Logic
    if (sortBy === 'relevance') {
      list.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'duration') {
      list.sort((a, b) => parseInt(a.duration) - parseInt(b.duration))
    }

    return list
  }, [scoredResources, searchQuery, selectedTopic, selectedDifficulty, selectedFormat, selectedPricing, sortBy])

  // Saved resources list
  const savedResourcesList = useMemo(() => {
    return allResources.filter(r => activity.savedIds.includes(r.id))
  }, [allResources, activity.savedIds])

  // Profile Completeness metric
  const profileCompleteness = useMemo(() => {
    let score = 0
    if (profile.name) score += 20
    if (profile.experience) score += 20
    if (profile.goal) score += 20
    if (profile.interests && profile.interests.length >= 2) score += 20
    if (profile.format) score += 10
    if (profile.weeklyTime) score += 10
    return Math.min(100, score)
  }, [profile])

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
    setActivity(prev => {
      const isSaved = prev.savedIds.includes(resId)
      const updatedSaved = isSaved
        ? prev.savedIds.filter(id => id !== resId)
        : [...prev.savedIds, resId]
      
      const eventMsg = isSaved ? `Removed "${resTitle?.slice(0, 28)}..." from library` : `Saved "${resTitle?.slice(0, 28)}..."`
      showToast(eventMsg, isSaved ? 'info' : 'success')

      return {
        ...prev,
        savedIds: updatedSaved,
        recentEvents: [
          { id: Date.now(), title: eventMsg, time: 'Just now', icon: isSaved ? '✕' : '🔖' },
          ...prev.recentEvents.slice(0, 5)
        ]
      }
    })
  }

  const toggleCompleteResource = (resId, resTitle) => {
    setActivity(prev => {
      const isDone = prev.completedIds.includes(resId)
      const updatedDone = isDone
        ? prev.completedIds.filter(id => id !== resId)
        : [...prev.completedIds, resId]

      const eventMsg = isDone ? `Unmarked "${resTitle?.slice(0, 28)}..."` : `Completed "${resTitle?.slice(0, 28)}..."`
      showToast(eventMsg, isDone ? 'info' : 'success')

      return {
        ...prev,
        completedIds: updatedDone,
        hoursSpent: isDone ? Math.max(0, prev.hoursSpent - 3.5) : prev.hoursSpent + 3.5,
        recentEvents: [
          { id: Date.now(), title: eventMsg, time: 'Just now', icon: '✓' },
          ...prev.recentEvents.slice(0, 5)
        ]
      }
    })
  }

  const handleStartLearning = (resource) => {
    setActiveCourse({
      ...resource,
      progress: 25,
      currentLesson: 'Module 1: Principles & Fundamentals'
    })
    setActivity(prev => ({
      ...prev,
      sessionsCount: prev.sessionsCount + 1
    }))
    showToast(`Started: "${resource.title.slice(0, 30)}..."`, 'info')
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRateResource = (resId, rating) => {
    setActivity(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [resId]: rating }
    }))
    showToast(`Rated course ${rating} stars! Thank you for the feedback.`, 'success')
  }

  const handleGenerateRecommendations = () => {
    setActiveSection('recommendations')
    showToast("Recommendations personalized and updated for your profile!", "success")
    const recSection = document.getElementById('recommendationsWorkspace')
    if (recSection) {
      recSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleResetPreferences = () => {
    setProfile({
      name: 'Alex Morgan',
      role: 'Verified Scholar',
      experience: 'Intermediate',
      goal: 'Build AI projects',
      interests: ['Machine Learning', 'Generative AI', 'Python'],
      format: 'Course',
      weeklyTime: '7-10 hours',
      studySchedule: 'Flexible / Self-paced'
    })
    setPreferences({
      handsOnTheory: 75,
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
    showToast("All learning preferences restored to default prototype settings.", "info")
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
            className={`nav-item ${activeSection === 'recommendations' ? 'active' : ''}`}
            onClick={() => { setActiveSection('recommendations'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">✨</span>
            <span>Recommendations</span>
            <span className="nav-badge-pill highlight">{displayedRecommendations.length}</span>
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

        {/* Prototype Environment Status Card (As required in Section 6) */}
        <div className="sidebar-status-panel">
          <div className="status-indicator-row">
            <span className="pulse-dot-green"></span>
            <span className="status-headline">Prototype Mode</span>
          </div>
          <p className="status-body">
            Recommendations are generated from preference signals for this product prototype.
          </p>
          <div className="status-meta">
            <span>Catalog: {cloudConnected ? '300+ Cloud Courses' : 'Local Fast Demo'}</span>
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

        {/* Professional SaaS Top Header */}
        <header className="workspace-header">
          <div className="header-left">
            <div className="breadcrumbs">
              <span>LearnIQ</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active" style={{ textTransform: 'capitalize' }}>
                {activeSection === 'overview' && 'Overview Dashboard'}
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
                placeholder="Quick search skills, courses..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (activeSection !== 'recommendations' && e.target.value) {
                    setActiveSection('recommendations')
                  }
                }}
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateRecommendations}
            >
              <span>✨ Generate Recommendations</span>
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
                <span className="notif-dot" />
              </button>

              {notificationOpen && (
                <div className="dropdown-panel notif-dropdown">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Recent Activity</span>
                  </div>
                  <div className="dropdown-list">
                    {activity.recentEvents.map(evt => (
                      <div key={evt.id} className="dropdown-item">
                        <span style={{ fontSize: '1rem' }}>{evt.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.78rem', color: '#fff' }}>{evt.title}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{evt.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="auth-user-badge"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title="View Scholar Profile"
              >
                <div className="user-avatar-circle">
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{profile.name}</div>
                  <div style={{ fontSize: '0.65rem', color: '#38bdf8' }}>{profile.role}</div>
                </div>
              </div>

              {userMenuOpen && (
                <div className="dropdown-panel user-dropdown">
                  <div className="dropdown-header">
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{profile.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{profile.goal}</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.74rem', color: '#cbd5e1', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>Track: <strong>{profile.experience}</strong></div>
                    <div>Saved: <strong>{activity.savedIds.length}</strong> • Completed: <strong>{activity.completedIds.length}</strong></div>
                  </div>
                  <button
                    type="button"
                    className="dropdown-action-btn"
                    onClick={() => { setActiveSection('profile'); setUserMenuOpen(false); }}
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    className="dropdown-action-btn"
                    onClick={() => { handleResetPreferences(); setUserMenuOpen(false); }}
                  >
                    Reset Demo Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Cloud Warmup Banner if Render instance is spinning up */}
        {cloudWakingUp && (
          <div className="cloud-wakeup-banner">
            <div className="pulse-dot-amber" />
            <div>
              <strong>Connecting to Render cloud catalog...</strong> The cloud service is spinning up (~30s). Local verified courses and dynamic recommendations are ready immediately!
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 1: OVERVIEW DASHBOARD
            ==================================================================== */}
        {activeSection === 'overview' && (
          <div className="dashboard-content">
            {/* Top 6 KPI Metric Cards */}
            <div className="overview-kpi-grid">
              <div className="kpi-card" onClick={() => setActiveSection('recommendations')}>
                <div className="kpi-icon-wrap bg-blue-subtle">✨</div>
                <div>
                  <div className="kpi-value">{scoredResources.length}</div>
                  <div className="kpi-label">Recommended for You</div>
                </div>
                <span className="kpi-subtext">Personalized to profile</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('progress')}>
                <div className="kpi-icon-wrap bg-emerald-subtle">📈</div>
                <div>
                  <div className="kpi-value">{Math.round((activity.completedIds.length / 10) * 100)}%</div>
                  <div className="kpi-label">Learning Progress</div>
                </div>
                <span className="kpi-subtext">{activity.completedIds.length} modules finished</span>
              </div>

              <div className="kpi-card" onClick={() => setActiveSection('profile')}>
                <div className="kpi-icon-wrap bg-purple-subtle">🧠</div>
                <div>
                  <div className="kpi-value">{profile.interests.length}</div>
                  <div className="kpi-label">Active Topics</div>
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

            {/* In-Progress "Continue Learning" Card */}
            {activeCourse && (
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
                      <div className="continue-progress-fill" style={{ width: `${activeCourse.progress || 25}%` }}></div>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      {activeCourse.progress || 25}% Completed
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
            )}

            {/* Top Recommended Highlights */}
            <div className="section-header-row">
              <div>
                <h3 className="section-title">Top Recommendations for Your Goal</h3>
                <p className="section-subtitle">
                  Curated specifically for <strong>{profile.goal}</strong> and your <strong>{profile.experience}</strong> experience level.
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

            {/* Quick Profile Summary Banner */}
            <div className="profile-summary-callout">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem' }}>🎯</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                    Target Track: {profile.goal}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    Available: {profile.weeklyTime} • Schedule: {profile.studySchedule} • Hands-on Focus: {preferences.handsOnTheory}%
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveSection('preferences')}
                >
                  Adjust Preferences
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveSection('profile')}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 2: LEARNER PROFILE
            ==================================================================== */}
        {activeSection === 'profile' && (
          <div className="section-container">
            <div className="form-card">
              <h3 className="form-card-title">1. Experience Level</h3>
              <p className="form-card-subtitle">Choose where you are currently starting in your engineering and technical journey.</p>
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
              <h3 className="form-card-title">2. Primary Learning Goal</h3>
              <p className="form-card-subtitle">Select the main milestone you want this platform to guide you towards.</p>
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
                    className={`chip-toggle ${profile.goal === goal ? 'active' : ''}`}
                    onClick={() => setProfile(p => ({ ...p, goal }))}
                  >
                    <span>{profile.goal === goal ? '✓' : '+'}</span>
                    <span>{goal}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">3. Areas of Interest (Select All That Apply)</h3>
              <p className="form-card-subtitle">Curated subjects that shape your personalized recommendation feed.</p>
              <div className="chips-grid">
                {TOPIC_CHIPS.map(topic => {
                  const isSelected = (profile.interests || []).includes(topic)
                  return (
                    <button
                      key={topic}
                      type="button"
                      className={`chip-toggle ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleInterest(topic)}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{topic}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="form-card">
              <div className="two-col-grid">
                <div>
                  <h3 className="form-card-title">4. Preferred Learning Format</h3>
                  <p className="form-card-subtitle">Primary delivery style for course materials.</p>
                  <select
                    className="saas-select"
                    value={profile.format}
                    onChange={(e) => setProfile(p => ({ ...p, format: e.target.value }))}
                  >
                    <option value="Course">Full Comprehensive Course</option>
                    <option value="Video">Video Tutorials & Walkthroughs</option>
                    <option value="Article">Technical Articles & Guides</option>
                    <option value="Interactive lesson">Interactive Notebooks / Lessons</option>
                    <option value="Project">Hands-on Capstone Projects</option>
                    <option value="Mixed">Mixed Media (Any Format)</option>
                  </select>
                </div>

                <div>
                  <h3 className="form-card-title">5. Weekly Available Study Time</h3>
                  <p className="form-card-subtitle">Pacing calibration for estimated completion dates.</p>
                  <select
                    className="saas-select"
                    value={profile.weeklyTime}
                    onChange={(e) => setProfile(p => ({ ...p, weeklyTime: e.target.value }))}
                  >
                    <option value="1-3 hours">1–3 hours per week (Casual / Light)</option>
                    <option value="4-6 hours">4–6 hours per week (Standard Pacing)</option>
                    <option value="7-10 hours">7–10 hours per week (Accelerated)</option>
                    <option value="10+ hours">10+ hours per week (Intensive Bootcamp)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetPreferences}
              >
                Reset Profile
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerateRecommendations}
              >
                Save Profile &amp; Update Recommendations →
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 3: LEARNING PREFERENCES
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
                  <span>End-to-End Projects (100%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={preferences.projectBased}
                  onChange={(e) => setPreferences(p => ({ ...p, projectBased: Number(e.target.value) }))}
                  className="saas-slider slider-purple"
                />
              </div>
            </div>

            <div className="form-card">
              <h3 className="form-card-title">Content Preferences &amp; Filters</h3>
              <p className="form-card-subtitle">Fine-tune the scope and attributes of discovery results.</p>

              <div className="toggle-list">
                <div className="toggle-item">
                  <div>
                    <div className="toggle-label">Prioritize Free Resources Only</div>
                    <div className="toggle-desc">Exclude paid certifications and prioritize open-source, university, and community courses.</div>
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
            SECTION 4: LEARNING ACTIVITY
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
                    onClick={() => setActivity(p => ({ ...p, sessionsCount: Math.max(1, p.sessionsCount - 1) }))}
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
                {activity.recentEvents.map((evt) => (
                  <div key={evt.id} className="timeline-event">
                    <div className="timeline-icon-circle">{evt.icon}</div>
                    <div className="timeline-body">
                      <div className="timeline-title">{evt.title}</div>
                      <div className="timeline-time">{evt.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            SECTION 5: RECOMMENDATIONS WORKSPACE
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
                    placeholder="Search by topic, instructor, framework, or skill..."
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
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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
                      {(res.tags || []).slice(0, 3).map((tag, tIdx) => (
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
            SECTION 6: SAVED RESOURCES LIBRARY
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
                        className={`btn-icon-subtle ${activity.completedIds.includes(res.id) ? 'active-done' : ''}`}
                        onClick={() => toggleCompleteResource(res.id, res.title)}
                      >
                        {activity.completedIds.includes(res.id) ? '✓ Completed' : 'Mark Done'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* Empty State (Required in Section 16) */
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
            SECTION 7: PROGRESS DASHBOARD
            ==================================================================== */}
        {activeSection === 'progress' && (
          <div className="section-container">
            {/* Overall Progress Stat Banners */}
            <div className="form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 className="form-card-title" style={{ margin: 0 }}>Overall Milestone Progress</h3>
                  <p className="form-card-subtitle" style={{ margin: 0, marginTop: '0.2rem' }}>
                    Track your journey toward mastering <strong>{profile.goal}</strong>.
                  </p>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {activity.completedIds.length} / 12 Completed ({Math.min(100, Math.round((activity.completedIds.length / 12) * 100))}%)
                </div>
              </div>

              <div className="roadmap-progress-bar-container" style={{ height: '12px' }}>
                <div
                  className="roadmap-progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.round((activity.completedIds.length / 12) * 100))}%` }}
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

            {/* Topic Mastery Progress Bars */}
            <div className="form-card" style={{ marginTop: '1.5rem' }}>
              <h3 className="form-card-title">Subject Mastery Breakdown</h3>
              <p className="form-card-subtitle">Estimated proficiency based on completed exercises and topics.</p>

              <div className="topic-mastery-list">
                {[
                  { topic: 'Machine Learning', progress: 75, color: '#38bdf8' },
                  { topic: 'Generative AI & LLMs', progress: 60, color: '#a855f7' },
                  { topic: 'Python Programming', progress: 90, color: '#10b981' },
                  { topic: 'Deep Learning & PyTorch', progress: 45, color: '#f59e0b' },
                  { topic: 'MLOps & Deployment', progress: 30, color: '#06b6d4' }
                ].map(item => (
                  <div key={item.topic} className="topic-mastery-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: '#fff', marginBottom: '0.35rem' }}>
                      <span>{item.topic}</span>
                      <span style={{ color: item.color }}>{item.progress}% Mastery</span>
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
            SECTION 8: SETTINGS
            ==================================================================== */}
        {activeSection === 'settings' && (
          <div className="section-container">
            <div className="form-card">
              <h3 className="form-card-title">Scholar Account Profile</h3>
              <p className="form-card-subtitle">Manage your local profile details and display credentials.</p>

              <div className="two-col-grid" style={{ marginTop: '1.25rem' }}>
                <div>
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={profile.name}
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="auth-label">Academic Role / Title</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={profile.role}
                    onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="form-card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <h3 className="form-card-title" style={{ color: '#f87171' }}>Reset &amp; Danger Zone</h3>
              <p className="form-card-subtitle">
                Clear all custom preferences, bookmarked resources, and activity logs to restore initial prototype defaults.
              </p>

              <div style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  onClick={handleResetPreferences}
                >
                  Reset All Settings to Factory Demo Defaults
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
              <span>EdTech SaaS Prototype</span>
              <span className="footer-dot">•</span>
              <span>Intelligent Resource Recommendations</span>
            </div>
            <div className="footer-right">
              <span>{allResources.length} Curated Technical Modules</span>
            </div>
          </div>
        </footer>
      </main>

      {/* --------------------------------------------------------------------
          4. RESOURCE DETAILS MODAL (As required in Section 15)
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
                {activity.savedIds.includes(modalResource.id) ? '★ Saved in Library' : '🔖 Bookmark Resource'}
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
