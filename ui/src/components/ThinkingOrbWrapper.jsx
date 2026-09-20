import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';

/**
 * ThinkingOrbWrapper
 * Monochromatic fluid presence orb powered by thinking-orbs from libraries.dev
 */
export function ThinkingOrbWrapper({ status }) {
  // Map extension connection status to ThinkingOrb state
  let orbState = 'breathing';
  let speed = 1.0;

  if (status === 'connecting') {
    orbState = 'connecting';
    speed = 1.4;
  } else if (status === 'connected') {
    orbState = 'working';
    speed = 1.0;
  } else if (status === 'rendering') {
    orbState = 'composing';
    speed = 1.8;
  } else {
    // Disconnected
    orbState = 'breathing';
    speed = 0.7;
  }

  return (
    <div className="orb-wrapper" title={`Engine Status: ${status}`}>
      <ThinkingOrb
        state={orbState}
        size={20}
        theme="dark"
        speed={speed}
        style={{
          width: '24px',
          height: '24px',
          filter: 'grayscale(100%) contrast(120%) brightness(1.2)'
        }}
      />
    </div>
  );
}
