/**
 * After Effects Discord Rich Presence (Client Engine)
 *
 * Developed by Jadenaep | Runeveil Studio
 * Free & Open Source for the community
 * https://github.com/runeveilstudio/xyz.rpcdiscord.ae
 */

var csInterface = new CSInterface();

// DOM References
var statusSpan = document.getElementById('status');
var statusBadge = document.getElementById('status-badge');
var refreshButton = document.getElementById('refresh-btn');
var connectButton = document.getElementById('connect-btn');

var previewProject = document.getElementById('preview-project');
var previewComp = document.getElementById('preview-comp');

var statSession = document.getElementById('stat-session');
var statProjectTotal = document.getElementById('stat-project-total');
var statToday = document.getElementById('stat-today');

var customStatusInput = document.getElementById('custom-status');
var moodChips = document.querySelectorAll('.mood-chip');

var badgeLayers = document.getElementById('badge-layers');
var badge4k = document.getElementById('badge-4k');
var badgeFps = document.getElementById('badge-fps');
var badgeVertical = document.getElementById('badge-vertical');

var toggleProjectTime = document.getElementById('toggle-project-time');
var toggleWorkflow = document.getElementById('toggle-workflow');
var toggleFormat = document.getElementById('toggle-format');
var toggleEmojis = document.getElementById('toggle-emojis');
var toggleExtension = document.getElementById('toggle-extension');
var toggleSpecs = document.getElementById('toggle-specs');
var toggleDuration = document.getElementById('toggle-duration');
var toggleLayers = document.getElementById('toggle-layers');
var toggleRender = document.getElementById('toggle-render');
var togglePrivacy = document.getElementById('toggle-privacy');

var connected = false;
var isLaunching = false;

var settings = {
    privacyMode: false,
    useEmojis: true,
    stripExtension: true,
    showSpecs: true,
    showDuration: true,
    showLayers: true,
    customStatus: "",
    detectRender: true,
    showProjectTime: true,
    showWorkflow: true,
    showFormatTag: true
};

// ==========================================
// Time Tracking & Session Analytics
// ==========================================
var sessionSeconds = 0;
var currentRawProject = "Unsaved Project";
var projectTimes = {};
var todaySeconds = 0;
var todayDateStr = (new Date()).toDateString();

function loadTimeStats() {
    try {
        var savedProjects = localStorage.getItem('runeveil_ae_project_times');
        if (savedProjects) {
            projectTimes = JSON.parse(savedProjects) || {};
        }

        var savedTodayDate = localStorage.getItem('runeveil_ae_today_date');
        var savedTodaySec = localStorage.getItem('runeveil_ae_today_seconds');
        if (savedTodayDate === todayDateStr && savedTodaySec) {
            todaySeconds = parseInt(savedTodaySec, 10) || 0;
        } else {
            todaySeconds = 0;
            localStorage.setItem('runeveil_ae_today_date', todayDateStr);
            localStorage.setItem('runeveil_ae_today_seconds', "0");
        }
    } catch (e) {}
}

function saveTimeStats() {
    try {
        localStorage.setItem('runeveil_ae_project_times', JSON.stringify(projectTimes));
        localStorage.setItem('runeveil_ae_today_seconds', String(todaySeconds));
    } catch (e) {}
}

