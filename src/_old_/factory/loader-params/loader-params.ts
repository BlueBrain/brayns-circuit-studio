import LoaderParamsFactoryInterface, {
    LoaderParams,
} from "@/_old_/contract/factory/loader-params"
import {
    CircuitModel,
    isCircuitModel,
} from "@/_old_/contract/manager/models/types/circuit-model"
import {
    isMeshModel,
    MeshModel,
} from "@/_old_/contract/manager/models/types/mesh-model"
import {
    isMorphologyModel,
    MorphologyModel,
} from "@/_old_/contract/manager/models/types/morphology-model"
import {
    isVolumeModel,
    VolumeModel,
} from "@/_old_/contract/manager/models/types/volume-model"
import { makeLoaderParamsForCircuit } from "./circuit"
import { makeLoaderParamsForMesh } from "./mesh"
import { makeLoaderParamsForMorphology } from "./morphology"
import { makeLoaderParamsForVolume } from "./volume"
import { isCellPlacementModel } from "../../contract/manager/models"
import { makeLoaderParamsForCellPlacement } from "./cell-placement"

export default class LoaderParamsFactory extends LoaderParamsFactoryInterface {
    makeLoaderParams(
        model: CircuitModel | MeshModel | MorphologyModel | VolumeModel
    ): LoaderParams {
        if (isCellPlacementModel(model))
            return makeLoaderParamsForCellPlacement(model)
        if (isCircuitModel(model)) return makeLoaderParamsForCircuit(model)
        if (isMeshModel(model)) return makeLoaderParamsForMesh(model)
        if (isMorphologyModel(model))
            return makeLoaderParamsForMorphology(model)
        if (isVolumeModel(model)) return makeLoaderParamsForVolume(model)
        throw Error(
            "We don't know how to generate loader params for this model!"
        )
    }
}
