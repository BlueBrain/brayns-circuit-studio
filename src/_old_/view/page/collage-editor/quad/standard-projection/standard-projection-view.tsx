import * as React from "react"
import SceneView from "@/_old_/view/scene"
import StandardPainter from "../../painter/standard"
import "./standard-projection-view.css"

export interface StandardProjectionViewProps {
    className?: string
    painter: StandardPainter
}

export default function StandardProjectionView(
    props: StandardProjectionViewProps
) {
    return (
        <div className={getClassNames(props)}>
            <SceneView />
            <canvas
                className="overlay"
                ref={(canvas) => (props.painter.canvas = canvas)}
            ></canvas>
        </div>
    )
}

function getClassNames(props: StandardProjectionViewProps): string {
    const classNames = [
        "custom",
        "feature-bezierSlices-main-quad-StandardProjectionView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
