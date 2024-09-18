import "./color-by-mname-view.css"

import * as React from "react"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import { CircuitColorManagerInterface } from "@/_old_/contract/manager/colors"
import { useOptionalColors } from "../hooks"
import OptionalColorsEditor from "../optional-colors-editor"
import { getEnabledColors } from "../color-converter"

export interface ColorByMNameViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorByMNameView(props: ColorByMNameViewProps) {
    const modal = useModal()
    const names = props.manager.colorableMorphologyNames
    const [colors, setColors] = useOptionalColors("mname", names)
    return (
        <div className={getClassNames(props)}>
            <OptionalColorsEditor
                names={names}
                value={colors}
                onChange={setColors}
            />
            <Button
                label="Apply Color by Morphology Name"
                accent={true}
                wide={true}
                onClick={() => {
                    void modal.wait(
                        "Apply Colors...",
                        props.manager.applyColorByMorphologyNames(
                            getEnabledColors(colors, names)
                        )
                    )
                }}
            />
        </div>
    )
}

function getClassNames(props: ColorByMNameViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorByMNameView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
