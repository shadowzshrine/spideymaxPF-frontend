let audioCtx = null;
let activePulseOscillators = [];
let activePulseInterval = null;
let cachedFemaleVoice = null;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  } catch (err) {
    console.warn('[Audio] Failed to initialize AudioContext:', err);
    return null;
  }
}

function resumeAudioContext(ctx) {
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch((err) => console.warn('[Audio] Failed to resume context:', err));
  }
}

// Pre-load voices on module import to fix male-to-female start bug
if (typeof window !== 'undefined' && window.speechSynthesis) {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();

    const femaleKeywords = ['zira', 'samantha', 'karen', 'hazel', 'susan', 'female', 'natural'];
    let voiceMatch = null;

    for (const key of femaleKeywords) {
      voiceMatch = voices.find(v =>
        v.lang.startsWith('en') &&
        v.name.toLowerCase().includes(key) &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('david') &&
        !v.name.toLowerCase().includes('george') &&
        !v.name.toLowerCase().includes('mark')
      );
      if (voiceMatch) break;
    }

    // If no matching female voice found, fallback to any English voice that is not explicitly male
    if (!voiceMatch) {
      voiceMatch = voices.find(v =>
        v.lang.startsWith('en') &&
        !v.name.toLowerCase().includes('male') &&
        !v.name.toLowerCase().includes('david') &&
        !v.name.toLowerCase().includes('george') &&
        !v.name.toLowerCase().includes('mark')
      );
    }

    if (!voiceMatch) {
      voiceMatch = voices.find(v => v.lang.startsWith('en'));
    }

    if (voiceMatch) {
      cachedFemaleVoice = voiceMatch;
    }
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// Pre-warm the audio engine
export function initAudio() {
  try {
    console.log('[Audio] initAudio() pre-warming audio engine...');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    // Play a 0.001-second silent buffer to pre-warm the audio context
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    source.stop(0.001);
  } catch (err) {
    console.warn('[Audio] Failed to pre-warm AudioContext:', err);
  }
}

// Quick helper to safely create oscillator, gain, and other nodes
function createAudioNodeChain(ctx, type, startFreq, endFreq, duration, maxVolume, gainDecayType = 'exponential') {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  if (endFreq && endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(maxVolume, ctx.currentTime);
  if (gainDecayType === 'exponential') {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  } else {
    gainNode.gain.linearRampToValueAtTime(0.0, ctx.currentTime + duration);
  }

  osc.connect(gainNode);
  return { osc, gainNode };
}

// ==========================================
// 1. DYNAMIC SYNTHESIZED SFX GENERATORS
// ==========================================

// playClick(): Quick high-pitch futuristic UI click
export function playClick() {
  try {
    console.log('[Audio] playClick() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const { osc, gainNode } = createAudioNodeChain(ctx, 'sine', 1600, 600, 0.05, 0.05);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (err) {
    console.warn('[Audio] playClick error:', err);
  }
}

// playHover(): Micro tech chirp on mouse enter
export function playHover() {
  try {
    console.log('[Audio] playHover() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const { osc, gainNode } = createAudioNodeChain(ctx, 'triangle', 2200, 3200, 0.08, 0.03);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    console.warn('[Audio] playHover error:', err);
  }
}

// playWebSling(): White noise sweep simulating a Spidey "thwip" web-shoot
export function playWebSling() {
  try {
    console.log('[Audio] playWebSling() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const duration = 0.22;
    const now = ctx.currentTime;

    // Create white noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter to sweep frequency
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.0, now);
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + duration - 0.02);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch (err) {
    console.warn('[Audio] playWebSling error:', err);
  }
}

// playPopupOpen(): Rising sweep (pitch ramp up) combined with web-stretch texture
export function playPopupOpen() {
  try {
    console.log('[Audio] playPopupOpen() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const duration = 0.3;
    const now = ctx.currentTime;

    // Main rising sweep
    const { osc, gainNode } = createAudioNodeChain(ctx, 'sine', 250, 1300, duration, 0.05);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Web stretch clicks texture
    const clicksCount = 4;
    for (let i = 0; i < clicksCount; i++) {
      const clickTime = now + (i / clicksCount) * (duration - 0.05);
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(120 + i * 150, clickTime);
      clickGain.gain.setValueAtTime(0.02, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(clickTime);
      clickOsc.stop(clickTime + 0.03);
    }
  } catch (err) {
    console.warn('[Audio] playPopupOpen error:', err);
  }
}

// playPopupClose(): Descending sweep (pitch ramp down) combined with web-release texture
export function playPopupClose() {
  try {
    console.log('[Audio] playPopupClose() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const duration = 0.28;
    const now = ctx.currentTime;

    // Main descending sweep
    const { osc, gainNode } = createAudioNodeChain(ctx, 'sine', 1100, 150, duration, 0.05);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Web release snap texture
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(350, now);
    snapOsc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    snapGain.gain.setValueAtTime(0.03, now);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    snapOsc.connect(filter);
    filter.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapOsc.start(now);
    snapOsc.stop(now + 0.08);
  } catch (err) {
    console.warn('[Audio] playPopupClose error:', err);
  }
}

// playSuccess() / playAdd(): Pleasant cybernetic double-chime (major chord)
export function playSuccess() {
  try {
    console.log('[Audio] playSuccess() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const now = ctx.currentTime;

    // First chime
    const { osc: osc1, gainNode: gain1 } = createAudioNodeChain(ctx, 'sine', 783.99, 783.99, 0.25, 0.05); // G5
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second chime (delayed, major third higher)
    const delay = 0.07;
    const { osc: osc2, gainNode: gain2 } = createAudioNodeChain(ctx, 'sine', 987.77, 987.77, 0.25, 0.05); // B5
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.25);
  } catch (err) {
    console.warn('[Audio] playSuccess error:', err);
  }
}

export const playAdd = playSuccess;

// playDelete() / playWarning(): Cyber buzz or alarm tone
export function playDelete() {
  try {
    console.log('[Audio] playDelete() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const duration = 0.22;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.1);
    osc.frequency.linearRampToValueAtTime(130, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (err) {
    console.warn('[Audio] playDelete error:', err);
  }
}

export const playWarning = playDelete;

// playLogin() / playStartup(): Cinematic digital startup sequence
export function playLogin() {
  try {
    console.log('[Audio] playLogin() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const now = ctx.currentTime;
    const notes = [329.63, 440.00, 554.37, 659.25, 880.00]; // E4, A4, C#5, E5, A5

    notes.forEach((freq, idx) => {
      const delay = idx * 0.05;
      const duration = 0.45;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      // Cinematic sweep filter
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(100, now + delay);
      filter.frequency.exponentialRampToValueAtTime(1200, now + delay + duration);

      gainNode.gain.setValueAtTime(0.035, now + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + duration);
    });
  } catch (err) {
    console.warn('[Audio] playLogin error:', err);
  }
}

export const playStartup = playLogin;

// playLogout() / playShutdown(): Power-down robotic sweep
export function playLogout() {
  try {
    console.log('[Audio] playLogout() triggered');
    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const duration = 0.6;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(50, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + duration);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (err) {
    console.warn('[Audio] playLogout error:', err);
  }
}

export const playShutdown = playLogout;

// playScrollTick(): Low-volume organic tick triggered during scroll steps (throttled)
let lastScrollTickTime = 0;
export function playScrollTick() {
  try {
    const nowMs = Date.now();
    if (nowMs - lastScrollTickTime < 120) return;
    lastScrollTickTime = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    const { osc, gainNode } = createAudioNodeChain(ctx, 'triangle', 900, 80, 0.015, 0.012);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.015);
  } catch (err) {
    console.warn('[Audio] playScrollTick error:', err);
  }
}

// ==========================================
// 2. LOOPING ANIMATION SFX SYSTEM
// ==========================================

export function startLoopingSFX(type) {
  try {
    stopLoopingSFX(); // Clear any existing loop first

    const ctx = getAudioContext();
    if (!ctx) return;
    resumeAudioContext(ctx);

    console.log("🔊 Starting looping SFX: " + type);

    if (type === 'loading') {
      const playSonar = () => {
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now); // E4
          osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);

          gainNode.gain.setValueAtTime(0.015, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.2);

          // Track active oscillators
          activePulseOscillators.push(osc);
          osc.onended = () => {
            activePulseOscillators = activePulseOscillators.filter(o => o !== osc);
          };
        } catch (e) {
          // ignore
        }
      };

      playSonar();
      activePulseInterval = setInterval(playSonar, 1500);
    } else if (type === 'terminating' || type === 'logging-in') {
      const intervalMs = type === 'terminating' ? 300 : 400;
      const playAlarm = () => {
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'triangle';
          const freq = type === 'terminating' ? 880 : 587.33; // A5 vs D5
          osc.frequency.setValueAtTime(freq, now);

          gainNode.gain.setValueAtTime(0.02, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.15);

          // Track active oscillators
          activePulseOscillators.push(osc);
          osc.onended = () => {
            activePulseOscillators = activePulseOscillators.filter(o => o !== osc);
          };
        } catch (e) {
          // ignore
        }
      };

      playAlarm();
      activePulseInterval = setInterval(playAlarm, intervalMs);
    }
  } catch (err) {
    console.warn('[Audio] startLoopingSFX error:', err);
  }
}

export function stopLoopingSFX() {
  if (activePulseInterval) {
    clearInterval(activePulseInterval);
    activePulseInterval = null;
  }
  if (activePulseOscillators && activePulseOscillators.length > 0) {
    activePulseOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { }
      try { osc.disconnect(); } catch (e) { }
    });
    activePulseOscillators = [];
  }
  console.log("🔊 Looping SFX Stopped.");
}

// ==========================================
// 3. VOICE NARRATION (Web Speech API)
// ==========================================

export function speakText(text) {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel any ongoing speech to avoid overlaps
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onstart = () => {
        if (typeof window !== 'undefined') {
          window.welcomeSpoken = true;
        }
      };

      // If cached voice is empty, query for a natural female voice
      if (!cachedFemaleVoice) {
        const voices = window.speechSynthesis.getVoices();
        const femaleKeywords = ['zira', 'samantha', 'karen', 'hazel', 'susan', 'female', 'natural'];
        let voiceMatch = null;
        for (const key of femaleKeywords) {
          voiceMatch = voices.find(v =>
            v.lang.startsWith('en') &&
            v.name.toLowerCase().includes(key) &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('george') &&
            !v.name.toLowerCase().includes('mark')
          );
          if (voiceMatch) break;
        }
        if (!voiceMatch) {
          voiceMatch = voices.find(v =>
            v.lang.startsWith('en') &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('george') &&
            !v.name.toLowerCase().includes('mark')
          );
        }
        if (!voiceMatch) {
          voiceMatch = voices.find(v => v.lang.startsWith('en'));
        }
        if (voiceMatch) {
          cachedFemaleVoice = voiceMatch;
        }
      }

      if (cachedFemaleVoice) {
        utterance.voice = cachedFemaleVoice;
      }

      utterance.pitch = 1.16; // Perfectly tuned Spidey suit AI Karen pitch
      utterance.rate = 1.02;  // Responsive, clear cybernetic speed

      window.speechSynthesis.speak(utterance);
      console.log(`[Audio] speakText() triggered: "${text}"`);
    }
  } catch (err) {
    console.warn('[Audio] speakText error:', err);
  }
}

// Predefined Karen voice commands
export function speakWelcome(isEditor) {
  if (isEditor) {
    speakText("Welcome to the admin panel, Young spidey!");
  } else {
    speakText("Hi, I am Karen, your AI assistant. Welcome to Mageshwaran's portfolio grid.");
  }
}

export function speakChatOpen() {
  speakText("AI terminal activated. How can I assist you?");
}

export function speakChatClose() {
  speakText("AI terminal deactivated.");
}

export function speakTermination() {
  speakText("Warning: Terminating connection link now.");
}

export function speakError(message) {
  speakText("Alert: Access denied. " + message);
}

export function speakThankYou() {
  speakText("Thank you for visiting. Have a great day!");
}

export function speakGuestExit() {
  speakText("Redirecting to login page. Returning to login screen.");
}
