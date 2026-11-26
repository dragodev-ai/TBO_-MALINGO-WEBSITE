/* ==========================================================================
   MALINGO x THE BRAND OUTREACH - 3D INTERACTIVE SCRIPT (Three.js & Antigravity Motion)
   ========================================================================== */

// Early check for saved light/dark theme preference
(function() {
  try {
    if (localStorage.getItem('malingo_theme') === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  } catch (e) {}
})();

// --- Global Audio Synthesizer (Zero external dependency) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playPop(freq = 520, duration = 0.08) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  }

  playChime() {
    if (!this.enabled || !this.ctx) return;
    try {
      const freqs = [587.33, 880, 1174.66];
      freqs.forEach((f, i) => {
        setTimeout(() => this.playPop(f, 0.15), i * 60);
      });
    } catch (e) {}
  }

  // Realistic tactile micro-switch sound (independent of global ambient mute)
  playSwitchClick(isLight = false) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const t = this.ctx.currentTime;

      // 1. Mechanical friction & contact snap (20ms transient noise impulse)
      const sampleRate = this.ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 0.02);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isLight ? 2900 : 2200, t);
      filter.Q.setValueAtTime(3.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.02);

      // 2. Damped tactile switch clack / acoustic housing seating (26ms)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = isLight ? 540 : 420;
      const endFreq = isLight ? 220 : 160;

      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.024);

      oscGain.gain.setValueAtTime(0.07, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.026);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.028);
    } catch (e) {
      // AudioContext unavailable or restricted
    }
  }
}

const sound = new SoundEngine();

// --- Magnetic Custom Cursor ---
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover detection on interactables
  const interactables = document.querySelectorAll('a, button, .social-3d-cube, .staff-card, .service-card, .work-card, .stat-chip');
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      sound.playPop(640, 0.04);
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
    el.addEventListener('click', () => {
      sound.playPop(880, 0.1);
    });
  });
}

// --- 3D WebGL Background Scene using Three.js ---
function initThreeScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const orangeLight = new THREE.PointLight(0xF37321, 3.5, 80);
  orangeLight.position.set(-15, 12, 10);
  scene.add(orangeLight);

  const goldLight = new THREE.PointLight(0xF5A623, 2.5, 80);
  goldLight.position.set(15, -10, 10);
  scene.add(goldLight);

  // 1. Constellation Starfield Particles
  const particleCount = 650;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const c1 = new THREE.Color(0xF37321); // Malingo Orange
  const c2 = new THREE.Color(0xF5A623); // TBO Gold
  const c3 = new THREE.Color(0x3B82F6); // Digital Blue

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

    const rCol = Math.random();
    const col = rCol < 0.45 ? c1 : rCol < 0.75 ? c2 : c3;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(geometry, particleMat);
  scene.add(particleMesh);

  // Enhanced Lights for 3D Social Elements Specular Sheen
  const purpleLight = new THREE.PointLight(0x8B5CF6, 2.5, 90);
  purpleLight.position.set(0, 18, 12);
  scene.add(purpleLight);

  const cyanLight = new THREE.PointLight(0x00BAF2, 2.5, 90);
  cyanLight.position.set(-8, -16, 14);
  scene.add(cyanLight);

  // Helper for drawing rounded rectangles on Canvas
  function drawRoundRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  // ==========================================================================
  // AUTHENTIC OFFICIAL BRAND LOGOS (DOWNLOADED SIMPLE ICONS VECTOR PATHS)
  // ==========================================================================
  const OFFICIAL_LOGOS = {
    instagram: {
      name: "Instagram",
      brandColor: "#E1306C",
      emissiveHex: 0xE1306C,
      sideHex: 0x962FBF,
      url: "https://www.instagram.com/malingomedia",
      stats: "@malingomedia • 500M+ Organic Views",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 512, 512, 0);
        grad.addColorStop(0, '#feda75');
        grad.addColorStop(0.2, '#fa7e1e');
        grad.addColorStop(0.45, '#d62976');
        grad.addColorStop(0.75, '#962fbf');
        grad.addColorStop(1, '#4f5bd5');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        const gloss = ctx.createRadialGradient(120, 120, 10, 120, 120, 260);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gloss;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(13.5, 13.5);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"));
        ctx.restore();
      }
    },
    youtube: {
      name: "YouTube",
      brandColor: "#FF0000",
      emissiveHex: 0xFF0000,
      sideHex: 0xB30000,
      url: "https://www.youtube.com/@malingomedia",
      stats: "Cinematic Shorts & Viral Ad Production",
      w: 3.2, h: 2.25, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#FF1E1E');
        grad.addColorStop(1, '#D00000');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 70, 464, 372, 110);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(15, 15);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"));
        ctx.restore();
      }
    },
    twitter: {
      name: "X (Twitter)",
      brandColor: "#FFFFFF",
      emissiveHex: 0xE2E8F0,
      sideHex: 0x1E293B,
      url: "https://x.com/malingomedia",
      stats: "Viral News & Mainstream PR Clout",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#1c1c22');
        grad.addColorStop(1, '#08080a');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 6;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.stroke();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(14, 14);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"));
        ctx.restore();
      }
    },
    whatsapp: {
      name: "WhatsApp",
      brandColor: "#25D366",
      emissiveHex: 0x25D366,
      sideHex: 0x1B9A4A,
      url: "https://wa.me/message/EWQ6YJE2UQUHA1",
      stats: "+91 78383 02650 • VIP Instant Hotline",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#2ee372');
        grad.addColorStop(1, '#1ebd5a');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(14, 14);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"));
        ctx.restore();
      }
    },
    facebook: {
      name: "Facebook",
      brandColor: "#1877F2",
      emissiveHex: 0x1877F2,
      sideHex: 0x0D5EC4,
      url: "https://www.facebook.com/malingomedia",
      stats: "Paid Social Ad Funnels & 4.8x ROAS",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#2382f7');
        grad.addColorStop(1, '#0e6ee6');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(14, 14);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"));
        ctx.restore();
      }
    },
    linkedin: {
      name: "LinkedIn",
      brandColor: "#0A66C2",
      emissiveHex: 0x0A66C2,
      sideHex: 0x074D91,
      url: "https://www.linkedin.com/company/malingo-media-group/",
      stats: "B2B Authority & Enterprise Deals",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#1075dd');
        grad.addColorStop(1, '#085bb1');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(14, 14);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"));
        ctx.restore();
      }
    },
    tiktok: {
      name: "TikTok",
      brandColor: "#00F2FE",
      emissiveHex: 0x00F2FE,
      sideHex: 0xFE0979,
      url: "https://www.tiktok.com/@malingomedia",
      stats: "Hyper-Viral Short-Form Retention",
      w: 2.7, h: 2.7, d: 0.45,
      draw: (ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        drawRoundRect(ctx, 24, 24, 464, 464, 115);
        ctx.fill();

        ctx.save();
        ctx.translate(256, 256);
        ctx.scale(14, 14);
        ctx.translate(-12, -12);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill(new Path2D("M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"));
        ctx.restore();
      }
    }
  };

  function createOfficialSocialTexture(platform) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cfg = OFFICIAL_LOGOS[platform] || OFFICIAL_LOGOS['instagram'];

    cfg.draw(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }

  // Audio synthesizer for interactive 3D pops
  let audioCtx = null;
  function playBrandPopSound(freq = 640) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (err) {}
  }

  // 3D Particles burst system for click effects
  const sparkParticles = [];

  function spawnBrandSparks(pos, hexColor) {
    const sparkCount = 35;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkCount * 3);
    const velocities = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 0.25 + Math.random() * 0.45;

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: hexColor,
      size: 0.45,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geom, mat);
    scene.add(pSystem);

    sparkParticles.push({
      pSystem,
      velocities,
      life: 1.0,
      decay: 0.024
    });
  }

  // Floating Interactive HUD Toast when clicking 3D Social Media Icons
  function showSocialToast(data) {
    let toast = document.getElementById('social-3d-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'social-3d-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(40px);
        background: rgba(14, 20, 32, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.25);
        padding: 14px 24px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 16px;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        z-index: 9999;
        opacity: 0;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: var(--font-body);
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div style="width: 14px; height: 14px; border-radius: 50%; background: ${data.brandColor}; box-shadow: 0 0 14px ${data.brandColor}; flex-shrink: 0;"></div>
      <div style="display: flex; flex-direction: column;">
        <strong style="color: #fff; font-size: 0.94rem; letter-spacing: -0.01em;">${data.name}</strong>
        <span style="color: var(--text-muted); font-size: 0.78rem; font-family: var(--font-mono);">${data.stats}</span>
      </div>
      <a href="${data.url}" target="_blank" style="margin-left: 8px; background: ${data.brandColor}; color: #fff; padding: 7px 16px; border-radius: 999px; text-decoration: none; font-size: 0.82rem; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
        Open Channel ↗
      </a>
    `;

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0px)';

    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(40px)';
    }, 4500);
  }

  // Authentic 3D Social Media Plaque Generator
  function create3DSocialIcon(platform) {
    const group = new THREE.Group();
    const cfg = OFFICIAL_LOGOS[platform] || OFFICIAL_LOGOS['instagram'];
    const texture = createOfficialSocialTexture(platform);

    const w = cfg.w;
    const h = cfg.h;
    const d = cfg.d;

    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.3,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.18,
      metalness: 0.3,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: cfg.sideHex,
      roughness: 0.22,
      metalness: 0.85
    });

    const materials = [
      sideMat,  // right
      sideMat,  // left
      sideMat,  // top
      sideMat,  // bottom
      frontMat, // front
      backMat   // back
    ];

    const boxGeo = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
    const mainMesh = new THREE.Mesh(boxGeo, materials);
    group.add(mainMesh);

    group.userData = {
      platform,
      name: cfg.name,
      brandColor: cfg.brandColor,
      emissiveHex: cfg.emissiveHex,
      url: cfg.url,
      stats: cfg.stats,
      frontMat,
      backMat,
      sideMat,
      mainMesh,
      baseScale: 1.0,
      popScale: 1.0,
      spinVelocity: 0,
      isHovered: false
    };

    return group;
  }

  // 2. Interactive 3D Floating Social Media Handles Cluster
  const floatingObjects = [];
  const socialPlatforms = [
    'instagram', 'youtube', 'twitter', 'facebook', 'linkedin', 'whatsapp', 'tiktok',
    'instagram', 'youtube', 'twitter', 'facebook', 'linkedin', 'instagram', 'youtube', 'whatsapp'
  ];

  for (let i = 0; i < socialPlatforms.length; i++) {
    const icon3D = create3DSocialIcon(socialPlatforms[i]);
    
    // Position in 3D orbit around camera
    const angle = (i / socialPlatforms.length) * Math.PI * 2;
    const rad = 13 + (Math.random() * 14);
    
    icon3D.position.set(
      Math.cos(angle) * rad + (Math.random() - 0.5) * 6,
      Math.sin(angle) * (rad * 0.6) + (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 22
    );

    icon3D.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 0.5
    );

    const scale = 0.85 + Math.random() * 0.45;
    icon3D.scale.setScalar(scale);

    icon3D.userData.baseScale = scale;
    icon3D.userData.rotX = (Math.random() - 0.5) * 0.012;
    icon3D.userData.rotY = (Math.random() - 0.5) * 0.016;
    icon3D.userData.rotZ = (Math.random() - 0.5) * 0.008;
    icon3D.userData.baseY = icon3D.position.y;
    icon3D.userData.baseX = icon3D.position.x;
    icon3D.userData.speed = 0.7 + Math.random() * 0.8;
    icon3D.userData.phase = Math.random() * Math.PI * 2;

    scene.add(icon3D);
    floatingObjects.push(icon3D);
  }

  // Interactive Raycaster for Hover & Click Reactions
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2(-999, -999);
  let targetMouseX = 0;
  let targetMouseY = 0;
  let curMouseX = 0;
  let curMouseY = 0;
  let hoveredIcon = null;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Click on 3D Social Media Icon triggers Explosive Brand Color Pop & Particle Sparks
  window.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, select, textarea, .staff-card, .modal-card, .btn-corner, .btn')) return;

    raycaster.setFromCamera(mouseNDC, camera);
    const intersects = raycaster.intersectObjects(floatingObjects, true);

    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root && !floatingObjects.includes(root)) {
        root = root.parent;
      }
      if (root) {
        // Pop animation
        root.userData.popScale = 2.1;
        root.userData.spinVelocity = 0.45;
        spawnBrandSparks(root.position, root.userData.emissiveHex);
        playBrandPopSound(720);
        showSocialToast(root.userData);
      }
    }
  });

  // Scroll Reactivity
  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    curMouseX += (targetMouseX - curMouseX) * 0.05;
    curMouseY += (targetMouseY - curMouseY) * 0.05;

    // Camera gently orbits cursor & scroll
    camera.position.x = curMouseX * 5;
    camera.position.y = -curMouseY * 4 - (scrollY * 0.008);
    camera.lookAt(0, -scrollY * 0.008, 0);

    // Rotate particles
    particleMesh.rotation.y = time * 0.03;
    particleMesh.rotation.x = time * 0.015;

    // Raycast hover detection
    raycaster.setFromCamera(mouseNDC, camera);
    const intersects = raycaster.intersectObjects(floatingObjects, true);

    let activeHit = null;
    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root && !floatingObjects.includes(root)) {
        root = root.parent;
      }
      activeHit = root;
    }

    if (activeHit) {
      document.body.style.cursor = 'pointer';
      if (hoveredIcon !== activeHit) {
        if (hoveredIcon) hoveredIcon.userData.isHovered = false;
        hoveredIcon = activeHit;
        activeHit.userData.isHovered = true;
        playBrandPopSound(950);
      }
    } else {
      if (hoveredIcon) {
        hoveredIcon.userData.isHovered = false;
        hoveredIcon = null;
        document.body.style.cursor = 'default';
      }
    }

    // Animate 3D floating Social Icons
    floatingObjects.forEach((obj) => {
      const u = obj.userData;

      // Hover scale target
      const currentBase = u.isHovered ? u.baseScale * 1.55 : u.baseScale;
      const targetS = currentBase * u.popScale;
      obj.scale.lerp(new THREE.Vector3(targetS, targetS, targetS), 0.12);

      // Decay click pop scale
      if (u.popScale > 1.0) {
        u.popScale += (1.0 - u.popScale) * 0.09;
      }

      // Emissive hover glow in icon's own authentic brand color
      const targetEmissive = u.isHovered ? 0.65 : 0.0;
      if (u.frontMat) {
        u.frontMat.emissive.setHex(u.emissiveHex);
        u.frontMat.emissiveIntensity += (targetEmissive - u.frontMat.emissiveIntensity) * 0.15;
      }
      if (u.backMat) {
        u.backMat.emissive.setHex(u.emissiveHex);
        u.backMat.emissiveIntensity += (targetEmissive - u.backMat.emissiveIntensity) * 0.15;
      }

      // Spin burst on click
      if (u.spinVelocity > 0.001) {
        obj.rotation.y += u.spinVelocity;
        obj.rotation.x += u.spinVelocity * 0.5;
        u.spinVelocity *= 0.94;
      }

      // Continuous float & rotation
      obj.rotation.x += u.isHovered ? u.rotX * 2.5 : u.rotX;
      obj.rotation.y += u.isHovered ? u.rotY * 2.5 : u.rotY;
      if (u.rotZ) obj.rotation.z += u.rotZ;

      obj.position.y = u.baseY + Math.sin(time * u.speed + u.phase) * 1.8;
      obj.position.x = u.baseX + Math.cos(time * (u.speed * 0.7) + u.phase) * 0.8;
    });

    // Animate particle sparks burst
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const sp = sparkParticles[i];
      sp.life -= sp.decay;
      sp.pSystem.material.opacity = Math.max(0, sp.life);
      const posArr = sp.pSystem.geometry.attributes.position.array;

      for (let j = 0; j < sp.velocities.length; j++) {
        posArr[j * 3] += sp.velocities[j].x;
        posArr[j * 3 + 1] += sp.velocities[j].y;
        posArr[j * 3 + 2] += sp.velocities[j].z;
        sp.velocities[j].x *= 0.96;
        sp.velocities[j].y *= 0.96;
        sp.velocities[j].z *= 0.96;
      }
      sp.pSystem.geometry.attributes.position.needsUpdate = true;

      if (sp.life <= 0) {
        scene.remove(sp.pSystem);
        sp.pSystem.geometry.dispose();
        sp.pSystem.material.dispose();
        sparkParticles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --- 3D Gyroscopic Card Tilt Physics ---
function init3DTiltCards() {
  const cards = document.querySelectorAll('.tilt-3d');

  cards.forEach((card) => {
    let bounds;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.12s ease-out, box-shadow 0.2s';
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
      const maxDistance = Math.max(bounds.width, bounds.height) / 2;
      const intensity = 14;

      const rotateX = -(center.y / maxDistance) * intensity;
      const rotateY = (center.x / maxDistance) * intensity;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX.toFixed(2)}deg)
        rotateY(${rotateY.toFixed(2)}deg)
        translateZ(12px)
      `;
    }

    function onMouseLeave() {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

// --- Live Animated Counter on Scroll ---
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.counter-val');
  let animated = false;

  function runCounters() {
    if (animated) return;
    const triggerSection = document.querySelector('.hero-stats-ribbon');
    if (!triggerSection) return;

    const rect = triggerSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.9) {
      animated = true;
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const duration = 1800;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = start + (target - start) * easeOut;

          counter.innerText = isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            counter.innerText = target;
          }
        }
        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener('scroll', runCounters);
  runCounters(); // Check on init
}

