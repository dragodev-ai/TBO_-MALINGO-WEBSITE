/* ==========================================================================
   MALINGO x THE BRAND OUTREACH - INTERACTIVE APPLICATION SCRIPT
   Silent Experience (Zero Audio Effects, Zero Revolving 3D Logos)
   ========================================================================== */

// Early check for saved light/dark theme preference
(function() {
  try {
    if (localStorage.getItem('malingo_theme') === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  } catch (e) {}
})();

// Helper: detect fine pointer (desktop mouse/trackpad) vs touch screens
function hasFinePointer() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
    : true;
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

// --- Magnetic Custom Cursor (Fine-Pointer Desktops Only) ---
function initCustomCursor() {
  if (!hasFinePointer()) return;

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

  const interactables = document.querySelectorAll(
    'a, button, .social-3d-cube, .staff-card, .service-card, .work-card, .stat-chip'
  );
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}

// --- Subtle Ambient Particle Backdrop (Zero Revolving Logos, Zero Click Handlers, Zero Sound) ---
function initThreeScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined' || prefersReducedMotion()) {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (err) {
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 34;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  // Calm, lightweight ambient particle field
  const isCompact = window.innerWidth <= 768;
  const particleCount = isCompact ? 160 : 340;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const c1 = new THREE.Color(0xF37321); // Malingo Orange
  const c2 = new THREE.Color(0xF5A623); // TBO Gold
  const c3 = new THREE.Color(0x3B82F6); // Accent Blue

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 84;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 64;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 48;

    const rCol = Math.random();
    const col = rCol < 0.45 ? c1 : rCol < 0.78 ? c2 : c3;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: isCompact ? 0.22 : 0.24,
    vertexColors: true,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(geometry, particleMat);
  scene.add(particleMesh);

  let targetMouseX = 0;
  let targetMouseY = 0;
  let curMouseX = 0;
  let curMouseY = 0;

  if (hasFinePointer()) {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  let scrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    curMouseX += (targetMouseX - curMouseX) * 0.04;
    curMouseY += (targetMouseY - curMouseY) * 0.04;

    camera.position.x = curMouseX * 2.5;
    camera.position.y = -curMouseY * 2 - (scrollY * 0.004);
    camera.lookAt(0, -scrollY * 0.004, 0);

    particleMesh.rotation.y = time * 0.018;
    particleMesh.rotation.x = time * 0.008;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// --- Subtle Card Tilt (Fine-Pointer Desktops Only) ---
function init3DTiltCards() {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  const cards = document.querySelectorAll('.tilt-3d');

  cards.forEach((card) => {
    let bounds;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.14s ease-out, box-shadow 0.2s';
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const leftX = e.clientX - bounds.x;
      const topY = e.clientY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };

      const maxDistance = Math.max(bounds.width, bounds.height) / 2 || 1;
      const intensity = 8;

      const rotateX = -(center.y / maxDistance) * intensity;
      const rotateY = (center.x / maxDistance) * intensity;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX.toFixed(2)}deg)
        rotateY(${rotateY.toFixed(2)}deg)
        translateZ(8px)
      `;
    }

    function onMouseLeave() {
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

// --- Mobile Navigation Drawer ---
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!menuBtn || !drawer) return;

  function closeMenu() {
    drawer.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open Navigation Menu');
    menuBtn.classList.remove('is-open');
  }

  function openMenu() {
    drawer.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close Navigation Menu');
    menuBtn.classList.add('is-open');
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.hidden) openMenu();
    else closeMenu();
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (!drawer.hidden && !e.target.closest('.navbar')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1080 && !drawer.hidden) {
      closeMenu();
    }
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
    if (rect.top <= window.innerHeight * 0.95) {
      animated = true;
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;

        if (prefersReducedMotion()) {
          counter.innerText = target;
          return;
        }

        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = target * easeOut;

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

  window.addEventListener('scroll', runCounters, { passive: true });
  runCounters();
}

// --- Leadership Team Profiles ---
const STAFF_DOSSIER = {
  kushagra: {
    name: "Kushagra",
    title: "Founder & Managing Director, Malingo",
    experience: "8–10 Years Experience",
    badge: "Malingo Founder",
    brand: "tag-malingo",
    image: "./STAFF/kushagra.png",
    focus: "Performance Media Strategy, Creative Testing & Digital Scaling",
    bio: "Kushagra founded Malingo to bring structured research, disciplined creative testing, and measurable performance marketing to growing brands. Over the past decade, he has guided campaigns spanning Meta, Google, and YouTube across D2C, healthcare, education, and B2B categories — focusing on clear acquisition economics and repeatable creative frameworks.",
    achievements: [
      "Guided digital growth for 150+ consumer, D2C, and enterprise brands across paid and organic channels.",
      "Built structured creative testing workflows driving strong blended ROAS and lower cost per lead.",
      "Developed short-form content and performance media systems tailored to each brand’s market."
    ],
    skills: ["Growth Strategy", "Performance Paid Media", "Analytics & Attribution", "Creative Direction"]
  },
  shekha: {
    name: "Shikha Ma'am",
    title: "Co-Founder & Owner, The Brand Outreach",
    experience: "25+ Years in National Media & PR",
    badge: "TBO Co-Founder",
    brand: "tag-tbo",
    image: "./STAFF/shekha mam.png",
    focus: "Mainstream Media Relations, Corporate PR & Brand Reputation",
    bio: "With over 25 years of experience across national news agencies and corporate communications, Shikha Ma'am leads reputation management, mainstream media placement, and executive PR at The Brand Outreach. Her direct editorial relationships across television networks, print publications, and digital newsrooms help brands build lasting public credibility.",
    achievements: [
      "25+ years leading national PR initiatives and news agency collaborations across India.",
      "Secured editorial features and leadership interviews across tier-1 television, print, and digital media.",
      "Advised corporate leadership teams on reputation management and high-stakes crisis communications."
    ],
    skills: ["Tier-1 Media Relations", "Corporate PR", "Executive Profiling", "Crisis Communications"]
  },
  amit: {
    name: "Amit Sir",
    title: "Co-Founder & Owner, The Brand Outreach",
    experience: "25+ Years in Media & Corporate Marketing",
    badge: "TBO Co-Founder",
    brand: "tag-tbo",
    image: "./STAFF/amit sir.png",
    focus: "Enterprise Communications, Media Partnerships & Strategic Outreach",
    bio: "Amit Sir brings 25+ years of experience across national news agencies and corporate marketing. His work bridges institutional credibility with practical commercial outreach — helping enterprises, listed companies, and regional leaders communicate clearly across national and regional markets.",
    achievements: [
      "25+ years in national news agency editorial and commercial leadership.",
      "Led large-scale corporate communication mandates and multi-market outreach campaigns.",
      "Built long-standing media and corporate relationships spanning India and international markets."
    ],
    skills: ["Enterprise Outreach", "Public Affairs", "Media Strategy", "Commercial Partnerships"]
  },
  madhur: {
    name: "Madhur",
    title: "Director of Enterprise Sales & Strategic Partnerships",
    experience: "20+ Years in Corporate Sales",
    badge: "Enterprise Sales",
    brand: "tag-tbo",
    image: "./STAFF/madhur sir.png",
    focus: "Enterprise Account Management & Commercial Partnerships (incl. Livanto Green Infra)",
    bio: "With over 20 years in corporate sales and key account leadership, Madhur oversees enterprise client relationships — including Livanto Green Infra and industrial partners. He ensures marketing deliverables connect directly to commercial sales goals, pipeline conversion, and long-term partner value.",
    achievements: [
      "20+ years closing enterprise sales across clean-tech, FMCG, and commercial services.",
      "Leads strategic enterprise engagements including Livanto Green Infra.",
      "Aligns marketing lead funnels directly with B2B qualification and deal closing."
    ],
    skills: ["Enterprise Sales", "Livanto Green Account", "Pipeline Strategy", "Key Partnerships"]
  },
  aryaman: {
    name: "Aryaman",
    title: "Head of Operations & Client Point of Contact",
    experience: "Operations & Client Delivery Lead",
    badge: "Operations",
    brand: "tag-malingo",
    image: "./STAFF/aryaman.png",
    focus: "Client Communication, Sprint Delivery & Cross-Team Coordination",
    bio: "Aryaman leads day-to-day operations across Malingo and The Brand Outreach. As the dedicated point of contact for client teams, he keeps briefs clear, coordinates handoffs between design, video, media, and PR specialists, and ensures timelines and weekly reviews stay on schedule.",
    achievements: [
      "Maintains strong client retention and satisfaction across 60+ active brand engagements.",
      "Provides direct client responsiveness without layers of ticketing or slow handoffs.",
      "Oversees structured weekly review cycles and on-time deliverable tracking."
    ],
    skills: ["Client Operations", "Account Management", "Delivery Planning", "Cross-Team Coordination"]
  },
  mayank: {
    name: "Mayank",
    title: "Senior Sales & Growth Strategist",
    experience: "10+ Years in Sales & Strategy",
    badge: "Growth Strategy",
    brand: "tag-malingo",
    image: "./STAFF/mayank.png",
    focus: "Client Growth Roadmaps, Funnel Economics & Market Expansion",
    bio: "Mayank brings over 10 years of commercial sales and strategy experience to client onboarding and growth planning. He works closely with founders to identify conversion bottlenecks, define realistic growth milestones, and align acquisition channels with unit economics.",
    achievements: [
      "Onboarded and advised 80+ growing brands across consumer and B2B sectors.",
      "Co-developed Malingo’s 48-hour onboarding audit to pinpoint funnel and messaging gaps.",
      "Specializes in practical, commercially grounded customer acquisition roadmaps."
    ],
    skills: ["Strategic Sales", "Funnel Economics", "Onboarding Audits", "Market Expansion"]
  },
  dev: {
    name: "Dev",
    title: "Lead Video Editor & Motion Designer",
    experience: "8 Years in Post-Production",
    badge: "Video Production",
    brand: "tag-malingo",
    image: "./STAFF/dev.png",
    focus: "Short-Form Reels, Commercial Ad Editing & Motion Graphics",
    bio: "Dev brings 8 years of post-production experience across short-form social content, paid video ads, and brand films. Focused on clear pacing, strong opening hooks, and clean motion graphics, he turns raw footage into videos built to hold attention across Instagram, YouTube, and paid social feeds.",
    achievements: [
      "Edited 1,200+ reels, shorts, and paid performance video creatives for client brands.",
      "Consistently delivers high 3-second hook retention across Meta and YouTube ad campaigns.",
      "Specializes in kinetic typography, pacing structure, and polished commercial sound design."
    ],
    skills: ["DaVinci Resolve / Premiere", "After Effects Motion", "Retention Pacing", "Ad Video Editing"]
  },
  jeetu: {
    name: "Jeetu (Jitu)",
    title: "Creative Director & Lead Visual Designer",
    experience: "8+ Years in Brand & Packaging Design",
    badge: "Creative Direction",
    brand: "tag-malingo",
    image: "./STAFF/jeetu.png",
    focus: "Brand Identity Systems, Retail Packaging & High-CTR Ad Design",
    bio: "Jeetu leads visual direction across Malingo’s brand, packaging, outdoor, and digital design work. With over 8 years of experience, he pairs clean typography and strong shelf hierarchy with commercial clarity — crafting brand systems and ad suites tailored to each client’s industry.",
    achievements: [
      "Designed full brand identities and guideline systems for 40+ consumer and B2B brands.",
      "Created retail packaging spanning food, skincare, hardware, and agricultural products.",
      "Produces static ad creative systems engineered for clarity and strong click-through rates."
    ],
    skills: ["Creative Direction", "Brand Identity", "Packaging Design", "Performance Ad Graphics"]
  }
};

// --- Team Profile Modal (Semantic Theme-Safe Markup) ---
window.openStaffModal = function(staffKey) {
  const modalOverlay = document.getElementById('staff-modal-overlay');
  const modalContent = document.getElementById('staff-modal-body');
  const data = STAFF_DOSSIER[staffKey];
  if (!data || !modalOverlay || !modalContent) return;

  modalContent.innerHTML = `
    <div class="staff-modal-top">
      <div class="staff-modal-photo">
        <img src="${data.image}" alt="${data.name}">
      </div>
      <div class="staff-modal-intro">
        <div class="staff-modal-meta">
          <span class="staff-brand-tag ${data.brand}" style="position: static;">${data.badge}</span>
          <span class="staff-modal-exp">★ ${data.experience}</span>
        </div>
        <h2 class="staff-modal-name">${data.name}</h2>
        <p class="staff-modal-title">${data.title}</p>
        <div class="staff-modal-focus">
          <span class="staff-modal-focus-label">Core Focus</span>
          <strong class="staff-modal-focus-text">${data.focus}</strong>
        </div>
      </div>
    </div>

    <div class="staff-modal-section">
      <h4 class="staff-modal-heading">Background &amp; Role</h4>
      <p class="staff-modal-bio">${data.bio}</p>

      <h4 class="staff-modal-heading">Key Experience &amp; Highlights</h4>
      <ul class="staff-modal-list">
        ${data.achievements.map(a => `
          <li>
            <span class="staff-modal-check" aria-hidden="true">✓</span>
            <span>${a}</span>
          </li>
        `).join('')}
      </ul>

      <div class="staff-modal-skills">
        ${data.skills.map(s => `<span class="staff-modal-skill-pill">${s}</span>`).join('')}
      </div>

      <div class="staff-modal-cta-row">
        <a href="https://wa.me/message/EWQ6YJE2UQUHA1" target="_blank" rel="noopener noreferrer" class="btn-cta staff-modal-cta">
          <span>Connect With ${data.name.split(' ')[0]}’s Team</span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
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
    const openCard = () => {
      const staffKey = card.getAttribute('data-staff');
      if (staffKey) window.openStaffModal(staffKey);
    };
    card.addEventListener('click', openCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard();
      }
    });
  });

  function closeModal() {
    if (!modalOverlay.classList.contains('active')) return;
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

// --- Team Showcase (Interactive Cylindrical View + Responsive Grid View) ---
function initStaffWorksWheel() {
  const stageEl = document.getElementById('staff-wheel-stage');
  const pivotEl = document.getElementById('staff-wheel-pivot');
  const labelEl = document.getElementById('staff-wheel-label');
  const titleEl = document.getElementById('staff-wheel-title');
  const badgeEl = document.getElementById('staff-front-badge');
  const nameEl = document.getElementById('staff-front-name');
  const roleEl = document.getElementById('staff-front-role');
  const focusEl = document.getElementById('staff-front-superpower-text');
  const modalBtn = document.getElementById('staff-front-modal-btn');
  const indexEl = document.getElementById('staff-wheel-index');
  const btnViewWheel = document.getElementById('btn-view-wheel');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const wheelOuter = document.getElementById('staff-wheel-outer');
  const gridMain = document.getElementById('staff-grid-main');
  const instructionChip = document.getElementById('wheel-instruction-chip');

  const btnPrev = document.getElementById('btn-wheel-prev');
  const btnNext = document.getElementById('btn-wheel-next');
  const btnAuto = document.getElementById('btn-wheel-auto');
  const btnRing = document.getElementById('btn-wheel-ring');
  const iconPlay = document.getElementById('icon-wheel-play');
  const labelAuto = document.getElementById('label-wheel-auto');

  if (!stageEl || !pivotEl) return;

  function setView(mode) {
    const showWheel = mode === 'wheel';
    if (btnViewWheel) {
      btnViewWheel.classList.toggle('active', showWheel);
      btnViewWheel.setAttribute('aria-selected', showWheel ? 'true' : 'false');
    }
    if (btnViewGrid) {
      btnViewGrid.classList.toggle('active', !showWheel);
      btnViewGrid.setAttribute('aria-selected', !showWheel ? 'true' : 'false');
    }
    if (wheelOuter) wheelOuter.style.display = showWheel ? 'block' : 'none';
    if (gridMain) gridMain.style.display = showWheel ? 'none' : 'grid';
    if (instructionChip) instructionChip.style.visibility = showWheel ? 'visible' : 'hidden';
  }

  if (btnViewWheel && btnViewGrid && gridMain && wheelOuter) {
    btnViewWheel.addEventListener('click', () => setView('wheel'));
    btnViewGrid.addEventListener('click', () => {
      stopAutoTour();
      setView('grid');
    });

    // Default to clean responsive Grid on mobile screens so touch scrolling stays natural
    setView(window.innerWidth <= 768 ? 'grid' : 'wheel');
  }

  const memberKeys = ['kushagra', 'shekha', 'amit', 'madhur', 'aryaman', 'mayank', 'dev', 'jeetu'];
  const items = memberKeys.map(k => ({
    key: k,
    ...(STAFF_DOSSIER[k] || {})
  }));
  const count = items.length;
  const last = Math.max(count - 1, 0);

  const turn = { current: 1 };
  const target = { current: 1 };
  let activeIdx = -1;
  let isAutoPlaying = false;
  let autoPlayTimer = null;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (deg) => (deg * Math.PI) / 180;
  const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

  function to(next) {
    target.current = clamp(next, 0, last + 1);
  }

  function startAutoTour() {
    isAutoPlaying = true;
    if (btnAuto) btnAuto.classList.add('active');
    if (iconPlay) iconPlay.className = 'fa-solid fa-pause';
    if (labelAuto) labelAuto.textContent = 'Pause';
    if (target.current < 1) to(1);

    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      let next = Math.round(target.current) + 1;
      if (next > last + 1) next = 1;
      to(next);
    }, 3000);
  }

  function stopAutoTour() {
    if (!isAutoPlaying) return;
    isAutoPlaying = false;
    if (btnAuto) btnAuto.classList.remove('active');
    if (iconPlay) iconPlay.className = 'fa-solid fa-play';
    if (labelAuto) labelAuto.textContent = 'Auto-Play';
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }

  pivotEl.innerHTML = '';
  if (indexEl) indexEl.innerHTML = '';
  const cardNodes = [];
  const indexBtns = [];

  let dragMoved = 0;

  items.forEach((item, idx) => {
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
        <span>View Profile</span>
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </div>
    `;

    inner.appendChild(img);
    inner.appendChild(overlay);
    card.appendChild(inner);

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dragMoved > 8) return;
      stopAutoTour();
      if (activeIdx === idx && turn.current >= 0.8) {
        if (typeof window.openStaffModal === 'function') {
          window.openStaffModal(item.key);
        }
      } else {
        to(idx + 1);
      }
    });

    pivotEl.appendChild(card);
    cardNodes.push(card);

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
      });
      li.appendChild(btn);
      indexEl.appendChild(li);
      indexBtns.push(btn);
    }
  });

  if (modalBtn) {
    modalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentItem = items[activeIdx];
      if (currentItem && typeof window.openStaffModal === 'function') {
        window.openStaffModal(currentItem.key);
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      const cur = Math.round(target.current);
      const prev = cur <= 1 ? last + 1 : cur - 1;
      to(prev);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      const cur = Math.round(target.current);
      const next = cur >= last + 1 ? 1 : cur + 1;
      to(next);
    });
  }

  if (btnRing) {
    btnRing.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAutoTour();
      if (Math.round(target.current) === 0) {
        to(activeIdx >= 0 ? activeIdx + 1 : 1);
        btnRing.classList.remove('active');
      } else {
        to(0);
        btnRing.classList.add('active');
      }
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isAutoPlaying) stopAutoTour();
      else startAutoTour();
    });
  }

  const CARD_H = 0.44;
  const CARD_MAX_W = 0.38;
  const CARD_RATIO = 1.35;
  const STEP = 42;
  const DRUM = 2.22;
  const LENS = 2.7;
  const RING_R = 1.15;
  const BOW = 1.82;
  const EASE = 0.12;

  function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
    return (
      `translateX(${m * bowAt(drumDeg, bow)}px)` +
      ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
      ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
    );
  }

  let isDragging = false;
  let dragLastY = 0;
  let dragVelocity = 0;
  let lastDragTime = 0;

  stageEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input')) return;
    isDragging = true;
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
      let snap = target.current;
      if (Math.abs(dragVelocity) > 0.35) {
        snap += Math.sign(dragVelocity) * 0.6;
      }
      let finalTarget = Math.round(snap);
      if (finalTarget < 1) finalTarget = (target.current < 0.5) ? 0 : 1;
      if (finalTarget > last + 1) finalTarget = last + 1;
      to(finalTarget);
    }
  };

  stageEl.addEventListener('pointerup', onPointerEnd);
  stageEl.addEventListener('pointercancel', onPointerEnd);

  let lastWheelTime = 0;
  let settleTimeout = null;
  stageEl.addEventListener('wheel', (e) => {
    stopAutoTour();
    const now = performance.now();
    const isTrackpad = Math.abs(e.deltaY) < 30 && Math.abs(e.deltaY) % 1 !== 0;

    if ((e.deltaY > 0 && target.current < last + 1) || (e.deltaY < 0 && target.current > 1)) {
      e.preventDefault();
    }

    if (isTrackpad) {
      to(target.current + e.deltaY / 280);
      clearTimeout(settleTimeout);
      settleTimeout = setTimeout(() => {
        to(clamp(Math.round(target.current), 1, last + 1));
      }, 140);
    } else {
      e.preventDefault();
      if (now - lastWheelTime > 160) {
        lastWheelTime = now;
        const dir = e.deltaY > 0 ? 1 : -1;
        const currentTarget = Math.round(target.current);
        let nextTarget = currentTarget + dir;
        if (currentTarget === 0 && dir > 0) nextTarget = 1;
        if (nextTarget > last + 1) nextTarget = 1;
        if (nextTarget < 1) nextTarget = last + 1;
        to(nextTarget);
      }
    }
  }, { passive: false });

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

  function draw() {
    requestAnimationFrame(draw);
    if (wheelOuter && wheelOuter.style.display === 'none') return;

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

    const cardW = Math.min(stageH * CARD_H * CARD_RATIO, stageW * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1;
    const bow = cardH * BOW;
    const depth = cardH * LENS;

    stageEl.style.perspective = `${depth}px`;
    pivotEl.style.transform = `translateZ(${-m * drumR}px)`;

    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardNodes[i];
      if (card) {
        card.style.width = `${cardW}px`;
        card.style.height = `${cardH}px`;
        card.style.marginLeft = `${-cardW / 2}px`;
        card.style.marginTop = `${-cardH / 2}px`;
        card.style.transform = place(d * (360 / count), drumDeg, ringR, drumR, bow, m);

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

    if (labelEl) {
      labelEl.style.opacity = String(Math.max(0, 1 - m * 1.5));
      labelEl.style.pointerEvents = m < 0.3 ? 'auto' : 'none';
    }
    if (titleEl) {
      titleEl.style.opacity = String(Math.max(0, (m - 0.2) * 1.25));
      titleEl.style.pointerEvents = m > 0.5 ? 'auto' : 'none';
    }

    const near = clamp(Math.round(pos), 0, last);
    if (near !== activeIdx) {
      activeIdx = near;
      const currentItem = items[activeIdx];
      if (currentItem) {
        if (badgeEl) badgeEl.innerText = currentItem.badge || '';
        if (nameEl) nameEl.innerText = currentItem.name || '';
        if (roleEl) roleEl.innerText = currentItem.title || '';
        if (focusEl) focusEl.innerText = currentItem.focus || '';
      }
      indexBtns.forEach((btn, idx) => {
        if (btn && btn.classList) {
          btn.classList.toggle('active', idx === activeIdx);
        }
      });
    }
  }

  requestAnimationFrame(draw);
}

// --- Smooth Anchor Navigation ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- Case Studies Catalog ---
const CASE_STUDIES_DATA = {
  barwizard: {
    id: 'barwizard',
    discipline: 'PERFORMANCE MARKETING',
    categoryTag: 'BARTENDING EDUCATION · Q2 2026',
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
    metricsNote: 'Campaign performance for April–June 2026.',
    related: ['neofit', 'livanto'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / YouTube)'
  },
  neofit: {
    id: 'neofit',
    discipline: 'PERFORMANCE MARKETING',
    categoryTag: 'NUTRACEUTICALS · PAID ACQUISITION',
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
    metricsNote: 'Multi-platform campaign results across Instagram and Facebook.',
    related: ['livanto', 'barwizard'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / YouTube)'
  },
  livanto: {
    id: 'livanto',
    discipline: 'PERFORMANCE MARKETING',
    categoryTag: 'EV INFRASTRUCTURE · LEAD GENERATION',
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
    metricsNote: 'Lead generation performance for Livanto Green Infra.',
    related: ['neofit', 'barwizard'],
    goalOption: 'Performance Paid Ads Scaling (Meta / Google / YouTube)'
  },
  paytm: {
    id: 'paytm',
    discipline: 'SOCIAL MEDIA · CONTENT WRITING',
    categoryTag: 'FINTECH · CONTENT STRATEGY',
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
    opportunity: 'Strengthens feature clarity, service discovery, and consistent everyday brand recall across digital payment channels.',
    related: ['mufin', 'intrend'],
    goalOption: 'Full-Service Agency Retainer'
  },
  mufin: {
    id: 'mufin',
    discipline: 'SOCIAL MEDIA MARKETING',
    categoryTag: 'GREEN FINANCE · LISTED ENTERPRISE',
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
    goalOption: 'Full-Service Agency Retainer'
  },
  intrend: {
    id: 'intrend',
    discipline: 'SOCIAL MEDIA MARKETING',
    categoryTag: 'COSMETICS · SOCIAL MEDIA',
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
    goalOption: 'Short-Form Video & Reel Production'
  },
  colourvalley: {
    id: 'colourvalley',
    discipline: 'SOCIAL MEDIA MARKETING',
    categoryTag: 'PAINTS & COATINGS · SOCIAL MEDIA',
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
    goalOption: 'Full-Service Agency Retainer'
  },
  starfox: {
    id: 'starfox',
    discipline: 'BRANDING · SOCIAL MEDIA · OUTDOOR DESIGN',
    categoryTag: 'MEN’S APPAREL · 360° BRANDING',
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
    metricsNote: 'Integrated brand, outdoor, and digital mandate for Starfox Fashion.',
    related: ['malee', 'lytage'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  malee: {
    id: 'malee',
    discipline: 'BRAND IDENTITY · OUTDOOR DESIGN',
    categoryTag: 'GARDENING & ECO-LIVING · BRANDING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  lytage: {
    id: 'lytage',
    discipline: 'COMPLETE BRAND DESIGN · OUTDOOR DESIGN',
    categoryTag: 'CONSUMER ELECTRONICS · BRANDING',
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
    opportunity: 'Gives Lytage a consistent visual foundation that accelerates product launches and retail trust.',
    related: ['starfox', 'malee'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  california: {
    id: 'california',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'FOOD & RETAIL · PACKAGING',
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
    workSummary: 'Retail pouch packaging design created for high-visibility modern trade and kirana shelves.',
    opportunity: 'Wins the crucial three-second shelf decision through clear hierarchy and premium freshness cues.',
    related: ['godesi', 'mithai'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  godesi: {
    id: 'godesi',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'FMCG SNACKS · PACKAGING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  mithai: {
    id: 'mithai',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'FOOD SERVICE · PACKAGING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  veghouse: {
    id: 'veghouse',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'RESTAURANTS & QSR · PACKAGING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  jovees: {
    id: 'jovees',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'SKINCARE · PACKAGING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  pulp: {
    id: 'pulp',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'PERSONAL CARE · PACKAGING',
    title: 'Pulp',
    meta: 'Skincare & Personal Care · Coffee & Love Scrub',
    lead: 'Pulp Coffee & Love breaks away from predictable clinical skincare whites with a bold dark matte pouch and high-contrast pink graphic typography.',
    scope: 'D2C skincare spout-pouch packaging design for Pulp Coffee & Cacao Scrub.',
    asset: './CASE_STUDIES/pack_pulp.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'Modern D2C skincare lives equally on retail shelves and social feeds. Pulp needed a distinct visual code that stood out immediately against minimalist pastel competitors.',
    steps: [
      { no: '01', title: 'Build a category-breaking visual code', text: 'Pair a deep matte dark pouch with bold pink typography for instant visual contrast.' },
      { no: '02', title: 'Fuse name and ingredients', text: 'Make Coffee & Love and the coffee-and-cacao scrub benefit part of one memorable story.' },
      { no: '03', title: 'Design a scalable brand asset', text: 'Create a distinctive pouch template ready to extend across future Pulp SKUs.' }
    ],
    workSummary: 'Distinctive pouch packaging design for Pulp Coffee & Cacao Scrub.',
    opportunity: 'Drives instant social shareability, unboxing appeal, and clear brand differentiation.',
    related: ['jovees', 'godesi'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  bharat: {
    id: 'bharat',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'AGRISCIENCE · PACKAGING',
    title: 'Bharat Certis',
    meta: 'Agriculture & Crop Care · Vestar (Paclobutrazole 40% SC)',
    lead: 'For Bharat Certis, Malingo designed packaging for Vestar, a Paclobutrazole 40% SC plant growth regulator engineered for crisp technical clarity across rural and dealer distribution.',
    scope: 'Technical agri-science product packaging design for Vestar.',
    asset: './CASE_STUDIES/pack_bharat.webp',
    sectionHeading: 'What the product needs its pack to say.',
    challenge: 'In crop protection and agriculture, clarity prevents costly misuse. Dealers and farmers need the product name, active formulation, and category unmistakable at a glance.',
    steps: [
      { no: '01', title: 'Prioritise technical legibility', text: 'Present Vestar and Paclobutrazole 40% SC with zero visual ambiguity.' },
      { no: '02', title: 'Structure information hierarchy', text: 'Position the plant growth regulator classification cleanly for rapid counter reference.' },
      { no: '03', title: 'Build durable shelf recognition', text: 'Frame the pack with a distinct visual structure that reinforces brand trust.' }
    ],
    workSummary: 'Specialist agricultural packaging design for Bharat Certis AgriScience’s Vestar formulation.',
    opportunity: 'Improves dealer recall and buyer confidence across pan-India rural and regional agri-markets.',
    related: ['dyazo', 'incase'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  dyazo: {
    id: 'dyazo',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'HARDWARE · PACKAGING',
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
    opportunity: 'Strengthens visual impact on marketplaces and immediate comprehension on retail shelves.',
    related: ['incase', 'bharat'],
    goalOption: 'Brand Identity, Packaging & Creative Design'
  },
  incase: {
    id: 'incase',
    discipline: 'PACKAGING DESIGN',
    categoryTag: 'B2B PROPOSITION · PACKAGING',
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
    goalOption: 'Brand Identity, Packaging & Creative Design'
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
    if (lbCaption) lbCaption.textContent = caption || 'Malingo × The Brand Outreach';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
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
    modalDiscipline.textContent = `CASE STUDY  /  ${cs.discipline}`;

    const stepsHtml = (cs.steps || []).map((s) => `
      <article class="case-modal-step">
        <span>${s.no}</span>
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </article>
    `).join('');

    const metricsHtml = cs.metrics && cs.metrics.length ? `
      <div class="case-modal-metrics-box">
        <div class="case-modal-kicker" style="margin-bottom: 0;">CAMPAIGN PERFORMANCE</div>
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
          <div class="case-modal-kicker">${cs.categoryTag || cs.discipline}</div>
          <h2 id="case-modal-title">${cs.title}</h2>
          <div class="case-modal-sector">${cs.meta}</div>
          <p class="case-modal-lead">${cs.lead}</p>
          <div class="case-modal-scope">
            <span>SCOPE OF WORK</span>
            <p>${cs.scope}</p>
          </div>
        </div>
        <div class="case-modal-hero-visual" id="case-hero-zoom-trigger">
          <img src="${cs.asset}" alt="${cs.title} campaign artwork">
        </div>
      </div>

      <div class="case-modal-body">
        <div class="case-modal-section-head">
          <div class="case-modal-kicker">APPROACH &amp; STRATEGY</div>
          <h3>${cs.sectionHeading}</h3>
          <p>${cs.challenge}</p>
        </div>

        <div class="case-modal-steps">${stepsHtml}</div>

        ${metricsHtml}

        <div class="case-modal-duo">
          <article class="case-modal-card">
            <span>DELIVERABLES</span>
            <h4>What We Executed</h4>
            <p>${cs.workSummary}</p>
          </article>
          <article class="case-modal-card highlight">
            <span>BUSINESS IMPACT</span>
            <h4>Why It Mattered</h4>
            <p>${cs.opportunity}</p>
          </article>
        </div>

        ${relatedHtml ? `
          <div class="case-modal-related">
            <div class="case-modal-kicker" style="margin-bottom: 0;">KEEP EXPLORING</div>
            <h4>More Client Case Studies</h4>
            <div class="case-modal-related-links">${relatedHtml}</div>
          </div>
        ` : ''}

        <div class="case-modal-footer">
          <button type="button" class="btn-cta" id="case-cta-contact">
            <span>Discuss a Similar Project</span>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
          <button type="button" class="case-modal-close" id="case-footer-close">Back to Case Studies ↑</button>
        </div>
      </div>
    `;

    modalScroll.scrollTop = 0;

    const heroZoom = document.getElementById('case-hero-zoom-trigger');
    if (heroZoom) {
      heroZoom.addEventListener('click', () => openLightbox(cs.asset, `${cs.title} · ${cs.discipline}`));
    }

    modalScroll.querySelectorAll('[data-case-open-inline]').forEach((b) => {
      b.addEventListener('click', () => openCaseModal(b.getAttribute('data-case-open-inline'), true));
    });

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

// --- Privacy Policy & Terms Modal ---
function initLegalModal() {
  const overlay = document.getElementById('legal-modal-overlay');
  const body = document.getElementById('legal-modal-body');
  const closeBtn = document.getElementById('legal-close-btn');
  if (!overlay || !body) return;

  const LEGAL_DOCS = {
    privacy: {
      kicker: 'PRIVACY & CONFIDENTIALITY',
      title: 'Privacy Policy',
      paragraphs: [
        'Malingo and The Brand Outreach respect your privacy. Information submitted through our contact form (name, company, email or phone number, and project details) is used solely to review your inquiry and communicate with you about potential services.',
        'Form inquiries are routed securely to our official desks at kushagra@malingo.in and info@thebrandoutreach.in. We never sell, rent, or distribute client contact data to third parties.',
        'All brand documents, ad account insights, and campaign briefs shared during consultations or audits are treated as strictly confidential, and a formal Non-Disclosure Agreement (NDA) is available prior to any account review.',
        'To request removal or updates to any information you have shared with us, email kushagra@malingo.in or info@thebrandoutreach.in.'
      ]
    },
    terms: {
      kicker: 'AGENCY TERMS',
      title: 'Terms of Service',
      paragraphs: [
        'All creative work, case study snapshots, and company profiles displayed on malingo.in are presented for informational and portfolio purposes by Malingo in collaboration with The Brand Outreach.',
        'Client logos and campaign trademarks remain the property of their respective owners. Campaign metrics reflect specific historical engagements and are not a guarantee of identical outcomes across different markets or budgets.',
        'All active client engagements are governed by a separate written scope of work, timeline, and commercial agreement signed by both parties prior to project commencement.'
      ]
    }
  };

  function openLegal(key) {
    const doc = LEGAL_DOCS[key];
    if (!doc) return;
    body.innerHTML = `
      <span class="legal-modal-kicker">${doc.kicker}</span>
      <h2 id="legal-modal-title" class="legal-modal-title">${doc.title}</h2>
      <div class="legal-modal-copy">
        ${doc.paragraphs.map(p => `<p>${p}</p>`).join('')}
      </div>
    `;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLegal() {
    if (!overlay.classList.contains('active')) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-legal-open]').forEach((btn) => {
    btn.addEventListener('click', () => openLegal(btn.getAttribute('data-legal-open')));
  });

  closeBtn?.addEventListener('click', closeLegal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLegal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLegal();
  });
}

// --- Form Submission (Email Dispatch to Malingo & TBO via Netlify Forms) ---
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

      if (btn) {
        btn.innerHTML = '✓ Sent to Malingo &amp; TBO Desks';
        btn.style.background = '#10B981';
        btn.style.borderColor = '#34D399';
      }

      if (statusEl) {
        statusEl.className = 'form-status-msg is-success';
        statusEl.innerHTML = '<strong>Thank you!</strong> Your brief has been emailed to <strong>kushagra@malingo.in</strong> &amp; <strong>info@thebrandoutreach.in</strong>. Our operations team will connect shortly.';
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
        `Name / Company: ${nameVal}\nEmail / WhatsApp: ${contactVal}\nPrimary Focus: ${goalVal}\n\nBrand & Goals:\n${detailsVal}`
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

// --- Light / Dark Theme Switcher ---
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const labelEl = document.getElementById('theme-label');
  const root = document.documentElement;

  function updateUI(isLight) {
    if (labelEl) labelEl.textContent = isLight ? 'LIGHT' : 'DARK';
    if (toggleBtn) {
      toggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
      toggleBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    }
  }

  updateUI(root.classList.contains('light-theme'));
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isNowLight = root.classList.toggle('light-theme');
    try {
      localStorage.setItem('malingo_theme', isNowLight ? 'light' : 'dark');
    } catch (err) {}
    updateUI(isNowLight);
  });
}

// --- DOM Ready Initializer ---
function initAllModules() {
  const initializers = [
    ['ThemeSwitcher', initThemeSwitcher],
    ['MobileMenu', initMobileMenu],
    ['CustomCursor', initCustomCursor],
    ['ThreeScene', initThreeScene],
    ['3DTiltCards', init3DTiltCards],
    ['AnimatedCounters', initAnimatedCounters],
    ['StaffModal', initStaffModal],
    ['StaffWorksWheel', initStaffWorksWheel],
    ['SmoothScroll', initSmoothScroll],
    ['ContactForm', initContactForm],
    ['PortfolioFilters', initPortfolioFilters],
    ['CaseStudiesAndLightbox', initCaseStudiesAndLightbox],
    ['LegalModal', initLegalModal]
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
