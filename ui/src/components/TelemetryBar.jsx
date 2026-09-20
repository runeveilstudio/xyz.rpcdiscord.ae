import React from 'react';

export function TelemetryBar({ session, project, today }) {
  return (
    <div className="penumbra-card">
      <div className="telemetry-row">
        <div className="telemetry-cell">
          <span className="telemetry-tag">SESSION</span>
          <span className="telemetry-num">{session}</span>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-cell">
          <span className="telemetry-tag">PROJECT TIME</span>
          <span className="telemetry-num">{project}</span>
        </div>
        <div className="telemetry-divider" />
        <div className="telemetry-cell">
          <span className="telemetry-tag">TODAY</span>
          <span className="telemetry-num">{today}</span>
        </div>
      </div>
    </div>
  );
}
