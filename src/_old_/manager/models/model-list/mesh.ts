import ModelListBase from "./base"
import { getBasename } from "@/_old_/tool/filename"
import { MeshListInterface } from "@/_old_/contract/manager/models/types/mesh-list"
import { MeshModel } from "@/_old_/contract/manager/models/types/mesh-model"
import { ModelOptions } from "@/_old_/contract/manager/models/types/model-list-base"
import { Vector4 } from "@/_old_/contract/tool/calc"
import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import {
    ModelColor,
    extractSolidColor,
} from "@/_old_/contract/manager/models/types/model-types"

const DEFAULT_COLOR: Vector4 = [0.8, 0.9, 1, 0.02]

export default class MeshList
    extends ModelListBase<MeshModel>
    implements MeshListInterface
{
    constructor(
        brayns: BraynsApiServiceInterface,
        table: TableStorageInterface<MeshModel>,
        private readonly loaderParamsFactory: LoaderParamsFactoryInterface
    ) {
        super(brayns, table)
    }

    async load(
        options: ModelOptions<MeshModel>,
        cancellableTaskHandler: (task: LongTask) => void
    ): Promise<MeshModel | null> {
        const model: MeshModel = {
            id: 0,
            type: "mesh",
            loader: { name: "mesh", data: {} },
            colors: { method: "solid", values: { color: DEFAULT_COLOR } },
            name: getBasename(options.path),
            visible: true,
            modelIds: [],
            modelTypes: [],
            boundingBox: {
                max: [+1, +1, +1],
                min: [-1, -1, -1],
            },
            cameraTarget: [0, 0, 0],
            ...options,
        }
        const models = await this.brayns.addModel(
            this.loaderParamsFactory.makeLoaderParams(model),
            cancellableTaskHandler,
            model.data
        )
        if (!models) return null

        const { table } = this
        model.modelIds = models.map((model) => model.model_id)
        const mesh = await table.store(
            preventModelFromBeingTooBigForStorage(model)
        )
        const color = extractSolidColor(model.colors)
        for (const modelId of mesh.modelIds) {
            await this.brayns.setMaterial("ghost", modelId, color)
        }
        await this.updateColor(mesh.id, model.colors)
        if (!model.visible) await this.updateVisible(mesh.id, model.visible)
        return mesh
    }

    async updateColor(id: number, colors: ModelColor): Promise<boolean> {
        const { table } = this
        const meshModel = await table.get(id)
        if (!meshModel) return false

        for (const modelId of meshModel.modelIds) {
            await this.brayns.jsonRpcService.exec("color-model", {
                id: modelId,
                ...colors,
            })
        }
        await table.store({
            ...meshModel,
            colors,
        })
        return true
    }

    async updateVisible(id: number, visible: boolean): Promise<boolean> {
        const { brayns, table } = this
        const meshModel = await table.get(id)
        if (!meshModel) {
            console.error("No mesh model with this id:", id)
            return false
        }
        for (const modelId of meshModel.modelIds) {
            await brayns.updateModel({
                id: modelId,
                visible,
            })
        }
        await table.store({
            ...meshModel,
            visible,
        })
        return true
    }
}

/**
 * Today, we are using local storage to save user data.
 * It has a size limitation and if the data to store
 * is too big, we get this error:
 * ```
 * The quota has been exceeded.
 * ```
 *
 * So If there is a `data` attribute, we delete it to reduce the
 * size of the model before storage.
 *
 * In the future we will use the backend for this, so this limitation
 * will be gone.
 * @param model
 */
function preventModelFromBeingTooBigForStorage(model: MeshModel): MeshModel {
    if (!model.data) return model

    const smallerModel: MeshModel = { ...model }
    delete smallerModel.data
    return smallerModel
}
