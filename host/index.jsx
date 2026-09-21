/**
 * After Effects Discord Rich Presence (Host Engine)
 *
 * Developed by Jadenaep | Runeveil Studio
 * Free & Open Source for the community
 * https://github.com/runeveilstudio/xyz.rpcdiscord.ae
 */

var EXTENSION_VERSION = "1.2.0";
var EXTENSION_NAME = "xyz.rpcdiscord.ae";

var currentSettings = {
    privacyMode: false,
    useEmojis: true,
    stripExtension: true,
    showSpecs: true,
    showDuration: true,
    showLayers: true,
    customStatus: "",
    detectRender: true,
    showProjectTime: true,
    projectTimeStr: "",
    showWorkflow: true,
    showFormatTag: true
};

var _lastProjectInfoTime = 0;
var _cachedProjectInfo = null;

function updateSettings(settingsJson) {
    if (!settingsJson) return;
    try {
        var cfg = eval("(" + settingsJson + ")");
        if (typeof cfg === "object" && cfg !== null) {
            if (cfg.privacyMode !== undefined) currentSettings.privacyMode = !!cfg.privacyMode;
            if (cfg.useEmojis !== undefined) currentSettings.useEmojis = !!cfg.useEmojis;
            if (cfg.stripExtension !== undefined) currentSettings.stripExtension = !!cfg.stripExtension;
            if (cfg.showSpecs !== undefined) currentSettings.showSpecs = !!cfg.showSpecs;
            if (cfg.showDuration !== undefined) currentSettings.showDuration = !!cfg.showDuration;
            if (cfg.showLayers !== undefined) currentSettings.showLayers = !!cfg.showLayers;
            if (cfg.detectRender !== undefined) currentSettings.detectRender = !!cfg.detectRender;
            if (cfg.customStatus !== undefined) currentSettings.customStatus = String(cfg.customStatus);
            if (cfg.showProjectTime !== undefined) currentSettings.showProjectTime = !!cfg.showProjectTime;
            if (cfg.projectTimeStr !== undefined) currentSettings.projectTimeStr = String(cfg.projectTimeStr);
            if (cfg.showWorkflow !== undefined) currentSettings.showWorkflow = !!cfg.showWorkflow;
            if (cfg.showFormatTag !== undefined) currentSettings.showFormatTag = !!cfg.showFormatTag;
            _lastProjectInfoTime = 0;
            _cachedProjectInfo = null;
        }
    } catch (e) {}
}

function formatDuration(seconds) {
    if (isNaN(seconds) || seconds <= 0) return "";
    var total = Math.round(seconds);
    var mins = Math.floor(total / 60);
    var secs = total % 60;
    return mins > 0 ? mins + ":" + (secs < 10 ? "0" : "") + secs : secs + "s";
}

function getFormatTag(w, h, emoji) {
    if ((w === 1080 && h === 1920) || (h > w && Math.abs((h / w) - (16 / 9)) < 0.05)) {
        return emoji ? "📱 9:16" : "9:16";
    }
    if (w === h) {
        return emoji ? "⏹️ 1:1" : "1:1";
    }
    if (w >= 3840 || h >= 2160) {
        return emoji ? "🖥️ 4K" : "4K";
    }
    if (w >= 2560 || h >= 1440) {
        return emoji ? "🖥️ 2K" : "2K";
    }
    if (w >= 1920 && h >= 1080) {
        return emoji ? "🖥️ 1080p" : "1080p";
    }
    return "";
}

// Cached workflow detection to eliminate unnecessary layer scans
var _cachedCompId = null;
var _cachedLayerCount = -1;
var _cachedWorkflowTag = "";

