import { Model } from "./model-types"
import { assertType, isType } from "@/_old_/tool/validator"

export interface CellPlacementModel extends Model {
    type: "Cell placement loader"
    morphologyFolder: string
    percentage: number
    extension: string
    showSoma: boolean
    showDendrites: boolean
    showAxon: boolean
}

export function assertCellPlacementModel(
    data: unknown,
    prefix = ""
): asserts data is CellPlacementModel {
    assertType<{ type: string }>(
        data,
        {
            type: "string",
            morphologyFolder: "string",
            percentage: "number",
            extension: "string",
            showSoma: "boolean",
            showDendrites: "boolean",
            showAxon: "boolean",
        },
        prefix
    )
    if (data.type !== "Cell placement loader") {
        throw Error(
            `Expected type to be "Cell placement loader", but we got "${data.type}"!`
        )
    }
}

export function isCellPlacementModel(
    data: unknown
): data is CellPlacementModel {
    return isType(data, {
        type: "string",
        morphologyFolder: "string",
        percentage: "number",
        extension: "string",
        showSoma: "boolean",
        showDendrites: "boolean",
        showAxon: "boolean",
    })
}
