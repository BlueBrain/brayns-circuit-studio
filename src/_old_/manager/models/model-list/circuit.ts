import { isString } from "@/_old_/tool/validator"
import ModelListBase from "./base"
import { getBasename } from "@/_old_/tool/filename"
import { CircuitListInterface } from "@/_old_/contract/manager/models/types/circuit-list"
import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import { ModelOptions } from "@/_old_/contract/manager/models/types/model-list-base"
import CalcInterface, { Vector4 } from "@/_old_/contract/tool/calc"
import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import { TableStorageInterface } from "@/_old_/contract/storage/table"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"
import Color from "@/_old_/ui/color/color"
import { isType } from "@tolokoban/type-guards"

const DEFAULT_COLOR: Vector4 = [0.5, 1, 0.4, 1]

export default class CircuitList
    extends ModelListBase<CircuitModel>
    implements CircuitListInterface
{
    constructor(
        brayns: BraynsApiServiceInterface,
        table: TableStorageInterface<CircuitModel>,
        private readonly loaderParamsFactory: LoaderParamsFactoryInterface,
        private readonly calc: CalcInterface
    ) {
        super(brayns, table)
    }

    async load(
        options: ModelOptions<CircuitModel>,
        onTaskReady: (task: LongTask) => void
    ): Promise<CircuitModel | null> {
        // Let's fill the optional attributes.
        const model: CircuitModel = fillOptionalAttributes(options)
        const params = this.loaderParamsFactory.makeLoaderParams(model)
        model.loader.name = params.loader_name
        model.loader.data = params.loader_properties
        console.log(params)
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
        console.log("#########################################")
        console.log("🚀 [circuit] circuit = ", circuit) // @FIXME: Remove this line written on 2024-05-28 at 10:56
        if (options.report?.type === "spikes") {
            const colorramp: Vector4[] = []
            if (isSolidColor(model.colors)) {
                const color = Color.fromArrayRGBA(model.colors.values.color)
                const dark = new Color(color.stringify())
                dark.rgb2hsl()
                dark.L *= 0.3
                dark.hsl2rgb()
                colorramp.push(
                    dark.toArrayRGBA(),
                    color.toArrayRGBA(),
                    [1, 1, 1, 1]
                )
            } else {
                colorramp.push(
                    [0.1, 0.1, 0.2, 1],
                    [0.9, 0.6, 0.1, 1],
                    [1, 1, 0, 1]
                )
            }
            for (const modelId of model.modelIds) {
                await this.brayns.setModelTransferFunction(modelId, {
                    range: {
                        min: 0,
                        max: 1,
                    },
                    colors: colorramp,
                })
            }
        } else {
            await this.updateColor(circuit.id, model.colors)
        }
        if (!model.visible) await this.updateVisible(circuit.id, model.visible)
        return circuit
    }

    async updateColor(id: number, colors: ModelColor): Promise<boolean> {
        const { table, brayns } = this
        const circuitModel = await table.get(id)
        if (!circuitModel) return false

        for (const modelId of circuitModel.modelIds) {
            const availableMethods = await brayns.getColorMethods(modelId)
            if (!availableMethods.includes(colors.method)) {
                console.error(
                    `Color method "${colors.method}" does not exist for model #${modelId}!`
                )
                console.error("Available methods are:", availableMethods)
                return false
            }

            await brayns.setColor(modelId, colors)
        }
        await table.store({
            ...circuitModel,
            colors: colors,
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
    options: ModelOptions<CircuitModel>
): CircuitModel {
    if (!isString(options.type)) options.type = "SONATA loader"
    if (options.type === "SONATA loader") {
        const model: CircuitModel = {
            id: 0,
            type: "SONATA loader",
            name: getBasename(options.path),
            loader: {
                name: "SONATA loader",
                data: {},
            },
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
            density: 1,
            population: { name: "", type: "" },
            nodeSets: [],
            showAxon: false,
            showDendrites: false,
            showSoma: false,
            thickness: 1,
            report: options.report,
            reports: [],
            size: 0,
            afferent: [],
            efferent: [],
            ...options,
        }
        return model
    }
    if (options.type === "BBP loader") {
        const model: CircuitModel = {
            id: 0,
            type: "BBP loader",
            loader: {
                name: "BBP loader",
                data: {},
            },
            name: getBasename(options.path),
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
            density: 1,
            gids: "",
            showAfferentSynapses: false,
            showAxon: false,
            showDendrites: false,
            showEfferentSynapses: false,
            showSoma: false,
            targets: [],
            thickness: 8,
            ...options,
        }
        return model
    }
    throw Error(
        `Loader type ${JSON.stringify(options)} is not implemented yet!`
    )
}

function isSolidColor(colors: ModelColor): colors is {
    method: "solid"
    values: { color: Vector4 }
} {
    return isType(colors, {
        method: ["literal", "solid"],
        values: {
            color: ["array(4)", "number"],
        },
    })
}
