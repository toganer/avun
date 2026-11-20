/**
 * The app controller: connects the screens, the settings, the session and the device services.
 *
 * Flow:  splash (first launch only) → pick → dial ⇄ settings
 *        dial → session ("imm") → arrived ("arr") → dial or again
 */
import { Latch, ScreenAwake, hapticTap } from "./device.js";
import { LANGS, LANG_NAMES, STRINGS } from "./i18n.js";
import { THEMES, THEME_IDS, paintThumbnail } from "./scenes/index.js";
import { Session, systemClock } from "./session.js";
import { PRESETS, appendLog, loadSettings, saveSetting } from "./settings.js";
import { Flash, button, byId, setPressed, svgById } from "./ui/dom.js";
import { onSwipeUp } from "./ui/gestures.js";
import { SceneRenderer, startFrameLoop } from "./ui/renderer.js";
const SCREENS = ["splash", "pick", "dial", "imm", "arr", "set"];
const SPLASH_MS = 5000;
const PEEK_MS = 2000;
const FPS = 30;
/** Circumference of the dial ring (r = 120) in SVG units. */
const DIAL_LENGTH = 754;
export class App {
    constructor(root, options) {
        this.root = root;
        this.options = options;
        this.settings = loadSettings();
        this.latch = new Latch();
        this.awake = new ScreenAwake();
        this.peekFlash = new Flash(byId("peekbox"), PEEK_MS);
        this.screen = "dial";
        this.session = null;
        this.renderer = new SceneRenderer(byId("scene", HTMLCanvasElement), root);
    }
    get debug() {
        return this.options.speed !== 1;
    }
    get text() {
        return STRINGS[this.settings.lang];
    }
    // ---------- start-up ----------
    start() {
        this.buildPresets();
        this.bindControls();
        this.applyLanguage();
        this.selectMinutes(this.settings.minutes);
        if (this.settings.onboarded) {
            this.show("dial");
        }
        else {
            this.show("splash");
            const next = () => {
                if (this.screen === "splash")
                    this.show("pick");
            };
            byId("splash").addEventListener("click", next);
            window.setTimeout(next, SPLASH_MS);
        }
        startFrameLoop(FPS, (dt) => this.tick(dt));
    }
    show(id) {
        for (const s of SCREENS)
            byId(s).classList.toggle("on", s === id);
        this.screen = id;
        this.renderer.visible = id === "imm" || id === "arr";
        if (this.debug)
            byId("dbg").style.display = id === "imm" ? "block" : "none";
    }
    bindControls() {
        byId("gear").addEventListener("click", () => this.show("set"));
        byId("closeSet").addEventListener("click", () => this.show("dial"));
        this.bindToggle("tSound", "sound");
        this.bindToggle("tVib", "vibration");
        byId("start").addEventListener("click", () => this.beginSession());
        byId("again").addEventListener("click", () => this.beginSession());
        byId("done").addEventListener("click", () => {
            this.session = null;
            this.show("dial");
        });
        byId("peek").addEventListener("click", () => this.peek());
        byId("end").addEventListener("click", () => this.confirmEnd(true));
        byId("keep").addEventListener("click", () => this.confirmEnd(false));
        byId("endnow").addEventListener("click", () => {
            this.confirmEnd(false);
            this.finish("ended-early");
        });
        byId("hint").addEventListener("click", () => this.swipe());
        onSwipeUp(this.root, () => this.screen === "imm", () => this.swipe());
    }
    bindToggle(id, key) {
        const el = byId(id);
        setPressed(el, this.settings[key]);
        el.addEventListener("click", () => {
            saveSetting(this.settings, key, !this.settings[key]);
            setPressed(el, this.settings[key]);
        });
    }
    // ---------- text ----------
    applyLanguage() {
        const t = this.text;
        document.documentElement.lang = this.settings.lang;
        document.querySelectorAll("[data-t]").forEach((el) => {
            const value = t[el.dataset["t"]];
            if (typeof value === "string")
                el.textContent = value;
        });
        document.querySelectorAll("[data-l]").forEach((el) => {
            const value = t[el.dataset["l"]];
            if (typeof value === "string")
                el.setAttribute("aria-label", value);
        });
        this.buildThemeCards();
        this.buildThemeDots();
        this.buildLanguages();
    }
    // ---------- pick, dial and settings ----------
    buildThemeCards() {
        const box = byId("cards");
        box.replaceChildren();
        for (const id of THEME_IDS) {
            const theme = THEMES[id];
            const name = this.text[theme.nameKey];
            const line = this.text[theme.lineKey];
            const card = button("card", () => {
                this.chooseTheme(id);
                saveSetting(this.settings, "onboarded", true);
                this.show("dial");
            });
            card.setAttribute("aria-label", `${name}: ${line}`);
            const preview = document.createElement("canvas");
            const title = document.createElement("span");
            title.textContent = name;
            const sub = document.createElement("small");
            sub.textContent = line;
            card.append(preview, title, sub);
            box.append(card);
            requestAnimationFrame(() => paintThumbnail(preview, id));
        }
    }
    buildThemeDots() {
        const box = byId("tdots");
        box.replaceChildren();
        for (const id of THEME_IDS) {
            const [bg, fg] = THEMES[id].dot;
            const dot = button(`tdot${this.settings.theme === id ? " sel" : ""}`, () => this.chooseTheme(id));
            dot.style.background = bg;
            dot.setAttribute("aria-label", this.text[THEMES[id].nameKey]);
            setPressed(dot, this.settings.theme === id);
            dot.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="${fg}"/></svg>`;
            box.append(dot);
        }
    }
    chooseTheme(id) {
        saveSetting(this.settings, "theme", id);
        this.buildThemeDots();
    }
    buildPresets() {
        const box = byId("presets");
        for (const m of PRESETS) {
            const b = button("preset", () => this.selectMinutes(m));
            b.dataset["m"] = String(m);
            b.textContent = String(m);
            box.append(b);
        }
    }
    selectMinutes(m) {
        saveSetting(this.settings, "minutes", m);
        byId("mins").textContent = String(m);
        const share = Math.min(1, m / 60);
        svgById("arc").setAttribute("stroke-dasharray", `${(DIAL_LENGTH * share).toFixed(0)} ${DIAL_LENGTH}`);
        document.querySelectorAll(".preset").forEach((b) => {
            const on = Number(b.dataset["m"]) === m;
            b.classList.toggle("sel", on);
            setPressed(b, on);
        });
    }
    buildLanguages() {
        const box = byId("langs");
        box.replaceChildren();
        for (const lang of LANGS) {
            const b = button(`lang${this.settings.lang === lang ? " sel" : ""}`, () => {
                saveSetting(this.settings, "lang", lang);
                this.applyLanguage();
            });
            b.textContent = LANG_NAMES[lang];
            box.append(b);
        }
    }
    // ---------- the session ----------
    beginSession() {
        this.latch.unlock();
        this.session = new Session(this.settings.minutes, systemClock, this.options.speed);
        this.confirmEnd(false);
        this.peekFlash.hide();
        this.show("imm");
        this.renderer.fadeIn();
        this.awake.set(true);
    }
    peek() {
        if (!this.session)
            return;
        const minutes = this.session.peek();
        byId("peektext").textContent = minutes === 0 ? this.text.lessThanMinute : this.text.minutesLeft(minutes);
        this.peekFlash.show();
    }
    confirmEnd(open) {
        byId("confirm").classList.toggle("on", open);
    }
    swipe() {
        const s = this.session;
        if (!s || s.ended)
            return;
        this.renderer.nudge(s.trySwipe() ? "advance" : "resist");
    }
    finish(reason) {
        const s = this.session;
        if (!s || !s.end(reason))
            return;
        if (this.settings.sound)
            this.latch.play();
        if (this.settings.vibration)
            hapticTap();
        this.awake.set(false);
        appendLog(s.record(this.settings.theme));
        byId("passed").textContent = this.text.passed(s.passedLabel());
        byId("again").textContent = this.text.again(this.settings.minutes);
        this.show("arr");
    }
    // ---------- every frame ----------
    tick(dt) {
        if (this.screen !== "imm" && this.screen !== "arr")
            return;
        const s = this.session;
        const landing = s ? s.landing() : 0;
        this.renderer.advance(dt, landing);
        const swipeReady = this.screen === "imm" && s !== null && s.swipesReady() > 0;
        this.renderer.draw({
            theme: this.settings.theme,
            progress: s ? s.progress() : 0,
            view: s ? s.view : 0,
            landing: this.screen === "arr" ? 1 : landing,
            swipeGlow: swipeReady,
        });
        if (this.screen !== "imm" || !s)
            return;
        byId("hint").classList.toggle("on", swipeReady);
        if (this.debug) {
            byId("dbg").textContent =
                `TEST x${this.options.speed}\nleft ${Math.ceil(s.remaining() / 1000)}s\n` +
                    `peeks ${s.peeks}  swipes ${s.swipes}\nready ${s.swipesReady()}`;
        }
        if (s.isTimeUp())
            this.finish("completed");
    }
}
