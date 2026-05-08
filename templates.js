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
          
          <div class="type-badge" style="color: var(--type-${type}); border-color: var(--type-${type})44; background: var(--type-${type})11">
            ${typeCfg.label}
          </div>

          <div class="content">
            <h3 class="title">${entry.title}</h3>
            <div class="meta-row">
              ${entry.sub ? `<div class="meta-item">${typeIcon} ${entry.sub}</div>` : ""}
              ${entry.releaseDate ? `<div class="meta-item">${ICONS.calendar} ${dateFormatter.format(new Date(entry.releaseDate))}${entry.releaseNote ? ` · ${entry.releaseNote}` : ""}</div>` : ""}
            </div>
            ${entry.note ? `<div class="note-txt" role="status"><span style="display: flex; align-items: center; width: 14px; height: 14px">${ICONS.warning}</span> ${entry.note}</div>` : ""}
          </div>

          <div class="status-wrap">
            <div class="status-btn-proxy" 
                 style="${status ? `color: var(--status-${status}); border-color: var(--status-${status})44; background: var(--status-${status})11` : ''}">
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
                style="${isActive ? `color: var(--status-${key}); background: var(--status-${key})11` : ''}">
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

    return `
      <div class="dropdown open" id="dropdown-${id}" role="listbox">
        ${options}
        ${clearBtn}
      </div>
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
        <button class="dropdown-option ${isActive ? 'active' : ''}" data-action="set-theme" data-theme="${key}" role="option" aria-selected="${isActive}">
          <span style="width:12px; height:12px; border-radius:50%; background: ${cfg.color}; display:inline-block; margin-right: 8px" aria-hidden="true"></span>
          <span style="font-weight: ${isActive ? '700' : '500'}">${cfg.label}</span>
          ${isActive ? `<span class="active-check" aria-hidden="true">${ICONS.check}</span>` : ""}
        </button>
      `;
      })
      .join("");

    return `
      <div class="dropdown theme-dropdown open" id="theme-dropdown" role="listbox">
        <div style="padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid var(--border-default); margin-bottom: 0.5rem">Select Interface Theme</div>
        ${options}
      </div>
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
  }
};
