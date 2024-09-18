import { LoaderParams } from "@/_old_/contract/factory/loader-params"
import { MorphologyModel } from "@/_old_/contract/manager/models/types/morphology-model"

export function makeLoaderParamsForMorphology(
    morphology: MorphologyModel
): LoaderParams {
    return {
        path: morphology.path,
        loader_name: "Neuron Morphology loader",
        loader_properties: {
            // Can be: smooth, original, section_smooth or constant_radii
            geometry_type: "original",
            // Wether to load or not the axon section of the neuron
            load_axon: true,
            // Wether to load or not the dendrite sections of the neuron
            load_dendrites: true,
            // Wether to load or not the soma section of the neuron
            load_soma: true,
            // Parameter to multiply all morphology sample radii by.
            // Must be > 0.0. Ignored if 'radius_override' > 0.0
            radius_multiplier: 1,
            resampling: 1,
            subsampling: 1,
        },
    }
}
