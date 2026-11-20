/** Recognises "swipe up" from a finger, a mouse drag or a scroll wheel. */
const MIN_DRAG_PX = 60;
const MIN_WHEEL = 40;
export function onSwipeUp(surface, isActive, handler) {
    let touchY = null;
    surface.addEventListener("touchstart", (e) => {
        if (isActive())
            touchY = e.touches[0]?.clientY ?? null;
    }, { passive: true });
    surface.addEventListener("touchend", (e) => {
        const endY = e.changedTouches[0]?.clientY;
        if (isActive() && touchY !== null && endY !== undefined && endY - touchY < -MIN_DRAG_PX)
            handler();
        touchY = null;
    }, { passive: true });
    let mouseY = null;
    surface.addEventListener("mousedown", (e) => {
        if (isActive())
            mouseY = e.clientY;
    });
    surface.addEventListener("mouseup", (e) => {
        if (isActive() && mouseY !== null && e.clientY - mouseY < -MIN_DRAG_PX)
            handler();
        mouseY = null;
    });
    window.addEventListener("wheel", (e) => {
        if (isActive() && e.deltaY > MIN_WHEEL)
            handler();
    }, { passive: true });
}
