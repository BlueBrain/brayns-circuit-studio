import * as React from "react"
import "./show-hide-circuit-view.css"
import Button from "@/_old_/ui/view/button"

export interface ShowHideCircuitViewProps {
    className?: string
    visible: boolean
    onShow(this: void): void
    onHide(this: void): void
    onFocus(this: void): void
}

export default function ShowHideCircuitView(props: ShowHideCircuitViewProps) {
    const { visible, onShow, onHide, onFocus } = props
    return (
        <div className={getClassNames(props)}>
            <Button
                icon="show"
                highlight={visible}
                label="Show"
                onClick={onShow}
            />
            <Button
                icon="hide"
                highlight={visible}
                label="Hide"
                onClick={onHide}
            />
            <Button icon="focus" label="Focus" onClick={onFocus} />
        </div>
    )
}

function getClassNames(props: ShowHideCircuitViewProps): string {
    const classNames = [
        "custom",
        "view-page-main-sections-models-circuitDetails-ShowHideCircuitView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
