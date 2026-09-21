import { useState, useEffect, useRef, useCallback } from 'react';
import { validateSettings, buildPresencePayload } from '../lib/presenceSettings';

export function useAdobeBridge() {
  const csRef = useRef(null);

  // Connection & Preview State
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected' | 'rendering'
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [preview, setPreview] = useState({
    project: 'Loading...',
    comp: 'Initializing...',
    rawProject: 'Unsaved Project',
    layers: 0,
    w: 0,
    h: 0,
    fps: 0,
    rendering: false
  });

  // Telemetry Timers
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [projectTotalSeconds, setProjectTotalSeconds] = useState(0);
  const projectTimesRef = useRef({});
  const rawProjectRef = useRef('Unsaved Project');

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('runeveil_ae_rpc_settings');
      if (saved) {
        return validateSettings(JSON.parse(saved));
      }
    } catch (e) {}
    return validateSettings();
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const isLaunchingRef = useRef(false);

  // Initialize CSInterface
  useEffect(() => {
    if (typeof window !== 'undefined' && window.CSInterface) {
      try {
        const csInterface = new window.CSInterface();
        csRef.current = csInterface;
      } catch (e) {
        console.warn('CSInterface init warning:', e);
      }
    }
  }, []);

  // Format Helpers
  const formatClock = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatReadableTime = (sec) => {
    if (!sec || sec <= 0) return '0m';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${Math.max(1, mins)}m`;
  };

  // Load Saved Time Stats
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('runeveil_ae_project_times');
      if (savedProjects) {
        projectTimesRef.current = JSON.parse(savedProjects) || {};
      }
      const todayDateStr = new Date().toDateString();
      const savedTodayDate = localStorage.getItem('runeveil_ae_today_date');
      const savedTodaySec = localStorage.getItem('runeveil_ae_today_seconds');
      if (savedTodayDate === todayDateStr && savedTodaySec) {
        setTodaySeconds(parseInt(savedTodaySec, 10) || 0);
      } else {
        localStorage.setItem('runeveil_ae_today_date', todayDateStr);
        localStorage.setItem('runeveil_ae_today_seconds', '0');
        setTodaySeconds(0);
      }
    } catch (e) {}
  }, []);

  // Timer Tick (Every Second)
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
      setTodaySeconds((t) => t + 1);

      const p = rawProjectRef.current;
      if (p && p !== 'Unsaved Project') {
        projectTimesRef.current[p] = (projectTimesRef.current[p] || 0) + 1;
        setProjectTotalSeconds(projectTimesRef.current[p]);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist Time Stats periodically
  useEffect(() => {
    if (sessionSeconds > 0 && sessionSeconds % 15 === 0) {
      try {
        localStorage.setItem('runeveil_ae_project_times', JSON.stringify(projectTimesRef.current));
        localStorage.setItem('runeveil_ae_today_seconds', String(todaySeconds));
      } catch (e) {}
    }
  }, [sessionSeconds, todaySeconds]);

  // Settings validation helper
  // Settings Payload Constructor
  const getSettingsParam = useCallback(() => {
    const cur = validateSettings(settingsRef.current);
    const p = rawProjectRef.current;
    const pTime = projectTimesRef.current[p] || 0;
    const timeTag = cur.showProjectTime && pTime >= 60 ? `[${formatReadableTime(pTime)}]` : '';

    const payload = buildPresencePayload({
      ...cur,
      projectTimeStr: timeTag
    }, p || 'Unsaved Project');

    return JSON.stringify(JSON.stringify(payload));
  }, []);

  // EvalScript Helper
  const evalScript = useCallback((script, cb) => {
    if (csRef.current) {
      try {
        csRef.current.evalScript(script, cb);
      } catch (e) {
        if (cb) cb('{}');
      }
    } else {
      if (cb) cb('{}');
    }
  }, []);

  // Load Bridge Binary
  const loadBridge = useCallback(() => {
    if (isLaunchingRef.current) return;
    isLaunchingRef.current = true;
    setStatus('connecting');
    setStatusMessage('Connecting...');

    if (csRef.current && typeof window !== 'undefined' && window.SystemPath) {
      try {
        const extPath = csRef.current.getSystemPath(window.SystemPath.EXTENSION);
        if (!extPath) {
          isLaunchingRef.current = false;
          setStatus('disconnected');
          setStatusMessage('Bridge not available');
          return;
        }
        const safeExt = String(extPath).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        evalScript(`launchBridge("${safeExt}")`, () => {
          setTimeout(() => {
            isLaunchingRef.current = false;
          }, 15000);
        });
      } catch (e) {
        isLaunchingRef.current = false;
        setStatus('disconnected');
        setStatusMessage('Bridge not available');
      }
    } else {
      isLaunchingRef.current = false;
      setStatus('disconnected');
      setStatusMessage('Bridge not available');
    }
  }, [evalScript]);

  // Update Status & Preview
  const updateStatus = useCallback(() => {
    const params = getSettingsParam();

    // 1. Preview
    evalScript(`getCurrentPresencePreview(${params})`, (res) => {
      try {
        const info = JSON.parse(res);
        if (info.rawProject) {
          rawProjectRef.current = info.rawProject;
          setProjectTotalSeconds(projectTimesRef.current[info.rawProject] || 0);
        }
        setPreview((prev) => ({
          ...prev,
          project: info.project != null ? info.project : (prev.project || 'Unsaved Project'),
          comp: info.comp != null ? info.comp : (prev.comp || 'Comp 1'),
          layers: info.layers != null ? info.layers : (prev.layers || 0),
          w: info.w != null ? info.w : (prev.w || 0),
          h: info.h != null ? info.h : (prev.h || 0),
          fps: info.fps != null ? info.fps : (prev.fps || 0),
          rendering: !!info.rendering
        }));

        if (info.rendering) {
          setStatus('rendering');
          setStatusMessage('Rendering');
        }
      } catch (e) {}
    });

    // 2. Bridge Status
    evalScript(`getBridgeStatus(${params})`, (res) => {
      try {
        const response = JSON.parse(res);
        if (response.status === 'CONNECTED') {
          isLaunchingRef.current = false;
          setStatus((prev) => (prev === 'rendering' ? 'rendering' : 'connected'));
          setStatusMessage((prev) => (prev === 'Rendering' ? 'Rendering' : 'Connected'));
        } else if (response.status === 'DISCONNECTED') {
          setStatus('disconnected');
          setStatusMessage('Disconnected');
        } else if (response.status === 'ERROR') {
          setStatus('disconnected');
          setStatusMessage(response.message || 'Error');
        } else {
          setStatus('disconnected');
          setStatusMessage('Bridge Offline');
        }
      } catch (e) {
        if (!isLaunchingRef.current) {
          setStatus('connecting');
          setStatusMessage('Reconnecting...');
          loadBridge();
        } else {
          setStatus('disconnected');
          setStatusMessage('Bridge Offline');
        }
      }
    });
  }, [evalScript, getSettingsParam, loadBridge]);

  // Initial Load & Polling
  useEffect(() => {
    loadBridge();
    updateStatus();
    const poll = setInterval(updateStatus, 3000);
    return () => clearInterval(poll);
  }, [loadBridge, updateStatus]);

  // Connect / Disconnect Action
  const toggleConnection = useCallback(() => {
    if (!csRef.current) {
      setStatus('disconnected');
      setStatusMessage('Bridge not available');
      return;
    }

    const params = getSettingsParam();
    if (status === 'connected' || status === 'rendering') {
      evalScript('disconnectDiscord()', () => {
        updateStatus();
      });
    } else {
      setStatus('connecting');
      setStatusMessage('Connecting...');
      evalScript(`connectToDiscord(${params})`, () => {
        updateStatus();
      });
    }
  }, [evalScript, getSettingsParam, status, updateStatus]);

  // Update Specific Setting
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('runeveil_ae_rpc_settings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setTimeout(() => {
      updateStatus();
    }, 50);
  }, [updateStatus]);

  return {
    status,
    statusMessage,
    preview,
    telemetry: {
      session: formatClock(sessionSeconds),
      today: formatReadableTime(todaySeconds),
      project: formatReadableTime(projectTotalSeconds)
    },
    settings,
    updateSetting,
    toggleConnection,
    refresh: updateStatus
  };
}
