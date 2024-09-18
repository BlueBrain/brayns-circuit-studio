import { CellPlacementModel } from "../manager/models"
import { CircuitModel } from "../manager/models/types/circuit-model"
import { MeshModel } from "../manager/models/types/mesh-model"
import { MorphologyModel } from "../manager/models/types/morphology-model"
import { VolumeModel } from "../manager/models/types/volume-model"

export interface LoaderParams {
    loader_name: string
    loader_properties: Record<string, unknown>
    path: string
}

type Model =
    | MeshModel
    | MorphologyModel
    | CellPlacementModel
    | CircuitModel
    | VolumeModel

/**
 * Generate the parameters for the `add-model` entry point.
 * No call to `add-model` should be done without using
 * this factory to create the parameters. This ensures that
 * we have a level of absraction between our model and the way
 * they are loaded in Brayns byb different loaders.
 */
export default abstract class LoaderParamsFactoryInterface {
    abstract makeLoaderParams(model: Model): LoaderParams
}

export function ensureLoaderParamsFactoryInterface(
    data: unknown
): LoaderParamsFactoryInterface {
    if (data instanceof LoaderParamsFactoryInterface) return data

    console.error("Expected LoaderParamsFactoryInterface but got:", data)
    throw Error("Service is not of type LoaderParamsFactoryInterface!")
}
