import * as React from "react"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import OptionalColorsEditor from "../optional-colors-editor"
import { CircuitColorManagerInterface } from "@/_old_/contract/manager/colors"
import { getEnabledColors } from "../color-converter"
import { useOptionalColors } from "../hooks"
import "./color-by-layer-view.css"

export interface ColorByMTypeViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorByMTypeView(props: ColorByMTypeViewProps) {
    const modal = useModal()
    const names = props.manager.colorableLayers
    const [colors, setColors] = useOptionalColors("layer", names)
    return (
        <div className={getClassNames(props)}>
            <OptionalColorsEditor
                rewrite={(name) => `Layer ${name}`}
                names={names}
                value={colors}
                onChange={setColors}
            />
            <Button
                label="Apply Color by Layers"
                accent={true}
                wide={true}
                onClick={() => {
                    void modal.wait(
                        "Apply Colors...",
                        props.manager.applyColorByLayers(
                            getEnabledColors(colors, names)
                        )
                    )
                }}
            />
        </div>
    )
}

function getClassNames(props: ColorByMTypeViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorByLayerView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