function detectWorkflow(comp, emoji) {
    if (!comp || comp.numLayers <= 0) return "";
    
    var compId = (comp && comp.id !== undefined) ? comp.id : (comp ? comp.name : null);
    if (compId === _cachedCompId && comp.numLayers === _cachedLayerCount) {
        return _cachedWorkflowTag;
    }

    _cachedCompId = compId;
    _cachedLayerCount = comp.numLayers;

    var hasCamera = false;
    var hasLight = false;
    var textCount = 0;
    var shapeCount = 0;
    var audioCount = 0;
    var limit = comp.numLayers > 25 ? 25 : comp.numLayers;

    for (var i = 1; i <= limit; i++) {
        try {
            var layer = comp.layer(i);
            var isCam = false;
            var isLight = false;
            try { isCam = (typeof CameraLayer !== 'undefined' && layer instanceof CameraLayer); } catch(e) {}
            try { isLight = (typeof LightLayer !== 'undefined' && layer instanceof LightLayer); } catch(e) {}

            if (isCam) {
                hasCamera = true;
                break;
            }
            if (isLight) {
                hasLight = true;
                break;
            }
            try {
                if (typeof TextLayer !== 'undefined' && layer instanceof TextLayer) {
                    textCount++;
                } else if (typeof ShapeLayer !== 'undefined' && layer instanceof ShapeLayer) {
                    shapeCount++;
                }
            } catch (e) {}

            if (layer.hasAudio && !layer.hasVideo) {
                audioCount++;
            }
        } catch (e) {}
    }

    if (hasCamera || hasLight) {
        _cachedWorkflowTag = emoji ? "🎥 3D Scene" : "3D Scene";
    } else if (textCount >= 3 && textCount >= shapeCount) {
        _cachedWorkflowTag = emoji ? "✍️ Typography" : "Typography";
    } else if (shapeCount >= 3) {
        _cachedWorkflowTag = emoji ? "⚡ Motion Design" : "Motion Design";
    } else if (audioCount >= 2) {
        _cachedWorkflowTag = emoji ? "🎵 Audio Sync" : "Audio Sync";
    } else {
        _cachedWorkflowTag = "";
    }

    return _cachedWorkflowTag;
}

function launchBridge(extPath) {
    if (!extPath) return;
    var cleanPath = String(extPath).replace(/\\/g, "/");
    var launcher = new File(cleanPath + "/bin/launcher.exe");
    var bridge = new File(cleanPath + "/bin/discord-bridge.exe");

    if (launcher.exists) {
        launcher.execute();
    } else if (bridge.exists) {
        bridge.execute();
    }
}

function shutdownBridge() {
    return sendCommand("SHUTDOWN", {});
}

function sendCommand(actionName, dataObject) {
    var p = "";
    var c = "";
    if (dataObject) {
        if (dataObject.project) {
            p = String(dataObject.project)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\r/g, '')
                .replace(/\n/g, ' ');
        }
        if (dataObject.comp) {
            c = String(dataObject.comp)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\r/g, '')
                .replace(/\n/g, ' ');
        }
    }

    var payload = '{"action":"' + actionName + '","data":{"project":"' + p + '","comp":"' + c + '"}}\n';
    var conn = new Socket();
    var status = "OFFLINE";
    var msg = "Bridge offline";

    conn.timeout = 2;

    try {
        if (conn.open("127.0.0.1:54345", "UTF-8")) {
            conn.write(payload);
            var raw = conn.readln();
            if (raw && raw.length > 0) {
                try {
                    var res = eval("(" + raw + ")");
                    status = res.status;
                    msg = res.message;
                } catch (e) {
                    status = "ERROR";
                    msg = "Malformed response: " + e.message;
                }
            }
        }
    } catch (e) {
        status = "OFFLINE";
        msg = "Socket error: " + e.message;
    } finally {
        try {
            conn.close();
        } catch (e) {}
    }

    var safeMsg = String(msg).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return '{"status":"' + status + '","message":"' + safeMsg + '"}';
}

function getBridgeStatus(settingsJson) {
    if (settingsJson) updateSettings(settingsJson);
    var info = getProjectInfo();
    var result = sendCommand("STATUS", {
        project: info[0],
        comp: info[1]
    });
    try {
        var parsed = eval("(" + result + ")");
        parsed.version = EXTENSION_VERSION;
        parsed.name = EXTENSION_NAME;
        return JSON.stringify(parsed);
    } catch (e) {
        return result;
    }
}

