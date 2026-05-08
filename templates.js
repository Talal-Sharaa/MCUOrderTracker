/**
 * TEMPLATES (HTML GENERATION)
 */

const ICONS = {
  movie: '<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  series: '<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  calendar: '<svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  skip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
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
    const statusIcon = status ? this.getStatusIcon(status) : "";
    
    return `
      <div class="entry-row" data-id="${entry.id}" data-parent="${entry.parentKey}" 
           style="${status === 'skip' ? 'opacity: 0.4' : ''}">
        <div class="seq-num">${String(idx + 1).padStart(3, "0")}</div>
        
        <div class="type-badge" style="color: var(--type-${type}); border-color: var(--type-${type})33">
          ${typeCfg.label}
        </div>

        <div class="content">
          <div class="title" style="${status === 'skip' ? 'text-decoration: line-through' : ''}">${entry.title}</div>
          <div class="meta-row">
            ${entry.sub ? `<div class="meta-item">${typeIcon} ${entry.sub}</div>` : ""}
            ${entry.meta ? `<div class="meta-item">${ICONS.calendar} ${entry.meta}</div>` : ""}
          </div>
          ${entry.note ? `<div class="note-txt">⚠ ${entry.note}</div>` : ""}
        </div>

        <div class="status-wrap">
          <button class="status-btn" data-action="toggle-dropdown" 
                  style="${status ? `color: var(--status-${status}); border-color: var(--status-${status})44; background: var(--status-${status})11` : ''}">
            <span class="status-indicator" style="${status ? `background: var(--status-${status})` : ''}"></span>
            <span>${statusCfg ? statusCfg.label : "Track"}</span>
            <svg class="chevron" style="width:12px; height:12px; margin-left: 4px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          ${isOpen ? this.dropdown(parent, status) : ""}
        </div>
      </div>
    `;
  },

  getStatusIcon(status) {
    if (status === 'watched') return ICONS.check;
    if (status === 'watching') return ICONS.play;
    if (status === 'will-watch') return ICONS.clock;
    if (status === 'skip') return ICONS.skip;
    return "";
  },

  dropdown(parent, current) {
    const options = Object.entries(STATUS_CONFIG)
      .map(([key, cfg]) => {
        const isActive = current === key;
        const icon = this.getStatusIcon(key);
        return `
        <button class="dropdown-option" data-action="set-status" data-status="${key}"
                style="${isActive ? `color: var(--status-${key}); background: var(--status-${key})11` : ''}">
          <span style="width:16px; height:16px; display:flex; align-items:center; color: var(--status-${key})">${icon}</span>
          <span>${cfg.label}</span>
          ${isActive ? '<span style="margin-left:auto; font-size:10px; opacity:0.5">ACTIVE</span>' : ""}
        </button>
      `;
      })
      .join("");

    const clearBtn = current ? `
      <div style="height: 1px; background: var(--border-default); margin: 4px 8px"></div>
      <button class="dropdown-option" data-action="clear-status" style="color: var(--accent-red)">
        <span style="width:16px; height:16px; display:flex; align-items:center">${ICONS.skip}</span>
        <span>Clear Tracking</span>
      </button>
    ` : "";

    return `
      <div class="dropdown open">
        ${options}
        ${clearBtn}
      </div>
    `;
  },

  stats(stats) {
    return `
      <div class="stat-card">
        <span class="stat-label">Watched</span>
        <span class="stat-value" style="color: var(--status-watched)">${stats.watched}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Watching</span>
        <span class="stat-value" style="color: var(--status-watching)">${stats.watching}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Remaining</span>
        <span class="stat-value" style="color: var(--text-muted)">${stats.total - stats.watched}</span>
      </div>
      <div class="progress-container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end">
          <span class="stat-label">Overall Progress</span>
          <span class="stat-value" style="font-size: 1.5rem">${stats.pct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${stats.pct}%"></div>
        </div>
      </div>
    `;
  },

  emptyState() {
    return '<div class="empty-state">NO MATCHES FOUND</div>';
  }
};
