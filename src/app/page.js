"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/LoadingScreen';
import AppOverlay from '@/components/AppOverlay';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { startLoopingSFX, stopLoopingSFX, initAudio } from '@/utils/audio';

// Silence unavoidable third-party ThreeJS deprecation warnings from React Three Fiber
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('THREE.Clock: This module has been deprecated')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Dynamically import the ThreeCanvas with SSR disabled since WebGL requires window/browser APIs
const ThreeCanvas = dynamic(() => import('@/components/ThreeCanvas'), {
  ssr: false,
});

// Module-level in-memory cache for loaded portfolio data to avoid repeat fetches
let cachedPortfolioData = null;

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [portfolioData, setPortfolioData] = useState(cachedPortfolioData);
  const [isDataLoaded, setIsDataLoaded] = useState(!!cachedPortfolioData);

  // Pre-warm the audio context and handle browser autoplay unlock on mount
  useEffect(() => {
    initAudio(); // Attempt immediately on mount

    const unlockOnFirstInteraction = () => {
      initAudio();
    };

    window.addEventListener('pointerdown', unlockOnFirstInteraction, { once: true });
    window.addEventListener('keydown', unlockOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockOnFirstInteraction);
      window.removeEventListener('keydown', unlockOnFirstInteraction);
    };
  }, []);

  useEffect(() => {
    stopLoopingSFX();
    if (cachedPortfolioData) {
      return; // Use the module-level cached data
    }

    // Fetch MERN backend portfolio data
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/portfolio`)
      .then((res) => {
        if (!res.ok) throw new Error('API server response was not ok');
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          cachedPortfolioData = json.data;
          setPortfolioData(json.data);
          setIsDataLoaded(true);
        } else {
          console.error('API responded with error:', json.message);
        }
      })
      .catch((err) => {
        console.warn('Error fetching data from MERN API server:', err.message || err);
        
        // Provide mock fallback data so it displays even if the API server is temporarily offline
        const mockFallback = {
          profile: {
            name: 'MAGESHWARAN S',
            roles: ["Fresher", "Aspiring Developer", "Multimedia Designer", "FullStack Developer", "AI Agent Trainer"],
            bio: "I am a passionate fullstack developer who loves crafting real-world solutions using HTML, CSS, JS, React, Python, and SQL. I enjoy building dynamic, responsive websites and exploring cloud technologies. I aim to solve problems creatively and deliver impactful digital experiences through clean, functional code.",
            subtitle: "I'm passionate about building real-world software solutions.",
            stats: [
              { label: "D.O.B", value: "27 May 2004" },
              { label: "DEGREE", value: "B.E., CSE" },
              { label: "CITY", value: "Chennai, TN" },
              { label: "FREELANCE", value: "AVAILABLE" },
              { label: "GITHUB", value: "shadowzshrine" }
            ]
          },
          experiences: [
            {
              dateRange: "11.2025 - 02.2026",
              type: "INTERNSHIP",
              title: "Web Development & UI/UX Intern",
              company: "Magic Bus India Foundation",
              description: "Completed hands-on Web Development projects using HTML, CSS, Bootstrap, JavaScript, and React JS. Designed responsive user interfaces in Figma following modern styling principles.",
              index: 0
            },
            {
              dateRange: "2021 - 2025",
              type: "ACADEMICS",
              title: "B.E. Computer Science & Engineering",
              company: "Anna University Affiliation",
              description: "Focus on fullstack development, cloud integration, and database design. Built academic prototypes with HTML, CSS, JavaScript, ASP.NET, and Microsoft Azure.",
              index: 1
            }
          ],
          skills: [
            { category: 'FRONTEND_SYSTEMS', name: 'HTML5', percent: 96 },
            { category: 'FRONTEND_SYSTEMS', name: 'CSS3', percent: 86 },
            { category: 'FRONTEND_SYSTEMS', name: 'JavaScript', percent: 76 },
            { category: 'FRONTEND_SYSTEMS', name: 'ReactJS', percent: 70 },
            { category: 'FRONTEND_SYSTEMS', name: 'SASS / SCSS', percent: 80 },
            { category: 'FRONTEND_SYSTEMS', name: 'Bootstrap', percent: 70 },
            { category: 'FRONTEND_SYSTEMS', name: 'Tailwind CSS', percent: 40 },
            { category: 'BACKEND_INTEGRATIONS', name: 'Python', percent: 60 },
            { category: 'BACKEND_INTEGRATIONS', name: 'MySQL', percent: 66 },
            { category: 'BACKEND_INTEGRATIONS', name: 'Supabase', percent: 70 },
            { category: 'BACKEND_INTEGRATIONS', name: 'Strapi CMS', percent: 70 },
            { category: 'WORKFLOW_AND_DESIGN', name: 'AI-assisted IDEs', percent: 96 },
            { category: 'WORKFLOW_AND_DESIGN', name: 'Figma Prototyping', percent: 80 }
          ],
          projects: [
            {
              mission: 'MISSION_01',
              class: 'CORE_UI',
              title: 'Web & UI Projects',
              subtitle: 'Figma to Web & UI Optimization',
              description: 'Responsive web applications, turning static Figma mockups into functional layouts, and optimizing frontend performance and accessibility criteria.',
              techStack: ['React.js', 'Figma', 'Tailwind', 'SASS', 'HTML5'],
              githubLink: 'https://github.com/shadowzshrine'
            },
            {
              mission: 'MISSION_02',
              class: 'DESKTOP_APP',
              title: 'Max Notes',
              subtitle: 'Desktop Notes Application',
              description: 'A clean, efficient offline-capable desktop note-taking utility designed for developer productivity, featuring markdown support and quick tagging mechanisms.',
              techStack: ['HTML5', 'CSS3', 'JavaScript', 'Local Storage'],
              githubLink: 'https://github.com/shadowzshrine'
            }
          ],
          contact: {
            subtitle: "Feel free to reach out. I am highly responsive to messages.",
            phone: '+91 63690 43135',
            location: 'Chennai, Medavakkam',
            email: 'shadowzshrine@gmail.com',
            github: 'shadowzshrine',
            linkedin: 'shadowzshrine',
            resumeUrl: '/MAX Resume.pdf'
          }
        };
        cachedPortfolioData = mockFallback;
        setPortfolioData(mockFallback);
        setIsDataLoaded(true); // Proceed loading screen transition with fallback data
      });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      stopLoopingSFX();
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  // Handle start/stop looping SFX for viewer page loading
  useEffect(() => {
    if (!isLoaded) {
      startLoopingSFX('loading');
    } else {
      stopLoopingSFX();
    }
    return () => stopLoopingSFX();
  }, [isLoaded]);

  return (
    <div className="relative w-full min-h-screen bg-spidey-dark text-white overflow-x-hidden selection:bg-spidey-red selection:text-white">
      {/* 1. Preloader Screen (Waits for loading bar and API connection) */}
      <LoadingScreen onLoaded={() => setIsLoaded(true)} isDataLoaded={isDataLoaded} />

      {isLoaded && portfolioData && (
        <>
          {/* Subtle Halftone Background Grid Overlay */}
          <div className="fixed inset-0 comic-grid opacity-[0.07] pointer-events-none z-1" />

          {/* HUD scanline effect */}
          <div className="fixed inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_95%,rgba(255,255,255,1)_95%)] bg-[length:100%_20px] animate-scanline" />

          {/* 2. ThreeJS 3D Scene Layer */}
          <ThreeCanvas />

          {/* 3. HTML Content Layout Overlays */}
          <AppOverlay portfolioData={portfolioData} />
          
          {/* Cyberpunk HUD border frame */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 border-[8px] border-spidey-dark" />
        </>
      )}
    </div>
  );
}
