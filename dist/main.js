/** Entry point. Add #fast to the address to run time 10× faster for testing. */
import { App } from "./app.js";
import { byId } from "./ui/dom.js";
const speed = location.hash === "#fast" ? 10 : 1;
new App(byId("app"), { speed }).start();
