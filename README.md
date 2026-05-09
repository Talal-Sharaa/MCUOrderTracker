# 🎬 MCU Watch Order Tracker

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=flat-square&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

The most complete and cinematic Marvel Cinematic Universe watch order tracker. Navigate the multiverse with precision, tracking every movie, series, and special through release or chronological timelines.

---

## ✨ Key Features

- **🛡️ Dual Timeline Perspectives:** Seamlessly switch between **Release Order** (theatrical experience) and **Chronological Order** (storyline progression).
- **📊 Advanced Progress Analytics:** Real-time statistics including completion percentages and status breakdowns.
- **🎨 Cinematic Theming:** Immerse yourself with custom-crafted themes:
  - **Cosmic Multiverse:** Deep purples and cyans.
  - **Classic Marvel:** Iconic red and gold.
  - **Stark Tech:** HUD-inspired blue and red with grid overlays.
  - **Mystic Arts:** Warm golds and deep ambers.
- **🔍 Global Search & Smart Filtering:** Instant results with fuzzy search and filters for Movies vs. Series.
- **📱 PWA & Offline First:** Installable on mobile and desktop. Works without an internet connection once loaded.
- **💾 Data Sovereignty:** Your progress stays on your device. Export to JSON for backups or import to sync across browsers.
- **♿ Accessibility First:** 44px touch targets, full keyboard navigation, `prefers-reduced-motion` support, and screen-reader optimized ARIA attributes.

## 🛠️ Tech Stack

Built with a focus on performance, simplicity, and zero dependencies:

- **Language:** ES6+ JavaScript
- **Styling:** Modern CSS3 (CSS Variables, `color-mix`, `backdrop-filter`, `content-visibility`)
- **Persistence:** Browser `localStorage` with JSON serialization.
- **Formatting:** Native `Intl` APIs for localized dates and numbers.
- **Performance:** Optimized DOM manipulation and lazy loading for large lists.
- **Iconography:** Hand-tuned SVG paths for crisp visuals at any scale.

## 📁 Project Structure

```bash
├── 📄 index.html      # Application entry point & layout shell
├── 🎨 style.css       # Core design system & theme definitions
├── 📦 data.js         # Centralized MCU timeline & metadata
├── 💾 store.js        # State management & persistence logic
├── 🧩 templates.js    # Component templates & HTML generation
├── 🖥️ ui.js           # DOM orchestration & view logic
├── 🎮 controller.js   # Event handling & app initialization
├── 📡 sw.js           # Service Worker for offline capabilities
└── 📱 manifest.json   # PWA configuration
```

## 🚀 Getting Started

Since this project is built with zero dependencies, you can run it locally without any build steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/mcu-watch-order.git
    ```
2.  **Open the application:**
    Simply open `index.html` in any modern web browser.
3.  **Local Server (Recommended for PWA features):**
    For the Service Worker to register, serve the files via a local server:
    ```bash
    npx serve .
    # OR
    python3 -m http.server 8000
    ```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License & Disclaimer

Distributed under the MIT License.

**Disclaimer:** All Marvel Cinematic Universe assets, characters, and titles are the intellectual property of Marvel Studios and Disney. This project is a fan-made tool created for educational and organizational purposes.

---

<p align="center">
  Built with ❤️ for fans, by fans.
</p>
