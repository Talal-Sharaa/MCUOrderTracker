/**
 * CONTROLLER (EVENT HANDLING & ORCHESTRATION)
 */

const Controller = {
  init() {
    Store.init();
    this.bindEvents();
    UI.initObservers();
    UI.render();

    // Register Service Worker for PWA (only on http/https)
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(console.error);
      });
    }
  },

  bindEvents() {
    // ... view toggles, header toggle, etc.
    UI.els.viewToggles.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        Store.state.view = btn.dataset.view;
        Store.state.openId = null;
        UI.render();
      });
    });

    UI.els.headerToggle.addEventListener("click", () => {
      Store.state.headerCollapsed = !Store.state.headerCollapsed;
      Store.save();
      UI.render();
    });

    if (UI.els.modeToggle) {
        UI.els.modeToggle.addEventListener("click", () => {
            Store.toggleMode();
            UI.render();
        });
    }

    if (UI.els.themeToggle) {
        UI.els.themeToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          const wasOpen = Store.state.openId === 'theme-selector';
          Store.state.openId = wasOpen ? null : 'theme-selector';
          UI.render();

          if (Store.state.openId === 'theme-selector') {
            const dropdown = document.getElementById('theme-dropdown');
            if (dropdown) dropdown.querySelector('button').focus();
          }
        });
    }

    UI.els.filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        Store.state.filter = btn.dataset.filter;
        Store.state.openId = null;
        UI.els.filterGroups.forEach(g => g.classList.remove("open"));
        UI.render();
      });
    });

    UI.els.typeFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        Store.state.typeFilter = btn.dataset.type;
        Store.state.openId = null;
        UI.els.filterGroups.forEach(g => g.classList.remove("open"));
        UI.render();
      });
    });

    UI.els.filterGroups.forEach(group => {
        const trigger = group.querySelector('.filter-trigger');
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = group.classList.contains('open');
            UI.els.filterGroups.forEach(g => g.classList.remove('open'));
            if (!isOpen) {
                group.classList.add('open');
                const firstOption = group.querySelector('.filter-btn');
                if (firstOption) firstOption.focus();
            }
            UI.updateControls();
        });
    });

    let searchTimeout;
    UI.els.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        Store.state.search = e.target.value;
        Store.state.openId = null;
        UI.els.filterGroups.forEach(g => g.classList.remove("open"));
        UI.render();
      }, 150);
    });

    UI.els.clearSearch.addEventListener("click", () => {
      Store.state.search = "";
      UI.els.searchInput.value = "";
      Store.state.openId = null;
      UI.els.filterGroups.forEach(g => g.classList.remove("open"));
      UI.render();
    });

    if (UI.els.exportBtn) {
        UI.els.exportBtn.addEventListener("click", () => Store.exportData());
    }

    if (UI.els.importBtn) {
        UI.els.importBtn.addEventListener("click", () => UI.els.importInput.click());
    }

    if (UI.els.importInput) {
        UI.els.importInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (confirm("Importing data will overwrite your current progress. Continue?")) {
                try {
                    await Store.importData(file);
                    UI.render();
                    alert("Progress imported successfully!");
                } catch (err) {
                    alert("Failed to import data: " + err.message);
                }
            }
            e.target.value = ""; // Reset input
        });
    }

    // Global click for delegation
    document.addEventListener("click", (e) => {
      const clearAllFilters = e.target.closest('#clear-all-filters');
      const toggleRow = e.target.closest('[data-action="toggle-dropdown"]');
      const statusBtn = e.target.closest('[data-action="set-status"]');
      const clearBtn = e.target.closest('[data-action="clear-status"]');
      const themeBtn = e.target.closest('[data-action="set-theme"]');
      const closeThemeBtn = e.target.closest('[data-action="close-theme"]');
      const dismissIntroBtn = e.target.closest('[data-action="dismiss-intro"]');
      const scrollToEntryBtn = e.target.closest('[data-action="scroll-to-entry"]');

      // Close filter dropdowns if clicking outside
      const isThemeSelectorClick = e.target.closest('.theme-selector-wrap') || e.target.closest('.theme-dropdown');
      if (!e.target.closest('.filter-group') && !isThemeSelectorClick || closeThemeBtn) {
        let closed = false;
        UI.els.filterGroups.forEach(g => {
          if (g.classList.contains('open')) {
            g.classList.remove('open');
            closed = true;
          }
        });
        if (Store.state.openId === 'theme-selector') {
          Store.state.openId = null;
          closed = true;
        }
        if (closed) UI.render();
      }

      if (clearAllFilters) {
        Store.resetFilters();
        UI.els.searchInput.value = "";
        UI.render();
      } else if (dismissIntroBtn) {
        Store.dismissIntro();
        UI.render();
      } else if (scrollToEntryBtn) {
        const id = scrollToEntryBtn.dataset.id;
        const isVisible = Store.getFilteredList().some(e => e.id === id);
        if (!isVisible) {
          Store.resetFilters();
          UI.els.searchInput.value = "";
          UI.render();
        }
        setTimeout(() => UI.scrollToTitle(id), 100);
      } else if (themeBtn) {
        e.stopPropagation();
        Store.setTheme(themeBtn.dataset.theme);
        UI.render();
      } else if (toggleRow) {
        e.stopPropagation();
        const id = toggleRow.dataset.id;
        const wasOpen = Store.state.openId === id;
        Store.state.openId = wasOpen ? null : id;
        UI.renderList();
        
        if (Store.state.openId) {
          const dropdown = document.getElementById(`dropdown-${id}`);
          if (dropdown) {
            const firstOption = dropdown.querySelector('button');
            if (firstOption) firstOption.focus();
          }
        }
      } else if (statusBtn) {
        e.stopPropagation();
        const item = statusBtn.closest(".entry-item");
        const row = item.querySelector(".entry-row");
        Store.setStatus(row.dataset.parent, statusBtn.dataset.status);
        UI.render();
      } else if (clearBtn) {
        e.stopPropagation();
        const item = clearBtn.closest(".entry-item");
        const row = item.querySelector(".entry-row");
        const title = row.querySelector(".title").textContent;
        if (confirm(`Are you sure you want to clear the tracking for “${title}”?`)) {
          Store.setStatus(row.dataset.parent, null);
          UI.render();
        }
      } else if (Store.state.openId) {
        Store.state.openId = null;
        UI.renderList();
      }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (Store.state.openId) {
                const id = Store.state.openId;
                Store.state.openId = null;
                UI.renderList();
                const btn = document.querySelector(`.entry-row[data-id="${id}"]`);
                if (btn) btn.focus();
            }
            UI.els.filterGroups.forEach(g => {
                if (g.classList.contains('open')) {
                    g.classList.remove('open');
                    const trigger = g.querySelector('.filter-trigger');
                    if (trigger) trigger.focus();
                }
            });
            UI.updateControls();
            return;
        }

        const activeDropdown = document.querySelector('.dropdown.open, .filter-group.open .filter-options');
        if (!activeDropdown) return;

        const options = Array.from(activeDropdown.querySelectorAll('button'));
        const currentIndex = options.indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % options.length;
            options[nextIndex].focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + options.length) % options.length;
            options[prevIndex].focus();
        } else if (e.key === "Home") {
            e.preventDefault();
            options[0].focus();
        } else if (e.key === "End") {
            e.preventDefault();
            options[options.length - 1].focus();
        }
    });

    UI.els.topBtn.addEventListener("click", () => UI.scrollToTop());
  },
};

// Start the app
Controller.init();
