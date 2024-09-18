import * as React from "react"
import { ColorByGIDs, ColorRGBA } from "@/_old_/contract/service/colors"
import FloatingButton from "@/_old_/ui/view/floating-button"
import InputColor from "@/_old_/ui/view/input/color"
import Color from "@/_old_/ui/color"
import Touchable from "@/_old_/ui/view/touchable"
import { useModal } from "@/_old_/ui/modal"
import Dialog from "@/_old_/ui/view/dialog"
import "./gids-range-view.css"

export interface GidsRangeViewProps {
    className?: string
    colorRange: ColorByGIDs
    onDelete(this: void): void
    onUpdate(this: void, colorRange: Partial<ColorByGIDs>): void
}

export default function GidsRangeView(props: GidsRangeViewProps) {
    const modal = useModal()
    const handleViewRange = React.useCallback(() => {
        const [range] = props.colorRange.rangeDefinition.split("|")
        const hide = modal.show({
            content: (
                <Dialog
                    title="Full GIDs list"
                    hideCancel={true}
                    onOK={() => hide()}
                >
                    <textarea
                        cols={80}
                        rows={Math.min(10, Math.ceil(range.length / 80))}
                    >
                        {expandRange(range)}
                    </textarea>
                </Dialog>
            ),
            autoClosable: true,
        })
    }, [props.colorRange])
    return (
        <div className={getClassNames(props)}>
            <FloatingButton
                small={true}
                icon="delete"
                onClick={props.onDelete}
            />
            <Touchable className="range" onClick={handleViewRange}>
                {getLabelForRange(props.colorRange.rangeDefinition)}
            </Touchable>
            <InputColor
                value={stringifyColor(props.colorRange.color)}
                onChange={(value) =>
                    props.onUpdate({
                        color: parseColor(value),
                    })
                }
            />
        </div>
    )
}

function getClassNames(props: GidsRangeViewProps): string {
    const classNames = [
        "custom",
        "view-circuitColorEditor-colorByGid-GidsRangeView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function stringifyColor(rgba: ColorRGBA): string {
    const color = Color.fromRGBA(...rgba)
    return color.stringify()
}

function parseColor(value: string): ColorRGBA {
    const color = new Color(value)
    return color.toArrayRGBA()
}

/**
 * A label can be added after a pipe ("|") in a range definition.
 * If not, we will use the range as label.
 */
function getLabelForRange(rangeDefinition: string): React.ReactNode {
    const [range, label] = rangeDefinition.split("|")
    const rawLabel = label ?? range
    const MAX_LABEL_LENGTH = 32
    if (rawLabel.length < MAX_LABEL_LENGTH) return rawLabel

    return `${rawLabel.substring(0, MAX_LABEL_LENGTH)}...`
}

function expandRange(range: string): React.ReactNode {
    const individualNumbers: number[] = []
    for (const item of range.split(",")) {
        const [first, last] = item
            .trim()
            .split("-")
            .map((v) => parseInt(v.trim())) as [number, number | undefined]
        for (let value = first; value <= (last ?? first); value++) {
            individualNumbers.push(value)
        }
    }
    return individualNumbers.join(",")
}
