/** User settings, kept in localStorage when available (it may be missing or blocked). */
import { detectLang, isLang } from "./i18n.js";
import { THEME_IDS, isThemeId } from "./scenes/index.js";
export const PRESETS = [5, 10, 20, 30, 60];
const DEFAULT_MINUTES = 10;
const PREFIX = "avun.";
/** Storage key per setting. Kept identical to the B1 prototype so saved choices carry over. */
const KEYS = {
    lang: "lang",
    theme: "theme",
    minutes: "mins",
    sound: "sound",
    vibration: "vib",
    onboarded: "seen",
    log: "log",
};
function read(key) {
    try {
        const raw = localStorage.getItem(PREFIX + KEYS[key]);
        return raw === null ? undefined : JSON.parse(raw);
    }
    catch {
        return undefined;
    }
}
function write(key, value) {
    try {
        localStorage.setItem(PREFIX + KEYS[key], JSON.stringify(value));
    }
    catch {
        /* storage unavailable: settings simply aren't remembered */
    }
}
function isPreset(v) {
    return typeof v === "number" && PRESETS.includes(v);
}
export function loadSettings() {
    const lang = read("lang");
    const theme = read("theme");
    const minutes = read("minutes");
    const sound = read("sound");
    const vibration = read("vibration");
    const onboarded = read("onboarded");
    return {
        lang: isLang(lang) ? lang : detectLang(navigator.language),
        theme: isThemeId(theme) ? theme : THEME_IDS[0],
        minutes: isPreset(minutes) ? minutes : DEFAULT_MINUTES,
        sound: typeof sound === "boolean" ? sound : true,
        vibration: typeof vibration === "boolean" ? vibration : true,
        onboarded: onboarded === true,
    };
}
export function saveSetting(settings, key, value) {
    settings[key] = value;
    write(key, value);
}
const LOG_LIMIT = 50;
/** Keeps the last 50 sessions on this device only, for testing (peeks, swipes, completion). */
export function appendLog(record) {
    const current = read("log");
    const log = Array.isArray(current) ? current : [];
    log.push(record);
    write("log", log.slice(-LOG_LIMIT));
}
