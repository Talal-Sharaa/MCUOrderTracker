/**
 * UI LAYER (DOM MANIPULATION)
 */

const UI = {
  els: {
    header: document.getElementById("header"),
    headerToggle: document.getElementById("header-toggle"),
    stats: document.getElementById("stats"),
    searchInput: document.getElementById("search-input"),
    clearSearch: document.getElementById("clear-search"),
    listContainer: document.getElementById("list-container"),
    topBtn: document.getElementById("top-btn"),
    resultsAnnouncer: document.getElementById("results-announcer"),
    viewToggles: document.querySelectorAll(".toggle-btn"),
    filterBtns: document.querySelectorAll("#status-filter-group .filter-btn"),
    typeFilterBtns: document.querySelectorAll("#type-filter-group .filter-btn"),
    statusValue: document.querySelector("#status-trigger .trigger-value"),
    typeValue: document.querySelector("#type-trigger .trigger-value"),
    filterGroups: document.querySelectorAll(".filter-group"),
    themeToggle: document.getElementById("theme-toggle"),
    themeDropdownContainer: document.getElementById("theme-dropdown-container"),
    modeToggle: document.getElementById("mode-toggle"),
    introContainer: document.getElementById("intro-container"),
  },

  render() {
    this.updateTheme();
    this.updateHeaderState();
    this.renderIntro();
    this.updateControls();
    this.updateStats();
    this.renderList();
    this.updateTitle();
    Store.syncToUrl();
  },

  updateTheme() {
    const theme = Store.state.theme;
    const mode = Store.state.mode;

    // Remove all theme classes and add the current one
    Object.keys(THEMES).forEach(t => document.body.classList.remove(`theme-${t}`));
    document.body.classList.add(`theme-${theme}`);

    // Handle light/dark mode
    document.body.classList.toggle('light-mode', mode === 'light');
    
    // Update mode toggle icon
    if (this.els.modeToggle) {
        if (mode === 'light') {
            this.els.modeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
            this.els.modeToggle.setAttribute('aria-label', 'Switch to dark mode');
        } else {
            this.els.modeToggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
            this.els.modeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', mode === 'light' ? '#f1f5f9' : '#05070a');
    }

    // Render theme dropdown if open
    const isThemeOpen = Store.state.openId === 'theme-selector';
    document.body.classList.toggle('no-scroll', isThemeOpen);

    if (this.els.themeToggle) {
      this.els.themeToggle.setAttribute('aria-expanded', isThemeOpen);
      this.els.themeToggle.classList.toggle('active', isThemeOpen);
    }
    
    if (this.els.themeDropdownContainer) {
      if (isThemeOpen) {
        this.els.themeDropdownContainer.innerHTML = Templates.themeDropdown();
        
        // Dynamic positioning for desktop dropdown mode
        if (window.innerWidth > 768 && this.els.themeToggle) {
            const dropdown = document.getElementById('theme-dropdown');
            if (dropdown) {
                const rect = this.els.themeToggle.getBoundingClientRect();
                dropdown.style.position = 'fixed';
                dropdown.style.top = `${rect.bottom + 12}px`;
                dropdown.style.right = `${window.innerWidth - rect.right}px`;
                dropdown.style.left = 'auto';
                dropdown.style.bottom = 'auto';
            }
        }
      } else {
        this.els.themeDropdownContainer.innerHTML = '';
      }
    }
  },

  renderIntro() {
    if (!this.els.introContainer) return;
    if (Store.state.introDismissed) {
      this.els.introContainer.innerHTML = '';
      return;
    }
    this.els.introContainer.innerHTML = Templates.intro();
  },

  updateTitle() {
    const filter = Store.state.filter !== 'all' ? ` | ${Store.state.filter}` : '';
    const search = Store.state.search ? ` | Search: ${Store.state.search}` : '';
    document.title = `MCU Watch Order${filter}${search}`;
  },

  updateHeaderState() {
    const isCollapsed = Store.state.headerCollapsed;
    this.els.header.classList.toggle("collapsed", isCollapsed);
    this.els.headerToggle.setAttribute("aria-expanded", !isCollapsed);
    this.els.headerToggle.setAttribute("aria-label", isCollapsed ? "Expand header options" : "Collapse header options");
  },

  updateControls() {
    // View Toggles
    this.els.viewToggles.forEach(btn => {
      const view = btn.dataset.view;
      const isActive = view === Store.state.view;
      
      // Update href to preserve current filters/search
      const params = new URLSearchParams();
      params.set('view', view);
      if (Store.state.filter !== 'all') params.set('filter', Store.state.filter);
      if (Store.state.typeFilter !== 'all') params.set('type', Store.state.typeFilter);
      if (Store.state.search) params.set('search', Store.state.search);
      btn.href = '?' + params.toString();

      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive);
    });

    // Status Filters
    this.els.filterBtns.forEach(btn => {
      const f = btn.dataset.filter;
      const isActive = f === Store.state.filter;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
      if (isActive) {
        this.els.statusValue.textContent = btn.textContent;
      }
    });

    // Type Filters
    this.els.typeFilterBtns.forEach(btn => {
      const t = btn.dataset.type;
      const isActive = t === Store.state.typeFilter;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
      if (isActive) {
        this.els.typeValue.textContent = btn.textContent;
      }
    });

    // Filter Trigger Aria States
    this.els.filterGroups.forEach(group => {
        const trigger = group.querySelector('.filter-trigger');
        const isOpen = group.classList.contains('open');
        const label = group.id === 'status-filter-group' ? 'Status' : 'Type';
        const value = trigger.querySelector('.trigger-value').textContent;
        
        trigger.setAttribute('aria-expanded', isOpen);
        trigger.setAttribute('aria-label', `Filter by ${label}. Current: ${value}`);
    });

    // Search Input
    this.els.clearSearch.style.display = Store.state.search ? "flex" : "none";
  },

  updateStats() {
    const stats = Store.getStats();
    this.els.stats.innerHTML = Templates.stats(stats);
  },

  renderList() {
    const filtered = Store.getFilteredList();

    // Cancel any pending chunk rendering
    if (this._renderRaf) {
      cancelAnimationFrame(this._renderRaf);
    }

    if (filtered.length === 0) {
      this.els.listContainer.innerHTML = Templates.emptyState();
      this.els.resultsAnnouncer.textContent = "No matches found.";
      return;
    }

    this.els.resultsAnnouncer.textContent = `Showing ${filtered.length}\u00A0titles.`;

    // Chunked rendering to avoid long main-thread tasks
    const CHUNK_SIZE = 20;
    let currentIdx = 0;

    this.els.listContainer.innerHTML = "";
    
    const renderChunk = () => {
      const fragment = document.createDocumentFragment();
      const end = Math.min(currentIdx + CHUNK_SIZE, filtered.length);
      
      for (let i = currentIdx; i < end; i++) {
        const temp = document.createElement('div');
        temp.innerHTML = Templates.entryRow(filtered[i], i);
        while (temp.firstChild) {
          fragment.appendChild(temp.firstChild);
        }
      }

      this.els.listContainer.appendChild(fragment);
      currentIdx = end;

      if (currentIdx < filtered.length) {
        this._renderRaf = requestAnimationFrame(renderChunk);
      } else {
        this._renderRaf = null;
      }
    };

    renderChunk();
  },



  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  initObservers() {
    // Top button observer
    const header = document.getElementById('header');
    if (header && this.els.topBtn) {
      const observer = new IntersectionObserver((entries) => {
        const isVisible = !entries[0].isIntersecting;
        this.els.topBtn.style.display = isVisible ? "flex" : "none";
        this.els.topBtn.setAttribute("aria-hidden", !isVisible);
      }, { threshold: 0 });
      observer.observe(header);
    }
  }
};
