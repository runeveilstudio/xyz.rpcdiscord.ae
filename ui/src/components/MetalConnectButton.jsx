import React from 'react';
import { MetalFx } from 'metal-fx';

/**
 * MetalConnectButton
 * Liquid silver chrome button using metal-fx
 */
export function MetalConnectButton({ status, onToggle }) {
  const isConnected = status === 'connected' || status === 'rendering';
  const label = isConnected ? 'Disconnect' : (status === 'connecting' ? 'Connecting...' : 'Connect');

  return (
    <MetalFx
      preset="silver"
      theme="dark"
      variant="button"
      innerShadow={true}
      strength={0.8}
    >
      <button
        type="button"
        className={`btn-penumbra ${isConnected ? 'connected' : ''}`}
        onClick={onToggle}
      >
        {label}
      </button>
    </MetalFx>
  );
}
