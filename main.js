import data from './data.json';

class CodeBackground {
  constructor(data) {
    this.data = data;
    this.bgPre = document.getElementById('bg-pre');
    this.bgCode = document.getElementById('bg-code');
    this.lineMap = {}; 
    this.codeString = this.generateCodeString();
    
    this.highlightDiv = document.createElement('div');
    this.highlightDiv.className = 'bg-highlight';
    
    this.bgCode.textContent = this.codeString;
    this.bgPre.appendChild(this.highlightDiv);
    
    if (window.Prism) {
      window.Prism.highlightElement(this.bgCode);
    }
  }

  generateCodeString() {
    let lines = [];
    let lineIdx = 1;
    const addLine = (text, key = null) => {
      lines.push(text);
      if (key) this.lineMap[key] = lineIdx;
      lineIdx++;
    };

    addLine(`/**`);
    addLine(` * PORTFOLIO CONFIGURATION`);
    addLine(` * Dynamic runtime binding`);
    addLine(` */`);
    addLine(`import { Application } from '@core';`);
    addLine(`import { BlueNeonTheme } from '@themes';`);
    addLine(``);
    addLine(`// Interactive User State`);
    addLine(`const portfolioState = {`, "main");
    addLine(`  identity: {`);
    addLine(`    name: "${this.data.name}",`, "name");
    addLine(`    title: "${this.data.title}",`, "title");
    if (this.data.about) {
      addLine(`    about: \`${this.data.about}\`,`, "about");
    }
    addLine(`  },`);
    addLine(`  capabilities: [`, "skills");
    this.data.skills.forEach((skill, i) => addLine(`    "${skill}",`, `skill-${i}`));
    addLine(`  ],`);
    addLine(`  tools: [`, "tools");
    this.data.tools.forEach((tool, i) => addLine(`    "${tool.name}",`, `tool-${i}`));
    addLine(`  ],`);
    addLine(`  caseStudies: [`, "projects");
    this.data.projects.forEach((proj, idx) => {
      addLine(`    {`, `project-${idx}`);
      addLine(`      title: "${proj.title}",`);
      addLine(`      description: "${proj.description}",`);
      addLine(`    },`);
    });
    addLine(`  ],`);
    addLine(`  timeline: [`, "experience");
    this.data.experience.forEach((exp, idx) => {
      addLine(`    {`, `exp-${idx}`);
      addLine(`      role: "${exp.role}",`);
      addLine(`      company: "${exp.company}",`);
      addLine(`      duration: "${exp.duration}",`);
      addLine(`    },`);
    });
    addLine(`  ]`);
    addLine(`};`);
    addLine(``);
    addLine(`const app = new Application({`);
    addLine(`  state: portfolioState,`);
    addLine(`  theme: BlueNeonTheme,`);
    addLine(`  hardwareAcceleration: true`);
    addLine(`});`);
    addLine(``);
    addLine(`app.render();`);
    
    return lines.join('\n');
  }

  focus(key) {
    if (!key || !this.lineMap[key]) {
      this.bgPre.style.transform = `translateY(0px) scale(1)`;
      this.highlightDiv.style.opacity = 0;
      return;
    }
    
    const targetLine = this.lineMap[key];
    const lineHeight = 22.4; 
    const paddingTop = 40; 
    const actualTargetY = (targetLine - 1) * lineHeight;
    const highlightBoxY = paddingTop + actualTargetY;
    
    this.highlightDiv.style.top = `${highlightBoxY}px`;
    this.highlightDiv.style.opacity = 1;

    const centerY = window.innerHeight / 2;
    const dy = centerY - highlightBoxY;
    const rndRotate = (Math.random() - 0.5) * 1.0;
    
    // Using translate3d to explicitly invoke GPU hardware acceleration and skip layout repaints
    this.bgPre.style.transform = `translate3d(0, ${dy}px, 0) scale(1.6) rotate(${rndRotate}deg) translateX(50px)`;
  }
}