// --- Staff Data & Modal Dossier ---
const STAFF_DOSSIER = {
  kushagra: {
    name: "Kushagra",
    title: "Founder & Managing Director, Malingo",
    experience: "8–10 Years Industry Authority",
    badge: "Malingo Founder",
    brand: "tag-malingo",
    image: "./STAFF/kushagra.png",
    superpower: "Data-Driven Algorithm Hacking & Viral Conversion Architect",
    bio: "Kushagra founded Malingo with a singular, revolutionary vision: stripping away agency fluff and replacing intuition with raw data science, high-velocity creative testing, and algorithmic scaling. Over the past decade, he has orchestrated viral campaigns generating over 500M+ organic impressions, scaling startups from seed stage to multimillion-dollar monthly run rates. His proprietary 'Malingo Magic' framework fuses real-time trend analytics with high-converting paid media architectures.",
    achievements: [
      "Scaled 150+ international D2C and enterprise brands across Meta, Google & TikTok.",
      "Engineered proprietary predictive trend models yielding average 4.8x ROAS.",
      "Pioneered automated viral short-form retention architectures."
    ],
    skills: ["Growth Hacking", "Predictive Analytics", "Performance Paid Media", "Creative Strategy"]
  },
  shekha: {
    name: "Shikha Ma'am",
    title: "Co-Founder & Owner, The Brand Outreach",
    experience: "25+ Years Legacy in National Media & Marketing",
    badge: "The Brand Outreach Owner",
    brand: "tag-tbo",
    image: "./STAFF/shekha mam.png",
    superpower: "Mainstream Media Dominance & Strategic Brand Reputation",
    bio: "With over a quarter-century of top-tier leadership in premier national news agencies and international marketing firms, Shikha Ma'am is an undisputed powerhouse in reputation management, mainstream media placement, and institutional brand positioning. She possesses direct, executive-level relationships across leading television networks, print syndicates, and digital publications, giving client partners unprecedented organic credibility that money alone cannot buy.",
    achievements: [
      "25+ years spearheading Tier-1 PR campaigns and national news agency operations.",
      "Secured front-page editorial coverage for top conglomerates, ministers, and unicorns.",
      "Masterminded national brand perception turnarounds and high-stakes crisis communications."
    ],
    skills: ["Tier-1 Media Relations", "Corporate PR", "Brand Elevation", "Crisis Management"]
  },
  amit: {
    name: "Amit Sir",
    title: "Co-Founder & Owner, The Brand Outreach",
    experience: "25+ Years Senior Media & Corporate Marketing Authority",
    badge: "The Brand Outreach Owner",
    brand: "tag-tbo",
    image: "./STAFF/amit sir.png",
    superpower: "Strategic Enterprise Outreach & High-Stakes Institutional Clout",
    bio: "Amit Sir brings 25 years of distinguished leadership across the news agency ecosystem and corporate marketing realms. His expertise bridges institutional trust and aggressive enterprise market expansion. Having directed national communication initiatives, he ensures that every campaign engineered under The Brand Outreach possesses the gravitas, legal polish, and cultural resonance needed to win corporate contracts and dominate market share.",
    achievements: [
      "Quarter-century veteran in national news agency editorial and commercial direction.",
      "Orchestrated multi-million dollar corporate outreach deals and public affairs campaigns.",
      "Established strategic media conduits spanning India, UAE, and North America."
    ],
    skills: ["Enterprise Outreach", "Public Affairs", "Strategic Governance", "Commercial Dealmaking"]
  },
  madhur: {
    name: "Madhur",
    title: "Director of Enterprise Sales & Strategic Partnerships",
    experience: "20+ Years Corporate Sales Leadership",
    badge: "Enterprise Sales Leader",
    brand: "tag-tbo",
    image: "./STAFF/madhur sir.png",
    superpower: "High-Ticket Client Acquisition & Levanto Green Alliance Lead",
    bio: "A battle-tested sales director with over 20 years of relentless deal closing and pipeline architecture. Madhur manages high-level enterprise client accounts, currently actively driving strategic sales with Levanto Green and top-tier industrial entities. His consultative approach translates complex marketing deliverables into irresistible enterprise value propositions, consistently securing multi-year retainer contracts and 8-figure pipeline growth.",
    achievements: [
      "Over 20 years closing enterprise sales cycles across green-tech, marketing, and FMCG.",
      "Leads prestigious sales initiatives with Levanto Green and international conglomerates.",
      "Engineered automated high-ticket outbound frameworks achieving 42% close rates."
    ],
    skills: ["Enterprise Sales", "Levanto Green Accounts", "Pipeline Architecture", "High-Ticket Negotiation"]
  },
  aryaman: {
    name: "Aryaman",
    title: "Head of Operations & Strategic Client Concierge (POC)",
    experience: "Core Operations & Client Success Anchor",
    badge: "Operations Anchor",
    brand: "tag-malingo",
    image: "./STAFF/aryaman.png",
    superpower: "24/7 Flawless Client Handling & Multi-Disciplinary Orchestration",
    bio: "Aryaman is the operational heartbeat of the Malingo x TBO alliance. Serving as the primary point of contact (POC) for enterprise partners, he eliminates bureaucratic delays through seamless communication, real-time client resolution, and strategic sprint management. Under his stewardship, cross-departmental handoffs between video editors, copywriters, and media buyers operate with military precision.",
    achievements: [
      "Maintains a 99.4% client satisfaction index across 60+ simultaneous active retainers.",
      "Zero-friction client liaison ensuring sub-15-minute response times for VIP partners.",
      "Architect of the agency's end-to-end agile operational delivery pipeline."
    ],
    skills: ["Executive Client Handling", "Operations Sprints", "VIP Concierge", "Strategic Alignment"]
  },
  mayank: {
    name: "Mayank",
    title: "Senior Sales & Strategic Growth Specialist",
    experience: "10+ Years Strategic Acquisition & Funnel Economics",
    badge: "Growth Strategist",
    brand: "tag-malingo",
    image: "./STAFF/mayank.png",
    superpower: "Full-Funnel Sales Engineering & Cross-Market Client Expansion",
    bio: "Mayank is the master strategist behind client growth trajectories. Combining 10 years of sales psychology with sharp commercial acumen, he deconstructs client business models and tailors custom growth roadmaps that guarantee high ROI before contracts are signed. His strategic sales frameworks have unlocked new revenue verticals across international markets.",
    achievements: [
      "Directly sourced and closed 80+ high-growth brand accounts across 7 countries.",
      "Co-developed the Malingo client onboarding audit that pinpoints revenue leakage in 48 hours.",
      "Specialist in recurring revenue growth and retention scaling."
    ],
    skills: ["Strategic Sales", "Revenue Modeling", "Client Roadmapping", "Commercial Strategy"]
  },
  dev: {
    name: "Dev",
    title: "Lead Video Editor & Viral Motion Artist",
    experience: "8 Years High-Octane Post-Production",
    badge: "Video Editing Virtuoso",
    brand: "tag-malingo",
    image: "./STAFF/dev.png",
    superpower: "Sub-Second Hook Mastery, 3D Dynamic Cuts & Retention Optimization",
    bio: "Dev possesses an exceptional 8-year track record editing high-velocity video content that stops thumbs in their tracks. Specializing in psychological retention hacking, sound design dynamics, and 3D visual FX, his edits have propelled reels, TikToks, and YouTube shorts to millions of views organically. He turns raw client footage into polished cinematic masterpieces.",
    achievements: [
      "Edited 1,200+ viral reels and ads generating over 350M+ accumulated views.",
      "Average 3-second hook retention of 78% on paid Meta and TikTok video ads.",
      "Pioneer in kinetic typography, 3D tracking, and high-energy pacing."
    ],
    skills: ["DaVinci Resolve / Premiere", "After Effects 3D", "Pacing Psychology", "Sound Design"]
  },
  jeetu: {
    name: "Jeetu (Jitu)",
    title: "Creative Director & Lead Visual Designer",
    experience: "8+ Years Brand Identity & Visual Systems",
    badge: "Creative Director",
    brand: "tag-malingo",
    image: "./STAFF/jeetu.png",
    superpower: "Visual Hierarchy, 3D Brand Language & High-CTR Ad Creatives",
    bio: "Jeetu is the visual architect shaping the aesthetic identity of every brand in the agency roster. With more than 8 years of rigorous creative directorship, he balances sleek minimalism with high-impact emotional resonance. From viral static ad banners with record-breaking click-through rates (CTR) to comprehensive corporate identity overhauls, his work ensures unmatched market presence.",
    achievements: [
      "Crafted full brand identity systems for 40+ international tech and D2C startups.",
      "Designed static ad campaigns achieving CTRs up to 6.4% in competitive verticals.",
      "Master of 3D spatial composition, typography hierarchy, and conversion UI/UX."
    ],
    skills: ["Creative Direction", "3D Brand Assets", "High-CTR Ad Design", "Visual Psychology"]
  }
};

