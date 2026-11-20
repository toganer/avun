/** Window: a landscape gliding past a train window. Views: hills · lake with houses · coast. */
import { circle, eventPhase, hill, mix, polygon, rect, roundedRectPath, wrap } from "./paint.js";
import { DESIGN_HEIGHT } from "./types.js";
export const trainWindow = (c, W, H, f) => {
    const s = H / DESIGN_HEIGHT;
    const { t, progress: p, view, landing: L, odometer: od } = f;
    rect(c, 0, 0, W, H, "#2C2F42");
    // The glass.
    const x0 = W * 0.08;
    const y0 = H * 0.16;
    const ww = W * 0.84;
    const wh = H * 0.54;
    const radius = 34 * s;
    c.save();
    c.beginPath();
    roundedRectPath(c, x0, y0, ww, wh, radius);
    c.clip();
    // Sky and sun: the light turns from afternoon to sunset over the session.
    rect(c, x0, y0, ww, wh, mix("#F5C99A", "#EFA77A", p));
    rect(c, x0, y0 + wh * 0.4, ww, wh * 0.6, mix("#EFB585", "#E8916A", p));
    circle(c, x0 + ww * 0.68, y0 + wh * (0.25 + 0.3 * p), (30 + 10 * p) * s, mix("#FFF1D8", "#F6B36E", p));
    hill(c, W, H, { base: y0 + wh * 0.55, amp: 14 * s, freq: 0.01, phase: 1, offset: od * 0.08, colour: mix("#D49572", "#B9735C", p) });
    if (view === 1) {
        // Lake with houses on the far shore.
        rect(c, x0, y0 + wh * 0.62, ww, wh * 0.12, "#8FB4C8");
        for (let q = 0; q < 3; q++) {
            c.globalAlpha = 0.6 - q * 0.15;
            rect(c, x0 + ww * 0.55 - (30 - q * 8) * s, y0 + wh * 0.64 + q * 9 * s, (60 - q * 16) * s, 2.5 * s, "#FBE0B4");
        }
        c.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
            const hx = wrap(i * 140 - od * 0.25, ww + 140) + x0 - 70;
            const top = y0 + wh * 0.56;
            rect(c, hx, top, 18 * s, 22 * s, "#8A5C50");
            polygon(c, [hx - 2 * s, top, hx + 9 * s, top - 10 * s, hx + 20 * s, top], "#6E4A45");
        }
    }
    else if (view === 2) {
        // Coast: sea and a sandy shore.
        rect(c, x0, y0 + wh * 0.55, ww, wh * 0.2, "#3F6F91");
        for (let i = 0; i < 4; i++) {
            c.globalAlpha = 0.5;
            rect(c, x0 + wrap(i * 90 - od * 0.2, ww), y0 + wh * 0.6 + i * 7 * s, 40 * s, 2 * s, "#FBE0B4");
        }
        c.globalAlpha = 1;
        hill(c, W, H, { base: y0 + wh * 0.74, amp: 6 * s, freq: 0.02, phase: 2, offset: od * 0.5, colour: "#E7C08F" });
    }
    else {
        hill(c, W, H, { base: y0 + wh * 0.66, amp: 10 * s, freq: 0.016, phase: 2, offset: od * 0.35, colour: mix("#A86E58", "#8E5747", p) });
    }
    // Fast foreground: grass streaks and telegraph poles.
    const gy = y0 + wh * 0.82;
    rect(c, x0, gy, ww, wh * 0.18, mix("#6B4747", "#5E3B3B", p));
    for (let g = 0; g < 6; g++) {
        const gx = wrap(g * 97 - od * 1.6, ww + 120) + x0 - 60;
        c.globalAlpha = 0.45;
        rect(c, gx, gy + (10 + (g % 3) * 14) * s, (50 + g * 7) * s, 2 * s, "#F5C99A");
    }
    c.globalAlpha = 1;
    const gap = 190 * s;
    for (let k = 0; k < 5; k++) {
        const px = wrap(k * gap - od * 1.2, gap * 5) + x0 - gap * 0.5;
        rect(c, px, y0 + wh * 0.48, 4 * s, wh * 0.36, "#5E3E3E");
        c.strokeStyle = "#5E3E3E";
        c.lineWidth = 1.2 * s;
        c.beginPath();
        c.moveTo(px + 2 * s, y0 + wh * 0.5);
        c.quadraticCurveTo(px + gap / 2, y0 + wh * 0.56, px + gap + 2 * s, y0 + wh * 0.5);
        c.stroke();
    }
    // Now and then a train passes the other way (a dark blur for a few seconds).
    const passing = eventPhase(t, 3, 100);
    if (passing.on && L === 0 && passing.k < 0.25) {
        c.globalAlpha = 0.85;
        rect(c, x0, y0 + wh * 0.3, ww, wh * 0.5, "#3A2C2C");
        c.globalAlpha = 1;
    }
    // Reflection on the glass.
    c.fillStyle = "rgba(255,255,255,0.10)";
    c.beginPath();
    c.moveTo(x0 + 26 * s, y0 + 20 * s);
    c.lineTo(x0 + 90 * s, y0 + 20 * s);
    c.lineTo(x0 + 26 * s, y0 + 110 * s);
    c.fill();
    c.restore();
    // Frame, sill and table.
    c.strokeStyle = "#3C405A";
    c.lineWidth = 12 * s;
    c.beginPath();
    roundedRectPath(c, x0, y0, ww, wh, radius);
    c.stroke();
    rect(c, W * 0.05, y0 + wh + 20 * s, W * 0.9, 16 * s, "#3C405A");
    rect(c, 0, H * 0.83, W, H * 0.17, "#24273A");
};
