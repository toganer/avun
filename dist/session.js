/**
 * The session: Avun's timer core.
 *
 * Pure logic with no DOM, so it can be unit-tested with a fake clock.
 * Time is always computed from the start timestamp ("remaining = end − now"),
 * never by counting ticks, so it stays exact when the tab is in the background.
 */
/** One swipe becomes available every 5 minutes of session time. */
export const SWIPE_INTERVAL_MS = 5 * 60000;
/** The scene settles during the last 10 seconds. */
export const LANDING_MS = 10000;
/** Number of "further along" views per theme. */
export const VIEW_COUNT = 3;
export const systemClock = { now: () => Date.now() };
export class Session {
    /**
     * @param minutes  length of the session
     * @param clock    time source (inject a fake one in tests)
     * @param speed    test-mode multiplier: 10 makes 10 minutes pass in 1
     */
    constructor(minutes, clock = systemClock, speed = 1) {
        this.peekCount = 0;
        this.swipesUsed = 0;
        this.currentView = 0;
        this.endReason = null;
        if (!(minutes > 0))
            throw new RangeError("minutes must be positive");
        if (!(speed > 0))
            throw new RangeError("speed must be positive");
        this.durationMs = minutes * 60000;
        this.clock = clock;
        this.speed = speed;
        this.startedAt = clock.now();
    }
    /** Session time that has passed, capped at the duration. Never pauses. */
    elapsed() {
        const raw = (this.clock.now() - this.startedAt) * this.speed;
        return Math.min(this.durationMs, Math.max(0, raw));
    }
    remaining() {
        return this.durationMs - this.elapsed();
    }
    /** 0 at the start, 1 at the end. Drives each scene's slow layer. */
    progress() {
        return this.elapsed() / this.durationMs;
    }
    /** 0 until the last 10 seconds, then rises to 1 at the end. */
    landing() {
        if (this.endReason !== null)
            return 1;
        const rem = this.remaining();
        return rem >= LANDING_MS ? 0 : 1 - rem / LANDING_MS;
    }
    isTimeUp() {
        return this.remaining() <= 0;
    }
    get ended() {
        return this.endReason !== null;
    }
    get view() {
        return this.currentView;
    }
    get peeks() {
        return this.peekCount;
    }
    get swipes() {
        return this.swipesUsed;
    }
    /** Swipes earned so far and not yet used. */
    swipesReady() {
        if (this.ended || this.remaining() <= LANDING_MS)
            return 0;
        const earned = Math.floor(this.elapsed() / SWIPE_INTERVAL_MS);
        return Math.max(0, earned - this.swipesUsed);
    }
    /** Moves to the next view if a swipe is available. Returns whether it did. */
    trySwipe() {
        if (this.swipesReady() <= 0)
            return false;
        this.swipesUsed += 1;
        this.currentView = (this.currentView + 1) % VIEW_COUNT;
        return true;
    }
    /** Records a peek and returns the minutes left, rounded up (0 = under a minute). */
    peek() {
        this.peekCount += 1;
        const rem = this.remaining();
        return rem < 60000 ? 0 : Math.ceil(rem / 60000);
    }
    /** Ends the session once. Returns false if it had already ended. */
    end(reason) {
        if (this.endReason !== null)
            return false;
        this.endReason = reason;
        return true;
    }
    /** Time passed, formatted as m:ss for the Arrived screen. */
    passedLabel() {
        const total = Math.floor(this.elapsed() / 1000);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }
    record(theme) {
        return {
            at: new Date(this.startedAt).toISOString(),
            theme,
            min: this.durationMs / 60000,
            peeks: this.peekCount,
            swipes: this.swipesUsed,
            completed: this.endReason === "completed",
        };
    }
}