// --- Global Staff Modal Opener ---
window.openStaffModal = function(staffKey) {
  const modalOverlay = document.getElementById('staff-modal-overlay');
  const modalContent = document.getElementById('staff-modal-body');
  const data = STAFF_DOSSIER[staffKey];
  if (!data || !modalOverlay || !modalContent) return;

  if (sound && sound.playChime) sound.playChime();

  modalContent.innerHTML = `
    <div style="display: flex; gap: 28px; flex-wrap: wrap; align-items: flex-start;">
      <div style="width: 220px; height: 260px; border-radius: 18px; overflow: hidden; border: 2px solid var(--malingo-orange); flex-shrink: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
        <img src="${data.image}" alt="${data.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="flex: 1; min-width: 260px;">
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
          <span class="staff-brand-tag ${data.brand}" style="position: static;">${data.badge}</span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--tbo-gold); font-weight: 700;">★ ${data.experience}</span>
        </div>
        <h2 style="font-size: 2.2rem; color: #fff; margin-bottom: 4px;">${data.name}</h2>
        <p style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--malingo-orange-light); margin-bottom: 14px; font-weight: 600;">${data.title}</p>
        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid var(--tbo-gold); padding: 8px 14px; border-radius: 6px; margin-bottom: 16px;">
          <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; display: block;">Core Superpower:</span>
          <strong style="color: #fff; font-size: 0.92rem;">${data.superpower}</strong>
        </div>
      </div>
    </div>

    <div style="margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
      <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 10px;">Executive Profile & Impact</h4>
      <p style="color: var(--text-body); font-size: 0.96rem; line-height: 1.7; margin-bottom: 20px;">${data.bio}</p>

      <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 12px;">Key Career Milestones & Accomplishments</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
        ${data.achievements.map(a => `
          <li style="display: flex; gap: 10px; color: var(--text-heading); font-size: 0.92rem;">
            <span style="color: var(--malingo-orange);">✓</span> ${a}
          </li>
        `).join('')}
      </ul>

      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;">
        ${data.skills.map(s => `
          <span style="padding: 6px 14px; background: rgba(243,115,33,0.12); border: 1px solid rgba(243,115,33,0.3); border-radius: 99px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--malingo-orange-light);">${s}</span>
        `).join('')}
      </div>

      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="https://wa.me/message/EWQ6YJE2UQUHA1" target="_blank" class="btn-cta" style="flex: 1; text-align: center;">
          <span>Schedule Direct Strategy Call With ${data.name.split(' ')[0]}</span>
        </a>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function initStaffModal() {
  const modalOverlay = document.getElementById('staff-modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  if (!modalOverlay) return;

  document.querySelectorAll('.staff-card').forEach((card) => {
    card.addEventListener('click', () => {
      const staffKey = card.getAttribute('data-staff');
      if (staffKey) window.openStaffModal(staffKey);
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// --- 3D Staff Works-Wheel Animation Physics (Cylindrical Drum & Ring) ---
function initStaffWorksWheel() {
  const stageEl = document.getElementById('staff-wheel-stage');
  const pivotEl = document.getElementById('staff-wheel-pivot');
  const labelEl = document.getElementById('staff-wheel-label');
  const titleEl = document.getElementById('staff-wheel-title');
  const badgeEl = document.getElementById('staff-front-badge');
  const nameEl = document.getElementById('staff-front-name');
  const roleEl = document.getElementById('staff-front-role');
  const superpowerEl = document.getElementById('staff-front-superpower-text');
  const modalBtn = document.getElementById('staff-front-modal-btn');
  const indexEl = document.getElementById('staff-wheel-index');
  const btnViewWheel = document.getElementById('btn-view-wheel');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const wheelOuter = document.getElementById('staff-wheel-outer');
  const gridMain = document.getElementById('staff-grid-main');

  // Floating controls
  const btnPrev = document.getElementById('btn-wheel-prev');
  const btnNext = document.getElementById('btn-wheel-next');
  const btnAuto = document.getElementById('btn-wheel-auto');
  const btnRing = document.getElementById('btn-wheel-ring');
  const iconPlay = document.getElementById('icon-wheel-play');
  const labelAuto = document.getElementById('label-wheel-auto');

  if (!stageEl || !pivotEl) return;

  // View toggle handlers (3D Wheel vs Grid View)
  if (btnViewWheel && btnViewGrid && gridMain && wheelOuter) {
    btnViewWheel.addEventListener('click', () => {
      btnViewWheel.classList.add('active');
      btnViewGrid.classList.remove('active');
      wheelOuter.style.display = 'block';
      gridMain.style.display = 'none';
      if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(520, 0.06);
    });
    btnViewGrid.addEventListener('click', () => {
      btnViewGrid.classList.add('active');
      btnViewWheel.classList.remove('active');
      wheelOuter.style.display = 'none';
      gridMain.style.display = 'grid';
      if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(420, 0.06);
    });
    gridMain.style.display = 'none'; // Default to 3D Wheel view
  }

  // 8 Staff Items from STAFF_DOSSIER
  const titanKeys = ['kushagra', 'shekha', 'amit', 'madhur', 'aryaman', 'mayank', 'dev', 'jeetu'];
  const items = titanKeys.map(k => ({
    key: k,
    ...(STAFF_DOSSIER[k] || {})
  }));
  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Position and target values: default open to 1 (Titan 1: Kushagra) so the 3D drum is active immediately
  const turn = { current: 1 };
  const target = { current: 1 };
  let activeIdx = -1; // -1 forces initial DOM update on first frame
  let isAutoPlaying = false;
  let autoPlayTimer = null;

  function to(next) {
    target.current = clamp(next, 0, last + 1);
  }

  // Build card elements and index items
  pivotEl.innerHTML = '';
  if (indexEl) indexEl.innerHTML = '';
  const cardNodes = [];
  const indexBtns = [];

  let dragMoved = 0; // shared tracker for click vs drag suppression

  items.forEach((item, idx) => {
    // Card DOM element
    const card = document.createElement('div');
    card.className = 'staff-wheel-card';
    card.setAttribute('role', 'option');
    card.setAttribute('data-index', idx);
    card.setAttribute('data-staff', item.key);

    const inner = document.createElement('div');
    inner.className = 'staff-wheel-card-inner';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.draggable = false;

    const overlay = document.createElement('div');
    overlay.className = 'staff-wheel-card-overlay';
    overlay.innerHTML = `
      <span class="staff-wheel-card-role">${item.badge || ''}</span>
      <h4 class="staff-wheel-card-title">${item.name || ''}</h4>
      <div class="staff-wheel-card-action">
        <span>Inspect Dossier</span>
        <i class="fa-solid fa-arrow-right"></i>
      </div>
    `;

    inner.appendChild(img);
    inner.appendChild(overlay);
    card.appendChild(inner);

    // Click handler: if active card, open modal; otherwise turn to this card
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dragMoved > 8) return; // Suppress if user was dragging
      stopAutoTour();
      if (activeIdx === idx && turn.current >= 0.8) {
        if (typeof window.openStaffModal === 'function') {
          window.openStaffModal(item.key);
        }
      } else {
        to(idx + 1);
        if (typeof sound !== 'undefined' && sound && sound.playPop) {
          sound.playPop(580 + idx * 30, 0.05);
        }
      }
    });

    pivotEl.appendChild(card);
    cardNodes.push(card);

    // Right-hand Index button
    if (indexEl) {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `staff-wheel-index-btn ${idx === 0 ? 'active' : ''}`;
      btn.innerText = item.name;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopAutoTour();
        to(idx + 1);
        if (typeof sound !== 'undefined' && sound && sound.playPop) {
          sound.playPop(620, 0.05);
        }
      });
      li.appendChild(btn);
      indexEl.appendChild(li);
      indexBtns.push(btn);
    }
  });

  // Modal open button on front drawer
  if (modalBtn) {
    modalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentItem = items[activeIdx];
      if (currentItem && typeof window.openStaffModal === 'function') {
        window.openStaffModal(currentItem.key);
      }
    });
  }

  // Floating Control Buttons: Prev, Next, Auto-Tour, Ring Overview
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      const cur = Math.round(target.current);
      const prev = cur <= 1 ? last + 1 : cur - 1;
      to(prev);
      if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(500, 0.05);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      const cur = Math.round(target.current);
      const next = cur >= last + 1 ? 1 : cur + 1;
      to(next);
      if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(620, 0.05);
    });
  }

  if (btnRing) {
    btnRing.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      if (Math.round(target.current) === 0) {
        to(activeIdx >= 0 ? activeIdx + 1 : 1);
        btnRing.classList.remove('active');
        if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(580, 0.06);
      } else {
        to(0);
        btnRing.classList.add('active');
        if (typeof sound !== 'undefined' && sound && sound.playPop) sound.playPop(420, 0.08);
      }
    });
  }

  function startAutoTour() {
    isAutoPlaying = true;
    if (btnAuto) btnAuto.classList.add('active');
    if (iconPlay) iconPlay.className = 'fa-solid fa-pause';
    if (labelAuto) labelAuto.textContent = 'Pause Tour';
    if (target.current < 1) to(1);

    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      let next = Math.round(target.current) + 1;
      if (next > last + 1) next = 1;
      to(next);
      if (typeof sound !== 'undefined' && sound && sound.playPop) {
        sound.playPop(520 + next * 25, 0.04);
      }
    }, 3000);
  }

  function stopAutoTour() {
    if (!isAutoPlaying) return;
    isAutoPlaying = false;
    if (btnAuto) btnAuto.classList.remove('active');
    if (iconPlay) iconPlay.className = 'fa-solid fa-play';
    if (labelAuto) labelAuto.textContent = 'Auto-Tour';
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAutoPlaying) stopAutoTour();
      else startAutoTour();
    });
  }

  // Geometry constants matching works-wheel
  const CARD_H = 0.44;
  const CARD_MAX_W = 0.38;
  const CARD_RATIO = 1.35;
  const STEP = 42;
  const DRUM = 2.22;
  const LENS = 2.7;
  const RING_R = 1.15;
  const BOW = 1.82;
  const EASE = 0.12;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (deg) => (deg * Math.PI) / 180;
  const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

  function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
    return (
      `translateX(${m * bowAt(drumDeg, bow)}px)` +
      ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
      ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
    );
  }

  // Touch and Drag interaction with pointer capture and flick physics
  let isDragging = false;
  let dragStartY = 0;
  let dragLastY = 0;
  let dragVelocity = 0;
  let lastDragTime = 0;

  stageEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input')) return;
    isDragging = true;
    dragStartY = e.clientY;
    dragLastY = e.clientY;
    dragMoved = 0;
    dragVelocity = 0;
    lastDragTime = performance.now();
    try {
      stageEl.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  stageEl.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = Math.max(now - lastDragTime, 1);
    const instantDy = dragLastY - e.clientY;
    dragVelocity = instantDy / dt;
    dragLastY = e.clientY;
    lastDragTime = now;
    dragMoved += Math.abs(instantDy);

    if (dragMoved > 5) {
      stopAutoTour();
      to(target.current + instantDy / 240);
    }
  });

  const onPointerEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      stageEl.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (dragMoved > 8) {
      // Determined flick or drag: snap to nearest card with velocity boost
      let snap = target.current;
      if (Math.abs(dragVelocity) > 0.35) {
        snap += Math.sign(dragVelocity) * 0.6;
      }
      let finalTarget = Math.round(snap);
      if (finalTarget < 1) finalTarget = (target.current < 0.5) ? 0 : 1;
      if (finalTarget > last + 1) finalTarget = last + 1;
      to(finalTarget);
      if (typeof sound !== 'undefined' && sound && sound.playPop) {
        sound.playPop(580 + finalTarget * 20, 0.04);
      }
    }
  };

  stageEl.addEventListener('pointerup', onPointerEnd);
  stageEl.addEventListener('pointercancel', onPointerEnd);

  // Wheel interaction: handles discrete mouse wheel notches AND trackpad smooth scrolling
  let lastWheelTime = 0;
  let settleTimeout = null;
  stageEl.addEventListener('wheel', (e) => {
    stopAutoTour();
    const now = performance.now();
    const isTrackpad = Math.abs(e.deltaY) < 30 && Math.abs(e.deltaY) % 1 !== 0;

    // Prevent background page from scrolling while wheeling over the active stage
    if ((e.deltaY > 0 && target.current < last + 1) || (e.deltaY < 0 && target.current > 1)) {
      e.preventDefault();
    }

    if (isTrackpad) {
      // Smooth continuous scrolling gesture
      to(target.current + e.deltaY / 280);
      clearTimeout(settleTimeout);
      settleTimeout = setTimeout(() => {
        to(clamp(Math.round(target.current), 1, last + 1));
      }, 140);
    } else {
      // Discrete mouse wheel click (Windows standard mouse wheel)
      e.preventDefault();
      if (now - lastWheelTime > 160) {
        lastWheelTime = now;
        const dir = e.deltaY > 0 ? 1 : -1;
        const currentTarget = Math.round(target.current);
        let nextTarget = currentTarget + dir;
        if (currentTarget === 0 && dir > 0) nextTarget = 1;
        if (nextTarget > last + 1) nextTarget = 1; // Wrap around
        if (nextTarget < 1) nextTarget = last + 1; // Wrap around
        to(nextTarget);
        if (typeof sound !== 'undefined' && sound && sound.playPop) {
          sound.playPop(560 + nextTarget * 25, 0.04);
        }
      }
    }
  }, { passive: false });

  // Arrow keys for keyboard navigation
  stageEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      stopAutoTour();
      const cur = Math.round(target.current);
      to(cur >= last + 1 ? 1 : cur + 1);
      e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      stopAutoTour();
      const cur = Math.round(target.current);
      to(cur <= 1 ? last + 1 : cur - 1);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const currentItem = items[activeIdx];
      if (currentItem && typeof window.openStaffModal === 'function') {
        window.openStaffModal(currentItem.key);
      }
    }
  });

  // Main 60FPS animation frame loop
  function draw() {
    requestAnimationFrame(draw);
    const stageW = stageEl.clientWidth || 900;
    const stageH = stageEl.clientHeight || 640;
    if (!stageH) return;

    const gap = target.current - turn.current;
    if (Math.abs(gap) < 0.0005) {
      turn.current = target.current;
    } else {
      turn.current += gap * EASE;
    }

    const t = turn.current;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    // Compute dynamic metrics
    const cardW = Math.min(stageH * CARD_H * CARD_RATIO, stageW * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1;
    const bow = cardH * BOW;
    const depth = cardH * LENS;

    stageEl.style.perspective = `${depth}px`;

    // Pivot pullback: brings front face flush to picture plane
    pivotEl.style.transform = `translateZ(${-m * drumR}px)`;

    // Cards 3D placement
    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardNodes[i];
      if (card) {
        card.style.width = `${cardW}px`;
        card.style.height = `${cardH}px`;
        card.style.marginLeft = `${-cardW / 2}px`;
        card.style.marginTop = `${-cardH / 2}px`;

        card.style.transform = place(
          d * (360 / count),
          drumDeg,
          ringR,
          drumR,
          bow,
          m
        );

        // Smooth distance opacity fading
        const dist = Math.abs(d);
        const cardOpacity = m > 0.5 ? Math.max(0, 1 - Math.max(0, dist - 1.15) * 0.7) : 1;
        card.style.opacity = cardOpacity.toFixed(3);
        card.style.pointerEvents = cardOpacity > 0.25 ? 'auto' : 'none';
        card.style.zIndex = String(Math.round(100 - dist * 4));

        const face = card.firstElementChild;
        if (face) {
          face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
        }
      }
    }

    // Label & front title crossfade
    if (labelEl) {
      labelEl.style.opacity = String(Math.max(0, 1 - m * 1.5));
      labelEl.style.pointerEvents = m < 0.3 ? 'auto' : 'none';
    }
    if (titleEl) {
      titleEl.style.opacity = String(Math.max(0, (m - 0.2) * 1.25));
      titleEl.style.pointerEvents = m > 0.5 ? 'auto' : 'none';
    }

    // Active Titan detection and synchronization
    const near = clamp(Math.round(pos), 0, last);
    if (near !== activeIdx) {
      activeIdx = near;
      const currentItem = items[activeIdx];
      if (currentItem) {
        if (badgeEl) badgeEl.innerText = currentItem.badge || '';
        if (nameEl) nameEl.innerText = currentItem.name || '';
        if (roleEl) roleEl.innerText = currentItem.title || '';
        if (superpowerEl) superpowerEl.innerText = currentItem.superpower || '';
      }
      indexBtns.forEach((btn, idx) => {
        if (btn && btn.classList) {
          if (idx === activeIdx) btn.classList.add('active');
          else btn.classList.remove('active');
        }
      });
    }
  }

  requestAnimationFrame(draw);
}

// --- Audio Toggle Handler ---
function initAudioButton() {
  const btn = document.getElementById('audio-toggle-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isNowOn = sound.toggle();
    btn.innerHTML = isNowOn ? '🔊' : '🔇';
    btn.setAttribute('title', isNowOn ? 'Mute 3D Spatial Audio' : 'Unmute 3D Spatial Audio');
    if (isNowOn) sound.playChime();
  });
}

// --- Smooth Anchor Navigation ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- Case Studies Data Catalog (Extracted from Malingo Portfolio 2026) ---
const CASE_STUDIES_DATA = {
  barwizard: {
    id: 'barwizard',
    discipline: 'PERFORMANCE MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 05',
    title: 'BarWizard',
    meta: 'Bartending Education · Training · Consultancy',
    lead: 'BarWizard has been working in the bartending space since 1996. Its offer spans professional academy training, bar consultancy, and event mixology.',
    scope: 'Performance marketing for the April–June 2026 quarter, driving academy lead generation alongside multi-platform reach and community growth.',
    asset: './CASE_STUDIES/barwizard.webp',
    sectionHeading: 'The challenge behind the campaign.',
    challenge: 'Prospective students exploring bartending are looking for a credible course, a practical craft, or a pathway into hospitality. The Q2 2026 campaign paired high-volume platform reach with direct academy enquiry conversion.',
    steps: [
      { no: '01', title: 'Make the offer legible', text: 'Bring the training and academy proposition forward so audiences immediately understand the next step.' },
      { no: '02', title: 'Build attention at scale', text: 'Use multi-platform video and paid distribution to create visibility around a specialist hospitality category.' },
      { no: '03', title: 'Connect attention to enquiry', text: 'Track lead volume alongside reach and views to ensure audience momentum translates into academy enquiries.' }
    ],
    workSummary: 'Full-funnel performance marketing across April–June 2026 combining high-reach creative distribution, audience growth, and lead capture for BarWizard’s bartending academy.',
    opportunity: 'Converts category curiosity into direct academy enquiries while compounding long-term brand authority across social platforms.',
    metrics: [
      { val: '4.3M', label: 'Views · All Platforms' },
      { val: '1.9M', label: 'Total Reach' },
      { val: '+629', label: 'New Followers / Subscribers' },
      { val: '102', label: 'Academy Leads' },
      { val: '₹17,784', label: 'Ad Spend (INR)' }
    ],
    metricsNote: 'Portfolio-reported Q2 2026 campaign metrics (Malingo Portfolio 2026, page 5).',
    related: ['neofit', 'livanto'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / TikTok)'
  },
  neofit: {
    id: 'neofit',
    discipline: 'PERFORMANCE MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 06',
    title: 'Neofit',
    meta: 'Nutraceuticals · B&B Nutretia Health Supplements',
    lead: 'Neofit is a nutritional health brand by B&B Nutretia offering targeted formulations across eye care, multivitamins, calcium, and vitamin D3.',
    scope: 'Multi-platform performance marketing across Instagram and Facebook focused on qualified reach, link traffic, efficient CPM, and lead generation.',
    asset: './CASE_STUDIES/neofit.webp',
    sectionHeading: 'The challenge behind the campaign.',
    challenge: 'With a supplement range spanning distinct wellness needs, Neofit needed creative and media targeting that connected each product line to the exact health need-state while maintaining lean acquisition costs.',
    steps: [
      { no: '01', title: 'Clarify product relevance', text: 'Align product communication with the specific nutritional need-state it serves.' },
      { no: '02', title: 'Move from discovery to action', text: 'Build a seamless campaign funnel from broad reach to link clicks and lead capture.' },
      { no: '03', title: 'Optimise to the useful signal', text: 'Balance blended cost per lead (₹47.26) and CPM (₹11.49) alongside click volume rather than vanity impressions alone.' }
    ],
    workSummary: 'Performance paid media across Instagram and Facebook delivering 6.5M reach, 25K link clicks, and 2,083 leads on ₹98,442 total ad spend.',
    opportunity: 'Establishes a repeatable, low-CPM acquisition engine (₹11.49 overall CPM) capable of scaling D2C wellness product discovery and customer enquiries.',
    metrics: [
      { val: '6.5M', label: 'Reach · All Platforms' },
      { val: '25K', label: 'Link Clicks' },
      { val: '2,083', label: 'Leads Generated' },
      { val: '₹47.26', label: 'Blended Cost / Lead' },
      { val: '₹98,442', label: 'Ad Spend (INR)' },
      { val: '₹11.49', label: 'Overall CPM' }
    ],
    metricsNote: 'Portfolio-reported campaign snapshot (Malingo Portfolio 2026, page 6).',
    related: ['livanto', 'barwizard'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / TikTok)'
  },
  livanto: {
    id: 'livanto',
    discipline: 'PERFORMANCE MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 07',
    title: 'Livanto Green Infra',
    meta: 'EV Charging Infrastructure · 30–240 kW Fast Chargers',
    lead: 'Livanto Green Infra builds EV charging infrastructure including 30–240 kW fast chargers, charging management software, and turnkey support for homes, businesses, and fleets.',
    scope: 'Performance marketing and high-volume lead generation targeting residential, commercial, and fleet EV charging buyers.',
    asset: './CASE_STUDIES/livanto.webp',
    sectionHeading: 'The challenge behind the campaign.',
    challenge: 'EV charging infrastructure is a considered technical purchase where homeowners, commercial operators, and fleet managers evaluate different specs. The campaign translated technical charging hardware into clear enquiry hooks at ₹15.35 blended CPL.',
    steps: [
      { no: '01', title: 'Translate a technical offer', text: 'Make 30–240 kW charging hardware and software benefits instantly scannable.' },
      { no: '02', title: 'Segment by real use case', text: 'Connect creatives directly to home, commercial business, and fleet charging requirements.' },
      { no: '03', title: 'Scale an efficient enquiry engine', text: 'Pair high lead volume (3,943 leads) with disciplined spend efficiency (₹15.35 blended CPL).' }
    ],
    workSummary: 'Performance lead-generation campaigns delivering 3,943 leads at ₹15.35 blended cost per lead from ₹60,523 ad spend and 408K total reach.',
    opportunity: 'Creates an affordable, high-intent pipeline of B2B, commercial, and residential EV infrastructure enquiries ready for sales qualification.',
    metrics: [
      { val: '408K', label: 'Total Reach' },
      { val: '3,943', label: 'Leads Generated' },
      { val: '₹15.35', label: 'Blended Cost / Lead' },
      { val: '₹60,523', label: 'Ad Spend (INR)' }
    ],
    metricsNote: 'Portfolio-reported campaign snapshot (Malingo Portfolio 2026, page 7).',
    related: ['neofit', 'barwizard'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / TikTok)'
  },
  paytm: {
    id: 'paytm',
    discipline: 'SOCIAL MEDIA · CONTENT WRITING',
    pageRef: 'PORTFOLIO 2026 · PAGE 09',
    title: 'Paytm',
    meta: 'Financial Technology · Consumer & Merchant Services',
    lead: 'Paytm speaks simultaneously to everyday consumers making digital payments and merchants relying on Soundbox, UPI, and financial tools. Malingo crafted social media content writing across Instagram and Facebook.',
    scope: 'Social media content writing for Instagram and Facebook across consumer and merchant digital payment propositions.',
    asset: './CASE_STUDIES/paytm.webp',
    sectionHeading: 'The brand, its audience, and its voice.',
    challenge: 'Serving both mass-market consumers and business merchants requires simplifying complex financial features into clear, instantly recognisable social posts without diluting trust.',
    steps: [
      { no: '01', title: 'Simplify complex services', text: 'Translate payment and financial product utilities into crisp, accessible social storytelling.' },
      { no: '02', title: 'Keep the voice unmistakable', text: 'Maintain a cohesive brand tone across Instagram and Facebook formats.' },
      { no: '03', title: 'Give every post a clear job', text: 'Balance feature education, merchant utility, and ongoing top-of-mind brand recall.' }
    ],
    workSummary: 'Social media content writing across Instagram and Facebook supporting Paytm’s consumer and merchant product ecosystem.',
    opportunity: 'Strengthens feature clarity, service discovery, and consistent everyday brand recall across India’s largest digital payment channels.',
    related: ['mufin', 'intrend'],
    goalOption: 'Full Agency Retainer (All-In-One Domination)'
  },
  mufin: {
    id: 'mufin',
    discipline: 'SOCIAL MEDIA MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 10',
    title: 'Mufin Green Finance',
    meta: 'Green Finance · Publicly Listed EV & Solar Financing',
    lead: 'Mufin Green Finance sits at the intersection of listed NBFC finance and clean mobility, powering EV and solar infrastructure financing across India.',
    scope: 'Multi-platform social media marketing spanning LinkedIn, Instagram, and Facebook.',
    asset: './CASE_STUDIES/mufin.webp',
    sectionHeading: 'The brand, its audience, and its voice.',
    challenge: 'Green financing combines institutional credibility with emerging climate-tech narratives. Malingo tailored messaging across LinkedIn for corporate/investor stakeholders and Instagram/Facebook for broader clean-energy awareness.',
    steps: [
      { no: '01', title: 'Build category understanding', text: 'Explain what EV and solar financing unlocks using clear, jargon-free language.' },
      { no: '02', title: 'Adapt by platform behaviour', text: 'Tailor LinkedIn for B2B & institutional credibility while keeping Instagram and Facebook engaging and accessible.' },
      { no: '03', title: 'Sustain clean-tech leadership', text: 'Keep Mufin’s role in India’s clean-energy transition consistently visible.' }
    ],
    workSummary: 'End-to-end social media marketing across LinkedIn, Instagram, and Facebook for a ₹1700+ Cr publicly listed green finance leader.',
    opportunity: 'Positions Mufin as a trusted category authority for EV fleets, solar partners, and green-finance investors alike.',
    related: ['paytm', 'colourvalley'],
    goalOption: 'Full Agency Retainer (All-In-One Domination)'
  },
  intrend: {
    id: 'intrend',
    discipline: 'SOCIAL MEDIA MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 11',
    title: 'Intrend Colours',
    meta: 'Cosmetics · Accessible Beauty',
    lead: 'Intrend Colours offers an expansive cosmetics range built around vibrant shades, matte finishes, and an accessible everyday price point.',
    scope: 'Social media marketing across Instagram and Facebook focused on shade discovery and visual brand recognition.',
    asset: './CASE_STUDIES/intrend.webp',
    sectionHeading: 'The brand, its audience, and its voice.',
    challenge: 'In beauty and cosmetics, buyers notice shade payoff and finish before reading a single line of copy. The social grid needed repeatable formats that spotlighted 30+ SKUs while keeping the feed cohesive.',
    steps: [
      { no: '01', title: 'Lead with the product & shade', text: 'Make colour payoff, finishes, and textures the immediate focal point of every frame.' },
      { no: '02', title: 'Turn catalogue breadth into discovery', text: 'Use structured visual formats so shoppers easily navigate lip colours, primers, and fixers.' },
      { no: '03', title: 'Build a recognisable beauty grid', text: 'Maintain one signature visual language across Instagram and Facebook without visual fatigue.' }
    ],
    workSummary: 'Product-led social media marketing across Instagram and Facebook showcasing Intrend Colours’ cosmetics range.',
    opportunity: 'Drives rapid shade discovery, feed saves, and D2C/marketplace brand recall across high-frequency beauty audiences.',
    related: ['colourvalley', 'jovees'],
    goalOption: 'Viral Short-Form Video & Reel Production'
  },
  colourvalley: {
    id: 'colourvalley',
    discipline: 'SOCIAL MEDIA MARKETING',
    pageRef: 'PORTFOLIO 2026 · PAGE 12',
    title: 'Colour Valley India',
    meta: 'Paints · Primers · Wall Care',
    lead: 'Colour Valley India manufactures interior and exterior paints, primers, and protective wall-care formulations built around colour vibrancy and durability.',
    scope: 'Social media marketing across Instagram and Facebook highlighting product performance and finishes.',
    asset: './CASE_STUDIES/colourvalley.webp',
    sectionHeading: 'The brand, its audience, and its voice.',
    challenge: 'Technical paint and primer benefits only click when homeowners, contractors, and dealers can picture the finished surface. Creative direction turned formulations into tangible visual transformations.',
    steps: [
      { no: '01', title: 'Make technical benefits visible', text: 'Translate washability, weather shielding, and damp-coat protection into visual stories.' },
      { no: '02', title: 'Show finishes in real spaces', text: 'Use bold colour palettes and architectural context so buyers imagine the final wall finish.' },
      { no: '03', title: 'Keep the catalogue coherent', text: 'Unify Euro White, Damp Wall Coat, and luxury Metallica ranges under one consistent identity.' }
    ],
    workSummary: 'Ongoing social media marketing across Instagram and Facebook supporting brand awareness and product education.',
    opportunity: 'Builds dealer confidence and homeowner preference across residential and commercial paint categories.',
    related: ['intrend', 'malee'],
    goalOption: 'Full Agency Retainer (All-In-One Domination)'
  },
  starfox: {
    id: 'starfox',
    discipline: 'BRANDING · SOCIAL MEDIA · OUTDOOR DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGES 13 & 16',
    title: 'Starfox Fashion',
    meta: 'Men’s Fashion · Contemporary Apparel (Ludhiana)',
    lead: 'Based in Ludhiana, Starfox Fashion is a contemporary men’s apparel label with a customer base exceeding 100,000. Malingo worked across both its visual brand system and digital social channels.',
    scope: 'Logo design, comprehensive brand guidelines, outdoor advertising, and social media marketing across Instagram and Facebook.',
    asset: './CASE_STUDIES/starfox_brand.webp',
    sectionHeading: 'Giving the brand one unmistakable identity.',
    challenge: 'Fast-growing apparel labels lose equity when billboards, retail tags, and Instagram feeds look disconnected. Malingo aligned Starfox’s logo, outdoor hoardings, and social creative into one cohesive brand system.',
    steps: [
      { no: '01', title: 'Establish a recognisable identity', text: 'Anchor brand recall with a crisp logo system and repeatable brand guidelines.' },
      { no: '02', title: 'Carry identity into physical spaces', text: 'Extend the visual language cleanly into high-impact outdoor advertising.' },
      { no: '03', title: 'Keep the brand active on social', text: 'Translate seasonal drops and menswear styling into channel-native Instagram and Facebook content.' }
    ],
    workSummary: 'Integrated branding and digital scope spanning logo design, brand guidelines, outdoor advertising, and social media marketing.',
    opportunity: 'Ensures brand recognition compounds seamlessly whether a buyer sees a highway hoarding or an Instagram reel.',
    metrics: [
      { val: '100K+', label: 'Brand Customer Base' },
      { val: '360°', label: 'Identity + OOH + Social' }
    ],
    metricsNote: '100,000+ customer context as cited in Malingo Portfolio 2026 (pages 13 & 16).',
    related: ['malee', 'lytage'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  malee: {
    id: 'malee',
    discipline: 'BRAND IDENTITY · OUTDOOR DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 15',
    title: 'Malee',
    meta: 'Gardening & Eco-Living',
    lead: 'Malee is a modern gardening and eco-living brand. Malingo built its visual identity system from the ground up — covering logo design, brand guidelines, and outdoor advertising.',
    scope: 'Logo design, comprehensive brand guidelines, and outdoor advertising.',
    asset: './CASE_STUDIES/malee.webp',
    sectionHeading: 'Building an identity rooted in everyday clarity.',
    challenge: 'In a tactile category centred on plants and home gardens, the brand needed a friendly, structured visual identity practical enough to scale cleanly from digital touchpoints to highway billboards.',
    steps: [
      { no: '01', title: 'Create the identity foundation', text: 'Craft a fresh, memorable logo mark built for immediate category recognition.' },
      { no: '02', title: 'Codify brand guidelines', text: 'Define typography, colour rules, and application standards so every future asset stays consistent.' },
      { no: '03', title: 'Build physical outdoor visibility', text: 'Apply the brand cleanly to outdoor billboards and signage beyond digital screens.' }
    ],
    workSummary: 'Complete visual identity foundation including logo design, brand guidelines, and outdoor advertising.',
    opportunity: 'Equips Malee with a durable, scalable brand toolkit that drives instant recognition across physical and digital channels.',
    related: ['starfox', 'lytage'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  lytage: {
    id: 'lytage',
    discipline: 'COMPLETE BRAND DESIGN · OUTDOOR DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 17',
    title: 'Lytage',
    meta: 'Consumer Electronics',
    lead: 'Lytage operates in consumer electronics. Malingo delivered a complete brand design system spanning logo architecture, brand guidelines, and transit/outdoor advertising.',
    scope: 'Complete brand design, logo design, outdoor advertising, and corporate brand guidelines.',
    asset: './CASE_STUDIES/lytage.webp',
    sectionHeading: 'Engineering coherence across every brand touchpoint.',
    challenge: 'Electronics brands must signal precision and reliability across hardware boxes, retail spaces, and outdoor transit media. Malingo built a sharp geometric system engineered for repeatability.',
    steps: [
      { no: '01', title: 'Build the visual foundation', text: 'Design a modern geometric logo and cohesive brand mark tailored for electronics.' },
      { no: '02', title: 'Create rules for consistency', text: 'Establish brand guidelines so packaging, collateral, and digital ads speak one visual language.' },
      { no: '03', title: 'Translate identity into outdoor impact', text: 'Deploy the system across transit shelters and outdoor media for high-visibility recall.' }
    ],
    workSummary: 'End-to-end brand creation including complete brand design, logo, outdoor advertising, and brand guidelines.',
    opportunity: 'Gives Lytage an enterprise-ready visual foundation that accelerates product launches and retail trust.',
    related: ['starfox', 'malee'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  california: {
    id: 'california',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 19',
    title: 'California Nuts',
    meta: 'Food · Packaged California Almonds (Chougan)',
    lead: 'For California Nuts, Malingo designed the California Almonds pouch under the Chougan mark — placing the product name front and centre with natural appetite cues.',
    scope: 'Retail food packaging design engineered for instant shelf legibility.',
    asset: './CASE_STUDIES/pack_california.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Dry-fruit aisles are crowded and fast-scanned. The pack had to establish purity, quality, and almond imagery at arm’s length before a shopper reads the fine print.',
    steps: [
      { no: '01', title: 'Make the product unmistakable', text: 'Prioritise brand and product naming for split-second shelf identification.' },
      { no: '02', title: 'Lead with appetite & natural cues', text: 'Use crisp almond photography and wholesome tones to reinforce freshness.' },
      { no: '03', title: 'Create strong shelf distinction', text: 'Anchor the pouch with a confident colour field and disciplined typographic hierarchy.' }
    ],
    workSummary: 'Retail pouch packaging design featured in Malingo’s food-category packaging showcase.',
    opportunity: 'Wins the crucial three-second shelf decision through clear hierarchy and premium freshness cues.',
    related: ['godesi', 'mithai'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  godesi: {
    id: 'godesi',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 19',
    title: 'Go Desi',
    meta: 'Food & Beverages · Desi Popz (Kaccha Aam)',
    lead: 'Go Desi Desi Popz brings the tangy Kaccha Aam flavour straight to the front of the pack with an unmistakably legible ₹5 impulse price callout.',
    scope: 'Small-format FMCG pouch packaging design for high-velocity retail shelves.',
    asset: './CASE_STUDIES/pack_godesi.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'At a ₹5 impulse price point, a small-format snack pack has milliseconds to convey bold Indian flavour personality and affordability in crowded kirana and modern retail counters.',
    steps: [
      { no: '01', title: 'Lead with the product name', text: 'Make Desi Popz the boldest visual anchor on the small-format sachet.' },
      { no: '02', title: 'Signal flavour immediately', text: 'Use a vivid raw-mango green field and unmistakable Kaccha Aam visual cues.' },
      { no: '03', title: 'Accelerate impulse purchase', text: 'Highlight the ₹5 price point cleanly without cluttering the pack personality.' }
    ],
    workSummary: 'FMCG confectionery packaging design built for instant impulse recognition.',
    opportunity: 'Maximises counter visibility and split-second flavour recognition for rapid retail trial.',
    related: ['california', 'jovees'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  mithai: {
    id: 'mithai',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 19',
    title: 'Mithai Magic',
    meta: 'Restaurants · Food Service Takeaway',
    lead: 'For Mithai Magic, Malingo designed a distinctive branded sleeve for takeaway food containers — extending the hospitality experience beyond the counter.',
    scope: 'Food-service takeaway container sleeve and packaging design.',
    asset: './CASE_STUDIES/pack_mithai.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'For sweet shops and food-service brands, most customers experience the product at home or when gifting. A generic container wastes the strongest brand touchpoint.',
    steps: [
      { no: '01', title: 'Carry the brand past the counter', text: 'Keep the Mithai Magic identity prominent throughout delivery and unboxing.' },
      { no: '02', title: 'Elevate a practical format', text: 'Turn a functional takeaway box into a crisp, gift-worthy branded carrier.' },
      { no: '03', title: 'Build repeat recognition', text: 'Make every order reinforce brand warmth and dining recall.' }
    ],
    workSummary: 'Branded takeaway sleeve packaging design for Mithai Magic food-service containers.',
    opportunity: 'Transforms every takeaway and delivery order into a memorable physical brand touchpoint.',
    related: ['veghouse', 'godesi'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  veghouse: {
    id: 'veghouse',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 20',
    title: 'Veg House',
    meta: 'Restaurants · Multi-Format Food Packaging',
    lead: 'Veg House spans multiple takeaway container shapes unified by one cohesive visual system and the signature tagline “Where every flavour tells a story.”',
    scope: 'Multi-format restaurant takeaway packaging system across bowls and boxes.',
    asset: './CASE_STUDIES/pack_veghouse.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Delivery orders rarely ship in a single box size. Veg House needed a flexible packaging architecture that looked unmistakably unified across every bowl, tub, and carton.',
    steps: [
      { no: '01', title: 'Create a signature pack language', text: 'Anchor the range with consistent brand marks and the core flavour tagline.' },
      { no: '02', title: 'Adapt cleanly across formats', text: 'Scale the identity across different container shapes and colour accents.' },
      { no: '03', title: 'Deliver a cohesive unboxing', text: 'Ensure multi-item orders arrive feeling like one polished culinary brand.' }
    ],
    workSummary: 'Multi-container packaging family created for Veg House restaurant & delivery formats.',
    opportunity: 'Raises perceived food quality and reinforces brand recall across aggregators and direct orders.',
    related: ['mithai', 'california'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  jovees: {
    id: 'jovees',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 20',
    title: 'Jovees',
    meta: 'Cosmetics & Skincare · Sun Shield Protective Lotion',
    lead: 'Jovees Premium Sun Shield Protective Lotion balances clean dermatological credibility with effortless scannability of SPF 40 and PA sun-protection details.',
    scope: 'Skincare box and lotion packaging design for Jovees Premium.',
    asset: './CASE_STUDIES/pack_jovees.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Skincare buyers demand both premium aesthetic trust and immediate functional clarity on SPF rating and protection spectrum.',
    steps: [
      { no: '01', title: 'Lead with product purpose', text: 'Make Sun Shield Protective Lotion immediately scannable in crowded skincare aisles.' },
      { no: '02', title: 'Highlight clinical protection cues', text: 'Give SPF 40 and PA ratings a crisp, structured place in the front hierarchy.' },
      { no: '03', title: 'Maintain refined premium restraint', text: 'Use clean typography and balanced colour systems worthy of the Jovees Premium line.' }
    ],
    workSummary: 'Cosmetics & skincare packaging design for Jovees Premium Sun Shield Protective Lotion.',
    opportunity: 'Elevates shelf credibility and accelerates buyer confidence in high-competition skincare retail.',
    related: ['pulp', 'california'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  pulp: {
    id: 'pulp',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 20',
    title: 'Pulp',
    meta: 'Skincare & Personal Care · Coffee & Love Scrub',
    lead: 'Pulp Coffee & Love breaks away from predictable clinical skincare whites with a bold dark matte pouch and high-contrast pink graphic typography.',
    scope: 'D2C skincare spout-pouch packaging design for Pulp Coffee & Cacao Scrub.',
    asset: './CASE_STUDIES/pack_pulp.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Modern Gen-Z skincare lives equally on retail shelves and Instagram unboxings. Pulp needed an iconic visual code that stood out instantly against minimalist pastel competitors.',
    steps: [
      { no: '01', title: 'Build a category-breaking visual code', text: 'Pair a deep matte dark pouch with electric pink typography for instant visual contrast.' },
      { no: '02', title: 'Fuse name and ingredients', text: 'Make Coffee & Love and the coffee-and-cacao scrub benefit part of one memorable story.' },
      { no: '03', title: 'Design a scalable brand asset', text: 'Create a distinctive pouch template ready to extend across future Pulp SKUs.' }
    ],
    workSummary: 'Distinctive pouch packaging design for Pulp Coffee & Cacao Scrub.',
    opportunity: 'Drives instant social shareability, unboxing delight, and unmistakable brand differentiation.',
    related: ['jovees', 'godesi'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  bharat: {
    id: 'bharat',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 21',
    title: 'Bharat Certis',
    meta: 'Agriculture & Crop Care · Vestar (Paclobutrazole 40% SC)',
    lead: 'The Bharat Certis spread features Vestar, a Paclobutrazole 40% SC plant growth regulator designed for crisp technical clarity across rural and dealer distribution.',
    scope: 'Technical agri-science product packaging design for Vestar.',
    asset: './CASE_STUDIES/pack_bharat.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'In crop protection and agriculture, clarity prevents costly misuse. Dealers and farmers need the product name, active formulation, and category unmistakable at a glance.',
    steps: [
      { no: '01', title: 'Prioritise technical legibility', text: 'Present Vestar and Paclobutrazole 40% SC with zero visual ambiguity.' },
      { no: '02', title: 'Structure information hierarchy', text: 'Position the plant growth regulator classification cleanly for rapid counter reference.' },
      { no: '03', title: 'Build durable shelf recognition', text: 'Frame the pack with a distinct visual structure that reinforces multinational brand authority.' }
    ],
    workSummary: 'Specialist agricultural packaging design for Bharat Certis AgriScience’s Vestar formulation.',
    opportunity: 'Improves dealer recall and buyer confidence across pan-India rural and regional agri-markets.',
    related: ['dyazo', 'incase'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  dyazo: {
    id: 'dyazo',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 21',
    title: 'Dyazo',
    meta: 'PC & Mobile Hardware · Medusa Keyboard & Mouse Combo',
    lead: 'Dyazo Medusa is a gaming keyboard-and-mouse combo box that places both hardware pieces cleanly in view so shoppers immediately know what is inside.',
    scope: 'Consumer hardware box packaging design for Dyazo Medusa combo.',
    asset: './CASE_STUDIES/pack_dyazo.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Tech accessory buyers compare boxes rapidly online and in-store. The packaging had to showcase the full combo hardware and gaming aesthetic clearly without visual clutter.',
    steps: [
      { no: '01', title: 'Show what is inside immediately', text: 'Put crisp imagery of both the keyboard and mouse front and centre.' },
      { no: '02', title: 'Establish gaming-grade presence', text: 'Pair bold contrast with a clear hierarchy for the Medusa product identity.' },
      { no: '03', title: 'Support rapid spec comparison', text: 'Keep core hardware callouts clean and scannable on the primary face.' }
    ],
    workSummary: 'Retail & e-commerce hardware box packaging for the Dyazo Medusa keyboard-and-mouse combo.',
    opportunity: 'Strengthens click-through visual impact on marketplaces and immediate comprehension on retail shelves.',
    related: ['incase', 'bharat'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  },
  incase: {
    id: 'incase',
    discipline: 'PACKAGING DESIGN',
    pageRef: 'PORTFOLIO 2026 · PAGE 21',
    title: 'Incase',
    meta: 'B2B Service · Message-Led Proposition Packaging',
    lead: 'Incase takes a sharp message-led packaging approach: a bold blue box carrying the headline “Increase Project Speed By Months At Zero Extra Cost.”',
    scope: 'Conceptual message-led B2B service proposition packaging design.',
    asset: './CASE_STUDIES/pack_incase.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Intangible B2B services are hard to make memorable. Using physical packaging as a tactile billboard turns a core business promise into something stakeholders hold and remember.',
    steps: [
      { no: '01', title: 'Lead with the value proposition', text: 'Make the core speed-and-cost business promise the unmistakable headline.' },
      { no: '02', title: 'Visualise forward momentum', text: 'Use clean directional structure and confident colour hierarchy to reinforce progress.' },
      { no: '03', title: 'Make the promise tactile', text: 'Turn the physical box into a memorable conversation starter for decision-makers.' }
    ],
    workSummary: 'Specialist message-led packaging design turning a B2B service proposition into a tangible brand artefact.',
    opportunity: 'Elevates pitch recall and differentiates B2B service communications from standard digital slide decks.',
    related: ['dyazo', 'bharat'],
    goalOption: '3D Brand Identity, Packaging & Visual Overhaul'
  }
};

// --- Interactive Case Study Modal & Fullscreen Portfolio Lightbox ---
function initCaseStudiesAndLightbox() {
  const modalOverlay = document.getElementById('case-modal-overlay');
  const modalScroll = document.getElementById('case-modal-scroll');
  const modalDiscipline = document.getElementById('case-modal-discipline');
  const modalCloseBtn = document.getElementById('case-modal-close');

  const lightbox = document.getElementById('portfolio-lightbox');
  const lbImg = document.getElementById('portfolio-lightbox-img');
  const lbCaption = document.getElementById('portfolio-lightbox-caption');
  const lbClose = document.getElementById('lightbox-close-btn');

  function openLightbox(src, caption) {
    if (!lightbox || !lbImg || !src) return;
    lbImg.src = src;
    if (lbCaption) lbCaption.textContent = caption || 'Malingo Portfolio 2026';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (sound && sound.playPop) sound.playPop(640, 0.06);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lbImg) lbImg.removeAttribute('src');
    if (!modalOverlay || modalOverlay.hidden) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-lightbox]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(el.getAttribute('data-lightbox'), el.getAttribute('data-caption'));
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function renderCaseModal(cs) {
    if (!modalScroll || !modalDiscipline) return;
    modalDiscipline.textContent = `MALINGO CASE FILE  /  ${cs.discipline}`;

    const stepsHtml = (cs.steps || []).map((s) => `
      <article class="case-modal-step">
        <span>${s.no}</span>
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </article>
    `).join('');

    const metricsHtml = cs.metrics && cs.metrics.length ? `
      <div class="case-modal-metrics-box">
        <div class="case-modal-kicker" style="margin-bottom: 0;">PORTFOLIO-REPORTED SNAPSHOT</div>
        <div class="case-modal-metrics-grid">
          ${cs.metrics.map((m) => `
            <div class="case-modal-metric">
              <strong>${m.val}</strong>
              <span>${m.label}</span>
            </div>
          `).join('')}
        </div>
        ${cs.metricsNote ? `<p class="case-modal-metrics-note">${cs.metricsNote}</p>` : ''}
      </div>
    ` : '';

    const relatedHtml = (cs.related || []).map((rid) => {
      const rel = CASE_STUDIES_DATA[rid];
      if (!rel) return '';
      return `<button type="button" class="case-related-btn" data-case-open-inline="${rel.id}">${rel.title} ↗</button>`;
    }).join('');

    modalScroll.innerHTML = `
      <div class="case-modal-hero">
        <div class="case-modal-hero-copy">
          <div class="case-modal-kicker">THE WORK  /  ${cs.pageRef}</div>
          <h2 id="case-modal-title">${cs.title}</h2>
          <div class="case-modal-sector">${cs.meta}</div>
          <p class="case-modal-lead">${cs.lead}</p>
          <div class="case-modal-scope">
            <span>DOCUMENTED SCOPE</span>
            <p>${cs.scope}</p>
          </div>
        </div>
        <div class="case-modal-hero-visual" id="case-hero-zoom-trigger">
          <img src="${cs.asset}" alt="${cs.title} portfolio artwork">
        </div>
      </div>

      <div class="case-modal-body">
        <div class="case-modal-section-head">
          <div class="case-modal-kicker">STRATEGIC BREAKDOWN</div>
          <h3>${cs.sectionHeading}</h3>
          <p>${cs.challenge}</p>
        </div>

        <div class="case-modal-steps">${stepsHtml}</div>

        ${metricsHtml}

        <div class="case-modal-duo">
          <article class="case-modal-card">
            <span>THE WORK MALINGO TOOK ON</span>
            <h4>Execution Scope</h4>
            <p>${cs.workSummary}</p>
          </article>
          <article class="case-modal-card highlight">
            <span>BUSINESS IMPACT &amp; OPPORTUNITY</span>
            <h4>Why This Matters for Growth</h4>
            <p>${cs.opportunity}</p>
          </article>
        </div>

        ${relatedHtml ? `
          <div class="case-modal-related">
            <div class="case-modal-kicker" style="margin-bottom: 0;">KEEP EXPLORING</div>
            <h4>More Case Studies from Malingo × TBO</h4>
            <div class="case-modal-related-links">${relatedHtml}</div>
          </div>
        ` : ''}

        <div class="case-modal-footer">
          <button type="button" class="btn-cta" id="case-cta-contact">
            <span>Build Similar Results for Your Brand</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button type="button" class="case-modal-close" id="case-footer-close">Back to Portfolio ↑</button>
        </div>
      </div>
    `;

    modalScroll.scrollTop = 0;

    // Wire zoom on hero artwork
    const heroZoom = document.getElementById('case-hero-zoom-trigger');
    if (heroZoom) {
      heroZoom.addEventListener('click', () => openLightbox(cs.asset, `${cs.title} · ${cs.discipline} (${cs.pageRef})`));
    }

    // Wire inline related buttons
    modalScroll.querySelectorAll('[data-case-open-inline]').forEach((b) => {
      b.addEventListener('click', () => openCaseModal(b.getAttribute('data-case-open-inline'), true));
    });

    // Wire footer close & CTA to Contact form
    const footerClose = document.getElementById('case-footer-close');
    if (footerClose) footerClose.addEventListener('click', () => closeCaseModal(true));

    const ctaContact = document.getElementById('case-cta-contact');
    if (ctaContact) {
      ctaContact.addEventListener('click', () => {
        closeCaseModal(false);
        const selectEl = document.getElementById('client-service');
        if (selectEl && cs.goalOption) selectEl.value = cs.goalOption;
        const contactEl = document.getElementById('contact');
        if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function openCaseModal(id, pushHash) {
    const cs = CASE_STUDIES_DATA[id];
    if (!cs || !modalOverlay) return;
    renderCaseModal(cs);
    modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (sound && sound.playPop) sound.playPop(700, 0.08);

    if (pushHash && location.hash !== `#case-${id}`) {
      try {
        history.pushState({ caseId: id }, '', `#case-${id}`);
      } catch (err) {
        location.hash = `#case-${id}`;
      }
    }
  }

  function closeCaseModal(restoreHash = true) {
    if (!modalOverlay || modalOverlay.hidden) return;
    modalOverlay.hidden = true;
    document.body.style.overflow = '';
    if (restoreHash && location.hash.startsWith('#case-')) {
      try {
        history.replaceState(null, '', location.pathname + location.search + '#work');
      } catch (err) {
        location.hash = '#work';
      }
    }
  }

  document.querySelectorAll('[data-case-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCaseModal(btn.getAttribute('data-case-open'), true);
    });
  });

  // Also allow clicking the content body of a case study card to open its case file
  document.querySelectorAll('.case-work-card').forEach((card) => {
    const btn = card.querySelector('[data-case-open]');
    if (!btn) return;
    const caseId = btn.getAttribute('data-case-open');
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-lightbox]') || e.target.closest('button')) return;
      openCaseModal(caseId, true);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeCaseModal(true));
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCaseModal(true);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && !lightbox.hidden) {
        closeLightbox();
      } else if (modalOverlay && !modalOverlay.hidden) {
        closeCaseModal(true);
      }
    }
  });

  function syncFromHash() {
    const m = location.hash.match(/^#case-([a-z0-9-]+)$/i);
    if (m && CASE_STUDIES_DATA[m[1].toLowerCase()]) {
      openCaseModal(m[1].toLowerCase(), false);
    } else if (modalOverlay && !modalOverlay.hidden) {
      closeCaseModal(false);
    }
  }

  window.addEventListener('hashchange', syncFromHash);
  window.addEventListener('popstate', syncFromHash);
  syncFromHash();
}