function formatClock(totalSec) {
    var hrs = Math.floor(totalSec / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;
    if (hrs > 0) {
        return hrs + ":" + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    }
    return (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
}

function formatReadableTime(totalSec) {
    if (!totalSec || totalSec <= 0) return "0m";
    var hrs = Math.floor(totalSec / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    if (hrs > 0) {
        return hrs + "h " + (mins > 0 ? mins + "m" : "");
    }
    return Math.max(1, mins) + "m";
}

// Optimized 1-second interval with DOM guard checks
setInterval(function() {
    sessionSeconds++;
    todaySeconds++;

    if (currentRawProject && currentRawProject !== "Unsaved Project") {
        if (!projectTimes[currentRawProject]) {
            projectTimes[currentRawProject] = 0;
        }
        projectTimes[currentRawProject]++;
    }

    if (statSession) statSession.textContent = formatClock(sessionSeconds);
    if (statToday) statToday.textContent = formatReadableTime(todaySeconds);
    if (statProjectTotal) {
        var pTime = projectTimes[currentRawProject] || 0;
        statProjectTotal.textContent = formatReadableTime(pTime);
    }

    // Persist every 15s to keep disk I/O low
    if (sessionSeconds % 15 === 0) {
        saveTimeStats();
    }
}, 1000);

function getCurrentProjectTimeTag() {
    if (!settings.showProjectTime) return "";
    var pTime = projectTimes[currentRawProject] || 0;
    if (pTime < 60) return "";
    return (settings.useEmojis ? "⏱️ " : "") + formatReadableTime(pTime);
}

// ==========================================
// Settings Management
// ==========================================
function loadSavedSettings() {
    try {
        var saved = localStorage.getItem('runeveil_ae_rpc_settings');
        if (saved) {
            var parsed = JSON.parse(saved);
            if (typeof parsed === 'object' && parsed !== null) {
                if (typeof parsed.privacyMode === 'boolean') settings.privacyMode = parsed.privacyMode;
                if (typeof parsed.useEmojis === 'boolean') settings.useEmojis = parsed.useEmojis;
                if (typeof parsed.stripExtension === 'boolean') settings.stripExtension = parsed.stripExtension;
                if (typeof parsed.showSpecs === 'boolean') settings.showSpecs = parsed.showSpecs;
                if (typeof parsed.showDuration === 'boolean') settings.showDuration = parsed.showDuration;
                if (typeof parsed.showLayers === 'boolean') settings.showLayers = parsed.showLayers;
                if (typeof parsed.detectRender === 'boolean') settings.detectRender = parsed.detectRender;
                if (typeof parsed.showProjectTime === 'boolean') settings.showProjectTime = parsed.showProjectTime;
                if (typeof parsed.showWorkflow === 'boolean') settings.showWorkflow = parsed.showWorkflow;
                if (typeof parsed.showFormatTag === 'boolean') settings.showFormatTag = parsed.showFormatTag;
                if (typeof parsed.customStatus === 'string') settings.customStatus = parsed.customStatus;
            }
        }
    } catch (e) {}

    if (toggleProjectTime) toggleProjectTime.checked = settings.showProjectTime;
    if (toggleWorkflow) toggleWorkflow.checked = settings.showWorkflow;
    if (toggleFormat) toggleFormat.checked = settings.showFormatTag;
    if (toggleEmojis) toggleEmojis.checked = settings.useEmojis;
    if (toggleExtension) toggleExtension.checked = settings.stripExtension;
    if (toggleSpecs) toggleSpecs.checked = settings.showSpecs;
    if (toggleDuration) toggleDuration.checked = settings.showDuration;
    if (toggleLayers) toggleLayers.checked = settings.showLayers;
    if (toggleRender) toggleRender.checked = settings.detectRender;
    if (togglePrivacy) togglePrivacy.checked = settings.privacyMode;
    if (customStatusInput) customStatusInput.value = settings.customStatus || "";

    highlightActiveMoodChip(settings.customStatus);
}

function saveSettings() {
    try {
        localStorage.setItem('runeveil_ae_rpc_settings', JSON.stringify(settings));
    } catch (e) {}
}

function getSettingsParam() {
    var payload = {
        privacyMode: settings.privacyMode,
        useEmojis: settings.useEmojis,
        stripExtension: settings.stripExtension,
        showSpecs: settings.showSpecs,
        showDuration: settings.showDuration,
        showLayers: settings.showLayers,
        customStatus: settings.customStatus,
        detectRender: settings.detectRender,
        showProjectTime: settings.showProjectTime,
        projectTimeStr: getCurrentProjectTimeTag(),
        showWorkflow: settings.showWorkflow,
        showFormatTag: settings.showFormatTag
    };
    return JSON.stringify(JSON.stringify(payload));
}

// ==========================================
// UI Updates & Visual Feedback
// ==========================================
function setStatusState(type, text) {
    if (statusSpan && statusSpan.textContent !== text) {
        statusSpan.textContent = text;
    }
    var targetClass = 'status-pill status-' + type;
    if (statusBadge && statusBadge.className !== targetClass) {
        statusBadge.className = targetClass;
    }
}

var _lastLayersUnlocked = false;
var _last4kUnlocked = false;
var _lastFpsUnlocked = false;
var _lastVertUnlocked = false;

function updateMilestones(info) {
    if (!info) return;

    var layersUnlocked = info.layers >= 100;
    if (layersUnlocked !== _lastLayersUnlocked && badgeLayers) {
        _lastLayersUnlocked = layersUnlocked;
        badgeLayers.className = layersUnlocked ? 'badge-item badge-unlocked' : 'badge-item badge-locked';
    }

    var fourKUnlocked = info.w >= 3840 || info.h >= 2160;
    if (fourKUnlocked !== _last4kUnlocked && badge4k) {
        _last4kUnlocked = fourKUnlocked;
        badge4k.className = fourKUnlocked ? 'badge-item badge-unlocked' : 'badge-item badge-locked';
    }

    var fpsUnlocked = info.fps >= 60;
    if (fpsUnlocked !== _lastFpsUnlocked && badgeFps) {
        _lastFpsUnlocked = fpsUnlocked;
        badgeFps.className = fpsUnlocked ? 'badge-item badge-unlocked' : 'badge-item badge-locked';
    }

    var vertUnlocked = (info.w === 1080 && info.h === 1920) || (info.h > info.w && Math.abs((info.h / info.w) - (16 / 9)) < 0.05);
    if (vertUnlocked !== _lastVertUnlocked && badgeVertical) {
        _lastVertUnlocked = vertUnlocked;
        badgeVertical.className = vertUnlocked ? 'badge-item badge-unlocked' : 'badge-item badge-locked';
    }
}

function highlightActiveMoodChip(text) {
    var val = (text || "").trim();
    moodChips.forEach(function(chip) {
        var tag = chip.getAttribute('data-tag');
        if (val && tag && val.indexOf(tag.replace(/^[^\w]+/, '').trim()) !== -1) {
            chip.classList.add('active');
        } else if (!val && !tag) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

function loadBridge() {
    if (isLaunching) return;
    isLaunching = true;

    var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
    var safeExtPath = extensionPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    csInterface.evalScript('launchBridge("' + safeExtPath + '")', function() {
        setTimeout(function() { isLaunching = false; }, 8000);
    });
}

function updatePreview() {
    csInterface.evalScript('getCurrentPresencePreview(' + getSettingsParam() + ')', function(result) {
        try {
            var info = JSON.parse(result);
            if (info.rawProject) {
                currentRawProject = info.rawProject;
            }

            var nextProj = "Project: " + (info.project || "Unsaved Project");
            var nextComp = "Comp: " + (info.comp || "No Active Comp");

            if (previewProject && previewProject.textContent !== nextProj) {
                previewProject.textContent = nextProj;
            }
            if (previewComp && previewComp.textContent !== nextComp) {
                previewComp.textContent = nextComp;
            }

            updateMilestones(info);

            if (info.rendering && connected) {
                setStatusState("rendering", "Rendering");
            }
        } catch (e) {}
    });
}

function updateStatus() {
    updatePreview();

    csInterface.evalScript('getBridgeStatus(' + getSettingsParam() + ')', function(result) {
        try {
            var response = JSON.parse(result);

            if (response.status === "CONNECTED") {
                connected = true;
                isLaunching = false;
                if (!previewProject || previewProject.textContent.indexOf("Rendering") === -1) {
                    setStatusState("connected", "Connected");
                }
                if (connectButton && connectButton.textContent !== "Disconnect") {
                    connectButton.textContent = "Disconnect";
                }
            } else if (response.status === "DISCONNECTED") {
                connected = false;
                setStatusState("disconnected", "Disconnected");
                if (connectButton && connectButton.textContent !== "Connect") {
                    connectButton.textContent = "Connect";
                }
            } else if (response.status === "ERROR") {
                connected = false;
                setStatusState("disconnected", response.message || "Error");
                if (connectButton && connectButton.textContent !== "Connect") {
                    connectButton.textContent = "Connect";
                }
            } else {
                connected = false;
                setStatusState("disconnected", "Bridge Offline");
                if (connectButton && connectButton.textContent !== "Connect") {
                    connectButton.textContent = "Connect";
                }
            }
        } catch (e) {
            if (!isLaunching) {
                setStatusState("disconnected", "Reconnecting...");
                loadBridge();
            } else {
                setStatusState("disconnected", "Bridge Offline");
            }
        }
    });
}

// ==========================================
// Event Listeners
// ==========================================
if (refreshButton) {
    refreshButton.onclick = function() {
        updateStatus();
    };
}

if (connectButton) {
    connectButton.onclick = function() {
        if (connected) {
            csInterface.evalScript('disconnectDiscord()', function() {
                updateStatus();
            });
        } else {
            csInterface.evalScript('connectToDiscord(' + getSettingsParam() + ')', function() {
                updateStatus();
            });
        }
    };
}

moodChips.forEach(function(chip) {
    chip.onclick = function() {
        var tag = chip.getAttribute('data-tag') || "";
        if (customStatusInput) {
            customStatusInput.value = tag;
        }
        onSettingChange();
    };
});

function onSettingChange() {
    if (toggleProjectTime) settings.showProjectTime = !!toggleProjectTime.checked;
    if (toggleWorkflow) settings.showWorkflow = !!toggleWorkflow.checked;
    if (toggleFormat) settings.showFormatTag = !!toggleFormat.checked;
    if (toggleEmojis) settings.useEmojis = !!toggleEmojis.checked;
    if (toggleExtension) settings.stripExtension = !!toggleExtension.checked;
    if (toggleSpecs) settings.showSpecs = !!toggleSpecs.checked;
    if (toggleDuration) settings.showDuration = !!toggleDuration.checked;
    if (toggleLayers) settings.showLayers = !!toggleLayers.checked;
    if (toggleRender) settings.detectRender = !!toggleRender.checked;
    if (togglePrivacy) settings.privacyMode = !!togglePrivacy.checked;
    if (customStatusInput) settings.customStatus = customStatusInput.value.trim();

    highlightActiveMoodChip(settings.customStatus);
    saveSettings();

    if (connected) {
        csInterface.evalScript('connectToDiscord(' + getSettingsParam() + ')', function() {
            updateStatus();
        });
    } else {
        updateStatus();
    }
}

if (toggleProjectTime) toggleProjectTime.onchange = onSettingChange;
if (toggleWorkflow) toggleWorkflow.onchange = onSettingChange;
if (toggleFormat) toggleFormat.onchange = onSettingChange;
if (toggleEmojis) toggleEmojis.onchange = onSettingChange;
if (toggleExtension) toggleExtension.onchange = onSettingChange;
if (toggleSpecs) toggleSpecs.onchange = onSettingChange;
if (toggleDuration) toggleDuration.onchange = onSettingChange;
if (toggleLayers) toggleLayers.onchange = onSettingChange;
if (toggleRender) toggleRender.onchange = onSettingChange;
if (togglePrivacy) togglePrivacy.onchange = onSettingChange;

var debounceTimer = null;
if (customStatusInput) {
    customStatusInput.oninput = function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(onSettingChange, 350);
    };
}

// Initial Boot
loadTimeStats();
loadSavedSettings();
loadBridge();
updateStatus();

setInterval(updateStatus, 3000);