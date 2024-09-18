import { LoaderParams } from "@/_old_/contract/factory/loader-params"
import { CellPlacementModel } from "@/_old_/contract/manager/models"

export function makeLoaderParamsForCellPlacement(
    model: CellPlacementModel
): LoaderParams {
    const params: LoaderParams = {
        loader_name: "Cell placement loader",
        loader_properties: {
            morphology_folder: model.morphologyFolder,
            percentage: model.percentage / 100,
            morphology_parameters: {
                load_axon: model.showAxon,
                load_dendrites: model.showDendrites,
                load_soma: model.showSoma,
            },
        },
        path: model.path,
    }
    if (model.extension) params.loader_properties.extension = model.extension
    return params
}
