import * as React from "react"
import Button from "@/_old_/ui/view/button"
import CircuitColorManagerInterface from "@/_old_/contract/manager/circuit-colors"
import Color from "@/_old_/ui/color"
import GidsRangeView from "./gids-range/gids-range-view"
import InputFile from "@/_old_/ui/view/input/file"
import InputText from "@/_old_/ui/view/input/text"
import { useModal } from "@/_old_/ui/modal"
import Spinner from "../../../ui/view/spinner/spinner-view"
import ProgressView from "@/_old_/ui/view/progress"
import { ColorByGIDs, ColorRGBA } from "@/_old_/contract/service/colors"
import {
    HOURS_PER_MINUTE,
    HUNDRED,
    MINUTES_PER_SECOND,
    SEC_PER_MS,
} from "@/_old_/constants"
import { isRange } from "./validator"
import { loadColorRanges, saveColorRanges } from "./persistence"
import { useColorRanges, useTargets } from "./hook"
import "./color-by-gid-view.css"
import Label from "@/_old_/ui/view/label"
import { useServiceLocator } from "../../../tool/locator"
import FileSaverInterface, {
    ensureFileSaverInterface,
} from "@/_old_/contract/manager/file-saver"

export interface ColorByGidViewProps {
    className?: string
    manager: CircuitColorManagerInterface
}

export default function ColorByGidView(props: ColorByGidViewProps) {
    const { fileSaver } = useServiceLocator({
        fileSaver: ensureFileSaverInterface,
    })
    const [
        colorRanges,
        setColorRanges,
        addColorRange,
        removeColorRange,
        updateColorRange,
    ] = useColorRanges()
    const [newRange, setNewRange] = React.useState("")
    const [rangeValidity, setRangeValidity] = React.useState(false)
    const [targets, isValidTarget, loadingTargets] = useTargets(() =>
        props.manager.listTargets()
    )
    const [target, setTarget] = React.useState("")
    const handleApplyColors = useApplyColorsHandler(props, colorRanges)
    const [handleSaveColors, handleLoadColors] = useColorsPersistenceHandler(
        colorRanges,
        setColorRanges,
        fileSaver
    )
    const handleAddForTarget = useAddForTargetHandler(
        target,
        props,
        addColorRange
    )
    return (
        <div className={getClassNames(props)}>
            {renderAddNewRange(
                newRange,
                setNewRange,
                setRangeValidity,
                rangeValidity,
                addColorRange
            )}
            {loadingTargets && (
                <div>
                    <br />
                    <Spinner label="Loading targets..." />
                </div>
            )}
            {targets.length > 0 &&
                renderAddTarget(
                    target,
                    targets,
                    isValidTarget,
                    setTarget,
                    handleAddForTarget
                )}
            {renderColorRanges(colorRanges, removeColorRange, updateColorRange)}
            {renderButtons(
                handleLoadColors,
                handleSaveColors,
                handleApplyColors
            )}
        </div>
    )
}

function useAddForTargetHandler(
    target: string,
    props: ColorByGidViewProps,
    addColorRange: (colorRange: ColorByGIDs) => void
) {
    const modal = useModal()
    return React.useCallback(() => {
        const asyncAction = async () => {
            try {
                const gids = await modal.wait(
                    `Listing GIDs for "${target}"...`,
                    props.manager.listGIDsForTarget(target)
                )
                const range: string = convertArrayToRange(gids)
                addColorRange({
                    color: [Math.random(), Math.random(), Math.random(), 1],
                    rangeDefinition: `${range}|${target}`,
                })
            } catch (ex) {
                void modal.error(ex)
            }
        }
        void asyncAction()
    }, [target])
}

function renderAddTarget(
    target: string,
    targets: string[],
    isValidTarget: (target: string) => boolean,
    setTarget: React.Dispatch<React.SetStateAction<string>>,
    handleAddForTarget: () => void
): React.ReactNode {
    return (
        <div className="add">
            <InputText
                label="Target's name"
                value={target}
                suggestions={targets}
                validator={isValidTarget}
                onChange={setTarget}
                onEnterPressed={handleAddForTarget}
            />
            <Button
                icon="add"
                label="Add"
                enabled={isValidTarget(target)}
                onClick={handleAddForTarget}
            />
        </div>
    )
}

function useColorsPersistenceHandler(
    colorRanges: ColorByGIDs[],
    setColorRanges: (colorRanges: ColorByGIDs[]) => void,
    fileSaver: FileSaverInterface
): [saveColorHandler: () => void, loadColorHandler: (files: FileList) => void] {
    const saveColorHandler = React.useCallback(() => {
        saveColorRanges(colorRanges, fileSaver)
    }, [colorRanges])
    const loadColorHandler = React.useMemo(() => {
        const handler = async (files: FileList) => {
            const newColorRanges = await loadColorRanges(files)
            if (!newColorRanges) return

            setColorRanges(newColorRanges)
        }
        return (files: FileList) => void handler(files)
    }, [setColorRanges])
    return [saveColorHandler, loadColorHandler]
}

