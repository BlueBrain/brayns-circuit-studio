import * as React from "react"
import Checkbox from "@/_old_/ui/view/checkbox"
import Combo from "@/_old_/ui/view/combo"
import FloatingButton from "@/_old_/ui/view/floating-button"
import IntegerInput from "@/_old_/ui/view/input/integer"
import Options from "@/_old_/ui/view/options"
import Runnable from "@/_old_/ui/view/runnable"
import TextInput from "@/_old_/ui/view/input/text"
import "./snapshot-params-input-view.css"
import {
    DIMENSION_PRESETS,
    useSnapshotDimension,
    useSnapshotParams,
    useSnapshotPreview,
} from "./handler"
import { BraynsSnapshotQualityEnum } from "@/_old_/contract/service/brayns-api/snapshot"

export interface SnapshotParams {
    name: string
    width: number
    height: number
    quality: BraynsSnapshotQualityEnum
    transparentBackground: boolean
    /**
     * If camera is not in orthographic mode, return 0.
     * Otherwise, return the height in space unit.
     */
    cameraHeight: number
}

export interface SnapshotParamsInputViewProps {
    className?: string
    value: SnapshotParams
    fastSnapshot(
        this: void,
        params: SnapshotParams
    ): Promise<HTMLImageElement | null>
    onChange(value: SnapshotParams): void
}

const DIMENSION_PRESET_CUSTOM = "Custom"

/**
 *
 * @param props
 * @returns
 */
export default function SnapshotParamsInputView(
    props: SnapshotParamsInputViewProps
) {
    const [params, update] = useSnapshotParams(props)
    const [qualityMode, setQualityMode] = React.useState("high")
    const [
        unit,
        setUnit,
        width,
        setWidth,
        height,
        setHeight,
        dimensionPreset,
        setDimensionPreset,
        handleFlipOrientation,
    ] = useSnapshotDimension(props, update, DIMENSION_PRESET_CUSTOM)
    const [preview, loadingPreview] = useSnapshotPreview(
        params,
        props.fastSnapshot
    )
    const { name, transparentBackground } = params
    return (
        <div className={getClassNames(props)}>
            {renderFilenameAndBackground(name, update, transparentBackground)}
            {renderDimensionPreset(dimensionPreset, setDimensionPreset)}
            {renderOrientationAndSize(
                unit,
                setUnit,
                dimensionPreset,
                width,
                setWidth,
                height,
                setHeight,
                handleFlipOrientation
            )}
            {renderQuality(qualityMode, (quality: string) => {
                setQualityMode(quality)
                switch (quality) {
                    case "high":
                        update({ quality: BraynsSnapshotQualityEnum.High })
                        break
                    default:
                        update({ quality: BraynsSnapshotQualityEnum.Medium })
                        break
                }
            })}
            <QuickPreview loadingPreview={loadingPreview} preview={preview} />
        </div>
    )
}

function renderQuality(
    qualityMode: string,
    setQualityMode: (mode: string) => void
) {
    return (
        <div className="flex">
            <Options
                label="Quality"
                value={qualityMode}
                options={{
                    high: "High (slow)",
                    medium: "Medium (fast)",
                }}
                onChange={setQualityMode}
            />
        </div>
    )
}

function renderDimensionPreset(
    dimensionPreset: string,
    setDimensionPreset: (preset: string) => void
) {
    return (
        <div className="flex">
            <Combo
                wide={true}
                label="Dimension presets"
                value={dimensionPreset}
                onChange={setDimensionPreset}
                options={convertDimensionPresetsIntoOptions()}
            />
        </div>
    )
}

function renderFilenameAndBackground(
    name: string,
    update: (partialParams: Partial<SnapshotParams>) => void,
    transparentBackground: boolean
) {
    return (
        <div className="flex">
            <TextInput
                size={8}
                label="Snapshot's filename"
                value={name}
                onChange={(newName) => update({ name: newName })}
            />
            <Checkbox
                label="Transparent background"
                value={transparentBackground}
                onChange={(value) => update({ transparentBackground: value })}
            />
        </div>
    )
}

function renderOrientationAndSize(
    unit: string,
    setUnit: (v: string) => void,
    dimensionPreset: string,
    width: number,
    setWidth: (v: number) => void,
    height: number,
    setHeight: (v: number) => void,
    handleFlipOrientation: () => void
) {
    return (
        <div className="flex">
            <Options
                label="Unit"
                options={{ mm: "mm", px: "px" }}
                value={unit}
                onChange={setUnit}
            />
            <IntegerInput
                label="width"
                enabled={dimensionPreset === DIMENSION_PRESET_CUSTOM}
                size={4}
                min={16}
                value={width}
                onChange={setWidth}
            />
            <IntegerInput
                label="height"
                enabled={dimensionPreset === DIMENSION_PRESET_CUSTOM}
                size={4}
                min={16}
                value={height}
                onChange={setHeight}
            />
            <FloatingButton
                icon="orientation"
                onClick={handleFlipOrientation}
            />
        </div>
    )
}

function QuickPreview(props: {
    loadingPreview: boolean
    preview: JSX.Element | null
}) {
    return (
        <fieldset>
            <legend>Quick Preview (low quality)</legend>
            <Runnable className="preview" running={props.loadingPreview}>
                <div className="image">{props.preview}</div>
            </Runnable>
        </fieldset>
    )
}

function getClassNames(props: SnapshotParamsInputViewProps): string {
    const classNames = ["custom", "view-SnapshotParamsInputView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

/**
 * Used to fill the combo for dimension presets.
 */
function convertDimensionPresetsIntoOptions(): { [key: string]: string } {
    const output: { [key: string]: string } = {
        [DIMENSION_PRESET_CUSTOM]: DIMENSION_PRESET_CUSTOM,
    }
    for (const label of DIMENSION_PRESETS) {
        output[label] = label
    }
    return output
}