// Get version info for debugging
function getVersionInfo() {
    return JSON.stringify({
        version: EXTENSION_VERSION,
        name: EXTENSION_NAME
    });
}

// Persistent Active Composition Cache & Metadata Memory (prevents losing comp info when AE is in background)
var _cachedActiveComp = null;
var _savedCompName = "";
var _savedCompWidth = 0;
var _savedCompHeight = 0;
var _savedCompFps = 0;
var _savedCompDuration = 0;

// AE can temporarily report the first project item as the active item after
// the CEP panel takes focus.  In many projects that item is the default
// "Comp 1", which must not replace a comp we have already identified.
/**
 * Checks if a composition name is a generic fallback name that AE reports
 * when the CEP panel takes focus (e.g., "Comp 1", "Comp 2", etc.)
 */
function _isGenericFallbackCompName(name) {
    var trimmed = String(name || "").replace(/^\s+|\s+$/g, "");
    return trimmed === "Comp 1" || trimmed === "Comp 2" || /^Comp \d+$/.test(trimmed);
}

function _rememberActiveComp(comp) {
    if (!comp) return;
    try {
        var incomingName = String(comp.name || "").replace(/^\s+|\s+$/g, "");
        if (!incomingName || _isGenericFallbackCompName(incomingName)) {
            // Debug: log rejected comp names
            // $.writeln("[RPC] Rejected comp name: " + incomingName);
            return;
        }

        var keepKnownComp = _savedCompName &&
            !_isGenericFallbackCompName(_savedCompName) &&
            _isGenericFallbackCompName(incomingName);

        if (keepKnownComp) {
            // $.writeln("[RPC] Keeping known comp: " + _savedCompName);
            return;
        }

        _cachedActiveComp = comp;
        _savedCompName = incomingName;
        _savedCompWidth = comp.width;
        _savedCompHeight = comp.height;
        _savedCompFps = Math.round(comp.frameRate);
        _savedCompDuration = comp.duration;
        // $.writeln("[RPC] Cached new active comp: " + incomingName);
    } catch (e) {
        // $.writeln("[RPC] Error in _rememberActiveComp: " + e.message);
    }
}

function _isComp(it) {
    if (!it) return false;
    try {
        if (it.typeName === "Composition") return true;
    } catch (e) {}
    try {
        if (typeof CompItem !== "undefined" && (it instanceof CompItem)) return true;
    } catch (e) {}
    try {
        if (it.layers !== undefined && it.workAreaDuration !== undefined) return true;
    } catch (e) {}
    try {
        if (it.numLayers !== undefined && it.width !== undefined && it.frameRate !== undefined) return true;
    } catch (e) {}
    return false;
}

function _isCompValid(c) {
    if (!c) return false;
    try {
        return !!(c.name && _isComp(c));
    } catch (e) {
        return false;
    }
}

function findActiveComp() {
    if (!app.project) return null;

    // 1. Direct activeItem (works when AE is focused and a comp viewer is open)
    try {
        var ai = app.project.activeItem;
        if (_isComp(ai)) {
            _rememberActiveComp(ai);
            return ai;
        }
    } catch (e) {}

    // 2. Try the active viewer panel (works even when AE is in the background)
    try {
        var viewer = app.activeViewer;
        if (viewer && viewer.type === ViewerType.VIEWER_COMPOSITION) {
            var viewComp = viewer.view.options.zoom;
            // viewer.view is a CompView — get the comp from the parent item
            // In ExtendScript, app.project.activeItem still reflects the last focused comp
            // so we fall through; but we can check the viewer source:
            var src = viewer.source;
            if (src && _isComp(src)) {
                _rememberActiveComp(src);
                return src;
            }
        }
    } catch (e) {}

    // 4. Any selected comp in the project panel
    try {
        var sel = app.project.selection;
        if (sel && sel.length > 0) {
            for (var s = 0; s < sel.length; s++) {
                if (_isComp(sel[s])) {
                    _rememberActiveComp(sel[s]);
                    return sel[s];
                }
            }
        }
    } catch (e) {}

    // NOTE: Removed "scan all project items" fallback — it always returned Comp 1
    // (the first comp in the project), making the display stuck on that name.
    // If we have saved metadata, return null and let the caller use _savedCompName.
    return null;
}