function useApplyColorsHandler(
    props: ColorByGidViewProps,
    colorRanges: ColorByGIDs[]
) {
    const modal = useModal()
    return React.useCallback(() => {
        const startTime = Date.now()
        modal
            .progress((setProgress) =>
                props.manager.applyColorByGIDs(
                    colorRanges,
                    (percent: number) => {
                        setProgress(
                            <div>
                                <ProgressView
                                    wide={true}
                                    value={percent}
                                    label={`Applying colors for ${countGIDs(
                                        colorRanges
                                    )} GIDs (${(percent * HUNDRED).toFixed(
                                        1
                                    )} %)`}
                                />
                                <Label
                                    value={`Estimated time: ${estimateRemainingTime(
                                        startTime,
                                        percent
                                    )}`}
                                />
                            </div>
                        )
                    }
                )
            )
            .catch((ex) => modal.error(ex))
    }, [colorRanges])
}

function renderButtons(
    handleLoadColors: (files: FileList) => void,
    handleSaveColors: () => void,
    handleApplyColors: () => void
) {
    return (
        <>
            <div className="persistence">
                <InputFile
                    label="Load"
                    icon="import"
                    accept=".json"
                    onClick={handleLoadColors}
                />
                <Button label="Save" icon="export" onClick={handleSaveColors} />
            </div>
            <Button
                label="Apply Color by Cells IDs"
                accent={true}
                wide={true}
                onClick={handleApplyColors}
            />
        </>
    )
}

function renderColorRanges(
    colorRanges: ColorByGIDs[],
    removeColorRange: (colorRange: ColorByGIDs) => void,
    updateColorRange: (index: number, colorRange: Partial<ColorByGIDs>) => void
) {
    return (
        <>
            {colorRanges.length === 0 && (
                <p>
                    There are no color range defined yet.
                    <br />
                    If you apply the coloring now, every cell will have a random
                    color.
                </p>
            )}
            {colorRanges.length > 0 && (
                <div className="color-ranges theme-color-section">
                    {colorRanges.map((colorRange, index) => (
                        <GidsRangeView
                            key={index}
                            colorRange={colorRange}
                            onDelete={() => removeColorRange(colorRange)}
                            onUpdate={(value) => updateColorRange(index, value)}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

function renderAddNewRange(
    newRange: string,
    setNewRange: React.Dispatch<React.SetStateAction<string>>,
    setRangeValidity: React.Dispatch<React.SetStateAction<boolean>>,
    rangeValidity: boolean,
    addColorRange: (colorRange: ColorByGIDs) => void
) {
    const handleAdd = () => {
        addColorRange({
            color: makeColor(),
            rangeDefinition: newRange,
        })
        setNewRange("")
    }
    return (
        <div className="add">
            <InputText
                label="GIDs range (ex: 7,13-15,24,30-99)"
                value={newRange}
                onChange={setNewRange}
                validator={isRange}
                onEnterPressed={handleAdd}
                onValidation={setRangeValidity}
            />
            <Button
                enabled={rangeValidity}
                icon="add"
                label="Add"
                onClick={handleAdd}
            />
        </div>
    )
}

function getClassNames(props: ColorByGidViewProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorByGidView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

/**
 * @returns A random vivid color.
 */
function makeColor(): ColorRGBA {
    const HALF = 0.5
    const color = new Color()
    color.H = Math.random()
    color.L = 0.5
    color.S = HALF + Math.random() * HALF
    color.hsl2rgb()
    return color.toArrayRGBA()
}

function convertArrayToRange(gids: number[]): string {
    return gids.map((value) => `${value}`).join(",")
}

function countGIDs(colorRanges: ColorByGIDs[]): number {
    let count = 0
    for (const colorRange of colorRanges) {
        const [rangesList] = colorRange.rangeDefinition.split("|")
        const ranges = rangesList.split(",")
        for (const range of ranges) {
            const [a, b] = range.split("-")
            if (!b) count++
            else count += 1 + parseInt(b) - parseInt(a)
        }
    }
    return count
}

function estimateRemainingTime(startTime: number, percent: number) {
    if (percent <= 0) return "..."

    const timeInMsec = ((1 - percent) * (Date.now() - startTime)) / percent
    const seconds = Math.ceil(timeInMsec * SEC_PER_MS)
    if (seconds < 60) return `${seconds} sec`

    const minutes = Math.ceil(seconds * MINUTES_PER_SECOND)
    if (minutes < 60) return `${minutes} min`

    const hours = Math.ceil(minutes * HOURS_PER_MINUTE)
    return `${hours} hour${hours > 1 ? "s" : ""}`
}
