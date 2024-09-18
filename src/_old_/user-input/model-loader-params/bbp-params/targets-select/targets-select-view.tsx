import * as React from "react"
import Touchable from "@/_old_/ui/view/touchable"
import Style from "./targets-select-view.module.css"

export interface TargetsSelectViewProps {
    targets: string[]
    onClick(this: void): void
}

export default function TargetsSelectView({
    targets,
    onClick,
}: TargetsSelectViewProps) {
    return (
        <Touchable onClick={onClick}>
            {targets.length === 0 ? (
                <div className={Style.targetsSelect}>
                    None <em>(click to select a target)</em>
                </div>
            ) : (
                <div className={Style.targetsSelect}>{targets.join(", ")}</div>
            )}
        </Touchable>
    )
}