function getProjectInfo() {
    var now = (new Date()).getTime();
    if (_cachedProjectInfo && (now - _lastProjectInfoTime < 500)) {
        return _cachedProjectInfo;
    }

    var projectName = "Unsaved Project";
    var compName = "Comp 1";

    try {
        // Active Render Queue Item check
        if (currentSettings.detectRender && app.project && app.project.renderQueue) {
            var rq = app.project.renderQueue;
            if (rq.rendering) {
                var total = 0;
                var activeIdx = 0;
                var renderingComp = "";

                for (var i = 1; i <= rq.numItems; i++) {
                    var item = rq.item(i);
                    if (item && item.render) {
                        total++;
                        if (item.status === RQItemStatus.RENDERING) {
                            activeIdx = total;
                            renderingComp = item.comp ? item.comp.name : "Active Item";
                        }
                    }
                }

                var title = currentSettings.useEmojis ? "🚀 Rendering in AE" : "Rendering in After Effects";
                if (total > 1 && activeIdx > 0) {
                    title += " (" + activeIdx + "/" + total + ")";
                }

                var target = "";
                if (currentSettings.privacyMode) {
                    target = currentSettings.useEmojis ? "🔒 Private Composition" : "Private Composition";
                } else if (renderingComp) {
                    target = (currentSettings.useEmojis ? "🎬 " : "") + renderingComp;
                } else {
                    target = "Active Queue Item";
                }
                _cachedProjectInfo = [title, target];
                _lastProjectInfoTime = now;
                return _cachedProjectInfo;
            }
        }

        // NDA / Privacy mask
        if (currentSettings.privacyMode) {
            var privProj = currentSettings.useEmojis ? "🔒 Confidential Project" : "Confidential Project";
            var privComp = currentSettings.useEmojis ? "🔒 Private Composition" : "Private Composition";
            _cachedProjectInfo = [privProj, privComp];
            _lastProjectInfoTime = now;
            return _cachedProjectInfo;
        }

        // Active project file
        if (app.project && app.project.file) {
            projectName = app.project.file.name;
            if (currentSettings.stripExtension) {
                projectName = projectName.replace(/\.aep$/i, "");
            }
        }

        if (currentSettings.useEmojis) {
            projectName = "📁 " + projectName;
        }

        if (currentSettings.showProjectTime && currentSettings.projectTimeStr && currentSettings.projectTimeStr.length > 0) {
            var cleanTime = String(currentSettings.projectTimeStr).replace(/[\[\]]/g, "").trim();
            if (cleanTime.length > 0) {
                projectName += " [" + cleanTime + "]";
            }
        }

        // Composition name, specs (dimensions, frame rate, duration) and optional custom status
        var comp = findActiveComp();
        var rawCustom = currentSettings.customStatus ? String(currentSettings.customStatus).replace(/^\s+|\s+$/g, "") : "";
        var hasCustom = rawCustom.length > 0;

        if (comp) {
            _rememberActiveComp(comp);
        }

        // Use remembered metadata rather than a transient generic active item.
        var compNameStr = (comp && comp.name) ? String(comp.name).replace(/^\s+|\s+$/g, "") : "";
        var useSavedComp = comp && _savedCompName &&
            !_isGenericFallbackCompName(_savedCompName) &&
            _isGenericFallbackCompName(compNameStr);
        // Also use saved if comp is null/undefined but we have a saved name
        if (!comp && _savedCompName && !_isGenericFallbackCompName(_savedCompName)) {
            useSavedComp = true;
        }
        var activeName = useSavedComp ? _savedCompName : (compNameStr || _savedCompName);
        var activeW = useSavedComp ? _savedCompWidth : (comp ? comp.width : _savedCompWidth);
        var activeH = useSavedComp ? _savedCompHeight : (comp ? comp.height : _savedCompHeight);
        var activeFps = useSavedComp ? _savedCompFps : (comp ? Math.round(comp.frameRate) : _savedCompFps);
        var activeDur = useSavedComp ? _savedCompDuration : (comp ? comp.duration : _savedCompDuration);

        if (activeName && activeName.length > 0) {
            var parts = [];

            // Comp size and frame rate (e.g. 1080x1920 @ 60fps)
            if (currentSettings.showSpecs && activeW > 0 && activeH > 0) {
                var resStr = activeW + "x" + activeH;
                if (activeFps > 0) {
                    resStr += " @ " + activeFps + "fps";
                }
                parts.push(resStr);
            }

            // Duration (e.g. 0:30)
            if (currentSettings.showDuration && activeDur > 0) {
                var dur = formatDuration(activeDur);
                if (dur && dur !== "0:00") parts.push(dur);
            }

            // Format Tag (e.g. 9:16, 4K, 1080p)
            if (currentSettings.showFormatTag && activeW > 0 && activeH > 0) {
                var fTag = getFormatTag(activeW, activeH, currentSettings.useEmojis);
                if (fTag) parts.push(fTag);
            }

            // Workflow Tag (e.g. 3D Scene, Typography, Motion Design)
            if (currentSettings.showWorkflow && comp) {
                var wTag = detectWorkflow(comp, currentSettings.useEmojis);
                if (wTag) parts.push(wTag);
            }

            // Layers (e.g. 24 layers)
            if (currentSettings.showLayers && comp && comp.numLayers > 0) {
                var layerStr = comp.numLayers + (currentSettings.useEmojis ? " 📑" : " layers");
                parts.push(layerStr);
            }

            // Optional custom status / preset if selected
            if (hasCustom) {
                parts.push(rawCustom);
            }

            compName = activeName + (parts.length > 0 ? " • " + parts.join(" • ") : "");
        } else if (hasCustom) {
            compName = rawCustom;
        } else {
            compName = _savedCompName && !_isGenericFallbackCompName(_savedCompName) ? _savedCompName : "No composition selected";
        }
    } catch (err) {
        _cachedProjectInfo = [projectName, compName];
        _lastProjectInfoTime = now;
        return _cachedProjectInfo;
    }

    _cachedProjectInfo = [projectName, compName];
    _lastProjectInfoTime = now;
    return _cachedProjectInfo;
}

