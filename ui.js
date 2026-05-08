/**
 * UI LAYER (DOM MANIPULATION)
 */

const UI = {
  els: {
    progressFill: document.getElementById("progress-fill"),
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
    this.updateControls();
    this.updateStats();
    this.renderList();
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
        if (f === "all") btn.style.background = "#d4af37";
        else if (f === "none") btn.style.background = "#374151";
        else btn.style.background = STATUS_CONFIG[f]?.color;
        btn.style.color = "#000";
        btn.style.borderColor = "transparent";
      } else {
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    });

    // Type Filters
    this.els.typeFilterBtns.forEach(btn => {
      const t = btn.dataset.type;
      const isActive = t === Store.state.typeFilter;
      btn.classList.toggle("active", isActive);
      if (isActive) {
        this.els.typeValue.textContent = btn.textContent;
        btn.style.background = "#d4af37";
        btn.style.color = "#000";
        btn.style.borderColor = "transparent";
      } else {
        btn.style.background = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    });

    // Search Input
    this.els.clearSearch.style.display = Store.state.search ? "block" : "none";
  },

  updateStats() {
    const stats = Store.getStats();
    this.els.progressFill.style.width = `${stats.pct}%`;
    this.els.stats.innerHTML = Templates.stats(stats);
  },

  renderList() {
    const filtered = Store.getFilteredList();
    const fullList = Store.state.view === "release" ? RELEASE_ORDER : CHRONO_ORDER;

    if (filtered.length === 0) {
      this.els.listContainer.innerHTML = Templates.emptyState();
      return;
    }

    this.els.listContainer.innerHTML = filtered
      .map((entry, idx) => Templates.entryRow(entry, idx, fullList))
      .join("");
  },

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  toggleTopButton() {
    this.els.topBtn.style.display = window.scrollY > 400 ? "flex" : "none";
  }
};
