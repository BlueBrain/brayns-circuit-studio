import ColorRampEditor from "../../view/colorramp-editor"
import React from "react"
import ReactDOM from "react-dom"
import { EMPTY_FUNCTION } from "../../constants"
import "./colorramp-sandbox.css"

const EXPORT = {
    start() {
        return new Promise<void>((resolve) => {
            const root = document.getElementById("root") as HTMLElement
            ReactDOM.render(<SandboxView />, root)
            resolve()
        })
    },
}

function SandboxView() {
    return (
        <div className="sandbox">
            <ColorRampEditor
                colors={[]}
                onChange={EMPTY_FUNCTION}
                onColorClick={(index) => console.log("index:", index)}
            />
            <ColorRampEditor
                colors={[]}
                onChange={EMPTY_FUNCTION}
                onColorClick={(index) => console.log("index:", index)}
            />
            <div>
                <span>Shifting of few pixels</span>
                <ColorRampEditor
                    colors={[]}
                    onChange={EMPTY_FUNCTION}
                    onColorClick={(index) => console.log("index:", index)}
                />
            </div>
        </div>
    )
}

export default EXPORT
