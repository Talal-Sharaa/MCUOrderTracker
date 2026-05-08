/**
 * STORE (STATE MANAGEMENT)
 */

const Store = {
  state: {
    view: "release", // 'release' | 'chrono'
    statuses: {}, // { parentKey: status }
    openId: null, // ID of entry with open dropdown
    filter: "all", // status filter
    typeFilter: "all", // 'all' | 'movie' | 'series'
    search: "",
    headerCollapsed: false,
  },

  init() {
    this.load();
    this.syncFromUrl();
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.state.statuses = data.statuses || {};
        this.state.headerCollapsed = !!data.headerCollapsed;
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
  },

  syncFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('view')) this.state.view = params.get('view');
    if (params.has('filter')) this.state.filter = params.get('filter');
    if (params.has('type')) this.state.typeFilter = params.get('type');
    if (params.has('search')) this.state.search = params.get('search');
  },

  syncToUrl() {
    const params = new URLSearchParams();
    if (this.state.view !== 'release') params.set('view', this.state.view);
    if (this.state.filter !== 'all') params.set('filter', this.state.filter);
    if (this.state.typeFilter !== 'all') params.set('type', this.state.typeFilter);
    if (this.state.search) params.set('search', this.state.search);
    
    const queryString = params.toString() ? '?' + params.toString() : '';
    const newUrl = window.location.pathname + queryString;
    
    if (window.location.search !== queryString) {
      window.history.replaceState(null, '', newUrl);
    }
  },

  resetFilters() {
    this.state.filter = "all";
    this.state.typeFilter = "all";
    this.state.search = "";
    this.state.openId = null;
    this.syncToUrl();
  },

  save() {
    const data = {
      statuses: this.state.statuses,
      headerCollapsed: this.state.headerCollapsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    this.syncToUrl();
  },

  setStatus(parentKey, status) {
    if (!status) {
      delete this.state.statuses[parentKey];
    } else {
      this.state.statuses[parentKey] = status;
    }
    this.state.openId = null;
    this.save();
  },

  getFilteredList() {
    const list =
      this.state.view === "release" ? RELEASE_ORDER : CHRONO_ORDER;
    return list.filter((e) => {
      const parent = PARENTS[e.parentKey];
      const status = this.state.statuses[e.parentKey] || null;
      const type = parent?.type;

      const matchSearch =
        !this.state.search ||
        e.title.toLowerCase().includes(this.state.search.toLowerCase()) ||
        (e.sub && e.sub.toLowerCase().includes(this.state.search.toLowerCase())) ||
        parent?.title.toLowerCase().includes(this.state.search.toLowerCase());

      const matchStatus =
        this.state.filter === "all" ||
        status === this.state.filter ||
        (this.state.filter === "none" && !status);

      let matchType = true;
      if (this.state.typeFilter === "movie") {
        matchType = type === "movie";
      } else if (this.state.typeFilter === "series") {
        matchType = type === "series";
      } else {
        matchType = true;
      }

      return matchSearch && matchStatus && matchType;
    });
  },

  getStats() {
    const total = Object.keys(PARENTS).length;
    const watched = Object.values(this.state.statuses).filter(
      (s) => s === "watched",
    ).length;
    const watching = Object.values(this.state.statuses).filter(
      (s) => s === "watching",
    ).length;
    return { total, watched, watching, pct: Math.round((watched / total) * 100) };
  },
};