// FLIP Animation logic
function toggleSectionFocus(clickedEl) {
  const app = document.getElementById('app');
  const sections = Array.from(document.querySelectorAll('.section-glass'));
  
  // 1. FIRST: Cache all current geometry
  const firstRects = new Map();
  sections.forEach(sec => firstRects.set(sec, sec.getBoundingClientRect()));
  
  // Determine if we are opening or closing the clicked element
  const wasFocused = clickedEl.classList.contains('focused');
  
  // 2. TOGGLE CLASSES 
  sections.forEach(sec => sec.classList.remove('focused'));
  if (!wasFocused) {
    app.classList.add('has-focus');
    clickedEl.classList.add('focused');
  } else {
    app.classList.remove('has-focus');
  }
  
  // 3. LAST: Cache target geometry after layout reflow
  const lastRects = new Map();
  sections.forEach(sec => lastRects.set(sec, sec.getBoundingClientRect()));
  
  // 4. INVERT & PLAY: Animate the diff
  sections.forEach(sec => {
    const first = firstRects.get(sec);
    const last = lastRects.get(sec);
    
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    
    // Invert Phase: We remove normal transitions so we can snap back to the start instantly
    sec.style.transition = 'none';
    sec.style.transform = `translate(${dx}px, ${dy}px)`;
    sec.style.width = `${first.width}px`;
    sec.style.height = `${first.height}px`;
    
    // Force browser repaint to lock in the non-transitioned inverted state
    requestAnimationFrame(() => {
      // Play Phase: Turn on transition and remove inverted styles so it glides to its native new destination
      sec.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.4, 1), width 0.6s cubic-bezier(0.25, 1, 0.4, 1), height 0.6s cubic-bezier(0.25, 1, 0.4, 1), padding 0.6s ease';
      sec.style.transform = 'translate(0, 0)';
      sec.style.width = `${last.width}px`;
      sec.style.height = `${last.height}px`;
      
      // Cleanup inline properties after animation finishes (0.6s default + small buffer)
      setTimeout(() => {
        sec.style.transition = '';
        sec.style.transform = '';
        sec.style.width = '';
        sec.style.height = '';
      }, 650);
    });
  });
}

