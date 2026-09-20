import React from 'react';

const TOGGLES = [
  {
    key: 'showProjectTime',
    title: 'Show Logged Time',
    desc: 'Broadcast cumulative project working hours'
  },
  {
    key: 'showWorkflow',
    title: 'Smart Scene Detection',
    desc: 'Inspect active elements for 3D, Mograph, or Type workflows'
  },
  {
    key: 'showFormatTag',
    title: 'Resolution & Format Badges',
    desc: 'Append 4K, 1080p, and aspect tags to details'
  },
  {
    key: 'stripExtension',
    title: 'Typography & Clean Naming',
    desc: 'Strip .aep extensions from project title'
  },
  {
    key: 'showSpecs',
    title: 'Composition Specs',
    desc: 'Broadcast frame rate and exact dimensions'
  },
  {
    key: 'showDuration',
    title: 'Timeline Duration',
    desc: 'Display active composition running length'
  },
  {
    key: 'showLayers',
    title: 'Layer Count',
    desc: 'Display active composition layer count'
  },
  {
    key: 'detectRender',
    title: 'Auto-Detect Render Queue',
    desc: 'Switch status to dynamic render telemetry when encoding'
  },
  {
    key: 'privacyMode',
    title: 'Privacy / NDA Mode',
    desc: 'Conceal proprietary project and composition names'
  }
];

export function SettingsToggles({ settings, onToggle }) {
  return (
    <div className="penumbra-card">
      <div className="card-label">
        <span>Presence Specifications</span>
        <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>PREFERENCES</span>
      </div>

      <div className="toggles-list">
        {TOGGLES.map((t) => {
          const isActive = !!settings[t.key];
          return (
            <div
              key={t.key}
              className={`toggle-row ${isActive ? 'active' : ''}`}
              onClick={() => onToggle(t.key, !isActive)}
            >
              <div className="toggle-label-group">
                <span className="toggle-name">{t.title}</span>
                <span className="toggle-hint">{t.desc}</span>
              </div>
              <div className="toggle-switch">
                <div className="toggle-thumb" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
