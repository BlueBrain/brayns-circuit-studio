import { BRAYNS_VERSION } from "@/_old_/constants"
import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import SimpleMovieMakerFeatureInterface, {
    SimpleMovieMakerFeatureOptions,
} from "@/_old_/contract/feature/simple-movie-maker"
import { ModelColor } from "@/_old_/contract/manager/models/types/model-types"
import SceneManagerInterface from "@/_old_/contract/manager/scene"
import AtlasServiceInterface from "@/_old_/contract/service/atlas"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import FileSystemServiceInterface from "@/_old_/contract/service/file-system"
import NexusInterface from "@/_old_/contract/service/nexus"
import CalcInterface, { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import GenericEvent from "@/_old_/tool/event"
import { fillPlaceholders } from "@/_old_/tool/placeholders"
import Color from "@/_old_/ui/color/color"
import { KeyFrame } from "@/_old_/view/page/main/sections/movie/KeyFramesEditor"
import { makeColorRamp } from "./color-ramp"
import ActivateShFileContent from "./resources/activate.sh"
import AgentPyFileContent from "./resources/agent.py"
import BbpLogoURL from "./resources/bbp-logo.png"
import EpflLogoURL from "./resources/epfl-logo.png"
import FontURL from "./resources/font.ttf.bin"
import MakeMoviePyFileContent from "./resources/make-movie.py"
import PainterPyFileContent from "./resources/painter.py"
import RequirementsTxtFileContent from "./resources/requirements.txt"
import ScalebarPyFileContent from "./resources/scalebar.py"
import StartShFileContent from "./resources/start.sh"

export default class SimpleMovieMakerFeature extends SimpleMovieMakerFeatureInterface {
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

    async generateMovieScripts(
        options: SimpleMovieMakerFeatureOptions
    ): Promise<boolean> {
        const foldername = options.destinationFolder

        try {
            const meshes = await this.prepareMeshes(foldername)
            const transferFunction =
                options.mainModelId > -1
                    ? await this.braynsService.getModelTransferFunction(
                          options.mainModelId
                      )
                    : undefined
            await this.fileSystemService.saveTextFile(
                `${foldername}/config.json`,
                JSON.stringify(
                    await this.makeConfig(options, meshes),
                    null,
                    "  "
                )
            )
            this.shout("Writing Python scripts")
            const FILES: Array<
                [string, string, { [name: string]: string | number }?]
            > = [
                [
                    "activate.sh",
                    ActivateShFileContent,
                    {
                        RESERVATION:
                            options.reservation.trim().length > 0
                                ? `reservation=${options.reservation}`
                                : "",
                    },
                ],
                ["agent.py", AgentPyFileContent],
                ["make-movie.py", MakeMoviePyFileContent],
                ["painter.py", PainterPyFileContent],
                ["requirements.txt", RequirementsTxtFileContent],
                ["scalebar.py", ScalebarPyFileContent],
                [
                    "start.sh",
                    StartShFileContent,
                    {
                        ACCOUNT: options.account,
                        BRAYNS_VERSION,
                    },
                ],
            ]
            for (const [name, content, placeholders] of FILES) {
                await this.fileSystemService.saveTextFile(
                    `${foldername}/${name}`,
                    fillPlaceholders(content, placeholders)
                )
            }
            this.shout("Writing logos and fonts")
            await this.fileSystemService.saveBinaryFile(
                `${foldername}/epfl-logo.png`,
                EpflLogoURL
            )
            await this.fileSystemService.saveBinaryFile(
                `${foldername}/bbp-logo.png`,
                BbpLogoURL
            )
            await this.fileSystemService.saveBinaryFile(
                `${foldername}/font.ttf`,
                FontURL
            )
            if (transferFunction) {
                this.shout("Writing color ramp")
                const colorRampCanvas = makeColorRamp(transferFunction)
                await this.fileSystemService.saveAsImage(
                    `${foldername}/colorramp.jpg`,
                    colorRampCanvas
                )
            } else {
                const emptyCanvas = document.createElement("canvas")
                emptyCanvas.width = 1
                emptyCanvas.height = 1
                await this.fileSystemService.saveAsImage(
                    `${foldername}/colorramp.jpg`,
                    emptyCanvas
                )
            }
            return true
        } catch (ex) {
            console.error("Error while building movie maker script:", ex)
            throw ex
        }
    }

    private async makeConfig(
        options: SimpleMovieMakerFeatureOptions,
        meshes: MeshDefinition[]
    ) {
        return {
            samples: 50,
            resolution: [options.width, options.height],
            fps: options.fps,
            firstStep: options.firstStep,
            lastStep: options.lastStep,
            duration: options.duration,
            ...this.makeSimulationRange(options),
            background: await this.makeBackgroundColor(),
            models: await this.makeModelsConfig(),
            meshes: meshes.map((mesh) => ({
                id: mesh.regionId,
                color: mesh.color,
            })),
            ...this.makeCameraConfig(
                options.keyframes,
                options.firstStep,
                options.lastStep
            ),
        }
    }

    private makeSimulationRange(options: SimpleMovieMakerFeatureOptions) {
        if (options.mainModelId < 0 || !options.reportRange) {
            // No simulation.
            return {}
        }

        const [min, max] = options.reportRange
        const rangeUnit = options.reportDataUnit
        return {
            simulationRange: [`${min} ${rangeUnit}`, `${max} ${rangeUnit}`],
            simulationUnit: options.reportTimeUnit,
            simulationTime: options.reportDuration,
        }
    }

    private async makeBackgroundColor() {
        return await this.braynsService.getSceneBackgroundColor()
    }

    private makeCameraConfig(
        keyframes: KeyFrame[],
        firstStep: number,
        lastStep: number
    ): {
        lookat: { position: Vector3[]; target: Vector3[]; up: Vector3[] }
        orthographic: { height: number[] }
    } {
        if (keyframes.length === 0) {
            const cameraParams = this.scene.camera.params
            if (cameraParams.type !== "orthographic")
                throw Error("Movie maker works only with Orthographic cameras!")
            keyframes.push({
                duration: 1,
                ...cameraParams,
                snapshot: "",
            })
        }
        const { calc } = this
        const positions: Vector3[] = []
        const targets: Vector3[] = []
        const ups: Vector3[] = []
        const heights: number[] = []
        for (let step = firstStep; step <= lastStep; step++) {
            const i = step - firstStep
            const keyframe: KeyFrame = interpolteKeyframe(
                calc,
                keyframes,
                i / (lastStep - firstStep)
            )
            const axis = calc.getAxisFromQuaternion(keyframe.orientation)
            const position = calc.addVectors(
                keyframe.target,
                calc.scaleVector(axis.z, keyframe.distance)
            )
            positions[step] = position
            targets[step] = keyframe.target
            ups[step] = axis.y
            heights[step] = keyframe.height
        }
        return {
            lookat: {
                position: positions,
                target: targets,
                up: ups,
            },
            orthographic: { height: heights },
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
                colors: mesh.colors,
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
                colors: circuit.colors,
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
    colors: ModelColor
    transferFunction?: {
        range: { min: number; max: number }
        colors: Vector4[]
    }
}

interface Section {
    k1: KeyFrame
    k2: KeyFrame
    min: number
    max: number
}

function interpolteKeyframe(
    calc: CalcInterface,
    keyframes: KeyFrame[],
    alpha: number
): KeyFrame {
    const sections: Section[] = []
    for (let i = 0; i < keyframes.length - 1; i++) {
        const k1 = keyframes[i]
        const k2 = keyframes[i + 1]
        sections.push({
            k1,
            k2,
            min: i / (keyframes.length - 1),
            max: (i + 1) / (keyframes.length - 1),
        })
    }
    const section = sections.find(
        ({ min, max }) => alpha >= min && alpha <= max
    )
    if (!section) return keyframes[0]

    const { k1, k2, min, max } = section
    const a2 = (alpha - min) / (max - min)
    const a1 = 1 - a2
    return {
        duration: 0,
        snapshot: "",
        distance: a1 * k1.distance + a2 * k2.distance,
        height: a1 * k1.height + a2 * k2.height,
        orientation: calc.slerp(k1.orientation, k2.orientation, a2),
        target: calc.addVectors(
            calc.scaleVector(k1.target, a1),
            calc.scaleVector(k2.target, a2)
        ),
    }
}
