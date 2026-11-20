/** Village: hills, a lit window, smoke rising. Views: house · windmill and stream · orchard with lamp. */
import { circle, eventPhase, hill, mix, polygon, rect, stars } from "./paint.js";
import { DESIGN_HEIGHT } from "./types.js";
export const village = (c, W, H, f) => {
    const s = H / DESIGN_HEIGHT;
    const { t, progress: p, view, landing: L } = f;
    rect(c, 0, 0, W, H, mix("#2A2F57", "#1C2046", p));
    rect(c, 0, H * 0.31, W, H * 0.69, mix("#353B6B", "#262B55", p));
    stars(c, W, H, t, 0.35 + 0.6 * p);
    circle(c, W * 0.74, H * (0.2 - 0.06 * p), 30 * s, "#F6E9C9", 0.95);
    const sway = Math.sin(t * 0.6) * (1 - L);
    if (view === 0)
        house(c, W, H, s, f, sway);
    else if (view === 1)
        windmill(c, W, H, s, f);
    else
        orchard(c, W, H, s, f, sway);
    birds(c, W, H, s, t);
};
function house(c, W, H, s, f, sway) {
    const { t, progress: p, landing: L } = f;
    hill(c, W, H, { base: H * 0.5, amp: 14 * s, freq: 0.012, phase: 1, offset: 0, colour: "#454C82" });
    hill(c, W, H, { base: H * 0.6, amp: 10 * s, freq: 0.016, phase: 2, offset: 0, colour: "#2E3460" });
    const hx = W * 0.38;
    const hy = H * 0.56;
    rect(c, hx, hy, 96 * s, 68 * s, "#1F2347");
    polygon(c, [hx - 10 * s, hy + 2 * s, hx + 48 * s, hy - 40 * s, hx + 106 * s, hy + 2 * s], "#E07A5F");
    rect(c, hx + 18 * s, hy + 18 * s, 22 * s, 22 * s, "#F4B860");
    rect(c, hx + 56 * s, hy + 28 * s, 20 * s, 40 * s, "#161A36");
    // A second window lights up halfway through.
    if (p > 0.5 || L > 0)
        rect(c, hx + 56 * s, hy + 12 * s, 14 * s, 12 * s, "#F4B860");
    rect(c, hx + 74 * s, hy - 38 * s, 12 * s, 28 * s, "#1F2347");
    // Chimney smoke.
    for (let i = 0; i < 5; i++) {
        const k = (t * 0.12 * (1 - 0.5 * L) + i / 5) % 1;
        circle(c, hx + 80 * s + k * 36 * s + Math.sin(t + i) * 4 * s, hy - 44 * s - k * 120 * s, (7 + k * 14) * s, "#F6E9C9", 0.3 * (1 - k) * (1 - 0.7 * L));
    }
    tree(c, W * 0.2, H * 0.6, 30 * s, sway * 0.02, { left: 4 * s, up: 8 * s, width: 8 * s, height: 34 * s });
    tree(c, W * 0.82, H * 0.61, 24 * s, -sway * 0.02, { left: 3 * s, up: 6 * s, width: 7 * s, height: 28 * s });
    hill(c, W, H, { base: H * 0.76, amp: 6 * s, freq: 0.01, phase: 3, offset: 0, colour: "#1B1F3E" });
    rect(c, 0, H * 0.74, W * 0.4, 10 * s, "#151830");
    // Now and then a cat walks along the wall.
    const cat = eventPhase(t, 1, 90);
    if (cat.on) {
        const x = W * 0.4 * cat.k;
        const y = H * 0.74;
        polygon(c, [x, y, x + 14 * s, y, x + 18 * s, y - 12 * s, x + 4 * s, y - 10 * s], "#151830");
    }
}
/** A round tree that sways a little (stops swaying while landing). */
function tree(c, x, y, r, tilt, trunk) {
    c.save();
    c.translate(x, y);
    c.rotate(tilt);
    circle(c, 0, -r, r, "#232850");
    c.restore();
    rect(c, x - trunk.left, y - trunk.up, trunk.width, trunk.height, "#161A36");
}
function windmill(c, W, H, s, f) {
    const { t, landing: L } = f;
    hill(c, W, H, { base: H * 0.47, amp: 16 * s, freq: 0.011, phase: 4, offset: 0, colour: "#3E4579" });
    const mx = W * 0.75;
    const my = H * 0.42;
    rect(c, mx - 5 * s, my, 10 * s, 40 * s, "#161A36");
    c.save();
    c.translate(mx, my);
    c.rotate(t * 0.5 * (1 - L));
    c.fillStyle = "#161A36";
    for (let j = 0; j < 4; j++) {
        c.rotate(Math.PI / 2);
        c.fillRect(0, -3 * s, 36 * s, 6 * s);
    }
    c.restore();
    hill(c, W, H, { base: H * 0.58, amp: 10 * s, freq: 0.014, phase: 1, offset: 0, colour: "#2A2F5C" });
    // Stream with moonlight.
    const sy = H * 0.7;
    rect(c, 0, sy, W, 46 * s, "#4A5A92");
    for (let q = 0; q < 8; q++) {
        const w = (40 - q * 4) * s * (0.7 + 0.3 * Math.sin(t * 1.5 + q));
        c.globalAlpha = 0.6 - q * 0.06;
        rect(c, W * 0.3 - w / 2, sy + 4 * s + q * 5 * s, w, 2 * s, "#F6E9C9");
        c.globalAlpha = 1;
    }
    // Footbridge.
    c.fillStyle = "#161A36";
    c.beginPath();
    c.moveTo(W * 0.48, sy + 4 * s);
    c.quadraticCurveTo(W * 0.63, sy - 40 * s, W * 0.78, sy + 4 * s);
    c.lineTo(W * 0.78, sy + 10 * s);
    c.quadraticCurveTo(W * 0.63, sy - 30 * s, W * 0.48, sy + 10 * s);
    c.fill();
    // Sheep grazing.
    for (let i = 0; i < 3; i++) {
        const x = W * (0.15 + i * 0.1) + Math.sin(t * 0.2 + i) * 4 * s;
        c.fillStyle = "#D9D3C6";
        c.beginPath();
        c.ellipse(x, H * 0.66, 10 * s, 7 * s, 0, 0, 6.28);
        c.fill();
        circle(c, x + 10 * s, H * 0.655, 3.5 * s, "#161A36");
    }
    hill(c, W, H, { base: H * 0.8, amp: 5 * s, freq: 0.01, phase: 2, offset: 0, colour: "#191C38" });
}
function orchard(c, W, H, s, f, sway) {
    const { t } = f;
    hill(c, W, H, { base: H * 0.5, amp: 12 * s, freq: 0.013, phase: 5, offset: 0, colour: "#3B4277" });
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            const x = W * (0.12 + col * 0.19) + (row % 2) * W * 0.08;
            const y = H * (0.6 + row * 0.06);
            rect(c, x - 2 * s, y, 5 * s, 20 * s, "#161A36");
            c.save();
            c.translate(x, y);
            c.rotate(sway * 0.015);
            circle(c, 0, -8 * s, (14 - row) * s, "#262B52");
            c.restore();
        }
    }
    // Lamp on a bench.
    const lx = W * 0.5;
    const ly = H * 0.8;
    rect(c, lx - 50 * s, ly, 100 * s, 6 * s, "#161A36");
    rect(c, lx - 3 * s, ly - 40 * s, 6 * s, 40 * s, "#161A36");
    circle(c, lx, ly - 44 * s, 16 * s, "#F4B860", 0.18 + 0.06 * Math.sin(t * 2));
    circle(c, lx, ly - 44 * s, 5 * s, "#F4B860");
    hill(c, W, H, { base: H * 0.86, amp: 4 * s, freq: 0.01, phase: 1, offset: 0, colour: "#191C38" });
}
/** Two birds cross the sky every so often, in every view. */
function birds(c, W, H, s, t) {
    const ev = eventPhase(t, 2, 75);
    if (!ev.on)
        return;
    const bx = -40 + (W + 80) * ev.k;
    const by = H * 0.22 + ev.r() * H * 0.1;
    c.strokeStyle = "#EDE7DC";
    c.lineWidth = 1.8 * s;
    c.globalAlpha = 0.7;
    for (let z = 0; z < 2; z++) {
        const o = z * 22 * s;
        const flap = Math.sin(t * 8 + z) * 3 * s;
        const y = by + z * 8 * s;
        c.beginPath();
        c.moveTo(bx + o, y);
        c.quadraticCurveTo(bx + o + 7 * s, y - 6 * s - flap, bx + o + 14 * s, y);
        c.quadraticCurveTo(bx + o + 21 * s, y - 6 * s - flap, bx + o + 28 * s, y);
        c.stroke();
    }
    c.globalAlpha = 1;
}
