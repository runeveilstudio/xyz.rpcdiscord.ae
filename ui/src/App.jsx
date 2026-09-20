import React from 'react';
import { useAdobeBridge } from './hooks/useAdobeBridge';
import { ThinkingOrbWrapper } from './components/ThinkingOrbWrapper';
import { MetalConnectButton } from './components/MetalConnectButton';
import { DiscordPreviewCard } from './components/DiscordPreviewCard';
import { TelemetryBar } from './components/TelemetryBar';
import { ActivityChips } from './components/ActivityChips';
import { Milestones } from './components/Milestones';
import { SettingsToggles } from './components/SettingsToggles';

export default function App() {
  const {
    status,
    statusMessage,
    preview,
    telemetry,
    settings,
    updateSetting,
    toggleConnection,
    refresh
  } = useAdobeBridge();

  const isConnected = status === 'connected' || status === 'rendering';

  return (
    <div className="app-container">
      {/* Top Header & Monochromatic Thinking Orb */}
      <header className="penumbra-header">
        <div className="brand-section">
          <ThinkingOrbWrapper status={status} />
          <div className="brand-meta">
            <div className="brand-title">
              <span>Discord RPC</span>
              <span className="pill-mono">STUDIO</span>
            </div>
            <div className="status-pill">
              <span className={`status-dot ${status}`} />
              <span>{statusMessage}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <MetalConnectButton status={status} onToggle={toggleConnection} />
          <button
            type="button"
            className="btn-ghost-icon"
            title="Sync presence"
            onClick={refresh}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Telemetry Bar */}
      <TelemetryBar
        session={telemetry.session}
        project={telemetry.project}
        today={telemetry.today}
      />

      {/* Discord Live Preview with Monochromatic BorderBeam */}
      <DiscordPreviewCard preview={preview} isConnected={isConnected} />

      {/* Activity & Workflow Presets */}
      <ActivityChips
        customStatus={settings.customStatus}
        onSelectStatus={(val) => updateSetting('customStatus', val)}
        onCustomChange={(val) => updateSetting('customStatus', val)}
      />

      {/* Composition Milestones & Metrics */}
      <Milestones preview={preview} />

      {/* Presence Specifications & Settings Toggles */}
      <SettingsToggles
        settings={settings}
        onToggle={(key, val) => updateSetting(key, val)}
      />

      {/* Penumbra Monochromatic Studio Footer */}
      <footer className="penumbra-footer">
        <div className="footer-credit">
          <span>Runeveil Studio &bull; Developed by <span className="footer-author">Jadenaep</span></span>
        </div>
        <a
          href="https://github.com/runeveilstudio/xyz.rpcdiscord.ae"
          className="footer-link"
          target="_blank"
          rel="noreferrer"
        >
          xyz.rpcdiscord.ae
        </a>
      </footer>
    </div>
  );
}
