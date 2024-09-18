import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import { ModelOptions } from "@/_old_/contract/manager/models/types/model-list-base"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"
import { MorphologyListInterface } from "@/_old_/contract/manager/models/types/morphology-list"
import { MorphologyModel } from "@/_old_/contract/manager/models/types/morphology-model"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import { Vector4 } from "@/_old_/contract/tool/calc"
import { getBasename } from "@/_old_/tool/filename"
import { LongTask } from "../../../contract/service/json-rpc"
import ModelListBase from "./base"

const DEFAULT_COLOR: Vector4 = [1, 0.9, 0.7, 1]

export default class MorphologyList
    extends ModelListBase<MorphologyModel>
    implements MorphologyListInterface
{
    constructor(
        brayns: BraynsApiServiceInterface,
        table: TableStorageInterface<MorphologyModel>,
        private readonly loaderParamsFactory: LoaderParamsFactoryInterface
    ) {
        super(brayns, table)
    }

    async load(
        options: ModelOptions<MorphologyModel>,
        taskHandler: (task: LongTask) => void
    ): Promise<MorphologyModel | null> {
        const model: MorphologyModel = {
            id: 0,
            type: "morphology",
            loader: {
                name: "morphology",
                data: {},
            },
            colors: { method: "solid", values: { color: DEFAULT_COLOR } },
            modelIds: [],
            modelTypes: [],
            name: getBasename(options.path),
            visible: true,
            boundingBox: {
                max: [+1, +1, +1],
                min: [-1, -1, -1],
            },
            cameraTarget: [0, 0, 0],
            ...options,
        }
        const models = await this.brayns.addModel(
            this.loaderParamsFactory.makeLoaderParams(model),
            taskHandler
        )
        if (!models) return null

        model.modelIds = models.map((model) => model.model_id)
        const { table } = this
        const morphology = await table.store(model)
        await this.updateColor(morphology.id, model.colors)
        if (!model.visible)
            await this.updateVisible(morphology.id, model.visible)
        return morphology
    }

    async updateColor(id: number, colors: ModelColor): Promise<boolean> {
        const { brayns, table } = this
        const morphologyModel = await table.get(id)
        if (!morphologyModel) return false

        for (const modelId of morphologyModel.modelIds) {
            await brayns.setColor(modelId, colors)
        }
        await table.store({
            ...morphologyModel,
            colors,
        })
        return true
    }

    async updateVisible(id: number, visible: boolean): Promise<boolean> {
        const { brayns, table } = this
        const morphologyModel = await table.get(id)
        if (!morphologyModel) {
            console.error("No morphology model with this id:", id)
            return false
        }
        for (const modelId of morphologyModel.modelIds) {
            await brayns.updateModel({
                id: modelId,
                visible,
            })
        }
        await table.store({
            ...morphologyModel,
            visible,
        })
        return true
    }
}
