import ModelListBase from "./base"
import { getBasename } from "@/_old_/tool/filename"
import { CellPlacementListInterface } from "@/_old_/contract/manager/models/types/cell-placement-list"
import { CellPlacementModel } from "@/_old_/contract/manager/models/types/cell-placement-model"
import { ModelOptions } from "@/_old_/contract/manager/models/types/model-list-base"
import CalcInterface, { Vector4 } from "@/_old_/contract/tool/calc"
import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { bubbleError } from "../../../tool/error"
import {
    ModelColor,
    extractSolidColor,
} from "@/_old_/contract/manager/models/types/model-types"

const DEFAULT_COLOR: Vector4 = [0.8, 1, 0.6, 1]

export default class CellPlacementList
    extends ModelListBase<CellPlacementModel>
    implements CellPlacementListInterface
{
    constructor(
        brayns: BraynsApiServiceInterface,
        table: TableStorageInterface<CellPlacementModel>,
        private readonly loaderParamsFactory: LoaderParamsFactoryInterface,
        private readonly calc: CalcInterface
    ) {
        super(brayns, table)
    }

    async load(
        options: ModelOptions<CellPlacementModel>,
        onTaskReady: (task: LongTask) => void
    ): Promise<CellPlacementModel | null> {
        try {
            // Let's fill the optional attributes.
            const model: CellPlacementModel = fillOptionalAttributes(options)
            const params = this.loaderParamsFactory.makeLoaderParams(model)
            model.loader.name = params.loader_name
            model.loader.data = params.loader_properties
            const braynsModels = await this.brayns.addModel(params, onTaskReady)
            if (!braynsModels) return null

            model.boundingBox = this.calc.computeBoundingBoxesUnion(
                braynsModels.map((m) => m.bounds)
            )
            model.cameraTarget = this.calc.computeBoundingBoxCenter(
                model.boundingBox
            )
            model.modelIds = braynsModels.map((m) => m.model_id)
            model.modelTypes = braynsModels.map((m) => m.model_type)
            const { table } = this
            const circuit = await table.store(model)
            await this.updateColor(circuit.id, model.colors)
            if (!model.visible)
                await this.updateVisible(circuit.id, model.visible)
            return circuit
        } catch (ex) {
            bubbleError("Unable to load a Cell Placement file!", ex)
        }
    }

    async updateColor(id: number, colors: ModelColor): Promise<boolean> {
        const { table } = this
        const circuitModel = await table.get(id)
        if (!circuitModel) return false

        for (const modelId of circuitModel.modelIds) {
            await this.brayns.setMaterial(
                "phong",
                modelId,
                extractSolidColor(colors)
            )
        }
        await table.store({
            ...circuitModel,
            colors,
        })
        return true
    }

    async updateName(id: number, name: string): Promise<boolean> {
        const { table } = this
        const circuitModel = await table.get(id)
        if (!circuitModel) return false

        await table.store({
            ...circuitModel,
            name,
        })
        return true
    }

    async updateVisible(id: number, visible: boolean): Promise<boolean> {
        const { brayns, table } = this
        const circuitModel = await table.get(id)
        if (!circuitModel) {
            console.error("No circuit model with this id:", id)
            return false
        }
        for (const modelId of circuitModel.modelIds) {
            await brayns.updateModel({
                id: modelId,
                visible,
            })
        }
        await table.store({
            ...circuitModel,
            visible,
        })
        return true
    }
}

function fillOptionalAttributes(
    options: ModelOptions<CellPlacementModel>
): CellPlacementModel {
    const model: CellPlacementModel = {
        id: 0,
        type: "Cell placement loader",
        name: getBasename(options.path),
        loader: {
            name: "Cell placement loader",
            data: {},
        },
        showAxon: false,
        showDendrites: false,
        showSoma: false,
        visible: true,
        modelIds: [],
        modelTypes: [],
        boundingBox: {
            max: [+1, +1, +1],
            min: [-1, -1, -1],
        },
        cameraTarget: [0, 0, 0],
        colors: { method: "solid", values: { color: DEFAULT_COLOR } },
        morphologyFolder: "",
        percentage: 100,
        extension: "",
        ...options,
    }
    return model
}
