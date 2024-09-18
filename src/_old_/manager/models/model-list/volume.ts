import ModelListBase from "./base"
import { getBasename } from "@/_old_/tool/filename"
import { VolumeListInterface } from "@/_old_/contract/manager/models/types/volume-list"
import { VolumeModel } from "@/_old_/contract/manager/models/types/volume-model"
import { ModelOptions } from "@/_old_/contract/manager/models/types/model-list-base"
import { Vector4 } from "@/_old_/contract/tool/calc"
import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { assertType } from "@/_old_/tool/validator"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"

const DEFAULT_COLOR: Vector4 = [0.8, 0.9, 1, 0.02]

export default class VolumeList
    extends ModelListBase<VolumeModel>
    implements VolumeListInterface
{
    constructor(
        brayns: BraynsApiServiceInterface,
        table: TableStorageInterface<VolumeModel>,
        private readonly loaderParamsFactory: LoaderParamsFactoryInterface
    ) {
        super(brayns, table)
    }

    async load(
        options: ModelOptions<VolumeModel>,
        cancellableTaskHandler: (task: LongTask) => void
    ): Promise<VolumeModel | null> {
        const model: VolumeModel = {
            id: 0,
            type: "volume",
            loader: { name: "NRRD loader", data: {} },
            format: "orientation",
            visible: true,
            modelIds: [],
            modelTypes: [],
            boundingBox: {
                max: [+1, +1, +1],
                min: [-1, -1, -1],
            },
            cameraTarget: [0, 0, 0],
            colors: {
                method: "solid",
                values: { color: DEFAULT_COLOR },
            },
            availableUseCases: [],
            ...options,
            name: options.name || getBasename(options.path),
            /**
             * This is the default use case because this is the only one supported
             * by all volumes.
             */
            useCase: "Outline mesh shell",
        }
        const models = await this.brayns.addModel(
            this.loaderParamsFactory.makeLoaderParams(model),
            cancellableTaskHandler,
            model.data
        )
        if (!models) return null

        const { table } = this
        model.modelIds = models.map((model) => model.model_id)
        const [firstModelId] = model.modelIds
        const useCases = await this.brayns.jsonRpcService.exec(
            "get-available-atlas-usecases",
            {
                model_id: firstModelId,
            }
        )
        assertType<
            Array<{
                name: string
                params_schema: { [key: string]: unknown }
            }>
        >(
            useCases,
            [
                "array",
                {
                    name: "string",
                    params_schema: ["map", "unknown"],
                },
            ],
            "get-available-atlas-usecases"
        )
        model.availableUseCases = useCases
            .filter(
                (useCase) => Object.keys(useCase.params_schema).length === 0
            )
            .map(({ name }) => name)
        switch (model.format) {
            case "scalar":
                model.useCase = "Density"
                break
            default:
            /** We keep the default usecase. */
        }

        const volume = await table.store(model)
        console.log("🚀 [volume] model, volume = ", model, volume) // @FIXME: Remove this line written on 2023-10-31 at 16:50
        if (!model.visible) await this.updateVisible(volume.id, model.visible)
        return volume
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
        const volumeModel = await table.get(id)
        if (!volumeModel) {
            console.error("No volume model with this id:", id)
            return false
        }
        for (const modelId of volumeModel.modelIds) {
            await brayns.updateModel({
                id: modelId,
                visible,
            })
        }
        await table.store({
            ...volumeModel,
            visible,
        })
        return true
    }

    async updateUseCase(id: number, useCase: string): Promise<boolean> {
        const { brayns, table } = this
        const volumeModel = await table.get(id)
        if (!volumeModel) {
            console.error("No volume model with this id:", id)
            return false
        }
        if (volumeModel.useCase === useCase) return true

        const newModelIds: number[] = []
        for (const modelId of volumeModel.modelIds) {
            const result = await brayns.jsonRpcService.exec(
                "visualize-atlas-usecase",
                {
                    model_id: modelId,
                    use_case: useCase,
                    params: {},
                }
            )
            if (hasModelId(result)) {
                newModelIds.push(result.model_id)
            }
        }
        await brayns.jsonRpcService.exec("remove-model", {
            ids: volumeModel.modelIds,
        })
        await table.store({
            ...volumeModel,
            useCase,
            modelIds: newModelIds,
        })
        return true
    }
}

function hasModelId(data: unknown): data is { model_id: number } {
    try {
        assertType(data, { model_id: "number" })
        return true
    } catch (ex) {
        console.error(ex)
        return false
    }
}
