# Adobe After Effects Discord Rich Presence

A high-performance Discord Rich Presence integration for Adobe After Effects, maintained by Runeveil Studio. Provides real-time activity synchronization, project duration tracking, contextual composition telemetry, and render queue monitoring with zero impact on application performance.

---

## Overview

`xyz.rpcdiscord.ae` connects Adobe After Effects directly to Discord via a lightweight local IPC bridge. Built for professional motion designers, visual effects artists, and video editors who need accurate, unobtrusive presence indicators without background overhead.

### Key Capabilities

- **Project Telemetry & Time Tracking**: Tracks active editing duration across sessions with optional profile display.
- **Contextual Scene Evaluation**: Analyzes active composition structure to detect 3D camera and light environments, typography workflows, motion graphics, and audio sync passes.
- **Format Recognition**: Automatically classifies aspect ratios (including 9:16 vertical video workflows) and standard resolution tiers (4K, 2K, 1080p).
- **Activity State Presets**: Configurable activity flags (Animating, Color Grading, VFX, Editing, Idle) accessible via panel or custom input.
- **Render Queue Detection**: Monitors background and foreground render queue executions, reporting active item indices and queue status.
- **Privacy & NDA Masking**: Single-toggle obfuscation of project and composition identifiers for client confidentiality.
- **Native Panel UI**: Lightweight HTML5/CEP interface aligned with After Effects native theme architecture.

---

## Technical Specifications

| Parameter | Specification |
| :--- | :--- |
| **Target Host** | Adobe After Effects CC 2015 – 2026+ (AEFT 13.0 – 99.9) |
| **CEP Architecture** | CEP 8.0+ |
| **Runtime Dependencies** | None (Standalone local bridge daemon included) |
| **IPC Transport** | Local Loopback TCP (`127.0.0.1:54345`) |
| **License** | MIT License |

---

## Installation

### 1. Download Repository
Clone or download the repository to your workstation:
```bash
git clone https://github.com/runeveilstudio/xyz.rpcdiscord.ae.git
```

### 2. Deployment Directory
Copy the repository directory into your system Common CEP extensions path:

- **Windows**:
  ```text
  C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\xyz.rpcdiscord.ae
  ```

- **macOS**:
  ```text
  ~/Library/Application Support/Adobe/CEP/extensions/xyz.rpcdiscord.ae
  ```

### 3. Developer Mode Configuration
For unsigned CEP panels, ensure `PlayerDebugMode` is enabled for your CEP runtime version:

- **Windows (PowerShell)**:
  ```powershell
  reg add "HKCU\Software\Adobe\CSXS.8" /v PlayerDebugMode /t REG_SZ /d 1 /f
  reg add "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f
  reg add "HKCU\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f
  reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
  ```

- **macOS (Terminal)**:
  ```bash
  defaults write com.adobe.CSXS.8 PlayerDebugMode 1
  defaults write com.adobe.CSXS.9 PlayerDebugMode 1
  defaults write com.adobe.CSXS.10 PlayerDebugMode 1
  defaults write com.adobe.CSXS.11 PlayerDebugMode 1
  ```

### 4. Launching the Extension
1. Launch or restart Adobe After Effects.
2. In the menu bar, open **Window > Extensions > Discord Status**.
3. Click **Connect** to initialize the Discord RPC daemon.

---

## Architecture & Data Flow

```text
+---------------------------+
|  Adobe After Effects      |
|  ExtendScript Host Engine | <--- Reads comp metadata, layer counts, render queue
+-------------+-------------+
              | (CSInterface RPC)
+-------------v-------------+
|  CEP Panel Frontend       |
|  HTML5 / CSS / Vanilla JS | <--- Local storage, session timer, preferences
+-------------+-------------+
              | (TCP 127.0.0.1:54345)
+-------------v-------------+
|  Local Bridge Daemon      |
|  discord-bridge.exe (Go)  |
+-------------+-------------+
              | (Discord IPC Pipe)
+-------------v-------------+
|  Discord Desktop Client   |
+---------------------------+
```

---

## Contributing & Support

Maintained by **Jadenaep** at **Runeveil Studio**.

Issues, bug reports, and pull requests can be submitted through the official GitHub repository:
https://github.com/runeveilstudio/xyz.rpcdiscord.ae

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for full details.
