import * as React from "react"
import Button from "@/_old_/ui/view/button"
import ColorrampConfigView from "./colorramp-config"
import InputText from "@/_old_/ui/view/input/text"
import ScalebarConfigView from "./scalebar-config"
import { ColorRampConfig, CompositorCanvases, RawSnapshot } from "../types"
import { ScalebarConfig } from "../types"
import { Snapshot } from "@/_old_/contract/feature/snapshot"
import "./params-view.css"

export interface ParamsViewProps {
    className?: string
    params: RawSnapshot
    canvases: CompositorCanvases
    colorrampConfig?: ColorRampConfig
    onColorrampConfigChange(this: void, colorrampOptions: ColorRampConfig): void
    scalebarConfig: ScalebarConfig
    onScalebarConfigChange(this: void, scalebarOptions: ScalebarConfig): void
    onSave(snapshots: Snapshot[]): void
}

export default function ParamsView(props: ParamsViewProps) {
    const {
        colorrampConfig,
        onColorrampConfigChange: onColorRampConfigChange,
        scalebarConfig,
        onScalebarConfigChange,
    } = props
    const [name, setName] = React.useState("snapshot")
    return (
        <div className={getClassNames(props)}>
            {renderHeader(
                name,
                setName,
                props,
                Boolean(
                    colorrampConfig &&
                        colorrampConfig.enabled &&
                        colorrampConfig.separatedFile
                ),
                scalebarConfig.enabled && scalebarConfig.separatedFile
            )}
            <div>
                {colorrampConfig && (
                    <ColorrampConfigView
                        value={colorrampConfig}
                        onChange={onColorRampConfigChange}
                    />
                )}
                <ScalebarConfigView
                    value={scalebarConfig}
                    onChange={onScalebarConfigChange}
                />
            </div>
        </div>
    )
}

function renderHeader(
    name: string,
    setName: React.Dispatch<React.SetStateAction<string>>,
    props: ParamsViewProps,
    generateColorramp: boolean,
    generateScalebar: boolean
) {
    return (
        <header>
            <InputText
                label="Snapshot base name"
                wide={true}
                value={name}
                onChange={setName}
            />
            <fieldset>
                <legend>Files to generate</legend>
                <div>
                    <div>
                        {name}.
                        {props.params.transparentBackground ? "png" : "jpg"}
                    </div>
                    <div>
                        {props.params.width}x{props.params.height}
                    </div>
                </div>
                <div className={generateColorramp ? "enabled" : "disabled"}>
                    <div>{name}.colorramp.png</div>
                    <div>
                        {props.canvases.colorramp.width}x
                        {props.canvases.colorramp.height}
                    </div>
                </div>
                <div className={generateScalebar ? "enabled" : "disabled"}>
                    <div>{name}.scalebar.png</div>
                    <div>
                        {props.canvases.scalebar.width}x
                        {props.canvases.scalebar.height}
                    </div>
                </div>
            </fieldset>
            <Button
                label="Save and Close"
                wide={true}
                onClick={() => {
                    const { canvases } = props
                    const snapshots: Snapshot[] = [
                        {
                            canvas: combineCanvases(
                                canvases.main,
                                canvases.overlay
                            ),
                            filename: `${name}.${
                                props.params.transparentBackground
                                    ? "png"
                                    : "jpg"
                            }`,
                        },
                    ]
                    if (
                        props.colorrampConfig &&
                        props.colorrampConfig.enabled
                    ) {
                        if (props.colorrampConfig.separatedFile) {
                            snapshots.push({
                                canvas: canvases.colorramp,
                                filename: `${name}.colorramp.png`,
                            })
                        } else {
                            const ctx = canvases.main.getContext("2d")
                            if (!ctx)
                                throw Error("Unable to create a 2D context!")

                            const margin = props.colorrampConfig.fontSize
                            ctx.drawImage(
                                canvases.colorramp,
                                margin,
                                ctx.canvas.height -
                                    margin -
                                    canvases.colorramp.height
                            )
                        }
                    }
                    if (props.scalebarConfig.enabled) {
                        if (props.scalebarConfig.separatedFile) {
                            snapshots.push({
                                canvas: canvases.scalebar,
                                filename: `${name}.scalebar.png`,
                            })
                        } else {
                            const ctx = canvases.main.getContext("2d")
                            if (!ctx)
                                throw Error("Unable to create a 2D context!")

                            const margin = props.scalebarConfig.fontSize
                            ctx.drawImage(canvases.scalebar, margin, margin)
                        }
                    }
                    props.onSave(snapshots)
                }}
            />
        </header>
    )
}

function getClassNames(props: ParamsViewProps): string {
    const classNames = [
        "custom",
        "feature-snapshot-snapshotCompositor-ParamsView",
        "theme-color-frame",
        "theme-shadow-nav",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

/**
 * Create a Canvas by combining `main` then `overlay`.
 * @param main
 * @param overlay
 */
function combineCanvases(
    main: HTMLCanvasElement,
    overlay: HTMLCanvasElement
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        console.error("Unable to get 2D context on a canvas!")
        return canvas
    }

    const w = main.width
    const h = main.height
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(main, 0, 0)
    ctx.drawImage(overlay, 0, 0)
    return canvas
}
