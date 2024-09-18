import * as React from "react"
import "./tabstrip-view.css"

export interface TabstripViewProps {
    className?: string
    theme?: "screen" | "frame" | "section"
    headers: string[]
    children: JSX.Element[]
    value?: number
    onChange?(this: void, value: number): void
}

export default function TabstripView(props: TabstripViewProps) {
    const { headers, children, value, onChange } = props
    const [selection, setSelection] = React.useState(
        (value ?? 0) % headers.length
    )
    const handleClick = (index: number) => {
        setSelection(index)
        if (onChange) onChange(index)
    }
    return (
        <div className={getClassNames(props)}>
            <header>
                {headers.map((item, idx) => (
                    <button
                        key={idx}
                        className={selection === idx ? "selected" : ""}
                        onClick={() => handleClick(idx)}
                    >
                        {item}
                    </button>
                ))}
                <div className="space"></div>
            </header>
            <main>
                {children.map((child, idx) => (
                    <div
                        key={idx}
                        className={selection === idx ? "selected" : ""}
                    >
                        {child}
                    </div>
                ))}
            </main>
        </div>
    )
}

function getClassNames(props: TabstripViewProps): string {
    const classNames = ["custom", "ui-view-TabstripView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
