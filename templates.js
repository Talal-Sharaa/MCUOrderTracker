/**
 * TEMPLATES (HTML GENERATION)
 */

const Templates = {
  entryRow(entry, idx, totalList) {
    const parent = PARENTS[entry.parentKey];
    const status = Store.state.statuses[entry.parentKey] || null;
    const typeCfg = TYPE_CONFIG[parent?.type || "movie"];
    const statusCfg = status ? STATUS_CONFIG[status] : null;
    const isOpen = Store.state.openId === entry.id;
    const origIdx = totalList.indexOf(entry);
    
    const borderColor = statusCfg ? statusCfg.color : "transparent";
    const rowBg = status ? `${statusCfg.bar}44` : "#111520";
    const rowBgHover = status ? `${statusCfg.bar}88` : "#1a1f2e";
    const titleStyle = status === "skip"
      ? "text-decoration:line-through;color:#6b7280;"
      : "color:#e8edf5;";

    return `
      <div class="entry-row" data-id="${entry.id}" data-parent="${entry.parentKey}"
           style="border-left-color:${borderColor}; background:${rowBg}; --hover-bg:${rowBgHover}; opacity:${status === "skip" ? 0.5 : 1}">
        <div class="seq-num">${String(origIdx + 1).padStart(3, "0")}</div>
        <div class="type-badge" style="color:${typeCfg.color}; background:${typeCfg.bg}; border-color:${typeCfg.color}44">
          ${typeCfg.label}
        </div>
        <div class="content">
          <div class="title" style="${titleStyle}">${entry.title}</div>
          ${entry.sub ? `<div class="sub">${entry.sub}</div>` : ""}
          ${entry.meta ? `<div class="meta">${entry.meta}</div>` : ""}
          ${entry.note ? `<div class="note-txt">⚠ ${entry.note}</div>` : ""}
        </div>
        <div class="status-wrap">
          <button class="status-btn" data-action="toggle-dropdown"
                  style="background:${statusCfg ? statusCfg.color + "22" : "#1c2030"};
                         border-color:${statusCfg ? statusCfg.color + "66" : "#2a3148"};
                         color:${statusCfg ? statusCfg.color : "#4a5278"}">
            <span>${statusCfg ? statusCfg.icon : "+"}</span>
            <span class="status-label">${statusCfg ? statusCfg.label : "Track"}</span>
            <span style="font-size:10px; opacity:0.6">▾</span>
          </button>
          ${isOpen ? this.dropdown(parent, status) : ""}
        </div>
      </div>
    `;
  },

  dropdown(parent, current) {
    const options = Object.entries(STATUS_CONFIG)
      .map(([key, cfg]) => {
        const isActive = current === key;
        return `
        <button class="dropdown-option" data-action="set-status" data-status="${key}"
                style="background:${isActive ? cfg.color + "22" : "transparent"};
                       border-color:${isActive ? cfg.color + "88" : "transparent"};
                       color:${isActive ? cfg.color : "#94a3b8"}">
          <span style="color:${cfg.color}; width:16px">${cfg.icon}</span>
          <span>${cfg.label}</span>
          ${isActive ? '<span style="margin-left:auto; font-size:11px; opacity:0.7">✓ active</span>' : ""}
        </button>
      `;
      })
      .join("");

    const clearBtn = current ? `
      <button class="dropdown-option" data-action="clear-status" style="color:#ef4444; border-color:transparent;">
        <span style="width:16px">✕</span>
        <span>Clear status</span>
      </button>
    ` : "";

    return `
      <div class="dropdown open">
        <div class="dropdown-header">
          <div class="dropdown-title">${parent?.title}</div>
          <div class="dropdown-sub">Set status for all episodes</div>
        </div>
        ${options}
        ${clearBtn}
      </div>
    `;
  },

  stats(stats) {
    return `
      <span><span style="color:#4ade80">✓</span> ${stats.watched} watched</span>
      <span><span style="color:#60a5fa">▶</span> ${stats.watching} watching</span>
      <span style="color:#6b7280">${stats.total - stats.watched - stats.watching} remaining · ${stats.pct}% complete</span>
    `;
  },

  emptyState() {
    return '<div class="empty-state">No entries match your filters.</div>';
  }
};
