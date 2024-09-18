import React from "react"
import Styles from "./layout.module.css"
import { ModalProvider, Theme, ViewPanel } from "@tolokoban/ui"

/**
 * Splash screen fading duration in millisecs.
 */
const TRANSITION_DURATION = 600

new Theme({
    colors: {
        error: "#d20",
        input: "#bbb",
        neutral: ["#001325", "#36495e"],
        primary: ["#004569", "#5dc4ed"],
        secondary: "#e78500",
        textDark: "#000e",
        textLight: "#fffe",
        valid: "#3f3",
    },
}).apply()

export default function Layout({ children }: { children: React.ReactNode }) {
    React.useEffect(removeSplash, [])
    return <ModalProvider>{children}</ModalProvider>
}

function removeSplash() {
    const splash = get("splash-screen")
    if (!splash) return

    splash.style.transition = `all ${TRANSITION_DURATION}ms`
    window.setTimeout(() => {
        splash.classList.add(Styles.vanish)
        window.setTimeout(() => {
            splash.parentNode?.removeChild(splash)
        }, TRANSITION_DURATION)
    })
}

function get(id: string): HTMLElement {
    const element = document.getElementById(id)
    if (!element) throw Error(`Unable to find element #${id}!`)

    return element
}
