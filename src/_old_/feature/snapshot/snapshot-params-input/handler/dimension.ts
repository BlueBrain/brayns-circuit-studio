import * as React from "react"

import { HALF } from "@/_old_/constants"

import {
    SnapshotParams,
    SnapshotParamsInputViewProps,
} from "../snapshot-params-input-view"

// Pixels per millimeter (300 dpi).
const PX_PER_MM = 11.811023622047244
const MM_PER_PX = 1 / PX_PER_MM
export const UNIT_PX = "px"
export const UNIT_MM = "mm"

/* eslint-disable no-magic-numbers */
const DIMENSIONS: {
    [label: string]: [width: number, height: number, unit: string]
} = {
    "Paper: A3": [420, 297, "mm"],
    "Paper: A4": [297, 210, "mm"],
    "Paper: A5": [210, 148.5, "mm"],
    "Screen: Web": [960, 540, "px"],
    "Screen: HD": [1920, 1080, "px"],
    "Screen: 4K": [1920 * 2, 1080 * 2, "px"],
    "Screen: 8K": [1920 * 4, 1080 * 4, "px"],
}
/* eslint-enable no-magic-numbers */

export const DIMENSION_PRESETS = Object.keys(DIMENSIONS)

interface Dimension {
    unit: string
    width: number
    height: number
}

export type UseSnapshotDimensionType = [
    unit: string,
    setUnit: (v: string) => void,
    width: number,
    setWidth: (v: number) => void,
    height: number,
    setHeight: (v: number) => void,
    dimensionPreset: string,
    setDimensionPreset: (dimensionPreset: string) => void,
    handleFlipOrientation: () => void,
]

/**
 * Params' width and height are always expressed in millimeters.
 * But the displayed dimensions depend on the current unit.
 */
export function useSnapshotDimension(
    props: SnapshotParamsInputViewProps,
    update: (params: Partial<SnapshotParams>) => void,
    defaultDimensionPreset: string
): UseSnapshotDimensionType {
    const params = props.value
    const [dimension, setDimension] = React.useState<Dimension>({
        unit: UNIT_PX,
        width: params.width,
        height: params.height,
    })
    const updateDimension = makeUpdateDimension(dimension, setDimension, update)
    const [dimensionPreset, setDimensionPreset] = React.useState(
        defaultDimensionPreset
    )
    const setUnit = makeSetUnit(dimension, updateDimension)
    const setWidth = makeSetWidth(dimension, updateDimension)
    const setHeight = makeSetHeight(dimension, updateDimension)
    const handleFlipOrientation = makeFlipOrientationHandler(
        dimension,
        updateDimension
    )
    const handleDimensionPresetChange = makeDimensionPresetChangeHandler(
        setDimensionPreset,
        updateDimension
    )
    return [
        dimension.unit,
        setUnit,
        dimension.width,
        setWidth,
        dimension.height,
        setHeight,
        dimensionPreset,
        handleDimensionPresetChange,
        handleFlipOrientation,
    ]
}

function makeDimensionPresetChangeHandler(
    setDimensionPreset: React.Dispatch<React.SetStateAction<string>>,
    updateDimension: (dimensionUpdate: Partial<Dimension>) => void
) {
    return (presetName: string) => {
        const preset = DIMENSIONS[presetName]
        if (!preset) return

        setDimensionPreset(presetName)
        const [width, height, unit] = preset
        updateDimension({ unit, width, height })
    }
}

function makeFlipOrientationHandler(
    dimension: Dimension,
    updateDimension: (dimensionUpdate: Partial<Dimension>) => void
) {
    return () => {
        const { width, height } = dimension
        updateDimension({
            width: height,
            height: width,
        })
    }
}

function makeSetHeight(
    dimension: Dimension,
    updateDimension: (dimensionUpdate: Partial<Dimension>) => void
) {
    return (height: number) => {
        if (height === dimension.height) return

        updateDimension({ height })
    }
}

function makeSetWidth(
    dimension: Dimension,
    updateDimension: (dimensionUpdate: Partial<Dimension>) => void
) {
    return (width: number) => {
        if (width === dimension.width) return

        updateDimension({ width })
    }
}

function makeSetUnit(
    dimension: Dimension,
    updateDimension: (dimensionUpdate: Partial<Dimension>) => void
) {
    return (unit: string) => {
        if (unit === dimension.unit) return

        const isPX = unit === UNIT_PX
        const { width, height } = dimension
        updateDimension({
            unit,
            width: isPX ? mm2px(width) : px2mm(width),
            height: isPX ? mm2px(height) : px2mm(height),
        })
    }
}

function makeUpdateDimension(
    dimension: Dimension,
    setDimension: React.Dispatch<React.SetStateAction<Dimension>>,
    update: (params: Partial<SnapshotParams>) => void
) {
    return (dimensionUpdate: Partial<Dimension>) => {
        const newDimension = {
            ...dimension,
            ...dimensionUpdate,
        }
        setDimension(newDimension)
        const { unit, width, height } = newDimension
        if (unit === UNIT_PX) {
            update({ width, height })
        } else {
            update({ width: mm2px(width), height: mm2px(height) })
        }
    }
}

function px2mm(px: number): number {
    return round(px * MM_PER_PX)
}

function mm2px(mm: number): number {
    return round(mm * PX_PER_MM)
}

function round(value: number) {
    return Math.floor(HALF + value)
}
