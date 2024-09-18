import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import PythonScriptMakerFeatureInterface, {
    PythonScriptMakerFeatureOptions,
} from "@/_old_/contract/feature/python-script-maker"
import SceneManagerInterface from "@/_old_/contract/manager/scene"
import AtlasServiceInterface from "@/_old_/contract/service/atlas"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import FileSystemServiceInterface from "@/_old_/contract/service/file-system"
import NexusInterface from "@/_old_/contract/service/nexus"
import CalcInterface, { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import GenericEvent from "@/_old_/tool/event"
import { fillPlaceholders } from "@/_old_/tool/placeholders"
import Color from "@/_old_/ui/color/color"
import ResourceAllocate from "./resources/allocate.sh"
import ResourceBrayns from "./resources/brayns.py"
import ResourceScript from "./resources/script.py"
import ResourceStart from "./resources/start.sh"
import { BRAYNS_VERSION } from "@/_old_/constants"
import {
    CodeBloc,
    codeToString,
    pythonObjectToCode,
} from "@/_old_/util/code/code"

export default class PythonScriptMakerFeature extends PythonScriptMakerFeatureInterface {
    public readonly eventProgress = new GenericEvent<string>()

    constructor(
        private readonly braynsService: BraynsApiServiceInterface,
        private readonly scene: SceneManagerInterface,
        private readonly fileSystemService: FileSystemServiceInterface,
        private readonly calc: CalcInterface,
        private readonly loaderParamsfactory: LoaderParamsFactoryInterface,
        private readonly atlas: AtlasServiceInterface,
        private readonly nexus: NexusInterface
    ) {
        super()
    }

    async generatePythonScripts(
        options: PythonScriptMakerFeatureOptions
    ): Promise<boolean> {
        const foldername = options.destinationFolder

        try {
            const BACKGROUND = JSON.stringify(await this.makeBackgroundColor())
            const camera = this.makeCameraConfig()
            const code: CodeBloc = [
                `log("Setting camera...")`,
                `await exec(`,
                [`"set-camera-view",`, ...pythonObjectToCode(camera.lookat)],
                `)`,
                `await exec(`,
                [
                    `"set-camera-orthographic",`,
                    ...pythonObjectToCode(camera.orthographic),
                ],
                ")",
            ]
            const meshes = await this.prepareMeshes(foldername)
            console.log("🚀 [python-script-maker] meshes = ", meshes) // @FIXME: Remove this line written on 2023-09-15 at 11:57
            for (const mesh of meshes) {
                const region = this.atlas.findRegionById(mesh.regionId)
                if (!region) continue

                code.push(
                    "",
                    `log("Loading brains region ${region.name} (${region.acronym})...")`,
                    `path = pathlib.Path.joinpath(PATH, "mesh-${region.id}.obj")`,
                    `models = await exec(`,
                    [
                        `"add-model",`,
                        `{"loader_name": "mesh", "loader_properties": {}, "path": str(path)},`,
                    ],
                    `)`,
                    `model = models[0]`,
                    `model_id = model["model_id"]`,
                    "",
                    "# Setting color",
                    `await exec("set-material-ghost", {"model_id": model_id, "material": {}})`,
                    `await exec(`,
                    [
                        `"color-model",`,
                        `{`,
                        [
                            `"id": model_id,`,
                            `"method": "solid",`,
                            `"values": {"color": ${JSON.stringify(
                                Color.fromColorOrString(
                                    `#${region.color}`
                                ).toArrayRGBA()
                            )}}`,
                        ],
                        `}`,
                    ],
                    `)`
                )
            }
            const models = await this.makeModelsConfig()
            console.log("🚀 [python-script-maker] models = ", models) // @FIXME: Remove this line written on 2024-05-07 at 16:13
            models.forEach((model) => {
                code.push(
                    `log("Adding file: ${model.loader.path}")`,
                    `models = await exec(`,
                    [
                        `"add-model",`,
                        ...pythonObjectToCode({
                            path: model.loader.path,
                            loader_name: model.loader.name,
                            loader_properties: model.loader.properties,
                        }),
                    ],
                    ")",
                    "model = models[0]",
                    `model_id = model["model_id"]`
                )
                if (model.transferFunction) {
                    code.push(
                        `await exec("set-color-ramp",`,
                        [
                            "{",
                            [
                                `"id": model_id,`,
                                `"color_ramp": {`,
                                [
                                    `"colors": ${JSON.stringify(model.transferFunction.colors)},`,
                                    `"range": ${JSON.stringify([
                                        model.transferFunction.range.min,
                                        model.transferFunction.range.max,
                                    ])}`,
                                ],
                                "}",
                            ],
                            "}",
                        ],
                        ")",
                        `await exec("enable-simulation", {"model_id": model_id, "enabled": True})`
                    )
                }
            })
            const simulationParams =
                await this.braynsService.getSimulationParameters()
            code.push(
                "await exec(",
                [
                    `"set-simulation-parameters",`,
                    ...pythonObjectToCode({
                        current: simulationParams.current,
                    }),
                ],
                ")"
            )
            this.shout("Writing Python scripts")
            const FILES: Array<
                [string, string, { [name: string]: string | number }?]
            > = [
                ["allocate.sh", ResourceAllocate, { ACCOUNT: options.account }],
                ["brayns.py", ResourceBrayns],
                [
                    "script.py",
                    ResourceScript,
                    {
                        CODE: codeToString([code]),
                        WIDTH: `${options.width ?? 1920}`,
                        HEIGHT: `${options.height ?? 1080}`,
                        BACKGROUND,
                    },
                ],
                ["start.sh", ResourceStart, { BRAYNS_VERSION }],
                ["requirements.txt", `websockets==10.3\n`],
            ]
            for (const [name, content, placeholders] of FILES) {
                await this.fileSystemService.saveTextFile(
                    `${foldername}/${name}`,
                    fillPlaceholders(content, placeholders)
                )
            }
            return true
        } catch (ex) {
            console.error("Error while building python script:", ex)
            throw ex
        }
    }

    private async makeBackgroundColor() {
        return await this.braynsService.getSceneBackgroundColor()
    }

    private makeCameraConfig(): {
        lookat: { position: Vector3; target: Vector3; up: Vector3 }
        orthographic: { height: number }
    } {
        const cameraParams = this.scene.camera.params
        if (cameraParams.type !== "orthographic")
            throw Error("Movie maker works only with Orthographic cameras!")

        const { calc } = this
        const axis = calc.getAxisFromQuaternion(cameraParams.orientation)
        const position = calc.addVectors(
            cameraParams.target,
            calc.scaleVector(axis.z, cameraParams.distance)
        )
        return {
            lookat: {
                position,
                target: cameraParams.target,
                up: axis.y,
            },
            orthographic: { height: cameraParams.height },
        }
    }

    private async makeModelsConfig(): Promise<ModelSummary[]> {
        const { scene, braynsService } = this
        const result: ModelSummary[] = (await scene.models.mesh.getItems()).map(
            (mesh) => ({
                loader: {
                    name: "mesh",
                    path: mesh.path,
                    properties: {
                        geometry_quality: "high",
                    },
                },
            })
        )
        const circuits = await scene.models.circuit.getItems()
        for (const circuit of circuits) {
            const [modelId] = circuit.modelIds
            const transferFunction =
                await braynsService.getModelTransferFunction(modelId)
            result.push({
                loader: {
                    path: circuit.path,
                    name: circuit.type,
                    properties:
                        this.loaderParamsfactory.makeLoaderParams(circuit)
                            .loader_properties,
                },
                transferFunction,
            })
        }
        return result
    }

    private async prepareMeshes(foldername: string): Promise<MeshDefinition[]> {
        const { atlas, nexus, fileSystemService } = this
        const meshes: MeshDefinition[] = []
        const regionIds = atlas.getVisibleRegions()
        let count = 0
        for (const regionId of regionIds) {
            count++
            const region = atlas.findRegionById(regionId)
            if (!region) continue

            this.shout(
                `Loading mesh ${count}/${regionIds.length} for region ${region.acronym} (${region.name})...`
            )
            const content = await nexus.loadMeshForRegion(regionId)
            meshes.push({
                color: Color.fromColorOrString(
                    `#${region.color}`
                ).toArrayRGBA(),
                content,
                regionId,
            })
            this.shout(
                `Writing mesh ${count}/${regionIds.length} for region ${region.acronym} (${region.name})...`
            )
            await fileSystemService.saveTextFile(
                `${foldername}/mesh-${region.id}.obj`,
                content
            )
        }
        return meshes
    }

    /**
     * Tell any listener about the progress of the movie preparation.
     */
    private shout(message: string) {
        console.log("Movie generation:", message)
        this.eventProgress.trigger(message)
    }
}

interface MeshDefinition {
    content: string
    regionId: number
    color: Vector4
}

interface ModelSummary {
    loader: {
        name: string
        path: string
        properties: unknown
    }
    transferFunction?: {
        range: { min: number; max: number }
        colors: Vector4[]
    }
}
