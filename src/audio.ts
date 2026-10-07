// Asynchronous Web Audio API Sound Manager for "Limpa o Montanha"
// High-performance audio architecture with cached buffers, asynchronous dispatch,
// master dynamics compression, polyphony limiting, and zero allocations inside game loops.

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;

  // Cached AudioBuffers (pre-rendered once to avoid GC churn & frame drops)
  private bufferCache: Map<string, AudioBuffer> = new Map();

  // Voice tracking & polyphony limiting
  private activeVoices: number = 0;
  private readonly MAX_CONCURRENT_VOICES = 12;

  // Rate-limiting timestamps for rapid effects
  private lastFartTime: number = 0;
  private lastWaterHitTime: number = 0;
  private lastSpeechTime: number = 0;
  private lastWhooshTime: number = 0;

  constructor() {
    // Check saved mute preference
    const saved = localStorage.getItem('limpa_montanha_muted');
    if (saved === 'true') {
      this.isMuted = true;
    }

    // Auto-unlock AudioContext on first user interaction in browser
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initCtx();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    }
  }

  // Initialize AudioContext, Master Limiter/Compressor, and Precomputed Buffers
  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Compressor to prevent distortion/clipping when multiple sounds fire simultaneously
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, this.ctx.currentTime);

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      // Pre-warm audio buffers asynchronously so game loop frames are 100% allocation-free
      this.precomputeBuffers();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Pre-generate reusable noise and texture buffers
  private precomputeBuffers() {
    if (!this.ctx) return;
    try {
      const sampleRate = this.ctx.sampleRate;

      // 1. White / Ambient noise buffer (1.0 sec)
      const noiseSamples = Math.floor(sampleRate * 1.0);
      const noiseBuffer = this.ctx.createBuffer(1, noiseSamples, sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseSamples; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.5;
      }
      this.bufferCache.set('white_noise', noiseBuffer);

      // 2. High-Pressure Water Jet / Spray buffer (0.5 sec)
      const spraySamples = Math.floor(sampleRate * 0.5);
      const sprayBuffer = this.ctx.createBuffer(1, spraySamples, sampleRate);
      const sprayData = sprayBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < spraySamples; i++) {
        const white = Math.random() * 2 - 1;
        // Mild pink filtering for smoother water jet sound
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        sprayData[i] = (b0 + b1 + b2 + white * 0.5362) * 0.18;
      }
      this.bufferCache.set('spray_noise', sprayBuffer);

      // 3. Water Splash Impact buffer (0.4 sec)
      const splashSamples = Math.floor(sampleRate * 0.4);
      const splashBuffer = this.ctx.createBuffer(1, splashSamples, sampleRate);
      const splashData = splashBuffer.getChannelData(0);
      for (let i = 0; i < splashSamples; i++) {
        const t = i / splashSamples;
        // Exponential decay envelope baked into splash noise
        splashData[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.6;
      }
      this.bufferCache.set('splash_noise', splashBuffer);

      // 4. Comic Fart Sputter / Flutter buffer (0.45 sec)
      const fartSamples = Math.floor(sampleRate * 0.45);
      const fartBuffer = this.ctx.createBuffer(1, fartSamples, sampleRate);
      const fartData = fartBuffer.getChannelData(0);
      for (let i = 0; i < fartSamples; i++) {
        const t = i / sampleRate;
        // Modulated fluttering sputter texture
        const flutter = 0.5 + 0.5 * Math.sin(2 * Math.PI * 34 * t);
        fartData[i] = (Math.random() * 2 - 1) * flutter * 0.55;
      }
      this.bufferCache.set('fart_sputter', fartBuffer);
    } catch {
      // Fallback silently if buffer creation fails
    }
  }

  private getCachedBuffer(key: string): AudioBuffer | null {
    return this.bufferCache.get(key) || null;
  }

  // Non-blocking async execution using microtask queue:
  // Decouples sound generation completely from the caller's frame (rAF / React tick)
  private runAsync(fn: (ctx: AudioContext, destination: GainNode) => void) {
    if (this.isMuted) return;

    queueMicrotask(() => {
      try {
        this.initCtx();
        if (!this.ctx || !this.masterGain || this.ctx.state === 'suspended') return;
        if (this.activeVoices >= this.MAX_CONCURRENT_VOICES) {
          return; // Polyphony limit reached: discard low-priority effect to prevent stutter
        }
        fn(this.ctx, this.masterGain);
      } catch {
        // Safe silent swallow
      }
    });
  }

  // Track active voice count with automatic cleanup
  private trackVoice(node: AudioScheduledSourceNode) {
    this.activeVoices++;
    node.onended = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
      node.disconnect();
    };
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('limpa_montanha_muted', String(this.isMuted));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ==========================================
  // 1. CARTOON FART SOUND ("SOM DO PUM")
  // Web Audio async synthesis with resonant flutter & pitch drop
  // Zero lag, no frame freezes!
  // ==========================================
  public playFart(intensity = 1.0) {
    const nowMs = performance.now();
    if (nowMs - this.lastFartTime < 100) return; // Rate-limit rapid triggers
    this.lastFartTime = nowMs;

    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const duration = 0.28 * Math.max(0.6, intensity);

      // 1. Low raspy oscillator with comic pitch dive
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      
      const startPitch = 125 + Math.random() * 25;
      const endPitch = 48 + Math.random() * 12;
      osc.frequency.setValueAtTime(startPitch, now);
      osc.frequency.exponentialRampToValueAtTime(endPitch, now + duration);

      oscGain.gain.setValueAtTime(0.24 * intensity, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Low-pass filter to give it a comic chubby acoustic warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(140, now + duration);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(dest);

      osc.start(now);
      osc.stop(now + duration);
      this.trackVoice(osc);

      // 2. Comical Sputter Noise Layer from precomputed buffer
      const sputterBuffer = this.getCachedBuffer('fart_sputter');
      if (sputterBuffer) {
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = sputterBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(160, now);
        noiseFilter.Q.setValueAtTime(3.2, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.20 * intensity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(dest);

        noiseSource.start(now);
        noiseSource.stop(now + duration);
        this.trackVoice(noiseSource);
      }
    });
  }

  public playOfficialFart() {
    this.playFart(1.15);
  }

  public playLoudThunderFart() {
    this.playFart(1.35);
    this.playWhooshDodge();
  }

  // ==========================================
  // 2. WATER JETS & SPLASHES ("JATOS DE ÁGUA")
  // High-pressure streams, hose surprises & wet impacts
  // ==========================================
  public playWaterHit() {
    const nowMs = performance.now();
    if (nowMs - this.lastWaterHitTime < 75) return; // Debounce rapid continuous hits
    this.lastWaterHitTime = nowMs;

    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const duration = 0.16;

      // Layer A: Pre-rendered splash noise impact
      const splashBuffer = this.getCachedBuffer('splash_noise');
      if (splashBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = splashBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + duration);
        filter.Q.setValueAtTime(1.8, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(now);
        noise.stop(now + duration);
        this.trackVoice(noise);
      }

      // Layer B: Wet low-end droplet thud
      const drop = ctx.createOscillator();
      const dropGain = ctx.createGain();
      drop.type = 'sine';
      drop.frequency.setValueAtTime(380, now);
      drop.frequency.exponentialRampToValueAtTime(95, now + duration);

      dropGain.gain.setValueAtTime(0.28, now);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      drop.connect(dropGain);
      dropGain.connect(dest);

      drop.start(now);
      drop.stop(now + duration);
      this.trackVoice(drop);
    });
  }

  // Surprise Garden Hose / High-Pressure Water Jet whoosh
  public playSurpriseHose() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const duration = 0.32;

      // High-pressure water spray rush from cached buffer
      const sprayBuffer = this.getCachedBuffer('spray_noise');
      if (sprayBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = sprayBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(2600, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(1100, now + duration);
        filter.Q.setValueAtTime(2.2, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(now);
        noise.stop(now + duration);
        this.trackVoice(noise);
      }

      // High swoosh resonance
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);

      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(dest);

      osc.start(now);
      osc.stop(now + duration);
      this.trackVoice(osc);
    });
  }

  // Gentle water splash / droplet
  public playWaterSplash() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const f = 640 + Math.random() * 260;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f - 240, now + 0.08);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);
      this.trackVoice(osc);
    });
  }

  // ==========================================
  // 3. MONTANHA VOICE & CHATTER ("FALAS DO MONTANHA")
  // Expressive cartoon formant vocalization
  // ==========================================
  public playMontanhaSpeech(phrase?: string) {
    const nowMs = performance.now();
    if (nowMs - this.lastSpeechTime < 340) return; // Debounce so vocal chatter does not overlap
    this.lastSpeechTime = nowMs;

    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      // Syllable count: 2 to 3 quick cartoon blips based on phrase
      const syllables = phrase && phrase.length > 20 ? 3 : 2;
      const isExclamation = phrase?.includes('!') || phrase?.includes('🚨');
      const isQuestion = phrase?.includes('?');

      const baseFrequencies = [145, 175, 130];
      const formantFilters = [
        { f1: 420, f2: 1250 }, // 'oh' / 'bo' vowel
        { f1: 520, f2: 1550 }, // 'ah' vowel
        { f1: 320, f2: 2100 }, // 'ee' / 'eh' vowel
      ];

      for (let i = 0; i < syllables; i++) {
        const syllableStart = now + i * 0.09;
        const syllableDuration = 0.08;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        let pitch = baseFrequencies[i % baseFrequencies.length] + (Math.random() * 20 - 10);
        if (isExclamation) pitch *= 1.25;
        if (isQuestion && i === syllables - 1) pitch *= 1.35; // Rising intonation

        osc.frequency.setValueAtTime(pitch, syllableStart);
        osc.frequency.exponentialRampToValueAtTime(
          isQuestion && i === syllables - 1 ? pitch * 1.3 : pitch * 0.85,
          syllableStart + syllableDuration
        );

        // Formant filter for vocal character
        const formant = formantFilters[i % formantFilters.length];
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(formant.f1, syllableStart);
        filter.Q.setValueAtTime(4.0, syllableStart);

        gain.gain.setValueAtTime(0.20, syllableStart);
        gain.gain.exponentialRampToValueAtTime(0.001, syllableStart + syllableDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(syllableStart);
        osc.stop(syllableStart + syllableDuration);
        this.trackVoice(osc);
      }
    });
  }

  // ==========================================
  // 4. GAMEPLAY ACTIONS (JUMP, TURBO, SLIDE, ETC.)
  // All optimized with zero memory allocation inside loops
  // ==========================================
  public playJump() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.17);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.19);
      this.trackVoice(osc);
    });
  }

  public playDuckSlide() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.16);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.18);
      this.trackVoice(osc);
    });
  }

  public playTurboBoost() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const duration = 0.42;

      // 1. Cached rocket thrust noise (Zero allocation!)
      const sprayBuffer = this.getCachedBuffer('spray_noise');
      if (sprayBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = sprayBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.35);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.28, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(dest);

        noise.start(now);
        noise.stop(now + duration);
        this.trackVoice(noise);
      }

      // 2. Comic ascending rocket fanfare tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + duration);
      this.trackVoice(osc);
    });
  }

  public playWhooshDodge() {
    const nowMs = performance.now();
    if (nowMs - this.lastWhooshTime < 60) return;
    this.lastWhooshTime = nowMs;

    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);

      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.13);
      this.trackVoice(osc);
    });
  }

  public playMudSquish() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.19);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.2);
      this.trackVoice(osc);
    });
  }

  public playCollectItem() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.2);
      this.trackVoice(osc);
    });
  }

  public playTrip() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.24);
      this.trackVoice(osc);
    });
  }

  // ==========================================
  // 5. PHASE 1 BATHROOM EFFECTS
  // ==========================================
  public playBubblePop() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startFreq = 300 + Math.random() * 250;
      const endFreq = startFreq + 280;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.09);
      this.trackVoice(osc);
    });
  }

  public playScrub() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + Math.random() * 60, now);
      osc.frequency.linearRampToValueAtTime(260 + Math.random() * 80, now + 0.06);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.08);
      this.trackVoice(osc);
    });
  }

  public playSpray() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const sprayBuffer = this.getCachedBuffer('spray_noise');
      if (sprayBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = sprayBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(now);
        noise.stop(now + 0.14);
        this.trackVoice(noise);
      }
    });
  }

  public playTowel() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.07);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.09);
      this.trackVoice(osc);
    });
  }

  public playSparkle() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1850, now + 0.16);

      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.35);
      this.trackVoice(osc);
    });
  }

  public playGiggle() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const notes = [440, 554, 659];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.13, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.1);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.1);
        this.trackVoice(osc);
      });
    });
  }

  // ==========================================
  // 6. UI & TRANSITION JINGLES
  // ==========================================
  public playClick() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.05);
      this.trackVoice(osc);
    });
  }

  public playStageComplete() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.16, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
        this.trackVoice(osc);
      });
    });
  }

  public playVictory() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.14 },
        { f: 783.99, d: 0.14, t: 0.28 },
        { f: 1046.50, d: 0.45, t: 0.44 },
      ];

      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.26, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
        this.trackVoice(osc);
      });
    });
  }

  public playGameOver() {
    this.runAsync((ctx, dest) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.45);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.45);
      this.trackVoice(osc);
    });
  }
}

export const sounds = new SoundManager();
