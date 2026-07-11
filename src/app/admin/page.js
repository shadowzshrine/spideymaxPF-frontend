"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User as UserIcon, 
  Briefcase, 
  Cpu, 
  ShieldAlert, 
  Users, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  FileText, 
  LogOut, 
  ExternalLink,
  Ban,
  CheckCircle,
  AlertTriangle,
  LayoutDashboard,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  Menu,
  X
} from 'lucide-react';
import SpiderWebLoader from '@/components/SpiderWebLoader.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorPage from '../../components/ErrorPage';
import useLogout from '../../hooks/useLogout.js';
import LogoutOverlay from '../../components/LogoutOverlay.jsx';
import { playClick, playHover, playSuccess, playDelete, playLogout, playWebSling, stopLoopingSFX, startLoopingSFX, initAudio, speakWelcome } from '@/utils/audio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const skillCategories = [
  { id: 'FRONTEND_SYSTEMS', label: 'Frontend' },
  { id: 'BACKEND_INTEGRATIONS', label: 'Backend' },
  { id: 'MOBILE_ARCHITECTURES', label: 'Mobile' },
  { id: 'WORKFLOW_AND_DESIGN', label: 'Tools & Design' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const {
    initiateLogout,
    confirmLogout,
    cancelLogout,
    showConfirm: isLogoutConfirmOpen,
    isLoggingOut,
    progress,
    statusText
  } = useLogout(router);
  
  // Tab control state: dashboard, profile, projects, skills, experience, contact, users, alerts
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Loading & Session States
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalUsers: 0,
    totalMessages: 0,
    syncedRepos: 0,
    lastSyncTimestamp: null
  });

  // User session tracking states
  const [activeNodes, setActiveNodes] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    cumulativeTime: 0,
    averageDuration: 0,
    mostViewedSection: 'None'
  });

  // Formatter helper for active duration
  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return '0s';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${seconds}s`;
    return result;
  };

  // Profile & Contact Form State
  const [profileName, setProfileName] = useState('');
  const [profileRoles, setProfileRoles] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSubtitle, setProfileSubtitle] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactLocation, setContactLocation] = useState('');
  const [contactGithub, setContactGithub] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [profileDOB, setProfileDOB] = useState('');
  const [profileDegree, setProfileDegree] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');

  // Projects State
  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: '',
    description: '',
    techStack: '',
    githubLink: '',
    mission: '',
    class: '',
    subtitle: '',
    liveUrl: '',
    archived: false
  });
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [syncingProjects, setSyncingProjects] = useState(false);

  // Skills State
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({
    id: null,
    name: '',
    category: 'FRONTEND_SYSTEMS',
    percent: 80
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Experience State
  const [experiences, setExperiences] = useState([]);
  const [experienceForm, setExperienceForm] = useState({
    id: null,
    dateRange: '',
    type: 'INTERNSHIP',
    title: '',
    company: '',
    description: '',
    index: 0
  });
  const [showExperienceModal, setShowExperienceModal] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // all, active, banned
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Error Screens State
  const [errorPages, setErrorPages] = useState([]);
  const [activePreviewCode, setActivePreviewCode] = useState(null);
  const [fullscreenPreviewMode, setFullscreenPreviewMode] = useState(true);

  // Alerts State
  const [alerts, setAlerts] = useState([]);

  // Toast message states
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth Guard Verification
  useEffect(() => {
    stopLoopingSFX();
    initAudio();
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user && data.user.role === 'admin' && data.user.adminMode === 'editor') {
          setAdminUser(data.user);
          loadAllData();
          console.log('[SFX Debug] Calling speakWelcome with isEditor =', true);
          speakWelcome(true);
        } else {
          setTimeout(() => router.replace('/'), 0);
        }
      })
      .catch((err) => {
        console.warn('[AdminDashboard] Auth verification failed:', err);
        router.replace('/');
      });
  }, [router]);

  // Handle start/stop looping SFX for admin page loading
  useEffect(() => {
    if (loading) {
      startLoopingSFX('loading');
    } else {
      stopLoopingSFX();
    }
    return () => stopLoopingSFX();
  }, [loading]);

  // Dynamic audio listener for all right-side page buttons (event delegation)
  useEffect(() => {
    const handleGlobalMouseOver = (e) => {
      const target = e.target.closest('button, a, input, textarea, select, [role="button"]');
      if (!target) return;
      
      // Skip sidebar to avoid duplicate hover sounds
      const isSidebar = target.closest('aside') || target.closest('.sidebar-class') || target.closest('[class*="sidebar"]');
      if (isSidebar) return;

      playHover();
    };

    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (!target) return;

      // Skip sidebar to avoid duplicate click sounds
      const isSidebar = target.closest('aside') || target.closest('.sidebar-class') || target.closest('[class*="sidebar"]');
      if (isSidebar) return;

      // Classify click action types to play appropriate SFX
      const text = target.innerText?.toLowerCase() || '';
      const ariaLabel = target.getAttribute('aria-label')?.toLowerCase() || '';
      const title = target.getAttribute('title')?.toLowerCase() || '';
      const isDelete = text.includes('delete') || text.includes('remove') || text.includes('trash') ||
                       ariaLabel.includes('delete') || ariaLabel.includes('remove') ||
                       title.includes('delete') || title.includes('remove') ||
                       target.querySelector('svg')?.classList?.contains('text-spidey-red') ||
                       target.innerHTML.includes('Trash2') || target.innerHTML.includes('Trash');

      const isSave = text.includes('save') || text.includes('submit') || text.includes('upload') || text.includes('sync') ||
                     ariaLabel.includes('save') || ariaLabel.includes('submit') ||
                     title.includes('save') || title.includes('submit');

      if (isDelete) {
        playDelete();
      } else if (isSave) {
        playSuccess();
      } else {
        playClick();
      }
    };

    document.addEventListener('mouseover', handleGlobalMouseOver);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('mouseover', handleGlobalMouseOver);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Poll real-time active visitors currently viewing the portfolio
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const fetchActiveUsers = async () => {
        try {
          const res = await fetch(`${API_URL}/api/admin/active-users`, { credentials: 'include' });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();
          if (data.success) {
            setActiveNodes(data.activeUsers || []);
          }
        } catch (err) {
          console.warn('[Admin] Error fetching active users:', err.message || err);
        }
      };

      fetchActiveUsers();
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Load session logs and summary statistics for the selected user
  useEffect(() => {
    if (selectedUser) {
      setSessionsLoading(true);
      fetch(`${API_URL}/api/admin/users/${selectedUser._id}/sessions`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserSessions(data.sessions || []);
            setSessionStats(data.stats || {
              cumulativeTime: 0,
              averageDuration: 0,
              mostViewedSection: 'None'
            });
          }
        })
        .catch(err => console.error('Error loading user sessions:', err))
        .finally(() => setSessionsLoading(false));
    } else {
      setUserSessions([]);
    }
  }, [selectedUser]);

  const loadAllData = () => {
    setLoading(true);
    
    // Fetch Dashboard Stats
    fetch(`${API_URL}/api/admin/dashboard`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(err => console.warn('Error loading dashboard stats:', err.message || err));

    // Fetch Profile details
    fetch(`${API_URL}/api/admin/profile`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const prof = data.profile || {};
          const cont = data.contact || {};
          setProfileName(prof.name || '');
          setProfileRoles((prof.roles || []).join(', '));
          setProfileBio(prof.bio || '');
          setProfileSubtitle(prof.subtitle || '');
          
          setContactPhone(cont.phone || '');
          setContactEmail(cont.email || '');
          setContactLocation(cont.location || '');
          setContactGithub(cont.github || '');
          setContactLinkedin(cont.linkedin || '');

          // Extract stats from profile
          const statsList = prof.stats || [];
          const dobStat = statsList.find(s => s.label.toUpperCase() === 'D.O.B');
          const degreeStat = statsList.find(s => s.label.toUpperCase() === 'DEGREE');
          setProfileDOB(dobStat ? dobStat.value : '');
          setProfileDegree(degreeStat ? degreeStat.value : '');
        }
      })
      .catch(err => console.warn('Error loading admin profile:', err.message || err));

    // Fetch Projects
    fetch(`${API_URL}/api/admin/projects`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setProjects(data.projects || []);
      })
      .catch(err => console.warn('Error loading admin projects:', err.message || err));

    // Fetch Skills
    fetch(`${API_URL}/api/admin/skills`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setSkills(data.skills || []);
      })
      .catch(err => console.warn('Error loading admin skills:', err.message || err));

    // Fetch Experiences
    fetch(`${API_URL}/api/admin/experiences`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setExperiences(data.experiences || []);
      })
      .catch(err => console.warn('Error loading admin experiences:', err.message || err));

    // Fetch Users
    fetch(`${API_URL}/api/admin/users`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users || []);
      })
      .catch(err => console.warn('Error loading admin users:', err.message || err));

    // Fetch Error Pages
    fetch(`${API_URL}/api/admin/error-pages`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setErrorPages(data.errorPages || []);
      })
      .catch(err => console.warn('Error loading admin error pages:', err.message || err));

    // Fetch Security Alerts
    fetch(`${API_URL}/api/admin/alerts`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAlerts(data.alerts || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Error loading admin security alerts:', err.message || err);
        setLoading(false);
      });
  };

  // ==========================================
  // PROFILE HANDLERS
  // ==========================================
  const handleProfileSave = async (e) => {
    if (e) e.preventDefault();
    
    const formattedStats = [
      { label: 'D.O.B', value: profileDOB },
      { label: 'DEGREE', value: profileDegree },
      { label: 'CITY', value: contactLocation },
      { label: 'FREELANCE', value: 'AVAILABLE' },
      { label: 'GITHUB', value: contactGithub }
    ];

    try {
      const res = await fetch(`${API_URL}/api/admin/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          roles: profileRoles.split(',').map(r => r.trim()).filter(Boolean),
          bio: profileBio,
          subtitle: profileSubtitle,
          phone: contactPhone,
          location: contactLocation,
          email: contactEmail,
          github: contactGithub,
          linkedin: contactLinkedin,
          stats: formattedStats
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Profile and Identity configurations saved.');
      } else {
        showToast(data.message || 'Failed to save profile configurations.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving profile config.', 'error');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Only PDF resumes are supported.', 'error');
        return;
      }
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(resumeFile);
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await fetch(`${API_URL}/api/admin/resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64 }),
          credentials: 'include'
        });

        const data = await res.json();
        if (res.ok && data.success) {
          playSuccess();
          showToast('Resume uploaded as maxResume.pdf.');
          setResumeFile(null);
          setResumeName('');
        } else {
          showToast(data.message || 'Resume upload failed.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Network error uploading resume file.', 'error');
      }
    };
  };

  // ==========================================
  // PROJECTS HANDLERS
  // ==========================================
  const handleProjectEdit = (proj) => {
    playClick();
    setProjectForm({
      id: proj._id,
      title: proj.title || '',
      description: proj.description || '',
      techStack: (proj.techStack || []).join(', '),
      githubLink: proj.githubLink || proj.githubUrl || '',
      mission: proj.mission || '',
      class: proj.class || '',
      subtitle: proj.subtitle || '',
      liveUrl: proj.liveUrl || '',
      archived: proj.archived || false
    });
    setShowProjectModal(true);
  };

  const handleProjectAdd = () => {
    playClick();
    setProjectForm({
      id: null,
      title: '',
      description: '',
      techStack: '',
      githubLink: '',
      mission: '',
      class: '',
      subtitle: '',
      liveUrl: '',
      archived: false
    });
    setShowProjectModal(true);
  };

  const handleProjectDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playDelete();
        showToast('Project deleted successfully.');
        setProjects(projects.filter(p => p._id !== id));
      } else {
        showToast(data.message || 'Failed to delete project.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting project.', 'error');
    }
  };

  const handleToggleProjectVisibility = async (proj) => {
    try {
      const newArchived = !proj.archived;
      const res = await fetch(`${API_URL}/api/admin/projects/${proj._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: newArchived }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(newArchived ? 'Project hidden from portfolio.' : 'Project is now visible.');
        setProjects(projects.map(p => p._id === proj._id ? { ...p, archived: newArchived } : p));
      } else {
        showToast(data.message || 'Failed to update visibility.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error toggling visibility.', 'error');
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    const isEdit = !!projectForm.id;
    const url = isEdit 
      ? `${API_URL}/api/admin/projects/${projectForm.id}` 
      : `${API_URL}/api/admin/projects`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectForm.title,
          description: projectForm.description,
          techStack: projectForm.techStack.split(',').map(t => t.trim()).filter(Boolean),
          githubLink: projectForm.githubLink,
          mission: projectForm.mission,
          class: projectForm.class,
          subtitle: projectForm.subtitle,
          liveUrl: projectForm.liveUrl,
          archived: projectForm.archived
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playSuccess();
        showToast(isEdit ? 'Project updated.' : 'Project added.');
        setShowProjectModal(false);
        // Reload projects
        fetch(`${API_URL}/api/admin/projects`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success) setProjects(data.projects || []);
          });
      } else {
        showToast(data.message || 'Project submit failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error submitting project.', 'error');
    }
  };

  const triggerGitHubSync = async () => {
    setSyncingProjects(true);
    showToast('GitHub synchronization started...');

    try {
      const res = await fetch(`${API_URL}/api/admin/projects/sync`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('GitHub repositories successfully synchronized.');
        setProjects(data.projects || []);
        // Reload dashboard stats
        fetch(`${API_URL}/api/admin/dashboard`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.stats) setStats(data.stats);
          });
      } else {
        showToast(data.message || 'GitHub sync failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error triggering GitHub sync.', 'error');
    } finally {
      setSyncingProjects(false);
    }
  };

  // ==========================================
  // SKILLS HANDLERS
  // ==========================================
  const handleSkillEdit = (skill) => {
    setSkillForm({
      id: skill._id,
      name: skill.name || '',
      category: skill.category || 'FRONTEND_SYSTEMS',
      percent: skill.percent || 80
    });
    setShowSkillModal(true);
  };

  const handleSkillAdd = () => {
    setSkillForm({
      id: null,
      name: '',
      category: 'FRONTEND_SYSTEMS',
      percent: 80
    });
    setShowSkillModal(true);
  };

  const handleSkillDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/skills/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Skill deleted.');
        setSkills(skills.filter(s => s._id !== id));
      } else {
        showToast(data.message || 'Failed to delete skill.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting skill.', 'error');
    }
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!skillForm.id;
    const url = isEdit 
      ? `${API_URL}/api/admin/skills/${skillForm.id}`
      : `${API_URL}/api/admin/skills`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: skillForm.name,
          category: skillForm.category,
          percent: skillForm.percent
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEdit ? 'Skill updated.' : 'Skill added.');
        setShowSkillModal(false);
        // Reload skills
        fetch(`${API_URL}/api/admin/skills`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success) setSkills(data.skills || []);
          });
      } else {
        showToast(data.message || 'Skill submit failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error submitting skill.', 'error');
    }
  };

  // ==========================================
  // EXPERIENCE HANDLERS
  // ==========================================
  const handleExperienceEdit = (exp) => {
    setExperienceForm({
      id: exp._id,
      dateRange: exp.dateRange || '',
      type: exp.type || 'INTERNSHIP',
      title: exp.title || '',
      company: exp.company || '',
      description: exp.description || '',
      index: exp.index || 0
    });
    setShowExperienceModal(true);
  };

  const handleExperienceAdd = () => {
    setExperienceForm({
      id: null,
      dateRange: '',
      type: 'INTERNSHIP',
      title: '',
      company: '',
      description: '',
      index: experiences.length
    });
    setShowExperienceModal(true);
  };

  const handleExperienceDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/experiences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Experience entry deleted.');
        setExperiences(experiences.filter(e => e._id !== id));
      } else {
        showToast(data.message || 'Failed to delete experience.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting experience.', 'error');
    }
  };

  const handleExperienceSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!experienceForm.id;
    const url = isEdit 
      ? `${API_URL}/api/admin/experiences/${experienceForm.id}`
      : `${API_URL}/api/admin/experiences`;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange: experienceForm.dateRange,
          type: experienceForm.type,
          title: experienceForm.title,
          company: experienceForm.company,
          description: experienceForm.description,
          index: experienceForm.index
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEdit ? 'Experience entry updated.' : 'Experience entry added.');
        setShowExperienceModal(false);
        // Reload experiences
        fetch(`${API_URL}/api/admin/experiences`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success) setExperiences(data.experiences || []);
          });
      } else {
        showToast(data.message || 'Experience submit failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error submitting experience.', 'error');
    }
  };

  // ==========================================
  // USERS HANDLERS
  // ==========================================
  const handleBanToggle = async (userId, isBanned) => {
    const action = isBanned ? 'unban' : 'ban';
    let reason = '';
    if (!isBanned) {
      reason = window.prompt("Enter ban reason:", "Violation of security policies");
      if (reason === null) return; // user cancelled
    } else {
      if (!confirm("Are you sure you want to unban this user?")) return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User successfully ${action}ned.`);
        const updatedUsers = users.map(u => u._id === userId ? { ...u, isBanned: !isBanned, banReason: !isBanned ? (reason || 'Violation of security policies') : undefined } : u);
        setUsers(updatedUsers);
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isBanned: !isBanned, banReason: !isBanned ? (reason || 'Violation of security policies') : undefined });
        }
        // Reload alerts
        fetch(`${API_URL}/api/admin/alerts`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success) setAlerts(data.alerts || []);
          });
      } else {
        showToast(data.message || `Failed to ${action} user.`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(`Network error attempting user ${action}.`, 'error');
    }
  };

  // Logout handler
  const handleLogout = () => {
    playLogout();
    initiateLogout();
  };

  // Filter users lists
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchUserQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (userFilter === 'banned') return u.isBanned;
    if (userFilter === 'active') return !u.isBanned;
    return true;
  });

  if (loading) {
    return (
      <div className="relative min-h-screen w-screen flex items-center justify-center bg-[#050505] text-white font-mono overflow-hidden">
        <div className="fixed inset-0 comic-grid opacity-[0.08] pointer-events-none" />
        <div className="text-center z-10">
          <SpiderWebLoader 
            size="md"
            text="// AUTHORIZING_SECURE_ADMIN_PORTAL..."
            showProgress={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-mono selection:bg-spidey-red selection:text-white">
      {/* Halftone grid background */}
      <div className="fixed inset-0 comic-grid opacity-[0.05] pointer-events-none z-1" />
      <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.02] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

      {/* Cyberpunk frames */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 border-[8px] border-zinc-950" />

      {/* TOAST ALERTS */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 px-4 py-3 rounded-xl font-mono text-xs border backdrop-blur-md shadow-lg ${
          toast.type === 'error' 
            ? 'bg-spidey-red/10 border-spidey-red text-spidey-red' 
            : 'bg-emerald-950/20 border-emerald-500 text-emerald-400'
        }`}>
          {toast.type === 'error' ? '✕ ' : '✓ '} {toast.message}
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0f] border-b border-zinc-900 z-30 relative select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-spidey-red animate-pulse" />
          <span className="font-bold text-xs tracking-wider">// ADMIN_PORT</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* SIDE NAV PANEL */}
        <aside className={`fixed lg:static inset-0 top-[53px] lg:top-0 w-full lg:w-64 bg-[#0a0a0f] border-b lg:border-b-0 lg:border-r border-zinc-900 p-6 flex flex-col justify-between z-30 transform lg:transform-none transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div>
            <div className="hidden lg:flex items-center space-x-2.5 mb-8 select-none">
              <div className="w-3.5 h-3.5 rounded-full bg-spidey-red animate-pulse shadow-[0_0_8px_var(--color-spidey-red-glow)]" />
              <div>
                <h1 className="text-sm font-heading tracking-wider text-white spidey-heading">
                  MAX-OS // ADMIN
                </h1>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">ADMINISTRATOR COMMAND</span>
              </div>
            </div>

            <nav className="space-y-1 font-mono text-xs select-none">
              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-spidey-red" />
                <span>DASHBOARD</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <UserIcon className="w-4 h-4 text-spidey-red" />
                <span>PROFILE & BIO</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('projects'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'projects' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <Briefcase className="w-4 h-4 text-spidey-red" />
                <span>PROJECTS</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('skills'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'skills' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <Cpu className="w-4 h-4 text-spidey-red" />
                <span>SKILLS</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('experience'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'experience' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-spidey-red" />
                <span>EXPERIENCE</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('contact'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'contact' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <Phone className="w-4 h-4 text-spidey-red" />
                <span>CONTACT INFO</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('users'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'users' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <Users className="w-4 h-4 text-spidey-red" />
                <span>USERS</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('error-screens'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'error-screens' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-spidey-red" />
                <span>ERROR SCREENS</span>
              </button>

              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); setActiveTab('alerts'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'alerts' 
                    ? 'bg-spidey-red/10 border border-spidey-red/45 text-white font-bold'
                    : 'border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-950/20'
                }`}
              >
                <div className="relative">
                  <ShieldAlert className="w-4 h-4 text-spidey-red" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-spidey-red-glow animate-ping" />
                  )}
                </div>
                <span>SECURITY ALERTS</span>
              </button>
            </nav>
          </div>

          <div className="mt-8 border-t border-zinc-900 pt-6">
            <div className="flex items-center space-x-3 mb-4 select-none">
              <div className="w-8 h-8 rounded-full border border-spidey-red/35 overflow-hidden">
                <img src={adminUser?.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="truncate">
                <span className="font-mono text-[10px] text-white font-bold block truncate">{adminUser?.name}</span>
                <span className="font-mono text-[8px] text-zinc-500 block truncate">{adminUser?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-zinc-950 hover:bg-spidey-red/10 hover:text-spidey-red border border-zinc-850 hover:border-spidey-red/40 px-4 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer pointer-events-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>TERMINATE LINK</span>
            </button>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 p-6 md:p-10 z-10 max-h-screen overflow-y-auto scrollbar-thin">
          
          {/* SECTION 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 select-none">
                <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest block">// SECTION_00: OVERVIEW_TELEMETRY</span>
                <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">DASHBOARD COMMAND</h2>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 font-mono">
                <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-5 rounded-2xl relative card-grid">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Total Page Hits</span>
                  <div className="text-2xl font-bold text-white mt-1.5">{stats.totalVisitors}</div>
                </div>

                <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-5 rounded-2xl relative card-grid">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Registered Nodes</span>
                  <div className="text-2xl font-bold text-spidey-blue-glow mt-1.5">{stats.totalUsers}</div>
                </div>

                <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-5 rounded-2xl relative card-grid">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Transmissions Received</span>
                  <div className="text-2xl font-bold text-spidey-red mt-1.5">{stats.totalMessages}</div>
                </div>

                <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-5 rounded-2xl relative card-grid">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">GitHub Repos Cached</span>
                  <div className="text-2xl font-bold text-white mt-1.5">{stats.syncedRepos}</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-[#0a0a0f]/65 border border-zinc-900 rounded-2xl p-6 md:p-8 card-grid relative">
                <h3 className="font-heading text-sm text-zinc-400 tracking-wider spidey-heading border-b border-zinc-900 pb-3 uppercase select-none">
                  // TELEMETRY_QUICK_ACTIONS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5 select-none font-mono text-xs">
                  <button
                    onClick={() => { playWebSling(); triggerGitHubSync(); }}
                    disabled={syncingProjects}
                    className="flex items-center justify-center gap-2.5 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white py-3 rounded-xl transition-all cursor-pointer pointer-events-auto"
                  >
                    <RefreshCw className={`w-4 h-4 text-spidey-red ${syncingProjects ? 'animate-spin' : ''}`} />
                    <span>SYNC GITHUB METRICS</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab('profile'); }}
                    className="flex items-center justify-center gap-2.5 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white py-3 rounded-xl transition-all cursor-pointer pointer-events-auto"
                  >
                    <UserIcon className="w-4 h-4 text-spidey-red" />
                    <span>CONFIGURE BIOMETRICS</span>
                  </button>
                  <button
                    onClick={() => { playClick(); setActiveTab('alerts'); }}
                    className="flex items-center justify-center gap-2.5 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white py-3 rounded-xl transition-all cursor-pointer pointer-events-auto"
                  >
                    <ShieldAlert className="w-4 h-4 text-spidey-red" />
                    <span>VIEW SECURITY LOGS</span>
                  </button>
                </div>
                {stats.lastSyncTimestamp && (
                  <div className="text-[9px] text-zinc-650 mt-6 font-mono select-none uppercase">
                    Last GitHub Sync Checked: {new Date(stats.lastSyncTimestamp).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Real-time Currently Viewing Users Panel */}
              <div className="bg-[#0a0a0f]/65 border border-zinc-900 rounded-2xl p-6 md:p-8 card-grid relative font-mono">
                <h3 className="font-heading text-sm text-zinc-400 tracking-wider spidey-heading border-b border-zinc-900 pb-3 uppercase select-none flex items-center justify-between">
                  <span>// ACTIVE_NODES: {activeNodes.length} users currently on portfolio</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <div className="pt-5 space-y-3 font-mono text-xs select-none">
                  {activeNodes.length === 0 ? (
                    <div className="text-zinc-650 italic text-[10px]">// NO_ACTIVE_NODES_FOUND</div>
                  ) : (
                    activeNodes.map((node, index) => (
                      <div key={index} className="flex items-center space-x-2.5 text-zinc-355 bg-[#050508]/40 border border-zinc-900/60 rounded-xl p-3.5">
                        <span className="text-emerald-400 font-bold">●</span>
                        <span className="font-bold text-white">{node.name}</span>
                        <span className="text-zinc-550">—</span>
                        <span className="text-zinc-400">viewing // <span className="text-spidey-blue-glow font-bold uppercase">{node.section}_SECTION</span></span>
                        <span className="text-zinc-550">—</span>
                        <span className="text-zinc-400 font-semibold">{formatDuration(node.duration)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 2: PROFILE & BIO */}
          {activeTab === 'profile' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 select-none">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_01: CORE_IDENTITY</span>
                <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">PROFILE & PERSONAL INFO</h2>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <form onSubmit={handleProfileSave} className="xl:col-span-2 space-y-6 bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl p-6 md:p-8 card-grid">
                  <h3 className="font-heading text-sm text-spidey-red tracking-wider spidey-heading border-b border-zinc-900 pb-3 select-none">// IDENTITY_CONFIG</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    <div>
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Display Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Title / Subtitle</label>
                      <input
                        type="text"
                        value={profileSubtitle}
                        onChange={(e) => setProfileSubtitle(e.target.value)}
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Roles (comma separated lists for Hero text animation)</label>
                      <input
                        type="text"
                        value={profileRoles}
                        onChange={(e) => setProfileRoles(e.target.value)}
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Bio Summary</label>
                      <textarea
                        rows={5}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">D.O.B</label>
                      <input
                        type="text"
                        value={profileDOB}
                        onChange={(e) => setProfileDOB(e.target.value)}
                        placeholder="e.g. 15 November 1999"
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Degree / Qualification</label>
                      <input
                        type="text"
                        value={profileDegree}
                        onChange={(e) => setProfileDegree(e.target.value)}
                        placeholder="e.g. B.Tech IT"
                        className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 select-none">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white py-3 px-6 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(229,9,20,0.2)] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>SAVE CHANGES</span>
                    </button>
                  </div>
                </form>

                {/* Resume Upload Module */}
                <div className="bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl p-6 md:p-8 card-grid space-y-6 flex flex-col justify-between font-mono text-xs">
                  <div className="space-y-4">
                    <h3 className="font-heading text-sm text-spidey-red tracking-wider spidey-heading border-b border-zinc-900 pb-3 select-none">// CV_PORT</h3>
                    <p className="text-zinc-500 text-[10px] leading-relaxed select-none">
                      Upload a new resume file to replace the existing maxResume.pdf.
                    </p>

                    <div className="border border-dashed border-zinc-850 hover:border-zinc-700 bg-[#050508] p-5 rounded-xl text-center relative transition-all">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {resumeName || 'Click to select PDF'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleResumeUpload}
                    disabled={!resumeFile}
                    className="w-full flex items-center justify-center space-x-2 bg-zinc-950 border border-zinc-850 hover:border-spidey-red disabled:opacity-50 text-zinc-400 hover:text-white py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-spidey-red" />
                    <span>UPLOAD RESUME</span>
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 3: PROJECTS */}
          {activeTab === 'projects' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_02: PROJECT_NODES</span>
                  <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">PROJECT CATALOG</h2>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={triggerGitHubSync}
                    disabled={syncingProjects}
                    className="flex items-center space-x-2 bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl font-mono text-xs transition-colors cursor-pointer pointer-events-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-spidey-red ${syncingProjects ? 'animate-spin' : ''}`} />
                    <span>TRIGGER GITHUB SYNC</span>
                  </button>
                  <button
                    onClick={handleProjectAdd}
                    className="flex items-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white px-4 py-2.5 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_10px_rgba(229,9,20,0.2)] cursor-pointer pointer-events-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD MANUAL</span>
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
                {projects.map((proj) => (
                  <div key={proj._id} className="bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-4 card-grid relative">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">// {proj.class || 'GITHUB_INTEGRATED'}</span>
                        
                        {/* Visibility and Edit controls */}
                        <div className="flex items-center space-x-2 select-none">
                          <button
                            onClick={() => handleToggleProjectVisibility(proj)}
                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title={proj.archived ? "Show Project on Portfolio" : "Hide Project on Portfolio"}
                          >
                            {proj.archived ? <EyeOff className="w-3.5 h-3.5 text-spidey-red" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                          </button>
                          <button
                            onClick={() => handleProjectEdit(proj)}
                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-spidey-blue-glow" />
                          </button>
                          <button
                            onClick={() => handleProjectDelete(proj._id)}
                            className="p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-spidey-red" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{proj.title}</h3>
                        <p className="text-[10px] text-zinc-500 mt-1 select-text line-clamp-3 leading-relaxed">{proj.description}</p>
                      </div>

                      {/* Tech stack tags */}
                      <div className="flex flex-wrap gap-1.5 select-none pt-1">
                        {(proj.techStack || proj.skills || []).map((tech, idx) => (
                          <span key={idx} className="text-[8px] bg-zinc-950 text-zinc-550 border border-zinc-900 px-1.5 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 select-none text-[9px] text-zinc-650">
                      <span>STATUS: {proj.archived ? 'HIDDEN' : 'VISIBLE'}</span>
                      <div className="flex gap-2">
                        {proj.githubLink && (
                          <a href={proj.githubLink} target="_blank" rel="noreferrer" className="hover:text-white">GITHUB</a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="hover:text-white">LIVE</a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* SECTION 4: SKILLS */}
          {activeTab === 'skills' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 flex justify-between items-center select-none">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_03: COGNITIVE_ARSENAL</span>
                  <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">SKILL TELEMETRY</h2>
                </div>
                <button
                  onClick={handleSkillAdd}
                  className="flex items-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white px-4 py-2.5 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_10px_rgba(229,9,20,0.2)] cursor-pointer pointer-events-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD SKILL</span>
                </button>
              </div>

              {/* Skills Matrix */}
              <div className="space-y-8 font-mono">
                {skillCategories.map((cat) => {
                  const catSkills = skills.filter(s => s.category === cat.id);
                  return (
                    <div key={cat.id} className="bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl p-6 card-grid space-y-4">
                      <h3 className="text-xs font-bold text-spidey-red tracking-widest uppercase border-b border-zinc-900 pb-2 select-none">
                        // {cat.label.toUpperCase()}_SYSTEMS
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catSkills.map((skill) => (
                          <div key={skill._id} className="bg-[#050508] border border-zinc-850 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <div className="flex justify-between items-center text-[10px] mb-1 select-text">
                                <span className="font-bold text-white uppercase">{skill.name}</span>
                                <span className="text-spidey-blue-glow font-bold">{skill.percent}%</span>
                              </div>
                              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                                <div className="h-full bg-spidey-blue-glow" style={{ width: `${skill.percent}%` }} />
                              </div>
                            </div>
                            
                            <div className="flex space-x-1.5 select-none">
                              <button
                                onClick={() => handleSkillEdit(skill)}
                                className="p-1 rounded bg-zinc-950 border border-zinc-900 hover:border-spidey-red text-zinc-500 hover:text-white cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-spidey-blue-glow" />
                              </button>
                              <button
                                onClick={() => handleSkillDelete(skill._id)}
                                className="p-1 rounded bg-zinc-950 border border-zinc-900 hover:border-spidey-red text-zinc-500 hover:text-white cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3 text-spidey-red" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* SECTION 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 flex justify-between items-center select-none">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_04: TIMELINE_TELEMETRY</span>
                  <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">EXPERIENCE & EDUCATION</h2>
                </div>
                <button
                  onClick={handleExperienceAdd}
                  className="flex items-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white px-4 py-2.5 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_10px_rgba(229,9,20,0.2)] cursor-pointer pointer-events-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD ENTRY</span>
                </button>
              </div>

              {/* Experiences Timeline List */}
              <div className="space-y-5 font-mono">
                {experiences.map((exp) => (
                  <div key={exp._id} className="bg-[#0a0a0f]/60 border border-zinc-900 p-6 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 card-grid relative">
                    <div className="space-y-3.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 select-none">
                        <span className="text-[8px] bg-spidey-red/10 border border-spidey-red/25 text-spidey-red px-2 py-0.5 rounded font-bold uppercase">
                          {exp.type}
                        </span>
                        <span className="text-[10px] text-zinc-550">
                          // {exp.dateRange}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-white uppercase select-text">{exp.title}</h3>
                        <span className="text-[10px] text-spidey-blue-glow font-bold select-text uppercase">{exp.company}</span>
                        <p className="text-[10px] text-zinc-500 mt-2 select-text leading-relaxed">{exp.description}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end items-end gap-2.5 select-none">
                      <button
                        onClick={() => handleExperienceEdit(exp)}
                        className="flex items-center justify-center p-2 rounded bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white transition-colors cursor-pointer pointer-events-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-spidey-blue-glow" />
                      </button>
                      <button
                        onClick={() => handleExperienceDelete(exp._id)}
                        className="flex items-center justify-center p-2 rounded bg-zinc-950 border border-zinc-850 hover:border-spidey-red text-zinc-400 hover:text-white transition-colors cursor-pointer pointer-events-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-spidey-red" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* SECTION 6: CONTACT INFO */}
          {activeTab === 'contact' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 select-none">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_05: COMMUNICATIONS</span>
                <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">CONTACT & SOCIAL LINKAGES</h2>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6 bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl p-6 md:p-8 card-grid">
                <h3 className="font-heading text-sm text-spidey-red tracking-wider spidey-heading border-b border-zinc-900 pb-3 select-none">// LINKAGE_CONFIG</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Primary Mobile</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">Physical Location</label>
                    <input
                      type="text"
                      value={contactLocation}
                      onChange={(e) => setContactLocation(e.target.value)}
                      className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">GitHub Profile Link</label>
                    <input
                      type="text"
                      value={contactGithub}
                      onChange={(e) => setContactGithub(e.target.value)}
                      className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[9px] text-zinc-550 uppercase tracking-wider mb-2 select-none">LinkedIn Profile Link</label>
                    <input
                      type="text"
                      value={contactLinkedin}
                      onChange={(e) => setContactLinkedin(e.target.value)}
                      className="w-full bg-[#050508] border border-zinc-800 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-spidey-red/40 focus:shadow-[0_0_8px_rgba(229,9,20,0.1)] transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 select-none">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-spidey-red hover:bg-spidey-red-glow text-white py-3 px-6 rounded-xl font-heading text-xs tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(229,9,20,0.2)] cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE LINKAGES</span>
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {/* SECTION 7: USERS */}
          {activeTab === 'users' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
                <div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block">// SECTION_06: VISITOR_NODES</span>
                  <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">USER AUDITS</h2>
                </div>
                <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-4 py-1.5 rounded-lg border text-[10px] cursor-pointer ${userFilter === 'all' ? 'bg-spidey-red/10 border-spidey-red text-white font-bold' : 'border-zinc-850 text-zinc-450 hover:text-white'}`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setUserFilter('active')}
                    className={`px-4 py-1.5 rounded-lg border text-[10px] cursor-pointer ${userFilter === 'active' ? 'bg-spidey-red/10 border-spidey-red text-white font-bold' : 'border-zinc-850 text-zinc-450 hover:text-white'}`}
                  >
                    ACTIVE
                  </button>
                  <button
                    onClick={() => setUserFilter('banned')}
                    className={`px-4 py-1.5 rounded-lg border text-[10px] cursor-pointer ${userFilter === 'banned' ? 'bg-spidey-red/10 border-spidey-red text-white font-bold' : 'border-zinc-850 text-zinc-450 hover:text-white'}`}
                  >
                    BANNED
                  </button>
                </div>
              </div>

              {/* Search User Input */}
              <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-4 rounded-xl flex items-center select-none font-mono">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-850 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-650"
                />
              </div>

              {/* Users Table */}
              <div className="bg-[#0a0a0f]/60 border border-zinc-900 rounded-2xl overflow-hidden card-grid font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 uppercase text-[9px] tracking-wider select-none">
                        <th className="py-4 px-6 font-bold">Node Name</th>
                        <th className="py-4 px-6 font-bold">Role</th>
                        <th className="py-4 px-6 font-bold">Created At</th>
                        <th className="py-4 px-6 font-bold">Last Seen</th>
                        <th className="py-4 px-6 font-bold">Status</th>
                        <th className="py-4 px-6 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {filteredUsers.map((u) => (
                        <tr 
                          key={u._id} 
                          onClick={() => setSelectedUser(u)}
                          className="hover:bg-zinc-900/40 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-6 select-text">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full border border-zinc-800 overflow-hidden select-none">
                                <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.name}</span>
                                <span className="text-[10px] text-zinc-500 block">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 select-text uppercase">
                            {u.email === 'shadowzshrine@gmail.com' ? (
                              <span className="text-[#E50914] font-extrabold tracking-wider bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                                // ADMIN
                              </span>
                            ) : (
                              <span className={u.role === 'admin' ? 'text-spidey-red font-bold' : 'text-zinc-400'}>
                                {u.role}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 select-text text-zinc-450">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 select-text text-zinc-400">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 select-text">
                            {u.isBanned ? (
                              <span className="text-spidey-red font-bold uppercase text-[9px] bg-spidey-red/10 border border-spidey-red/20 px-2 py-0.5 rounded">BANNED</span>
                            ) : (
                              <span className="text-emerald-400 font-bold uppercase text-[9px] bg-emerald-950/20 border border-emerald-950/30 px-2 py-0.5 rounded">ACTIVE</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right select-none">
                            {u.email !== 'shadowzshrine@gmail.com' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBanToggle(u._id, u.isBanned);
                                }}
                                className={`px-3.5 py-1.5 rounded-lg border text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer pointer-events-auto ${
                                  u.isBanned 
                                    ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 hover:bg-emerald-900/10' 
                                    : 'bg-spidey-red/10 border-spidey-red text-spidey-red hover:bg-spidey-red/20'
                                }`}
                              >
                                {u.isBanned ? 'UNBAN_NODE' : 'BAN_NODE'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>
          )}

          {/* SECTION 7.5: ERROR SCREENS GALLERY */}
          {activeTab === 'error-screens' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 select-none">
                <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest block">// SECTION_08: ERROR_SYSTEMS_GALLERY</span>
                <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">ERROR SCREENS GALLERY</h2>
              </div>

              {/* Preview mode toggle */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#0a0a0f]/60 border border-zinc-900 p-4 rounded-xl mb-6 font-mono text-xs select-none">
                <div className="space-y-0.5">
                  <span className="text-zinc-400 font-bold block">PREVIEW_MODE_CONFIGURATION</span>
                  <span className="text-[10px] text-zinc-550 block">Configure how target node error pages render on activation</span>
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setFullscreenPreviewMode(false)}
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      !fullscreenPreviewMode 
                        ? 'bg-spidey-red/10 border-spidey-red text-spidey-red' 
                        : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-white'
                    }`}
                  >
                    IFRAME DIALOG
                  </button>
                  <button 
                    onClick={() => setFullscreenPreviewMode(true)}
                    className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      fullscreenPreviewMode 
                        ? 'bg-spidey-red/10 border-spidey-red text-spidey-red' 
                        : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-white'
                    }`}
                  >
                    FULLSCREEN OVERLAY
                  </button>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-mono text-xs">
                {(errorPages.length > 0 ? errorPages : [
                  { code: 400, title: '// CORRUPTED_REQUEST', name: 'BAD_REQUEST', description: 'The request payload contains malformed or unreadable data packets. Neural synap-link aborted.', webVariant: 'dissolve' },
                  { code: 401, title: '// AUTHENTICATION_REQUIRED', name: 'UNAUTHORIZED', description: 'Secure handshake failed. Identity signature required to access this sub-sector.', webVariant: 'key' },
                  { code: 403, title: '// ACCESS_DENIED', name: 'FORBIDDEN', description: 'Clearance level insufficient. Access to this mainframe node is strictly restricted.', webVariant: 'shield' },
                  { code: 404, title: '// NODE_NOT_FOUND', name: 'PAGE_NOT_FOUND', description: 'The requested resource does not exist in this sector of the network. The web has grown cold here.', webVariant: 'broken' },
                  { code: 500, title: '// SYSTEM_FAILURE', name: 'INTERNAL_SERVER_ERROR', description: 'An internal fault occurred in the neural core. Critical system modules are restarting.', webVariant: 'glitch' },
                  { code: 502, title: '// GATEWAY_MALFUNCTION', name: 'BAD_GATEWAY', description: 'Upstream gateway returned an invalid response. Mainframe comm-link unstable.', webVariant: 'slow-fade' },
                  { code: 503, title: '// SERVICE_OFFLINE', name: 'SERVICE_UNAVAILABLE', description: 'The target system is currently offline or undergoing defensive maintenance. Try linking later.', webVariant: 'slow-fade' }
                ]).map((pg) => {
                  const icons = {
                    400: '⚠️',
                    401: '🔑',
                    403: '🔒',
                    404: '🕸️',
                    500: '💥',
                    502: '🌐',
                    503: '⏱️'
                  };
                  return (
                    <div
                      key={pg.code}
                      onClick={() => setActivePreviewCode(pg.code)}
                      className="bg-[#0a0a0f]/60 border border-zinc-900 p-5 rounded-2xl relative cursor-pointer group transition-all duration-300 hover:border-spidey-red/45 hover:shadow-[0_0_20px_rgba(229,9,20,0.15)] flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start select-none">
                          <span className="text-3xl font-black font-heading text-zinc-500 group-hover:text-spidey-red transition-colors">
                            {pg.code}
                          </span>
                          <span className="text-xl">
                            {icons[pg.code] || '👾'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white tracking-wider uppercase text-[11px] group-hover:text-spidey-red transition-colors">
                            {pg.name}
                          </h3>
                          <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                            {pg.description}
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-zinc-900/60 mt-4 pt-3 flex justify-between items-center text-[8px] text-zinc-650 uppercase select-none">
                        <span>VARIANT: {pg.webVariant || 'DEFAULT'}</span>
                        <span className="text-spidey-red font-bold group-hover:translate-x-1 transition-transform">LAUNCH PREVIEW →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* SECTION 8: SECURITY ALERTS */}
          {activeTab === 'alerts' && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="border-b border-zinc-900 pb-4 mb-6 select-none">
                <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest block">// SECTION_07: INTRUSION_DETECTION_TELEMETRY</span>
                <h2 className="text-xl font-heading text-white spidey-heading tracking-wider mt-1">SECURITY LOGS</h2>
              </div>

              {/* Alerts List */}
              <div className="space-y-5 font-mono text-xs">
                {alerts.map((al) => (
                  <div key={al._id} className="bg-[#0a0a0f]/60 border border-spidey-red/25 p-6 rounded-2xl card-grid relative space-y-4">
                    <div className="flex justify-between items-start select-none">
                      <div className="flex items-center space-x-2.5">
                        <AlertTriangle className="w-4 h-4 text-spidey-red animate-pulse" />
                        <span className="text-[9px] text-spidey-red font-bold uppercase tracking-wider">// POLICY_VIOLATION_DETECTED</span>
                      </div>
                      <span className="text-[10px] text-zinc-550">{new Date(al.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="space-y-2 select-text">
                      <div>
                        <span className="text-zinc-650 mr-1.5 font-bold">NODE EMAIL:</span>
                        <span className="text-white font-bold">{al.email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-650 mr-1.5 font-bold">OFFENDING INPUT:</span>
                        <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-lg text-zinc-400 mt-1 select-text whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {al.query || al.message || 'No payload log.'}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900/60 pt-4 flex justify-between items-center select-none">
                      <span className="text-[9px] text-zinc-650">ACTION TAKEN: AUTOMATIC_BAN</span>
                      
                      {/* Unban Action link */}
                      <button
                        onClick={() => {
                          const targetUser = users.find(u => u.email === al.email);
                          if (targetUser) {
                            handleBanToggle(targetUser._id, true);
                          } else {
                            showToast('Matching user node not found.', 'error');
                          }
                        }}
                        className="flex items-center space-x-1.5 bg-emerald-950/20 border border-emerald-500 text-emerald-400 px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors cursor-pointer pointer-events-auto"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>REAUTHORIZE NODE (UNBAN)</span>
                      </button>
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="bg-[#0a0a0f]/60 border border-zinc-900 p-8 rounded-2xl text-center select-none">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-zinc-500 uppercase tracking-wider text-[10px] block">
                      // SECURITY GRID STABLE. ZERO ALERTS LOGGED.
                    </span>
                  </div>
                )}
              </div>
            </motion.section>
          )}

        </main>
      </div>

      {/* MODALS */}

      {/* 1. PROJECT EDITOR DIALOG */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowProjectModal(false)} />
          <form onSubmit={handleProjectSubmit} className="relative w-[90vw] max-w-[600px] bg-[#0a0a0f] border border-zinc-850 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col space-y-4 font-mono text-xs select-text pointer-events-auto">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 select-none">
              <span className="font-bold text-spidey-red tracking-widest uppercase">// PROJECT_CONFIG</span>
              <button type="button" onClick={() => setShowProjectModal(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Subtitle</label>
                <input
                  type="text"
                  value={projectForm.subtitle}
                  onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Description</label>
                <textarea
                  required
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Tech Stack (comma separated list)</label>
                <input
                  type="text"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">GitHub URL</label>
                <input
                  type="text"
                  value={projectForm.githubLink}
                  onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Live Demo URL</label>
                <input
                  type="text"
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Mission Code (e.g. MISSION_RED)</label>
                <input
                  type="text"
                  value={projectForm.mission}
                  onChange={(e) => setProjectForm({ ...projectForm, mission: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Class Tag (e.g. CLASS: DEV_APP)</label>
                <input
                  type="text"
                  value={projectForm.class}
                  onChange={(e) => setProjectForm({ ...projectForm, class: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 select-none">
              <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded-lg transition-colors cursor-pointer">Save Project</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. SKILL EDITOR DIALOG */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowSkillModal(false)} />
          <form onSubmit={handleSkillSubmit} className="relative w-[90vw] max-w-[450px] bg-[#0a0a0f] border border-zinc-850 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col space-y-4 font-mono text-xs select-text pointer-events-auto">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 select-none">
              <span className="font-bold text-spidey-red tracking-widest uppercase">// SKILL_CONFIG</span>
              <button type="button" onClick={() => setShowSkillModal(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Category System</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-zinc-400 rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none cursor-pointer"
                >
                  {skillCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Proficiency Percent ({skillForm.percent}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillForm.percent}
                  onChange={(e) => setSkillForm({ ...skillForm, percent: Number(e.target.value) })}
                  className="w-full accent-spidey-red bg-[#050508] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 select-none">
              <button type="button" onClick={() => setShowSkillModal(false)} className="px-4 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded-lg transition-colors cursor-pointer">Save Skill</button>
            </div>
          </form>
        </div>
      )}

      {/* 3. EXPERIENCE EDITOR DIALOG */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowExperienceModal(false)} />
          <form onSubmit={handleExperienceSubmit} className="relative w-[90vw] max-w-[500px] bg-[#0a0a0f] border border-zinc-850 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col space-y-4 font-mono text-xs select-text pointer-events-auto">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 select-none">
              <span className="font-bold text-spidey-red tracking-widest uppercase">// EXPERIENCE_CONFIG</span>
              <button type="button" onClick={() => setShowExperienceModal(false)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Role / Title</label>
                  <input
                    type="text"
                    required
                    value={experienceForm.title}
                    onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                    className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Company / School</label>
                  <input
                    type="text"
                    required
                    value={experienceForm.company}
                    onChange={(e) => setExperienceForm({ ...experienceForm, company: e.target.value })}
                    className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Duration / Date Range</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2021 - 2024"
                    value={experienceForm.dateRange}
                    onChange={(e) => setExperienceForm({ ...experienceForm, dateRange: e.target.value })}
                    className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Category Type</label>
                  <select
                    value={experienceForm.type}
                    onChange={(e) => setExperienceForm({ ...experienceForm, type: e.target.value })}
                    className="w-full bg-[#050508] border border-zinc-800 text-zinc-400 rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none cursor-pointer"
                  >
                    <option value="INTERNSHIP">Work / Internship</option>
                    <option value="ACADEMICS">Education / Academics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Sort Order index</label>
                  <input
                    type="number"
                    value={experienceForm.index}
                    onChange={(e) => setExperienceForm({ ...experienceForm, index: Number(e.target.value) })}
                    className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-zinc-550 uppercase mb-1.5 select-none">Description / Duties</label>
                <textarea
                  required
                  rows={4}
                  value={experienceForm.description}
                  onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}
                  className="w-full bg-[#050508] border border-zinc-800 text-white rounded-lg p-2.5 focus:outline-none focus:border-spidey-red/45 transition-colors outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 select-none">
              <button type="button" onClick={() => setShowExperienceModal(false)} className="px-4 py-2 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-spidey-red to-spidey-red-glow text-white font-bold rounded-lg transition-colors cursor-pointer">Save Entry</button>
            </div>
          </form>
        </div>
      )}

      {/* 4. USER DETAIL SLIDE-OVER PANEL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
              onClick={() => setSelectedUser(null)} 
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-[#0a0a0f] border-l border-zinc-850 shadow-[0_0_40px_rgba(229,9,20,0.15)] p-6 md:p-8 flex flex-col justify-between font-mono text-xs overflow-y-auto pointer-events-auto text-zinc-300 z-10"
            >
              <div>
                {/* Header section */}
                <div className="flex justify-between items-start border-b border-zinc-900 pb-5 mb-6 select-none">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-2 border-zinc-800 overflow-hidden shadow-lg bg-zinc-950">
                      <img 
                        src={selectedUser.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">{selectedUser.name}</h3>
                      <p className="text-[10px] text-zinc-500 lowercase mt-0.5">{selectedUser.email}</p>
                      <div className="flex gap-2 mt-2">
                        {/* Role Badge */}
                        {selectedUser.email === 'shadowzshrine@gmail.com' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-gradient-to-r from-red-600 to-amber-500 text-white drop-shadow-[0_0_8px_rgba(229,9,20,0.4)]">
                            // ADMIN
                          </span>
                        ) : selectedUser.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-spidey-red/10 border border-spidey-red/30 text-spidey-red">
                            // ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-zinc-400">
                            // USER
                          </span>
                        )}

                        {/* Status Badge */}
                        {selectedUser.isBanned ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-spidey-red/10 border border-spidey-red/30 text-spidey-red">
                            BANNED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedUser(null)} 
                    className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-550 hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* USER DETAIL PANEL fields */}
                <div className="space-y-6">
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-2.5">// ACCOUNT_METADATA</span>
                    <div className="grid grid-cols-2 gap-3 bg-[#050508]/80 border border-zinc-900 rounded-xl p-4">
                      <div>
                        <span className="text-zinc-500 block text-[9px]">CREATED_ON</span>
                        <span className="text-zinc-200 mt-1 block">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px]">LAST_SEEN</span>
                        <span className="text-zinc-200 mt-1 block">
                          {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ONBOARDING DATA section */}
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-2.5">// ONBOARDING_METADATA</span>
                    <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      <div>
                        <span className="text-zinc-500 block text-[9px]">MOBILE_NUMBER</span>
                        <span className="text-zinc-200 mt-1 block font-semibold">
                          {selectedUser.mobileNumber || 'NOT PROVIDED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px]">VISIT_PURPOSE</span>
                        <span className="text-zinc-200 mt-1 block leading-relaxed">
                          {selectedUser.visitReason || 'NOT PROVIDED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[9px]">HOW_FOUND</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selectedUser.findSource && selectedUser.findSource.length > 0 ? (
                            selectedUser.findSource.map((src, sIdx) => (
                              <span key={sIdx} className="bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-[9px] text-zinc-400 uppercase">
                                {src}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500 font-mono italic text-[9px]">NOT PROVIDED</span>
                          )}
                        </div>
                      </div>
                      {selectedUser.referrerName && (
                        <div>
                          <span className="text-zinc-500 block text-[9px]">REFERRED_BY</span>
                          <span className="text-zinc-200 mt-1 block">
                            {selectedUser.referrerName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VISIT HISTORY section / Admin mode tracking */}
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-2.5">// VISIT_METADATA</span>
                    <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 space-y-3">
                      {selectedUser.email === 'shadowzshrine@gmail.com' ? (
                        <>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">LAST_VIEWER_SESSION</span>
                            <span className="text-spidey-blue-glow mt-1 block font-bold">
                              {selectedUser.adminLastViewerLogin ? new Date(selectedUser.adminLastViewerLogin).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">LAST_EDITOR_SESSION</span>
                            <span className="text-spidey-red mt-1 block font-bold">
                              {selectedUser.adminLastEditorLogin ? new Date(selectedUser.adminLastEditorLogin).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">FIRST_VISIT_DATE</span>
                            <span className="text-zinc-200 mt-1 block">
                              {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px]">LAST_VISIT_DATE</span>
                            <span className="text-zinc-200 mt-1 block">
                              {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SESSION HISTORY section */}
                  {selectedUser.email !== 'shadowzshrine@gmail.com' && (
                    <div>
                      <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-2.5">// SESSION_TELEMETRY</span>
                      
                      {sessionsLoading ? (
                        <div className="text-zinc-500 font-mono italic text-[9px] p-4 bg-[#050508]/80 border border-zinc-900 rounded-xl">// RETRIEVING_SESSION_LOGS...</div>
                      ) : (
                        <div className="space-y-4">
                          {/* Session Stats Summary Cards */}
                          <div className="grid grid-cols-3 gap-2.5 font-mono text-[9px]">
                            <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-lg text-center">
                              <span className="text-zinc-550 block text-[8px] uppercase">CUMULATIVE_TIME</span>
                              <span className="text-white mt-1 block font-bold">{formatDuration(sessionStats.cumulativeTime * 1000)}</span>
                            </div>
                            <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-lg text-center">
                              <span className="text-zinc-550 block text-[8px] uppercase">AVG_DURATION</span>
                              <span className="text-spidey-blue-glow mt-1 block font-bold">{formatDuration(sessionStats.averageDuration * 1000)}</span>
                            </div>
                            <div className="bg-zinc-950/80 border border-zinc-900 p-3 rounded-lg text-center">
                              <span className="text-zinc-550 block text-[8px] uppercase">MOST_VIEWED_SEC</span>
                              <span className="text-spidey-red mt-1 block font-bold uppercase">{sessionStats.mostViewedSection}</span>
                            </div>
                          </div>

                          {/* Sessions Table */}
                          <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl overflow-hidden text-[9px]">
                            <div className="overflow-x-auto max-h-[220px] scrollbar-thin">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 uppercase text-[8px] tracking-wider font-bold">
                                    <th className="py-2.5 px-3">Date</th>
                                    <th className="py-2.5 px-3">Active</th>
                                    <th className="py-2.5 px-3">Total</th>
                                    <th className="py-2.5 px-3">Sections</th>
                                    <th className="py-2.5 px-3">Device</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-900/40 text-zinc-300">
                                  {userSessions.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-4 px-3 text-center text-zinc-650 italic">No session logs found.</td>
                                    </tr>
                                  ) : (
                                    userSessions.map((session, idx) => {
                                      const viewedStr = session.sectionsViewed
                                        ? session.sectionsViewed.map(sv => `${sv.section} (${sv.timeSpentSeconds}s)`).join(', ')
                                        : 'None';
                                      const deviceStr = session.device
                                        ? `${session.device.browser} / ${session.device.os}`
                                        : 'Unknown';
                                      return (
                                        <tr key={session._id || idx} className="hover:bg-zinc-900/25">
                                          <td className="py-2.5 px-3 whitespace-nowrap text-zinc-400 font-mono">
                                            {new Date(session.sessionStart).toLocaleDateString()}
                                          </td>
                                          <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-spidey-blue-glow font-mono">
                                            {formatDuration(session.activeTimeSeconds * 1000)}
                                          </td>
                                          <td className="py-2.5 px-3 whitespace-nowrap text-zinc-400 font-mono">
                                            {formatDuration(session.totalTimeSeconds * 1000)}
                                          </td>
                                          <td className="py-2.5 px-3 max-w-[150px] truncate font-mono" title={viewedStr}>
                                            {viewedStr}
                                          </td>
                                          <td className="py-2.5 px-3 truncate text-zinc-500 max-w-[100px] font-mono" title={deviceStr}>
                                            {deviceStr}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECURITY section */}
                  <div>
                    <span className="text-[9px] text-zinc-550 uppercase tracking-widest block mb-2.5">// SECURITY_METADATA</span>
                    <div className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                      {selectedUser.isBanned && (
                        <div>
                          <span className="text-spidey-red block text-[9px] font-bold">BAN_REASON</span>
                          <span className="text-zinc-200 mt-1 block italic leading-relaxed">
                            "{selectedUser.banReason || 'Violation of security policies'}"
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-zinc-500 block text-[9px]">AI_ABUSE_ATTEMPTS</span>
                        <span className={`mt-1 block font-bold ${
                          alerts.filter(al => al.email && al.email.toLowerCase() === selectedUser.email.toLowerCase()).length > 0 
                            ? 'text-spidey-red' 
                            : 'text-emerald-400'
                        }`}>
                          {alerts.filter(al => al.email && al.email.toLowerCase() === selectedUser.email.toLowerCase()).length} DETECTED
                        </span>
                      </div>
                      {alerts.filter(al => al.email && al.email.toLowerCase() === selectedUser.email.toLowerCase()).length > 0 && (
                        <div className="max-h-[150px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                          {alerts.filter(al => al.email && al.email.toLowerCase() === selectedUser.email.toLowerCase()).map((al, idx) => (
                            <div key={al._id || idx} className="bg-zinc-950 border border-zinc-900 p-2.5 rounded text-[10px] space-y-1.5 text-zinc-400">
                              <div className="flex justify-between text-[8px] text-zinc-550 font-bold">
                                <span>VIOLATION #{idx + 1}</span>
                                <span>{new Date(al.timestamp).toLocaleDateString()}</span>
                              </div>
                              <div className="text-[9px] leading-relaxed break-all bg-black/40 p-1.5 rounded border border-zinc-900/50">
                                {al.query || al.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions in detail panel */}
              <div className="flex gap-3 pt-6 border-t border-zinc-900 mt-6 select-none">
                {selectedUser.email !== 'shadowzshrine@gmail.com' && (
                  <button
                    onClick={() => handleBanToggle(selectedUser._id, selectedUser.isBanned)}
                    className={`flex-grow px-4 py-2.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      selectedUser.isBanned 
                        ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 hover:bg-emerald-900/10' 
                        : 'bg-spidey-red/10 border-spidey-red text-spidey-red hover:bg-spidey-red/20'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {selectedUser.isBanned ? 'REAUTHORIZE_NODE (UNBAN)' : 'BAN_NODE'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer text-center font-bold"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. ERROR SCREEN FULLSCREEN PREVIEW OVERLAY */}
      {activePreviewCode !== null && fullscreenPreviewMode && (
        <div className="fixed inset-0 z-[30000] pointer-events-auto">
          <ErrorPage code={activePreviewCode} />
          <button
            onClick={() => setActivePreviewCode(null)}
            className="fixed top-6 left-6 z-[30001] flex items-center space-x-2 bg-[#0a0a0f] border border-spidey-red/45 hover:border-spidey-red text-white hover:text-spidey-red px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(229,9,20,0.2)] hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
          >
            <span>← BACK TO ADMIN</span>
          </button>
        </div>
      )}

      {/* 6. ERROR SCREEN IFRAME PREVIEW DIALOG */}
      {activePreviewCode !== null && !fullscreenPreviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm pointer-events-auto">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActivePreviewCode(null)} />
          <div className="relative w-[95vw] max-w-5xl bg-[#0a0a0f] border border-zinc-850 rounded-2xl shadow-[0_0_40px_rgba(229,9,20,0.15)] p-6 flex flex-col font-mono text-xs select-none z-10">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
              <span className="font-bold text-spidey-red tracking-widest uppercase">// ERROR_SCREEN_IFRAME_PREVIEW (CODE: {activePreviewCode})</span>
              <button 
                type="button" 
                onClick={() => setActivePreviewCode(null)} 
                className="text-zinc-550 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-full h-[65vh] border border-zinc-900 rounded-xl overflow-hidden bg-black relative">
              <iframe 
                src={activePreviewCode === 404 ? '/not-found' : `/error/${activePreviewCode}`}
                className="w-full h-full border-none"
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setActivePreviewCode(null)} 
                className="px-5 py-2.5 bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer font-bold"
              >
                DISMISS PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutOverlay
        showConfirm={isLogoutConfirmOpen}
        isLoggingOut={isLoggingOut}
        progress={progress}
        statusText={statusText}
        onConfirm={() => confirmLogout()}
        onCancel={cancelLogout}
      />

    </div>
  );
}
