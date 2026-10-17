# MIYORI

> **YOUR MUSIC. NO LIMITS.**  
> Official showcase and distribution platform for the MIYORI Android music sanctuary.

---

## Overview

**MIYORI** is a high-performance Android music player engineered for pure local ownership, high-bitrate audio streaming, synchronized word-for-word lyrics, offline storage, and self-hosted Subsonic/Navidrome library integration.

The MIYORI web platform serves as the cinematic showcase and direct distribution portal for the application.

---

## Android Application Architecture

* **UI & Design:** 100% Jetpack Compose with Obsidian & Liquid Silver visual identity
* **Audio Engine:** AndroidX Media3 / ExoPlayer with system-level AudioEffect equalization
* **Lyrics Engine:** LRCLIB integration for real-time word-by-word synchronized scrolling lyrics
* **Network & Storage:** Room database, local cache management, and Subsonic/Navidrome remote library sync
* **Minimum SDK:** Android 8.0 (API Level 26)
* **Target SDK:** Android 14+ (API Level 34+)

---

## Web Platform Features

* **Design Aesthetic:** Obsidian dark mode (`#090A0E`), liquid silver metallic gradients, glassmorphism, and responsive typography (`Space Grotesk` + `Inter`).
* **Animated Album Wall:** Dynamic 3-column album artwork marquee showcasing 24 high-resolution procedural covers.
* **Interactive Demos:**
  * Real-time synchronized lyrics player with interactive seek bar and audio simulation.
  * Web Audio 5-band dynamic equalizer with live audio processing and responsive canvas visualizer.
  * Custom playlist builder with full browser localStorage persistence.
  * Realistic Android device frame mockup displaying Now Playing, Lyric Stream, Equalizer, and Library views.
* **Release Delivery:** Direct APK downloads configured with RFC-compliant headers via `vercel.json`.

---

## Project Structure

```
MIYORI/
├── art/                   # 24 procedural vector album covers (cover_1.svg - cover_24.svg)
├── favicon.ico            # Multi-resolution ICO favicon
├── favicon.png            # High-resolution PNG app icon
├── index.html             # Core responsive single-page application & showcase
├── logo.jpg               # Official MIYORI branding emblem
├── Miyori-Release.apk     # Official release APK binary (~10.25 MB)
├── poster.jpg             # High-resolution branding banner & Open Graph preview
├── vercel.json            # Deployment routing and download header rules
├── .gitignore             # Exclusion rules (OS files, reference backups, IDE caches)
└── README.md              # Project documentation and specifications
```

---

## Deployment & Hosting

The website is configured for seamless deployment on **Vercel**:
* **Domain:** `https://miyori.vercel.app/`
* **Static Routing:** Direct static file hosting with optimized caching and download attachment headers configured in `vercel.json`.
* **Continuous Deployment:** Automatically builds and updates upon commits pushed to the `main` branch.

---

## License

Private Project. All rights reserved.