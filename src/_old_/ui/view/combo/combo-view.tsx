import * as React from "react"
import Label from "../label"
import "./combo-view.css"

export interface OptionsViewProps {
    className?: string
    label?: string
    wide?: boolean
    value: string
    options: { [key: string]: string }
    onChange(this: void, value: string): void
}

export default function OptionsView(props: OptionsViewProps) {
    const { label, options, onChange } = props
    const [value, setValue] = React.useState(props.value)
    const handleChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = evt.target.value
        setValue(newValue)
        onChange(newValue)
    }
    return (
        <div className={getClassNames(props)}>
            <Label value={label} />
            <div className="container theme-shadow-button">
                <select
                    className="theme-color-input"
                    value={value}
                    onChange={handleChange}
                >
                    {Object.keys(options).map((key) => (
                        <option key={key} value={key}>
                            {options[key]}
                        </option>
                    ))}
                </select>
                <div className="dropdown-button theme-color-primary">▼</div>
            </div>
            <Label value={label} visible={false} />
        </div>
    )
}

function getClassNames(props: OptionsViewProps): string {
    const classNames = ["custom", "ui-view-ComboView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.wide === true) classNames.push("wide")

    return classNames.join(" ")
}
