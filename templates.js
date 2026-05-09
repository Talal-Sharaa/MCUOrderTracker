/**
 * TEMPLATES (HTML GENERATION)
 */

const seqFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 3, useGrouping: false });
const valFormatter = new Intl.NumberFormat();
const pctFormatter = new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' });

const ICONS = {
  movie: '<svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  series: '<svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  calendar: '<svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  skip: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  warning: '<svg class="icon-xs" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
};

const Templates = {
  getPoster(title, type, posterPath) {
    const initials = title.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const hash = title.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const h = Math.abs(hash % 360);
    const s = 40 + (Math.abs(hash % 20));
    const l = 30 + (Math.abs(hash % 20));
    
    const imgHtml = posterPath 
      ? `<img src="https://image.tmdb.org/t/p/w154${posterPath}" alt="" class="poster-img" width="60" height="90" loading="lazy" onerror="this.style.display='none'">` 
      : '';

    return `
      <div class="entry-poster" aria-hidden="true" style="background: linear-gradient(135deg, hsl(${h}, ${s}%, ${l}%), hsl(${(h+40)%360}, ${s}%, ${l-10}%))">
        ${imgHtml}
        <span class="poster-initials">${initials}</span>
      </div>
    `;
  },

  entryRow(entry, idx) {
    const parent = PARENTS[entry.parentKey];
    const status = Store.state.statuses[entry.parentKey] || null;
    const type = parent?.type || "movie";
    const typeCfg = TYPE_CONFIG[type];
    const statusCfg = status ? STATUS_CONFIG[status] : null;
    const isOpen = Store.state.openId === entry.id;

    const typeIcon = type === "movie" ? ICONS.movie : ICONS.series;
    const statusLabel = statusCfg ? statusCfg.label : "Untracked";
    
    return `
      <li class="entry-item">
        <button class="entry-row ${status === 'skip' ? 'is-skipped' : ''}" 
                data-id="${entry.id}" 
                data-parent="${entry.parentKey}"
                data-action="toggle-dropdown"
                aria-label="${entry.title}. Current status: ${statusLabel}. Click to change status."
                aria-haspopup="listbox" 
                aria-expanded="${isOpen}" 
                aria-controls="dropdown-${entry.id}"
                style="--index: ${idx % 20}">
          <div class="seq-num">${seqFormatter.format(idx + 1)}</div>
          
          ${this.getPoster(entry.title, type, parent?.poster)}

          <div class="content">
            <h3 class="title">${entry.title}</h3>
            <div class="meta-row">
              ${entry.sub ? `<div class="meta-item">${typeIcon} ${entry.sub}</div>` : ""}
              ${entry.releaseDate ? `<div class="meta-item">${ICONS.calendar} ${dateFormatter.format(new Date(entry.releaseDate))}${entry.releaseNote ? ` · ${entry.releaseNote}` : ""}</div>` : ""}
              ${parent?.runtime ? `<div class="meta-item"><svg class="icon-sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${parent.runtime}</div>` : ""}
            </div>
            ${entry.note ? `<div class="note-txt" role="status"><span style="display: flex; align-items: center; width: 14px; height: 14px">${ICONS.warning}</span> ${entry.note}</div>` : ""}
          </div>

          <div class="type-badge" style="color: var(--type-${type}); border-color: color-mix(in srgb, var(--type-${type}), transparent calc(100% - (var(--badge-border-opacity) * 100%))); background: color-mix(in srgb, var(--type-${type}), transparent calc(100% - (var(--badge-bg-opacity) * 100%)))">
            ${typeCfg.label}
          </div>

          <div class="status-wrap">
            <div class="status-btn-proxy" 
                 style="${status ? `color: var(--status-${status}); border-color: color-mix(in srgb, var(--status-${status}), transparent calc(100% - (var(--badge-border-opacity) * 100%))); background: color-mix(in srgb, var(--status-${status}), transparent calc(100% - (var(--badge-bg-opacity) * 100%)))` : ''}">
              <span class="status-indicator" style="${status ? `background: var(--status-${status})` : ''}"></span>
              <span>${statusCfg ? statusCfg.label : "Set Status"}</span>
              <svg class="chevron" width="14" height="14" style="margin-left: 6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><g><path d="m6 9 6 6 6-6"/></g></svg>
            </div>
          </div>
        </button>
        ${isOpen ? this.dropdown(entry.id, parent, status) : ""}
      </li>
    `;
  },

  getStatusIcon(status) {
    if (status === 'watched') return ICONS.check;
    if (status === 'watching') return ICONS.play;
    if (status === 'will-watch') return ICONS.clock;
    if (status === 'skip') return ICONS.skip;
    return "";
  },

  dropdown(id, parent, current) {
    const options = Object.entries(STATUS_CONFIG)
      .map(([key, cfg]) => {
        const isActive = current === key;
        const icon = this.getStatusIcon(key);
        return `
        <button class="dropdown-option ${isActive ? 'active' : ''}" data-action="set-status" data-status="${key}" role="option" aria-selected="${isActive}"
                style="${isActive ? `color: var(--status-${key}); background: color-mix(in srgb, var(--status-${key}), transparent calc(100% - (var(--badge-bg-opacity) * 100%)))` : ''}">
          <span style="width:18px; height:18px; display:flex; align-items:center; color: var(--status-${key})" aria-hidden="true">${icon}</span>
          <span style="font-weight: ${isActive ? '700' : '500'}">${cfg.label}</span>
          ${isActive ? `<span class="active-check" aria-hidden="true">${ICONS.check}</span>` : ""}
        </button>
      `;
      })
      .join("");

    const clearBtn = current ? `
      <div style="height: 1px; background: var(--border-default); margin: 6px 8px"></div>
      <button class="dropdown-option" data-action="clear-status" role="option" style="color: var(--accent-red)">
        <span style="width:18px; height:18px; display:flex; align-items:center" aria-hidden="true">${ICONS.skip}</span>
        <span style="font-weight: 600">Clear Tracking</span>
      </button>
    ` : "";

    const links = `
      <div style="height: 1px; background: var(--border-default); margin: 6px 8px"></div>
      <div class="dropdown-links">
        <a href="${parent?.imdb || `https://www.imdb.com/find?q=${encodeURIComponent(parent?.title || '')}`}" target="_blank" class="dropdown-link imdb">View on IMDb</a>
      </div>
    `;

    return `
      <div class="dropdown open" id="dropdown-${id}" role="listbox">
        ${options}
        ${clearBtn}
        ${links}
      </div>
    `;
  },

  groupHeader(phaseId) {
    const phase = PHASE_CONFIG[phaseId];
    if (!phase) return "";
    const saga = phase.saga ? SAGA_CONFIG[phase.saga] : null;

    return `
      <li class="group-header" data-phase="${phaseId}" style="${saga ? `--saga-color: ${saga.color}` : ""}">
        <div class="group-header-content">
          ${saga ? `<div class="saga-label">${saga.title}</div>` : ""}
          <h2 class="phase-title">${phase.title}</h2>
        </div>
        <div class="group-divider"></div>
      </li>
    `;
  },

  stats(stats) {
    return `
      <div class="stat-card" style="--index: 1">
        <span class="stat-label">Watched</span>
        <span class="stat-value" style="color: var(--status-watched)">${valFormatter.format(stats.watched)}</span>
      </div>
      <div class="stat-card" style="--index: 2">
        <span class="stat-label">Watching</span>
        <span class="stat-value" style="color: var(--status-watching)">${valFormatter.format(stats.watching)}</span>
      </div>
      <div class="stat-card" style="--index: 3">
        <span class="stat-label">Remaining</span>
        <span class="stat-value" style="color: var(--text-muted)">${valFormatter.format(stats.total - stats.watched)}</span>
      </div>
      <div class="progress-container" aria-live="polite" style="--index: 4; animation: slide-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards; animation-delay: 0.2s">
        <div style="display: flex; justify-content: space-between; align-items: flex-end">
          <span class="stat-label">Overall Progress</span>
          <span class="stat-value" style="font-size: 1.5rem; color: var(--accent-secondary)">${pctFormatter.format(stats.pct / 100)}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="transform: scaleX(${stats.pct / 100})"></div>
        </div>
      </div>
    `;
  },

  emptyState() {
    return `
      <div class="empty-state">
        <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5">🔭</div>
        <h2 style="font-family: var(--font-display); font-size: 3rem; letter-spacing: 0.05em; margin: 0; background: linear-gradient(to bottom, #fff, var(--text-dim)); -webkit-background-clip: text; color: transparent;">Lost in the Multiverse</h2>
        <div style="font-family: var(--font-main); font-size: 1.1rem; color: var(--text-muted); margin-top: 1rem; margin-bottom: 2rem; max-width: 400px; margin-left: auto; margin-right: auto">
          We couldn’t find any titles matching your search. Try adjusting your coordinates.
        </div>
        <button id="clear-all-filters" class="toggle-btn active" style="font-family: var(--font-main); font-size: 0.95rem; padding: 0 2rem; height: 48px; border-radius: var(--radius-md)">
          Reset Multiverse Filters
        </button>
      </div>
    `;
  },

  themeDropdown() {
    const current = Store.state.theme;
    const options = Object.entries(THEMES)
      .map(([key, cfg]) => {
        const isActive = current === key;
        return `
        <button class="theme-option ${isActive ? 'active' : ''}" data-action="set-theme" data-theme="${key}" role="option" aria-selected="${isActive}">
          <div class="theme-swatch" style="--swatch-primary: ${cfg.color}; --swatch-secondary: ${cfg.secondary}">
             <div class="swatch-inner"></div>
          </div>
          <div class="theme-meta">
            <span class="theme-label">${cfg.label}</span>
            <span class="theme-desc">${cfg.desc}</span>
          </div>
          ${isActive ? `<span class="active-check">${ICONS.check}</span>` : ""}
        </button>
      `;
      })
      .join("");

    return `
      <div class="dropdown theme-dropdown open" id="theme-dropdown" role="listbox">
        <div class="mobile-handle" aria-hidden="true"></div>
        <div class="dropdown-header">Select Interface Theme</div>
        <div class="theme-options-grid">
          ${options}
        </div>
      </div>
      <div class="dropdown-backdrop" data-action="close-theme"></div>
    `;
  },

  intro() {
    return `
      <section class="intro-card" aria-labelledby="intro-title">
        <div class="intro-header">
          <div class="intro-title-group">
            <h2 id="intro-title" class="intro-title">Choose Your Path</h2>
            <p class="intro-subtitle">Track your progress and master the multiverse with the ultimate MCU watch order guide.</p>
          </div>
          <button class="dismiss-btn" data-action="dismiss-intro" aria-label="Dismiss introduction">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="intro-grid">
          <div class="intro-option">
            <div class="option-icon release">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </div>
            <div class="option-content">
              <h3>Release Order</h3>
              <p>Experience the Marvel Cinematic Universe exactly as it was shown in theaters. <strong>Best for first-time viewers.</strong></p>
            </div>
          </div>
          <div class="intro-option">
            <div class="option-icon chrono">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="option-content">
              <h3>Chronological Order</h3>
              <p>Follow the events as they happen on the timeline, from 1940s to the future. <strong>Best for re-watches.</strong></p>
            </div>
          </div>
        </div>
        <div class="intro-footer">
          <p>Switch between views at any time using the <strong>Release</strong> and <strong>Chrono</strong> buttons in the top right.</p>
        </div>
      </section>
    `;
  },

  nextUp(entry) {
    if (!entry) {
      return `
        <section class="next-up-card all-caught-up" aria-labelledby="next-up-title">
          <div class="next-up-container-inner" style="background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(34, 197, 94, 0.05) 100%); border-color: var(--status-watched)">
            <div class="next-up-badge" style="background: var(--status-watched); border-color: var(--status-watched); color: white">Achievement Unlocked</div>
            <div class="next-up-content">
              <div class="next-up-info">
                <h2 id="next-up-title" class="next-up-title">You're All Caught Up!</h2>
                <div class="next-up-meta">
                  <span class="next-up-type">You've mastered the multiverse. Time for a re-watch?</span>
                </div>
              </div>
              <div style="font-size: 3rem; filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))">🏆</div>
            </div>
          </div>
        </section>
      `;
    }
    const parent = PARENTS[entry.parentKey];
    const type = parent?.type || "movie";
    const typeIcon = type === "movie" ? ICONS.movie : ICONS.series;
    
    return `
      <section class="next-up-card" aria-labelledby="next-up-title">
        <div class="next-up-container-inner">
          <div class="next-up-badge">Next Up</div>
          <div class="next-up-content">
            ${this.getPoster(entry.title, type, parent?.poster)}
            <div class="next-up-info">
              <h2 id="next-up-title" class="next-up-title">${entry.title}</h2>
              <div class="next-up-meta">
                <span class="next-up-type">${typeIcon} ${parent?.title || ""}</span>
                ${entry.sub ? `<span class="next-up-sub">· ${entry.sub}</span>` : ""}
                ${parent?.runtime ? `<span class="next-up-sub">· ${parent.runtime}</span>` : ""}
              </div>
            </div>
            <button class="next-up-btn" data-action="scroll-to-entry" data-id="${entry.id}">
              <span>Jump to Title</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>
    `;
  }
};
