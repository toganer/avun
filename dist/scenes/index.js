/** The theme registry: one entry per theme, everything else looks themes up here. */
import { graphic } from "./graphic.js";
import { sea } from "./sea.js";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./types.js";
import { village } from "./village.js";
import { trainWindow } from "./window.js";
export const THEME_IDS = ["village", "window", "sea", "graphic"];
export const THEMES = {
    village: { id: "village", paint: village, nameKey: "village", lineKey: "villageLine", dot: ["#2B3156", "#F4B860"] },
    window: { id: "window", paint: trainWindow, nameKey: "window", lineKey: "windowLine", dot: ["#F5C99A", "#A86E58"] },
    sea: { id: "sea", paint: sea, nameKey: "sea", lineKey: "seaLine", dot: ["#12243D", "#6FE3D2"] },
    graphic: { id: "graphic", paint: graphic, nameKey: "graphic", lineKey: "graphicLine", dot: ["#14142B", "#FF6B4A"] },
};
export function isThemeId(value) {
    return typeof value === "string" && THEME_IDS.includes(value);
}
/** Paints a still preview of a theme into a picker card (cropped from the middle of a phone-shaped frame). */
export function paintThumbnail(canvas, id) {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = box.width * dpr;
    canvas.height = box.height * dpr;
    const c = canvas.getContext("2d");
    if (!c)
        return;
    const W = canvas.width;
    const H = (W * DESIGN_HEIGHT) / DESIGN_WIDTH;
    c.save();
    c.translate(0, -(H - canvas.height) / 2);
    THEMES[id].paint(c, W, H, { t: 12, progress: 0.2, view: 0, landing: 0, odometer: 0 });
    c.restore();
}
