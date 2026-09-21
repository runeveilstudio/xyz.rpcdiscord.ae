import test from 'node:test';
import assert from 'node:assert/strict';

import { validateSettings, buildPresencePayload } from '../ui/src/lib/presenceSettings.js';

test('validateSettings keeps the user-configured emoji state', () => {
  const next = validateSettings({ useEmojis: true, showProjectTime: true, projectTimeStr: '[2h 30m]' });
  assert.equal(next.useEmojis, true);
  assert.equal(next.showProjectTime, true);
});

test('buildPresencePayload preserves useEmojis and project time', () => {
  const payload = buildPresencePayload({
    privacyMode: false,
    useEmojis: true,
    stripExtension: true,
    showSpecs: true,
    showDuration: true,
    showLayers: true,
    customStatus: '',
    detectRender: true,
    showProjectTime: true,
    projectTimeStr: '[2h 30m]',
    showWorkflow: true,
    showFormatTag: true,
  }, 'My Project');

  assert.equal(payload.useEmojis, true);
  assert.equal(payload.projectTimeStr, '[2h 30m]');
  assert.equal(payload.privacyMode, false);
});
