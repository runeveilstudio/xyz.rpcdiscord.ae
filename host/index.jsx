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
    
    if (comp.id === _cachedCompId && comp.numLayers === _cachedLayerCount) {
        return _cachedWorkflowTag;
    }

    _cachedCompId = comp.id;
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
            if (layer instanceof CameraLayer) {
                hasCamera = true;
                break;
            }
            if (layer instanceof LightLayer) {
                hasLight = true;
                break;
            }
            if (layer instanceof TextLayer) {
                textCount++;
            } else if (layer instanceof ShapeLayer) {
                shapeCount++;
            } else if (layer.hasAudio && !layer.hasVideo) {
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

function getProjectInfo() {
    var projectName = "Unsaved Project";
    var compName = "No Active Comp";

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
            projectName += " [" + currentSettings.projectTimeStr + "]";
        }

        if (currentSettings.customStatus && currentSettings.customStatus.length > 0) {
            projectName += " • " + currentSettings.customStatus;
        }

        // Active composition metadata
        if (app.project && app.project.activeItem && (app.project.activeItem instanceof CompItem)) {
            var comp = app.project.activeItem;
            var label = comp.name;
            if (currentSettings.useEmojis) {
                label = "🎬 " + label;
            }

            var tags = [];

            if (currentSettings.showFormatTag) {
                var fmt = getFormatTag(comp.width, comp.height, currentSettings.useEmojis);
                if (fmt) tags.push(fmt);
            }

            if (currentSettings.showSpecs) {
                tags.push(comp.width + "x" + comp.height);
                tags.push(Math.round(comp.frameRate) + "fps");
            }

            if (currentSettings.showDuration && comp.duration > 0) {
                var dur = formatDuration(comp.duration);
                if (dur) tags.push(dur);
            }

            if (currentSettings.showLayers && comp.numLayers > 0) {
                tags.push(comp.numLayers + (comp.numLayers === 1 ? " layer" : " layers"));
            }

            if (currentSettings.showWorkflow) {
                var wf = detectWorkflow(comp, currentSettings.useEmojis);
                if (wf) tags.push(wf);
            }

            compName = tags.length > 0 ? label + " • " + tags.join(" • ") : label;
        } else if (app.project && app.project.items && app.project.items.length > 0) {
            compName = currentSettings.useEmojis ? "🎬 Browsing Assets" : "Browsing Assets";
        } else {
            compName = currentSettings.useEmojis ? "🎬 No Active Comp" : "No Active Comp";
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
        if (app.project && app.project.activeItem && (app.project.activeItem instanceof CompItem)) {
            var activeComp = app.project.activeItem;
            w = activeComp.width;
            h = activeComp.height;
            fps = Math.round(activeComp.frameRate);
            layers = activeComp.numLayers;
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