/**
 * CONTROLLER (EVENT HANDLING & ORCHESTRATION)
 */

const Controller = {
  init() {
    Store.init();
    this.bindEvents();
    UI.render();
  },

  bindEvents() {
    // View switching
    UI.els.viewToggles.forEach(btn => {
      btn.addEventListener("click", () => {
        Store.state.view = btn.dataset.view;
        Store.state.openId = null;
        UI.render();
      });
    });

    // Status filtering
    UI.els.filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        Store.state.filter = btn.dataset.filter;
        Store.state.openId = null;
        UI.render();
      });
    });

    // Type filtering
    UI.els.typeFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        Store.state.typeFilter = btn.dataset.type;
        Store.state.openId = null;
        UI.render();
      });
    });

    // Search
    UI.els.searchInput.addEventListener("input", (e) => {
      Store.state.search = e.target.value;
      Store.state.openId = null;
      UI.render();
    });

    UI.els.clearSearch.addEventListener("click", () => {
      Store.state.search = "";
      UI.els.searchInput.value = "";
      Store.state.openId = null;
      UI.render();
    });

    // Global click for delegation and closing dropdowns
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest('[data-action="toggle-dropdown"]');
      const statusBtn = e.target.closest('[data-action="set-status"]');
      const clearBtn = e.target.closest('[data-action="clear-status"]');
      const row = e.target.closest(".entry-row");

      if (toggleBtn) {
        e.stopPropagation();
        const id = row.dataset.id;
        Store.state.openId = Store.state.openId === id ? null : id;
        UI.renderList();
      } else if (statusBtn) {
        e.stopPropagation();
        Store.setStatus(row.dataset.parent, statusBtn.dataset.status);
        UI.render();
      } else if (clearBtn) {
        e.stopPropagation();
        Store.setStatus(row.dataset.parent, null);
        UI.render();
      } else if (!e.target.closest(".status-wrap") && Store.state.openId) {
        Store.state.openId = null;
        UI.renderList();
      }
    });

    // Scroll helpers
    UI.els.topBtn.addEventListener("click", () => UI.scrollToTop());
    window.addEventListener("scroll", () => UI.toggleTopButton());
  },
};

// Start the app
Controller.init();
