import React from 'react';

export function Milestones({ preview }) {
  const isLayers = (preview.layers || 0) >= 100;
  const is4k = (preview.w || 0) >= 3840 || (preview.h || 0) >= 2160;
  const isFps = (preview.fps || 0) >= 60;
  const isVertical =
    (preview.w === 1080 && preview.h === 1920) ||
    (preview.h > preview.w && Math.abs(preview.h / preview.w - 16 / 9) < 0.05);

  return (
    <div className="penumbra-card">
      <div className="card-label">
        <span>Composition Metrics</span>
        <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>HARDWARE / SPEC</span>
      </div>

      <div className="milestones-grid">
        <div
          className={`metric-cell ${isLayers ? 'unlocked' : 'locked'}`}
          title="Active when comp contains 100+ active layers"
        >
          <span className="metric-cell-title">COMPLEXITY</span>
          <span className="metric-cell-val">100+ Layers</span>
        </div>

        <div
          className={`metric-cell ${is4k ? 'unlocked' : 'locked'}`}
          title="Active when width or height is 4K (3840/2160) or above"
        >
          <span className="metric-cell-title">FIDELITY</span>
          <span className="metric-cell-val">4K UHD</span>
        </div>

        <div
          className={`metric-cell ${isFps ? 'unlocked' : 'locked'}`}
          title="Active when frame rate is 60 FPS or higher"
        >
          <span className="metric-cell-title">CADENCE</span>
          <span className="metric-cell-val">60+ FPS</span>
        </div>

        <div
          className={`metric-cell ${isVertical ? 'unlocked' : 'locked'}`}
          title="Active for 9:16 vertical composition"
        >
          <span className="metric-cell-title">ASPECT</span>
          <span className="metric-cell-val">9:16 Vert</span>
        </div>
      </div>
    </div>
  );
}
