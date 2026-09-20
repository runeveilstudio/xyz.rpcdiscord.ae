import React from 'react';
import { BorderBeam } from 'border-beam';

/**
 * DiscordPreviewCard
 * Wrapped in BorderBeam with monochromatic styling
 */
export function DiscordPreviewCard({ preview, isConnected }) {
  return (
    <div className="penumbra-card">
      <div className="card-label">
        <span>Discord Rich Presence Live</span>
        <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>PRO PREVIEW</span>
      </div>

      <div className="beam-card-container">
        <BorderBeam
          colorVariant="mono"
          theme="dark"
          size="md"
          staticColors={true}
          strength={isConnected ? 0.9 : 0.25}
          active={true}
          borderRadius={9}
        >
          <div className="discord-preview-box">
            <div className="discord-ae-avatar-mono">
              <span className="ae-glyph-mono">Ae</span>
            </div>
            <div className="discord-details">
              <div className="discord-header-title">Adobe After Effects</div>
              <div className="discord-line-primary" title={preview.project}>
                Project: {preview.project}
              </div>
              <div className="discord-line-secondary" title={preview.comp}>
                Comp: {preview.comp}
              </div>
            </div>
          </div>
        </BorderBeam>
      </div>
    </div>
  );
}