// --- Form Submission (Real Email Dispatch to Malingo & TBO via Netlify Forms) ---
function initContactForm() {
  const form = document.getElementById('growth-audit-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status-msg');
  const sourceInput = document.getElementById('form-source-page');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const origHtml = btn ? btn.innerHTML : '';

    if (sourceInput) {
      sourceInput.value = window.location.href;
    }

    if (statusEl) {
      statusEl.hidden = true;
      statusEl.className = 'form-status-msg';
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" style="color:#fff;"></i> <span class="btn-text">Sending to Malingo &amp; TBO Desk...</span>';
    }

    const formData = new FormData(form);
    if (!formData.get('form-name')) {
      formData.set('form-name', form.getAttribute('name') || 'growth-audit');
    }

    const bodyEncoded = new URLSearchParams(formData).toString();
    const isNetlifyHost = /(^|\.)malingo\.in$|netlify\.app$/i.test(window.location.hostname);
    const endpoint = isNetlifyHost ? '/' : 'https://malingo.in/';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyEncoded
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (sound && sound.playChime) sound.playChime();

      if (btn) {
        btn.innerHTML = '✓ Dispatched to Malingo &amp; TBO Email Desks!';
        btn.style.background = '#10B981';
        btn.style.borderColor = '#34D399';
      }

      if (statusEl) {
        statusEl.className = 'form-status-msg is-success';
        statusEl.innerHTML = '<strong>Request Sent!</strong> Your brief has been emailed to <strong>kushagra@malingo.in</strong> &amp; <strong>info@thebrandoutreach.in</strong>. Aryaman (Operations POC) will connect within 15 minutes.';
        statusEl.hidden = false;
      }

      form.reset();

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
          btn.style.background = '';
          btn.style.borderColor = '';
        }
      }, 5000);
    } catch (err) {
      console.error('[ContactForm] Submission error:', err);
      const nameVal = formData.get('client_name') || '';
      const contactVal = formData.get('client_contact') || '';
      const goalVal = formData.get('growth_goal') || '';
      const detailsVal = formData.get('brand_details') || '';
      const mailSubject = encodeURIComponent(`[Malingo × TBO] Growth Audit Request — ${nameVal}`);
      const mailBody = encodeURIComponent(
        `Name / Company: ${nameVal}\nEmail / WhatsApp: ${contactVal}\nPrimary Growth Goal: ${goalVal}\n\nBrand & Targets:\n${detailsVal}`
      );
      const mailtoHref = `mailto:kushagra@malingo.in,info@thebrandoutreach.in?subject=${mailSubject}&body=${mailBody}`;

      if (statusEl) {
        statusEl.className = 'form-status-msg is-error';
        statusEl.innerHTML = `Could not auto-send right now. <a href="${mailtoHref}">Click here to send directly via email to kushagra@malingo.in &amp; info@thebrandoutreach.in</a>.`;
        statusEl.hidden = false;
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    }
  });
}

