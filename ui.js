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
  },

  updateHeaderState() {
    const isCollapsed = Store.state.headerCollapsed;
    this.els.header.classList.toggle("collapsed", isCollapsed);
    this.els.headerToggle.setAttribute("aria-expanded", !isCollapsed);
  },

  updateControls() {
    // View Toggles
    this.els.viewToggles.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === Store.state.view);
    });

    // Status Filters
    this.els.filterBtns.forEach(btn => {
      const f = btn.dataset.filter;
      const isActive = f === Store.state.filter;
      btn.classList.toggle("active", isActive);
      if (isActive) {
        this.els.statusValue.textContent = btn.textContent;
      }
    });

    // Type Filters
    this.els.typeFilterBtns.forEach(btn => {
      const t = btn.dataset.type;
      const isActive = t === Store.state.typeFilter;
      btn.classList.toggle("active", isActive);
      if (isActive) {
        this.els.typeValue.textContent = btn.textContent;
      }
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
      return;
    }

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

  toggleTopButton() {
    if (window.scrollY > 400) {
      this.els.topBtn.style.display = "flex";
      // Adding a small delay for the entrance animation if we had one
    } else {
      this.els.topBtn.style.display = "none";
    }
  }
};
