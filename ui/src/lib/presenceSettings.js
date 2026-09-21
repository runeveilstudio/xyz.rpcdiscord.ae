export const defaultPresenceSettings = {
  privacyMode: false,
  useEmojis: false,
  stripExtension: true,
  showSpecs: true,
  showDuration: true,
  showLayers: true,
  customStatus: '',
  detectRender: true,
  showProjectTime: true,
  projectTimeStr: '',
  showWorkflow: true,
  showFormatTag: true,
};

export function validateSettings(settings = {}) {
  return { ...defaultPresenceSettings, ...settings };
}

export function buildPresencePayload(settings = {}, projectName = 'Unsaved Project') {
  const cur = validateSettings(settings);
  const projectTime = typeof cur.projectTimeStr === 'string' ? cur.projectTimeStr.trim() : '';
  const payload = {
    privacyMode: !!cur.privacyMode,
    useEmojis: !!cur.useEmojis,
    stripExtension: !!cur.stripExtension,
    showSpecs: !!cur.showSpecs,
    showDuration: !!cur.showDuration,
    showLayers: !!cur.showLayers,
    customStatus: String(cur.customStatus || ''),
    detectRender: !!cur.detectRender,
    showProjectTime: !!cur.showProjectTime,
    projectTimeStr: projectTime,
    showWorkflow: !!cur.showWorkflow,
    showFormatTag: !!cur.showFormatTag,
    projectName,
  };

  return payload;
}
