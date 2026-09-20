# AE Discord Rich Presence

A lightweight, ultra-responsive Discord Rich Presence extension for **Adobe After Effects**, crafted by **Jadenaep** at **Runeveil Studio**.

100% Free and Open Source for the creative community.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Adobe%20After%20Effects-9999ff.svg)](#)
[![Discord RPC](https://img.shields.io/badge/Discord-Rich%20Presence-5865F2.svg)](#)

---

## ⚡ Highlights & Features

- ⏱️ **Lifetime & Session Project Tracking**: Tracks total hours and minutes spent on each project across days and sessions, and broadcasts your logged time directly on Discord.
- 🧠 **Smart Scene & Workflow Detection**: Dynamically detects what you're working on—automatically labeling `🎥 3D Scene`, `✍️ Typography`, `⚡ Motion Design`, or `🎵 Audio Sync`.
- 📱 **Format Intelligence**: Automatically recognizes 9:16 vertical compositions for TikTok, Instagram Reels, and YouTube Shorts (`📱 9:16`), as well as high-res workflows (`4K UHD`, `2K QHD`, `1080p`).
- 🎨 **Quick Activity Presets**: One-click status tags right on the panel (`⚡ Animating`, `🎨 Grading`, `💥 VFX`, `✂️ Editing`, `☕ AFK`).
- 🚀 **Queue Monitor**: Detects background and foreground renders, showing live queue item progress (`🚀 Rendering in AE (1/3)`).
- 🏆 **Composition Milestones**: Real-time visual milestone achievements for 100+ layers, 4K resolution, 60+ FPS, and 9:16 vertical projects.
- 🔒 **Privacy / NDA Mode**: Masks all sensitive project and composition titles into `Confidential Project` and `Private Composition` with a single toggle.

---

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/runeveilstudio/xyz.rpcdiscord.ae.git
   ```

2. Move or copy the folder into your Adobe CEP extensions directory:
   - **Windows**: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.ae.discordrpc`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/com.ae.discordrpc`

3. Ensure PlayerDebugMode is enabled (standard for CEP unsigned development):
   - **Windows**: In Registry Editor (`regedit`), navigate to `HKEY_CURRENT_USER\Software\Adobe\CSXS.8` (or your current AE CSXS version) and create/set string value `PlayerDebugMode` to `"1"`.
   - **macOS**: In Terminal: `defaults write com.adobe.CSXS.8 PlayerDebugMode 1`

4. Open **Adobe After Effects**.
5. Go to **Window > Extensions > Discord Status**.

---

## 🛠️ Architecture

- **CEP Frontend (`client/`)**: Pure, vanilla JavaScript, CSS3, and HTML5. Built without runtime framework overhead to guarantee zero lag and minimal memory footprint inside After Effects.
- **ExtendScript Host (`host/index.jsx`)**: Native ExtendScript engine integration with evaluation caching to avoid unnecessary layer-scan overhead during editing.
- **IPC Bridge Daemon (`bin/`)**: High-efficiency local Go daemon that communicates via IPC socket with Discord's RPC client.

---

## 💎 Community & Credits

- **Author**: **Jadenaep**
- **Studio**: **Runeveil Studio**
- **Repository**: [github.com/runeveilstudio/xyz.rpcdiscord.ae](https://github.com/runeveilstudio/xyz.rpcdiscord.ae)

This extension is 100% free and open source. If you find it useful, consider starring the repository and sharing it with other editors and designers!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
