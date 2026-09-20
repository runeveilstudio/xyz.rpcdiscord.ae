/**
 * Thinking Orb Engine for Runeveil AE Discord RPC
 * Inspired by libraries.dev/orbs
 * Zero-dependency lightweight HTML5 Canvas fluid animation
 */

(function(window) {
    function ThinkingOrb(canvasId, options) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.options = options || {};
        this.state = this.options.state || 'disconnected'; // 'disconnected' | 'connecting' | 'connected' | 'rendering'
        this.size = this.options.size || 48;
        this.speed = this.options.speed || 1.0;
        this.time = 0;
        this.animId = null;
        this.running = false;
        
        // Handle High-DPI screens (Retina / 4K)
        this.setupCanvas();
        this.start();
    }

    ThinkingOrb.prototype.setupCanvas = function() {
        var dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.size * dpr;
        this.canvas.height = this.size * dpr;
        this.canvas.style.width = this.size + 'px';
        this.canvas.style.height = this.size + 'px';
        this.ctx.scale(dpr, dpr);
    };

    ThinkingOrb.prototype.setState = function(newState) {
        if (this.state !== newState) {
            this.state = newState;
        }
    };

    ThinkingOrb.prototype.start = function() {
        if (this.running) return;
        this.running = true;
        var self = this;
        function loop() {
            if (!self.running) return;
            self.draw();
            self.animId = requestAnimationFrame(loop);
        }
        loop();
    };

    ThinkingOrb.prototype.stop = function() {
        this.running = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    };

    ThinkingOrb.prototype.draw = function() {
        var ctx = this.ctx;
        var w = this.size;
        var h = this.size;
        var cx = w / 2;
        var cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        var state = this.state;
        var speed = (state === 'rendering' ? 2.4 : (state === 'connecting' ? 1.8 : (state === 'connected' ? 1.1 : 0.6))) * this.speed;
        this.time += 0.02 * speed;
        var t = this.time;

        ctx.save();

        if (state === 'disconnected') {
            // Calm, low-energy dormant pulse
            var pulse = Math.sin(t * 1.5) * 0.12 + 0.88;
            var r = (w * 0.32) * pulse;

            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.4);
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
            grad.addColorStop(0.5, 'rgba(185, 28, 28, 0.2)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
            ctx.fill();

            // Core sphere
            var coreGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
            coreGrad.addColorStop(0, 'rgba(252, 165, 165, 0.8)');
            coreGrad.addColorStop(0.4, 'rgba(220, 38, 38, 0.9)');
            coreGrad.addColorStop(1, 'rgba(127, 29, 29, 0.95)');

            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();

        } else if (state === 'connecting') {
            // Orbiting weaving particles / liquid nodes (libraries.dev 'weaving' / 'connecting')
            var orbitR = w * 0.26;
            var numNodes = 4;

            // Ambient background glow
            var bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45);
            bgGlow.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
            bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = bgGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.45, 0, Math.PI * 2);
            ctx.fill();

            for (var i = 0; i < numNodes; i++) {
                var angle = t * 2.2 + (i * Math.PI * 2 / numNodes);
                var nodeR = (w * 0.12) + Math.sin(t * 3 + i) * 2;
                var nx = cx + Math.cos(angle) * orbitR;
                var ny = cy + Math.sin(angle) * orbitR * 0.85;

                var nodeGrad = ctx.createRadialGradient(nx - nodeR * 0.2, ny - nodeR * 0.2, 0, nx, ny, nodeR);
                if (i % 2 === 0) {
                    nodeGrad.addColorStop(0, 'rgba(165, 243, 252, 0.95)');
                    nodeGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
                    nodeGrad.addColorStop(1, 'rgba(14, 165, 233, 0.2)');
                } else {
                    nodeGrad.addColorStop(0, 'rgba(224, 231, 255, 0.95)');
                    nodeGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.8)');
                    nodeGrad.addColorStop(1, 'rgba(79, 70, 229, 0.2)');
                }

                ctx.fillStyle = nodeGrad;
                ctx.beginPath();
                ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
                ctx.fill();
            }

        } else if (state === 'rendering') {
            // High energy solar flare / kinetic woven orb (libraries.dev 'working' / 'shaping')
            var pulseFast = Math.sin(t * 4.5) * 0.08 + 1.0;
            var baseR = (w * 0.32) * pulseFast;

            // Radiant corona
            var coronaGrad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, w * 0.48);
            coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
            coronaGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.2)');
            coronaGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
            ctx.fillStyle = coronaGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2);
            ctx.fill();

            // Organic deformable liquid blob
            ctx.beginPath();
            var points = 16;
            for (var p = 0; p <= points; p++) {
                var th = (p / points) * Math.PI * 2;
                var distortion = Math.sin(th * 3 + t * 4) * 3 + Math.cos(th * 5 - t * 3) * 2;
                var pr = baseR + distortion;
                var px = cx + Math.cos(th) * pr;
                var py = cy + Math.sin(th) * pr;
                if (p === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            var blobGrad = ctx.createRadialGradient(cx - baseR * 0.3, cy - baseR * 0.3, baseR * 0.1, cx, cy, baseR * 1.1);
            blobGrad.addColorStop(0, '#fef08a');
            blobGrad.addColorStop(0.35, '#f59e0b');
            blobGrad.addColorStop(0.75, '#ea580c');
            blobGrad.addColorStop(1, '#9a3412');

            ctx.fillStyle = blobGrad;
            ctx.fill();

            // Orbiting flare rings
            ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(cx, cy, baseR * 1.25, baseR * 0.5, t * 1.8, 0, Math.PI * 2);
            ctx.stroke();

        } else {
            // 'connected' / 'listening' / 'solving' - Studio deep fluid harmonic orb
            var baseRadius = w * 0.31;
            var breathe = Math.sin(t * 1.8) * 0.06 + 1.0;
            var currentRadius = baseRadius * breathe;

            // Outer ethereal atmospheric bloom
            var outerGlow = ctx.createRadialGradient(cx, cy, currentRadius * 0.4, cx, cy, w * 0.48);
            outerGlow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
            outerGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
            outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2);
            ctx.fill();

            // Dynamic fluid wave distortion
            ctx.beginPath();
            var totalPts = 24;
            for (var k = 0; k <= totalPts; k++) {
                var phi = (k / totalPts) * Math.PI * 2;
                var offset = Math.sin(phi * 2 + t * 2.2) * 1.8 + Math.cos(phi * 3 - t * 1.6) * 1.2;
                var cr = currentRadius + offset;
                var ox = cx + Math.cos(phi) * cr;
                var oy = cy + Math.sin(phi) * cr;
                if (k === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
            }
            ctx.closePath();

            var coreShader = ctx.createRadialGradient(
                cx - currentRadius * 0.35, 
                cy - currentRadius * 0.35, 
                currentRadius * 0.1, 
                cx, 
                cy, 
                currentRadius * 1.15
            );
            coreShader.addColorStop(0, '#e0e7ff');
            coreShader.addColorStop(0.25, '#818cf8');
            coreShader.addColorStop(0.65, '#4f46e5');
            coreShader.addColorStop(0.9, '#312e81');
            coreShader.addColorStop(1, '#1e1b4b');

            ctx.fillStyle = coreShader;
            ctx.fill();

            // Luminous specular ring / light edge
            ctx.strokeStyle = 'rgba(199, 210, 254, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(cx, cy - currentRadius * 0.15, currentRadius * 0.85, currentRadius * 0.4, 0, Math.PI, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    };

    window.ThinkingOrb = ThinkingOrb;
})(window);
