import "./progress-view.css"

import * as React from "react"

import Event from "@/_old_/contract/tool/event"
import Progress from "@/_old_/contract/type/progress"
import Button from "@/_old_/ui/view/button"
import Spinner from "@/_old_/ui/view/spinner"

export interface ProgressViewProps {
    className?: string
    eventProgress: Event<Progress>
    onCancel(this: void): void
}

export default function ProgressView(props: ProgressViewProps) {
    const { eventProgress } = props
    const [progress, setProgress] = React.useState<Progress>({
        value: 0,
        label: "Loading model...",
    })
    React.useEffect(() => {
        eventProgress.add(setProgress)
        return () => eventProgress.remove(setProgress)
    }, [eventProgress])
    const PERCENT = 100
    return (
        <div className={getClassNames(props)}>
            <div className="label">
                <Spinner label={progress.label} />
            </div>
            <div className="progress">
                <progress
                    className="progress-bar"
                    max={1}
                    value={progress.value}
                ></progress>
                <div className="value">
                    {(PERCENT * (progress.value ?? 0)).toFixed(1)} %
                </div>
            </div>
            <div className="cancel">
                <Button label="Cancel" onClick={props.onCancel} />
            </div>
        </div>
    )
}

function getClassNames(props: ProgressViewProps): string {
    const classNames = ["custom", "service-braynsApi-ProgressView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
