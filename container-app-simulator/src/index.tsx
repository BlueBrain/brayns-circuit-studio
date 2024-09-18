import App from "./app"
import Auth from "./service/auth"
import React from "react"
import { ConfirmProvider } from "material-ui-confirm"
import { createRoot } from "react-dom/client"

async function start() {
    const auth = new Auth()
    const token = await auth.authorize()
    if (!token) return

    const container = document.getElementById("root") as HTMLElement
    const root = createRoot(container)
    root.render(
        <ConfirmProvider>
            <App token={token} />
        </ConfirmProvider>
    )
}

void start()