// --- Portfolio Filter Logic ---
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (sound && sound.playPop) sound.playPop(720, 0.08);

      const filterVal = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(/\s+/);
        const show = filterVal === 'all' || categories.includes(filterVal);
        if (show) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.94)';
          setTimeout(() => {
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter');
            if (activeFilter !== 'all' && !categories.includes(activeFilter)) {
              card.style.display = 'none';
            }
          }, 220);
        }
      });
    });
  });
}

// --- Micro Theme Switcher (Top-Left Corner) ---
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const labelEl = document.getElementById('theme-label');
  const root = document.documentElement;

  function updateUI(isLight) {
    if (labelEl) labelEl.textContent = isLight ? 'LIGHT' : 'DARK';
    if (toggleBtn) {
      toggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode (Currently Light)' : 'Switch to Light Mode (Currently Dark)');
      toggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    }
  }

  // Sync initial state
  const isLightInitial = root.classList.contains('light-theme');
  updateUI(isLightInitial);

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowLight = root.classList.toggle('light-theme');
    try {
      localStorage.setItem('malingo_theme', isNowLight ? 'light' : 'dark');
    } catch (err) {}

    updateUI(isNowLight);

    if (typeof sound !== 'undefined' && sound && sound.playSwitchClick) {
      sound.playSwitchClick(isNowLight);
    }
  });
}

// --- DOM Ready Initializer ---
function initAllModules() {
  const initializers = [
    ['ThemeSwitcher', initThemeSwitcher],
    ['CustomCursor', initCustomCursor],
    ['ThreeScene', initThreeScene],
    ['3DTiltCards', init3DTiltCards],
    ['AnimatedCounters', initAnimatedCounters],
    ['StaffModal', initStaffModal],
    ['StaffWorksWheel', initStaffWorksWheel],
    ['AudioButton', initAudioButton],
    ['SmoothScroll', initSmoothScroll],
    ['ContactForm', initContactForm],
    ['PortfolioFilters', initPortfolioFilters],
    ['CaseStudiesAndLightbox', initCaseStudiesAndLightbox]
  ];

  initializers.forEach(([name, fn]) => {
    try {
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.warn(`[Init] Error in ${name}:`, err);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllModules);
} else {
  initAllModules();
}

