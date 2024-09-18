import { LoaderParams } from "@/_old_/contract/factory/loader-params"
import { MeshModel } from "@/_old_/contract/manager/models/types/mesh-model"

export function makeLoaderParamsForMesh(mesh: MeshModel): LoaderParams {
    return {
        loader_name: "mesh",
        loader_properties: {},
        path: mesh.path,
    }
}
