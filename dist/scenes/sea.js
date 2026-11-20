/** Sea at night: moonlight and glittering waves. Views: open sea · lighthouse · jetty. */
import { circle, eventPhase, polygon, rect, rng, stars } from "./paint.js";
import { DESIGN_HEIGHT } from "./types.js";
export const sea = (c, W, H, f) => {
    const s = H / DESIGN_HEIGHT;
    const { t, progress: p, view, landing: L } = f;
    const horizon = H * 0.5;
    rect(c, 0, 0, W, H, "#0E1A30");
    stars(c, W, H, t, 0.4 + 0.5 * p);
    // The moon climbs over the session.
    const moonX = view === 1 ? W * 0.3 : W * 0.64;
    const moonY = H * (0.26 - 0.08 * p);
    circle(c, moonX, moonY, 32 * s, "#F6E9C9");
    if (view === 1)
        lighthouse(c, W, s, t, horizon);
    rect(c, 0, horizon, W, H - horizon, "#122842");
    rect(c, 0, horizon - 1, W, 2, "#2B4468");
    if (view === 2) {
        rect(c, W * 0.15, horizon + 40 * s, W * 0.7, 8 * s, "#5A4636");
        for (let i = 0; i < 7; i++)
            rect(c, W * 0.17 + i * W * 0.1, horizon + 40 * s, 4 * s, 40 * s, "#3B2F2A");
    }
    // The waves calm down while landing.
    const swell = 1 - 0.75 * L;
    // Moon path on the water.
    for (let i = 0; i < 16; i++) {
        const y = horizon + 12 * s + i * 24 * s;
        const w = (70 - i * 3) * s * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 0.7) * swell);
        c.globalAlpha = Math.max(0.1, 0.75 - i * 0.04);
        rect(c, moonX - w / 2, y, w, 3 * s, "#F6E9C9");
    }
    c.globalAlpha = 1;
    // Wave lines.
    c.strokeStyle = "#1E3A60";
    c.lineWidth = 2 * s;
    for (let k = 0; k < 7; k++) {
        const yy = horizon + 30 * s + k * 52 * s;
        const off = (t * 18 * swell + k * 40) % 100;
        c.beginPath();
        for (let x = -100; x <= W + 100; x += 10) {
            const y = yy + Math.sin((x + off) / 50) * 5 * s * swell;
            if (x === -100)
                c.moveTo(x, y);
            else
                c.lineTo(x, y);
        }
        c.stroke();
    }
    // Yakamoz: glints that fade in and out; fewer as the session lands.
    const r = rng(11 + view);
    const count = Math.round(70 * (1 - 0.7 * L));
    for (let j = 0; j < count; j++) {
        const x = r() * W;
        const y = horizon + 10 * s + r() * (H - horizon - 10 * s);
        const phase = r() * 6.28;
        const rate = 0.6 + r() * 1.2;
        if (Math.abs(x - moonX) < 40 * s)
            continue;
        const a = Math.max(0, Math.sin(t * rate + phase));
        circle(c, x, y, (1 + r() * 1.2) * s, "#6FE3D2", a * 0.9);
    }
    // A boat crosses the horizon now and then.
    const boat = eventPhase(t, 4, 110);
    if (boat.on && view !== 1) {
        const bx = -60 + (W + 120) * boat.k;
        polygon(c, [bx, horizon - 6 * s, bx + 36 * s, horizon - 6 * s, bx + 30 * s, horizon + 2 * s, bx + 6 * s, horizon + 2 * s], "#0A1222");
        rect(c, bx + 16 * s, horizon - 34 * s, 2 * s, 28 * s, "#0A1222");
    }
};
function lighthouse(c, W, s, t, horizon) {
    c.fillStyle = "#0A1222";
    c.beginPath();
    c.moveTo(W * 0.6, horizon);
    c.quadraticCurveTo(W * 0.7, horizon - 60 * s, W, horizon - 70 * s);
    c.lineTo(W, horizon);
    c.fill();
    const lx = W * 0.84;
    const ly = horizon - 170 * s;
    rect(c, lx, ly, 18 * s, 100 * s, "#D9D3C6");
    rect(c, lx, ly + 24 * s, 18 * s, 12 * s, "#B0463A");
    rect(c, lx, ly + 56 * s, 18 * s, 12 * s, "#B0463A");
    rect(c, lx - 4 * s, ly - 14 * s, 26 * s, 14 * s, "#F6E9C9");
    // Sweeping beam.
    const a = Math.sin(t * 0.5) * 0.5;
    const ox = lx + 9 * s;
    const oy = ly - 7 * s;
    c.globalAlpha = 0.1;
    c.fillStyle = "#F6E9C9";
    c.beginPath();
    c.moveTo(ox, oy);
    c.lineTo(ox - Math.cos(a) * W, oy - 60 * s + Math.sin(a) * 120 * s);
    c.lineTo(ox - Math.cos(a) * W, oy + 60 * s + Math.sin(a) * 120 * s);
    c.fill();
    c.globalAlpha = 1;
}
