/** Draws the chosen scene on the full-screen canvas, and the soft orange glow when a swipe is ready. */
import { THEMES } from "../scenes/index.js";
const SPRING = "transform .35s cubic-bezier(.3,1.6,.5,1)";
export class SceneRenderer {
    constructor(canvas, host) {
        this.canvas = canvas;
        this.host = host;
        /** Animation time: runs at half speed by the end of landing. */
        this.animTime = 0;
        /** Distance travelled by the Window theme: nearly stops while landing. */
        this.odometer = 0;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Canvas 2D is not available");
        this.ctx = ctx;
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }
    set visible(on) {
        this.canvas.style.display = on ? "block" : "none";
    }
    resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const box = this.host.getBoundingClientRect();
        this.canvas.width = Math.round(box.width * dpr);
        this.canvas.height = Math.round(box.height * dpr);
    }
    /** Moves the scene's clocks forward by dt seconds. */
    advance(dt, landing) {
        this.animTime += dt * (1 - 0.5 * landing);
        this.odometer += dt * 60 * (1 - 0.85 * landing);
    }
    draw(input) {
        const { ctx: c } = this;
        const W = this.canvas.width;
        const H = this.canvas.height;
        c.clearRect(0, 0, W, H);
        THEMES[input.theme].paint(c, W, H, {
            t: this.animTime,
            progress: input.progress,
            view: input.view,
            landing: input.landing,
            odometer: this.odometer,
        });
        if (input.swipeGlow) {
            const g = c.createRadialGradient(W / 2, H, 0, W / 2, H, W * 0.7);
            g.addColorStop(0, "rgba(242,166,90,0.45)");
            g.addColorStop(1, "rgba(242,166,90,0)");
            c.fillStyle = g;
            c.fillRect(0, H * 0.6, W, H * 0.4);
        }
    }
    /** Fades the scene in over 2 seconds at the start of a session. */
    fadeIn() {
        const s = this.canvas.style;
        s.opacity = "0";
        requestAnimationFrame(() => {
            s.transition = `opacity 2s ease, ${SPRING}`;
            s.opacity = "1";
        });
    }
    /** A short upward push: "advance" when the swipe worked, "resist" when it isn't earned yet. */
    nudge(kind) {
        const s = this.canvas.style;
        s.transform = kind === "advance" ? "translateY(-30px)" : "translateY(-26px) scaleY(1.02)";
        window.setTimeout(() => (s.transform = ""), kind === "advance" ? 180 : 260);
    }
}
/** Calls tick(dt) at most `fps` times a second (dt in seconds; long gaps are capped). */
export function startFrameLoop(fps, tick) {
    const step = 1 / fps;
    let last = performance.now();
    let pending = 0;
    const frame = (now) => {
        pending += Math.min(0.1, (now - last) / 1000);
        last = now;
        if (pending >= step) {
            tick(pending);
            pending = 0;
        }
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
