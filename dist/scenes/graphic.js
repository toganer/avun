/** Graphic: bold shapes and a flowing flock that gathers into a ring at the end. */
import { circle, eventPhase, mix, polygon, rect, rng, roundedRectPath } from "./paint.js";
import { DESIGN_HEIGHT } from "./types.js";
const FLOCK = (() => {
    const r = rng(5);
    return Array.from({ length: 150 }, () => ({
        angle: r() * 6.28,
        orbit: r() + 0.5,
        dx: r() * 2 - 1,
        dy: r() * 2 - 1,
        size: 1.5 + r() * 1.5,
        alpha: 0.55 + r() * 0.45,
    }));
})();
export const graphic = (c, W, H, f) => {
    const s = H / DESIGN_HEIGHT;
    const { t, progress: p, view, landing: L } = f;
    rect(c, 0, 0, W, H, mix("#14142B", "#1E1A40", p));
    if (view === 0) {
        circle(c, W * 0.8 + Math.sin(t * 0.1) * 10 * s, H * 0.22, 120 * s, "#FF6B4A");
        c.fillStyle = "#7B6CFF";
        c.beginPath();
        roundedRectPath(c, -40 * s, H * 0.66, 220 * s, 220 * s, 110 * s);
        c.fill();
        c.strokeStyle = "#FF6B4A";
        c.lineWidth = 4 * s;
        c.strokeRect(W * 0.55, H * 0.78, 110 * s, 110 * s);
    }
    else if (view === 1) {
        polygon(c, [W * 0.05, H * 0.12, W * 0.75, H * 0.08, W * 0.45, H * 0.42], "#7B6CFF");
        c.strokeStyle = "#FF6B4A";
        c.lineWidth = 22 * s;
        c.beginPath();
        c.arc(W * 0.72, H * 0.74, 100 * s, 0, 6.28);
        c.stroke();
        circle(c, W * 0.18, H * 0.72, 44 * s, "#FF6B4A");
    }
    else {
        circle(c, W * 0.5, H * 0.5, 190 * s, "#7B6CFF", 0.25);
        circle(c, W * 0.5, H * 0.5, 120 * s, "#FF6B4A");
    }
    const cx = W * 0.5;
    const cy = H * 0.5;
    const ringR = Math.min(W, H) * 0.32;
    const tt = t * 0.12 * (1 - 0.6 * L);
    for (const b of FLOCK) {
        let lx;
        let ly;
        if (view === 0) {
            // A wandering stream.
            lx = W * (0.5 + 0.42 * Math.sin(tt * 1.3 + b.angle * 0.15));
            ly = H * (0.48 + 0.16 * Math.sin(tt * 2.1 + b.angle * 0.15) + 0.06 * Math.sin(tt * 0.7));
        }
        else if (view === 1) {
            // A slow whirl.
            const a = tt * 1.6 + b.angle * 0.4;
            const rr = (40 + b.orbit * 120) * s;
            lx = cx + Math.cos(a) * rr;
            ly = cy + Math.sin(a) * rr * 0.8;
        }
        else {
            // A breathing ring.
            const a = tt * 1.2 + b.angle;
            lx = cx + Math.cos(a) * ringR * (0.85 + 0.15 * Math.sin(tt * 3 + b.angle));
            ly = cy + Math.sin(a) * ringR * (0.85 + 0.15 * Math.cos(tt * 2 + b.angle));
        }
        let x = lx + b.dx * 24 * s * Math.sin(t * 0.9 + b.angle);
        let y = ly + b.dy * 24 * s * Math.cos(t * 0.8 + b.angle);
        if (L > 0) {
            // Landing: every bird settles onto its place in a still ring.
            const rx = cx + Math.cos(b.angle) * ringR;
            const ry = cy + Math.sin(b.angle) * ringR;
            x += (rx - x) * L;
            y += (ry - y) * L;
        }
        circle(c, x, y, b.size * s * 1.2, "#F2E9DC", b.alpha);
    }
    // A thin curve sweeps across now and then.
    const sweep = eventPhase(t, 5, 80);
    if (sweep.on) {
        c.strokeStyle = "rgba(242,233,220,0.35)";
        c.lineWidth = 2 * s;
        c.beginPath();
        const yl = H * (0.2 + 0.6 * sweep.k);
        c.moveTo(0, yl);
        c.bezierCurveTo(W * 0.3, yl - 60 * s, W * 0.7, yl + 60 * s, W, yl);
        c.stroke();
    }
};
