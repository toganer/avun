/** Seeded random numbers (Park–Miller), so a scene looks the same on every run. */
export function rng(seed) {
    let s = Math.floor(seed) % 2147483647;
    if (s <= 0)
        s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}
function rgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
/** Blends two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
export function mix(a, b, t) {
    const A = rgb(a);
    const B = rgb(b);
    const ch = (i) => Math.round(A[i] + (B[i] - A[i]) * t);
    return `rgb(${ch(0)},${ch(1)},${ch(2)})`;
}
export function rect(c, x, y, w, h, colour) {
    c.fillStyle = colour;
    c.fillRect(x, y, w, h);
}
export function circle(c, x, y, r, colour, alpha = 1) {
    c.globalAlpha = alpha;
    c.fillStyle = colour;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
}
/** Filled polygon from a flat list: x0, y0, x1, y1, … */
export function polygon(c, pts, colour) {
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(pts[0] ?? 0, pts[1] ?? 0);
    for (let i = 2; i + 1 < pts.length; i += 2)
        c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fill();
}
export function roundedRectPath(c, x, y, w, h, r) {
    if (typeof c.roundRect === "function")
        c.roundRect(x, y, w, h, r);
    else
        c.rect(x, y, w, h);
}
/** A rolling hill line filled to the bottom of the screen. */
export function hill(c, w, h, spec) {
    const { base, amp, freq, phase, offset, colour } = spec;
    c.fillStyle = colour;
    c.beginPath();
    c.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) {
        const y = base +
            Math.sin((x + offset) * freq + phase) * amp +
            Math.sin((x + offset) * freq * 2.3 + phase * 1.7) * amp * 0.35;
        c.lineTo(x, y);
    }
    c.lineTo(w, h);
    c.closePath();
    c.fill();
}
const STARS = (() => {
    const r = rng(7);
    return Array.from({ length: 60 }, () => ({ x: r(), y: r() * 0.45, r: 0.6 + r(), phase: r() * 6.28, rank: r() }));
})();
/** Twinkling stars; `share` (0..1) is how many are out, so more appear as the session goes on. */
export function stars(c, w, h, t, share) {
    for (const s of STARS) {
        if (s.rank > share)
            continue;
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.8 + s.phase);
        circle(c, s.x * w, s.y * h, s.r, "#F6E9C9", 0.25 + 0.5 * twinkle);
    }
}
/** A small surprise once per `period` seconds, at a random moment in its first half. */
export function eventPhase(t, seed, period) {
    const r = rng(Math.floor(t / period) + seed * 31);
    const at = r() * period * 0.5;
    const local = (t % period) - at;
    return { on: local >= 0 && local < 12, k: local / 12, r };
}
/** Wraps a scrolling position into [0, span), for things that loop past a window. */
export function wrap(x, span) {
    return ((x % span) + span) % span;
}
