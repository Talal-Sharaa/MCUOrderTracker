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

  save() {
    const data = {
      statuses: this.state.statuses,
      headerCollapsed: this.state.headerCollapsed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
