import { LoaderParams } from "@/_old_/contract/factory/loader-params"
import { VolumeModel } from "@/_old_/contract/manager/models/types/volume-model"

export function makeLoaderParamsForVolume(volume: VolumeModel): LoaderParams {
    return {
        path: volume.path,
        loader_name: "NRRD loader",
        loader_properties: {
            // Voxel type to interpret the atlas being loaded
            type: volume.format,
        },
    }
}
