import * as React from "react"
import Label from "../label"
import Touchable from "../touchable"
import "./options-view.css"

export interface OptionsViewProps {
    className?: string
    label?: string
    value: string
    options: { [key: string]: string }
    orientation?: "horizontal" | "vertical"
    onChange(this: void, value: string): void
}

export default function OptionsView({
    className,
    label,
    value,
    options,
    orientation = "horizontal",
    onChange,
}: OptionsViewProps) {
    return (
        <div className={getClassNames(className, orientation)}>
            <Label value={label} />
            <div className="options theme-shadow-button theme-color-primary">
                {Object.keys(options).map((key) =>
                    key === value ? (
                        <div
                            className="button theme-color-accent-light"
                            key={key}
                        >
                            <b>{options[key]}</b>
                        </div>
                    ) : (
                        <Touchable
                            className="button theme-color-primary-dark"
                            key={key}
                            onClick={() => onChange(key)}
                        >
                            <div style={{ opacity: 0.5 }}>{options[key]}</div>
                        </Touchable>
                    )
                )}
            </div>
            <Label value={label} visible={false} />
        </div>
    )
}

function getClassNames(
    className: string | undefined,
    orientation: string
): string {
    const classNames = ["custom", "ui-view-OptionsView", orientation]
    if (typeof className === "string") {
        classNames.push(className)
    }

    return classNames.join(" ")
}
