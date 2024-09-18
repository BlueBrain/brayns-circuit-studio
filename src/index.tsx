import { createRoot } from "react-dom/client"

import App from "./app"
import { startOldVersion } from "./_old_"

console.log("🚀 [index] window.location = ", window.location) // @FIXME: Remove this line written on 2024-05-29 at 17:46
/**
 * Are we runnig the Beta version?
 */
function isBeta() {
    const args = new URLSearchParams(window.location.href)
    if (args.has("beta") || window.location.search.substring(1) === "beta") {
        sessionStorage.setItem("beta", "ON")
        return true
    }

    return sessionStorage.getItem("beta") === "ON"
}

if (isBeta()) {
    console.log("New Version!")
    const root = document.getElementById("root")
    if (root) {
        const container = createRoot(root)
        container.render(<App />)
    }
} else {
    console.log("Old Version!")
    void startOldVersion()
}
