import { saveBinaryFiles } from "./binary-files"
import { saveTextFiles } from "./text-files"
import { Vector4 } from "@/_old_/contract/tool/calc"
import {
    GenerateScriptsForMorphologyCollageOptions,
    GenerateScriptsForMorphologyCollageServices,
} from "./types"

export async function generateScriptsForMorphologyCollage(
    options: GenerateScriptsForMorphologyCollageOptions,
    services: GenerateScriptsForMorphologyCollageServices
): Promise<void> {
    try {
        await saveConfigFile(options, services)
        await saveBinaryFiles(options, services)
        await saveTextFiles(options, services)
    } catch (ex) {
        console.error("Unable to generate scripts for morphology collage:", ex)
        throw ex
    }
}

async function saveConfigFile(
    {
        cellsPerSlice,
        slices,
        resolution,
        outputFolder,
    }: GenerateScriptsForMorphologyCollageOptions,
    services: GenerateScriptsForMorphologyCollageServices
) {
    const { brayns, fileSystem } = services
    const config = {
        cellsPerSlice,
        resolution,
        background: await brayns.getSceneBackgroundColor(),
        slices: slices.positions.map((slice) => ({
            width: slices.width,
            height: slices.height,
            depth: slices.depth,
            center: slice.center,
            orientation: slice.orientation,
        })),
        models: await makeModelsConfig(services),
    }
    await fileSystem.saveTextFile(
        `${outputFolder}/config.json`,
        JSON.stringify(config, null, "  ")
    )
}

async function makeModelsConfig({
    brayns,
    scene,
}: GenerateScriptsForMorphologyCollageServices): Promise<ModelSummary[]> {
    const result: ModelSummary[] = (await scene.models.mesh.getItems()).map(
        (mesh) => ({
            loader: {
                name: mesh.loader.name,
                path: mesh.path,
                properties: mesh.loader.data,
            },
        })
    )
    for (const circuit of await scene.models.circuit.getItems()) {
        const [modelId] = circuit.modelIds
        const modelSummary: ModelSummary = {
            loader: {
                path: circuit.path,
                name: circuit.loader.name,
                properties: circuit.loader.data,
            },
        }
        try {
            const transferFunction =
                await brayns.getModelTransferFunction(modelId)
            modelSummary.transferFunction = transferFunction
        } catch (ex) {
            // We suppose we get here because the model
            // doesn't have any Transfer Function.
        }
        result.push(modelSummary)
    }
    return result
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
