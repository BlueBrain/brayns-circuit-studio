import * as React from "react"
import Icon from "../icon"
import "./spinner-view.css"
import GenericEvent from "@/_old_/tool/event"

export interface SpinnerViewProps {
    className?: string
    label?: React.ReactNode
    /**
     * If an event is given, we use it to update the label.
     */
    event?: GenericEvent<string>
}

export default function SpinnerView(props: SpinnerViewProps) {
    const [label, setLabel] = React.useState(props.label)
    React.useEffect(() => {
        setLabel(props.label)
        if (props.event) {
            props.event.add(setLabel)
            return () => props.event?.remove(setLabel)
        }
    }, [props.label, props.event])
    return (
        <div className={getClassNames(props)}>
            <Icon name="gear" className="spin" />
            {label && <div className="label">{label}</div>}
        </div>
    )
}

function getClassNames(props: SpinnerViewProps): string {
    const classNames = ["custom", "ui-view-SpinnerView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
