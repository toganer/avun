/** Device services: the latch sound, the haptic tap and keeping the screen awake. */
/** Plays the end sound: a gate latch clicking open (synthesised preview). */
export class Latch {
    constructor() {
        this.ctx = null;
        this.noise = null;
    }
    /** Must be called from a tap (e.g. Start), so browsers allow sound later. */
    unlock() {
        try {
            if (!this.ctx) {
                const Ctor = window.AudioContext ?? window.webkitAudioContext;
                if (!Ctor)
                    return;
                this.ctx = new Ctor();
            }
            if (this.ctx.state === "suspended")
                void this.ctx.resume();
        }
        catch {
            this.ctx = null;
        }
    }
    play() {
        const ctx = this.ctx;
        if (!ctx)
            return;
        const t = ctx.currentTime + 0.02;
        this.click(ctx, t, "bandpass", 2600, 3, 0.6, 0.036);
        this.click(ctx, t + 0.006, "lowpass", 600, 1, 0.25, 0.041);
        this.click(ctx, t + 0.13, "bandpass", 1500, 3, 0.5, 0.051);
        this.click(ctx, t + 0.136, "lowpass", 400, 1, 0.3, 0.061);
    }
    noiseBuffer(ctx) {
        if (this.noise)
            return this.noise;
        const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++)
            data[i] = Math.random() * 2 - 1;
        this.noise = buf;
        return buf;
    }
    click(ctx, at, type, freq, q, peak, decay) {
        const src = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        src.buffer = this.noiseBuffer(ctx);
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        gain.gain.setValueAtTime(0.0001, at);
        gain.gain.exponentialRampToValueAtTime(peak, at + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(at);
        src.stop(at + decay + 0.05);
    }
}
/** One strong tap. Works on Android browsers; iPhone browsers don't allow vibration. */
export function hapticTap() {
    try {
        navigator.vibrate?.([0, 60]);
    }
    catch {
        /* not supported */
    }
}
/** Keeps the screen on during a session where the browser allows it. */
export class ScreenAwake {
    constructor() {
        this.lock = null;
        this.wanted = false;
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && this.wanted) {
                this.lock = null;
                void this.request();
            }
        });
    }
    set(on) {
        this.wanted = on;
        if (on)
            void this.request();
        else
            this.release();
    }
    async request() {
        if (this.lock || !("wakeLock" in navigator))
            return;
        try {
            this.lock = await navigator.wakeLock.request("screen");
        }
        catch {
            this.lock = null;
        }
    }
    release() {
        const lock = this.lock;
        this.lock = null;
        void lock?.release().catch(() => undefined);
    }
}
