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
  },

  render() {
    this.updateHeaderState();
    this.updateControls();
    this.updateStats();
    this.renderList();
    this.updateTitle();
    Store.syncToUrl();
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
      const isActive = btn.dataset.view === Store.state.view;
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

    if (filtered.length === 0) {
      this.els.listContainer.innerHTML = Templates.emptyState();
      this.els.resultsAnnouncer.textContent = "No matches found.";
      return;
    }

    this.els.resultsAnnouncer.textContent = `Showing ${filtered.length} titles.`;

    // Using DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    
    temp.innerHTML = filtered
      .map((entry, idx) => Templates.entryRow(entry, idx))
      .join("");
    
    while (temp.firstChild) {
      fragment.appendChild(temp.firstChild);
    }

    this.els.listContainer.innerHTML = "";
    this.els.listContainer.appendChild(fragment);
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
