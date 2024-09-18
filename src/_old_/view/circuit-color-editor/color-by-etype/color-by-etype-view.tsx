import * as React from "react"
import Button from "@/_old_/ui/view/button"
import { useModal } from "@/_old_/ui/modal"
import OptionalColorsEditor from "../optional-colors-editor"
import { CircuitColorManagerInterface } from "@/_old_/contract/manager/colors"
import { getEnabledColors } from "../color-converter"
import { useOptionalColors } from "../hooks"
import "./color-by-etype-view.css"

export interface ColorByETypeViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorByETypeView(props: ColorByETypeViewProps) {
    const modal = useModal()
    const names = props.manager.colorableElectricalTypes
    const [colors, setColors] = useOptionalColors("etype", names)
    return (
        <div className={getClassNames(props)}>
            <OptionalColorsEditor
                names={names}
                value={colors}
                onChange={setColors}
            />
            <Button
                label="Apply Color by Electrical Type"
                accent={true}
                wide={true}
                onClick={() => {
                    void modal.wait(
                        "Apply Colors...",
                        props.manager.applyColorByElectricalTypes(
                            getEnabledColors(colors, names)
                        )
                    )
                }}
            />
        </div>
    )
}

function getClassNames(props: ColorByETypeViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorByETypeView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
