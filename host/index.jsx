/**
 * After Effects Discord Rich Presence (Host Engine)
 *
 * Developed by Jadenaep | Runeveil Studio
 * Free & Open Source for the community
 * https://github.com/runeveilstudio/xyz.rpcdiscord.ae
 */

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
        if (dataObject.project) p = String(dataObject.project).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (dataObject.comp) c = String(dataObject.comp).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
            conn.close();

            if (raw && raw.length > 0) {
                try {
                    var res = eval("(" + raw + ")");
                    status = res.status;
                    msg = res.message;
                } catch (e) {
                    status = "ERROR";
                    msg = "Malformed response";
                }
            }
        }
    } catch (e) {
        status = "OFFLINE";
        msg = "Socket error";
    }

    var safeMsg = String(msg).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return '{"status":"' + status + '","message":"' + safeMsg + '"}';
}

function getBridgeStatus(settingsJson) {
    if (settingsJson) updateSettings(settingsJson);
    var info = getProjectInfo();
    return sendCommand("STATUS", {
        project: info[0],
        comp: info[1]
    });
}

// Persistent Active Composition Cache & Metadata Memory (prevents losing comp info when AE is in background)
var _cachedActiveComp = null;
var _savedCompName = "";
var _savedCompWidth = 0;
var _savedCompHeight = 0;
var _savedCompFps = 0;
var _savedCompDuration = 0;

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

    // 1. Direct activeItem
    try {
        var ai = app.project.activeItem;
        if (_isComp(ai)) {
            _cachedActiveComp = ai;
            _savedCompName = ai.name;
            _savedCompWidth = ai.width;
            _savedCompHeight = ai.height;
            _savedCompFps = Math.round(ai.frameRate);
            _savedCompDuration = ai.duration;
            return ai;
        }
    } catch (e) {}

    // 2. Previously cached comp
    try {
        if (_cachedActiveComp && _isCompValid(_cachedActiveComp)) {
            return _cachedActiveComp;
        }
    } catch (e) {}

    // 3. Any selected comp in the project panel
    try {
        var sel = app.project.selection;
        if (sel && sel.length > 0) {
            for (var s = 0; s < sel.length; s++) {
                if (_isComp(sel[s])) {
                    _cachedActiveComp = sel[s];
                    _savedCompName = sel[s].name;
                    _savedCompWidth = sel[s].width;
                    _savedCompHeight = sel[s].height;
                    _savedCompFps = Math.round(sel[s].frameRate);
                    _savedCompDuration = sel[s].duration;
                    return sel[s];
                }
            }
        }
    } catch (e) {}

    // 4. Any composition in the project items
    try {
        var num = app.project.numItems;
        if (num && num > 0) {
            for (var i = 1; i <= num; i++) {
                var it = app.project.item(i);
                if (_isComp(it)) {
                    _cachedActiveComp = it;
                    if (!_savedCompName || _savedCompName.length === 0) {
                        _savedCompName = it.name;
                        _savedCompWidth = it.width;
                        _savedCompHeight = it.height;
                        _savedCompFps = Math.round(it.frameRate);
                        _savedCompDuration = it.duration;
                    }
                    return it;
                }
            }
        }
    } catch (e) {}

    return null;
}

function getProjectInfo() {
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
                return [title, target];
            }
        }

        // NDA / Privacy mask
        if (currentSettings.privacyMode) {
            var privProj = currentSettings.useEmojis ? "🔒 Confidential Project" : "Confidential Project";
            var privComp = currentSettings.useEmojis ? "🔒 Private Composition" : "Private Composition";
            return [privProj, privComp];
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
            try {
                _savedCompName = comp.name;
                _savedCompWidth = comp.width;
                _savedCompHeight = comp.height;
                _savedCompFps = Math.round(comp.frameRate);
                _savedCompDuration = comp.duration;
            } catch (e) {}
        }

        var activeName = _savedCompName;
        var activeW = _savedCompWidth;
        var activeH = _savedCompHeight;
        var activeFps = _savedCompFps;
        var activeDur = _savedCompDuration;

        if (!activeName || activeName.length === 0) {
            try {
                if (app.project && app.project.numItems > 0) {
                    for (var j = 1; j <= app.project.numItems; j++) {
                        var pi = app.project.item(j);
                        if (_isComp(pi)) {
                            activeName = pi.name;
                            activeW = pi.width;
                            activeH = pi.height;
                            activeFps = Math.round(pi.frameRate);
                            activeDur = pi.duration;
                            _savedCompName = activeName;
                            _savedCompWidth = activeW;
                            _savedCompHeight = activeH;
                            _savedCompFps = activeFps;
                            _savedCompDuration = activeDur;
                            break;
                        }
                    }
                }
            } catch (e) {}
        }

        if (activeName && activeName.length > 0) {
            var parts = [];

            // Comp size and frame rate (e.g. 1080x1920 @ 60fps)
            if (activeW > 0 && activeH > 0) {
                var resStr = activeW + "x" + activeH;
                if (activeFps > 0) {
                    resStr += " @ " + activeFps + "fps";
                }
                parts.push(resStr);
            }

            // Duration (e.g. 0:30)
            if (activeDur > 0) {
                var dur = formatDuration(activeDur);
                if (dur && dur !== "0:00") parts.push(dur);
            }

            // Optional custom status / preset if selected
            if (hasCustom) {
                parts.push(rawCustom);
            }

            compName = activeName + (parts.length > 0 ? " • " + parts.join(" • ") : "");
        } else if (hasCustom) {
            compName = rawCustom;
        } else {
            compName = "Comp 1";
        }
    } catch (err) {
        return [projectName, compName];
    }

    return [projectName, compName];
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