// MAIN SETUP
function init() {
  const bgEditor = new CodeBackground(data);
  const app = document.getElementById('app');
  
  // Column wrapper layout to support sticky sidebar and smooth FLIP via display:contents
  app.innerHTML = `
    <!-- Top Row for Columns -->
    <div class="columns-wrapper">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Hero / Name Section -->
        <div class="section-glass interactive-section section-name" data-target="name" style="position: relative;">
          <div class="collapsed-title">👋 Profile</div>
          <div class="inner-content">
            <h1 class="hero-title">${data.name}</h1>
          <div class="hero-subtitle interactive-section" style="padding:0; margin-bottom:1rem; border:none; background:none; box-shadow:none" data-target="title">${data.title}</div>
          
          ${data.about ? `<div class="hero-about interactive-section" style="padding:0; margin-bottom:2rem; border:none; background:none; box-shadow:none" data-target="about">${data.about}</div>` : ''}

          <div class="hero-actions" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: flex-start;">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=${data.email}&su=We%20want%20to%20hire%20you!&body=Hi%2C%0A%0AWe%20are%20very%20impressed%20by%20your%20portfolio!%20%0A%0AWe'd%20love%20to%20chat%20further." target="_blank" class="clickbait-btn" rel="noopener noreferrer">
              Hire Me 🚀
            </a>
            <div class="social-links" style="margin: 0; padding-bottom: 2rem;">
              ${data.socials.map(s => `<a href="${s.url}" class="social-link" target="_blank">${s.name}</a>`).join('')}
              ${data.resumeLink ? `<a href="${data.resumeLink}" class="social-link" target="_blank" rel="noopener noreferrer">📄 Resume</a>` : ''}
            </div>
          </div>
        </div>
        </div>
      

    </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Projects Section -->
        <div class="section-glass interactive-section section-projects" data-target="projects">
          <div class="collapsed-title">🚀 Case Studies</div>
          <div class="inner-content">
            <h2 class="section-title">Case Studies</h2>
            ${data.projects.map((proj, idx) => `
              <div class="interactive-card case-study-card" data-target="project-${idx}">
                <div class="card-header-flex">
                  <h3 class="card-title">${proj.title}</h3>
                  ${proj.content ? `<span class="expand-icon">+</span>` : ''}
                </div>
                <p class="card-desc">${proj.description}</p>
                ${proj.link ? `<a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="project-link" style="display: inline-block; margin-top: 0.5rem; color: var(--accent-secondary); text-decoration: none; font-weight: 600; font-size: 0.85rem; letter-spacing: 0.5px;">View ↗</a>` : ''}
                ${proj.content ? `<div class="card-detailed-content">${proj.content}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Experience Section -->
        <div class="section-glass interactive-section section-experience" data-target="experience">
          <div class="collapsed-title">⏳ Timeline</div>
          <div class="inner-content">
            <h2 class="section-title">Timeline</h2>
            <p style="color: var(--accent-color); font-style: italic; font-weight: 500; font-size: 0.95rem; margin-bottom: 1.5rem; text-align: center; opacity: 0.9; padding: 0.5rem; background: rgba(0, 210, 255, 0.03); border-radius: 8px; border: 1px dashed rgba(0, 210, 255, 0.2);">
              If you are a recruiter, this is your chance to get your firm's name here!!!
            </p>
            ${data.experience.map((exp, idx) => `
              <div class="interactive-card" data-target="exp-${idx}">
                <h3 class="card-title">${exp.role}</h3>
                <div class="card-meta">${exp.company} • ${exp.duration}</div>
                <p class="card-desc">${exp.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div> <!-- Close columns-wrapper -->

    <!-- Horizontal Capabilities Section -->
    <div class="section-glass interactive-section section-skills" data-target="skills" style="width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center;">
      <div class="collapsed-title">⚡ Capabilities</div>
      <div class="inner-content" style="width: 100%;">
        <h2 class="section-title centered-title" style="justify-content: center; text-align: center;">Capabilities</h2>
        <div class="tags-container" style="justify-content: center;">
          ${data.skills.map((skill, i) => `<span class="tag" data-target-sub="skill-${i}">${skill}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- Horizontal Tools Section -->
    <div class="section-glass interactive-section section-tools" data-target="tools" style="width: 100%;">
      <div class="collapsed-title">🛠️ Toolset Hub</div>
      <div class="inner-content">
        <h2 class="section-title">Ecosystem & Platforms</h2>
        <div class="skills-grid">
          ${data.tools.map((tool, i) => `
            <div class="skill-item" data-target-sub="tool-${i}">
              <img src="${tool.icon.includes('.') || tool.icon.includes('/') ? tool.icon : `https://skillicons.dev/icons?i=${tool.icon}`}" alt="${tool.name}" />
              <span>${tool.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach Hover handlers for code zooming
  const interactives = document.querySelectorAll('.interactive-section, .interactive-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      bgEditor.focus(el.getAttribute('data-target'));
    });
    
    el.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      bgEditor.focus(null);
    });
  });

  const subInteractives = document.querySelectorAll('[data-target-sub]');
  subInteractives.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      bgEditor.focus(el.getAttribute('data-target-sub'));
    });
    
    el.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      const parent = el.closest('[data-target]');
      if (parent) bgEditor.focus(parent.getAttribute('data-target'));
      else bgEditor.focus(null);
    });
  });
  
  // Attach Click handler for document background to reset layout
  document.addEventListener('click', (e) => {
    if (app.classList.contains('has-focus') && !e.target.closest('.section-glass')) {
      const active = document.querySelector('.section-glass.focused');
      if (active) toggleSectionFocus(active);
    }
  });
  
  // Attach Click handlers for FLIP state layout transitions
  const sections = document.querySelectorAll('.section-glass');
  sections.forEach(sec => {
    sec.addEventListener('click', (e) => {
      // Avoid triggering if we click deeply on interactive sub-elements
      if (e.target.closest('a')) return; 
      
      toggleSectionFocus(sec);
    });
  });

  // Attach internal click handlers for independent card expansions
  const caseStudyCards = document.querySelectorAll('.case-study-card');
  caseStudyCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!app.classList.contains('has-focus')) return;
      if (e.target.closest('a')) return;

      // If the card has detailed content available
      if (card.querySelector('.card-detailed-content')) {
        e.stopPropagation(); // prevent outer FLIP layout flip
        
        // If we're newly expanding this card, strictly collapse any others to maintain view focus
        if (!card.classList.contains('expanded')) {
          caseStudyCards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              const otherIcon = otherCard.querySelector('.expand-icon');
              if (otherIcon) otherIcon.textContent = '+';
            }
          });
        }
        
        card.classList.toggle('expanded');
        
        // Update the Plus/Minus icon intelligently
        const icon = card.querySelector('.expand-icon');
        if(icon) {
          icon.textContent = card.classList.contains('expanded') ? '−' : '+';
        }
      }
    });
  });

  // Attach Scroll Observer for fluid "Flowing" Reveal
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('flow-visible');
        entry.target.classList.remove('flow-hidden');
      } else {
        entry.target.classList.add('flow-hidden');
        entry.target.classList.remove('flow-visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach((sec) => {
    sec.classList.add('flow-hidden');
    scrollObserver.observe(sec);
  });
}

init();
