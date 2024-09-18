import * as React from "react"
import InputInteger from "@/_old_/ui/view/input/integer"
import Options from "@/_old_/ui/view/options"
import { DEFAULT_COLLAGE_CELLS_DENSITY } from "@/_old_/constants"
import "./cells-density-per-slice-view.css"

export interface CellsDensityPerSliceViewProps {
    className?: string
    /**
     * Max number of cells to display in a slice.
     * 0 means that we will display all the cells.
     */
    value: number
    onChange(this: void, value: number): void
}

const OPTION_ALL = "all"
const OPTION_LIMIT = "limit"

export default function CellsDensityPerSliceView(
    props: CellsDensityPerSliceViewProps
) {
    const handleOptionChange = (option: string) => {
        if (option === OPTION_ALL) props.onChange(0)
        else props.onChange(DEFAULT_COLLAGE_CELLS_DENSITY)
    }
    return (
        <fieldset className={getClassNames(props)}>
            <legend>Cells density per Slice</legend>
            <Options
                options={{
                    [OPTION_ALL]: "All cells",
                    [OPTION_LIMIT]: "Limited to",
                }}
                value={props.value > 0 ? OPTION_LIMIT : OPTION_ALL}
                onChange={handleOptionChange}
            />
            {props.value > 0 && (
                <InputInteger
                    wide={true}
                    value={props.value}
                    onChange={props.onChange}
                />
            )}
        </fieldset>
    )
}

function getClassNames(props: CellsDensityPerSliceViewProps): string {
    const classNames = [
        "custom",
        "view-page-collagePreview-CellsDensityPerSliceView",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