function getCurrentPresencePreview(settingsJson) {
    if (settingsJson) updateSettings(settingsJson);
    var info = getProjectInfo();
    var p = String(info[0]).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    var c = String(info[1]).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    var w = 0, h = 0, fps = 0, layers = 0, isRendering = false;
    var rawProjectName = "Unsaved Project";

    try {
        if (app.project && app.project.file) {
            rawProjectName = app.project.file.name;
        }
        if (app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
            isRendering = true;
        }
        var comp = findActiveComp();
        if (comp) {
            w = comp.width;
            h = comp.height;
            fps = Math.round(comp.frameRate);
            layers = comp.numLayers;
        }
    } catch (e) {}

    var safeRawProj = String(rawProjectName).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return '{"project":"' + p + '","comp":"' + c + '","rawProject":"' + safeRawProj + '","w":' + w + ',"h":' + h + ',"fps":' + fps + ',"layers":' + layers + ',"rendering":' + (isRendering ? 'true' : 'false') + '}';
}

function connectToDiscord(settingsJson, extPath) {
    if (settingsJson) updateSettings(settingsJson);
    if (extPath) launchBridge(extPath);
    var info = getProjectInfo();
    if (info[0] === -1 && info[1] === -1) return;

    return sendCommand("UPDATE_PRESENCE", {
        project: info[0],
        comp: info[1]
    });
}

function disconnectDiscord() {
    return sendCommand("DISCONNECT", {});
}
