import React from 'react';
import { Liquid } from 'liquid-gooey';

const PRESETS = [
  'Animation',
  'Color Grading',
  'VFX & Compositing',
  'Motion Graphics',
  'Editing',
  'Break'
];

export function ActivityChips({ customStatus, onSelectStatus, onCustomChange }) {
  const current = (customStatus || '').trim().toLowerCase();

  return (
    <div className="penumbra-card">
      <div className="card-label">
        <span>Activity & Focus Preset</span>
        <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>QUICK SET</span>
      </div>

      <Liquid blur={4} contrast={16} fill="rgba(255, 255, 255, 0.03)">
        <div className="activity-chips-container">
          {PRESETS.map((preset) => {
            const isActive = current.includes(preset.toLowerCase());
            return (
              <Liquid.Item key={preset} effect="morph">
                <button
                  type="button"
                  className={`activity-chip-mono ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectStatus(preset)}
                >
                  {preset}
                </button>
              </Liquid.Item>
            );
          })}
          <Liquid.Item effect="morph">
            <button
              type="button"
              className="activity-chip-mono activity-chip-reset"
              onClick={() => onSelectStatus('')}
            >
              Reset
            </button>
          </Liquid.Item>
        </div>
      </Liquid>

      <div className="input-box-mono">
        <input
          type="text"
          className="input-mono"
          placeholder="Custom activity, task, or mood..."
          value={customStatus}
          onChange={(e) => onCustomChange(e.target.value)}
          maxLength={32}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
