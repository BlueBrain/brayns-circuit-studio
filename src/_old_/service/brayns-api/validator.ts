import {
    BoundingBox,
    Quaternion,
    Vector3,
    Vector4,
} from "@/_old_/contract/tool/calc"
import {
    BraynsApiAddModelOutput,
    BraynsApiAddSphereOutput,
    BraynsApiGetSimulationParametersOutput,
    BraynsApiGetApplicationParametersOutput,
    BraynsApiGetModelOutput,
    BraynsApiGetRendererOutput,
    BraynsApiGetSceneOutput,
    BraynsApiGetStatisticsOutput,
    BraynsApiSnapshotOutput,
    BraynsVersion,
} from "@/_old_/contract/service/brayns-api/brayns-api"
import {
    assertArray,
    assertArrayBuffer,
    assertBoolean,
    assertNumber,
    assertObject,
    assertString,
    assertStringArray,
    assertVector2,
    assertVector3,
    assertVector4,
    assertVector4Array,
    isArray,
} from "@/_old_/tool/validator"

export interface InternalBraynsApiModelTransferFunction {
    colors: Vector4[]
    range: [number, number]
}

export function isBraynsApiGetVersionOutput(
    data: unknown
): data is BraynsVersion {
    try {
        assertObject(data, "version")
        const { major, minor, patch, revision } = data
        assertNumber(major, "version.major")
        assertNumber(minor, "version.minor")
        assertNumber(patch, "version.patch")
        assertString(revision, "version.revision")
        return true
    } catch (ex) {
        console.error(
            "Invalid InternalBraynsApiModelTransferFunction format:",
            data
        )
        console.error(ex)
        return false
    }
}

export function isBraynsApiAddSphereOutput(
    data: unknown
): data is BraynsApiAddSphereOutput {
    assertObject(data)
    const { id } = data
    return typeof id === "number"
}

export function isInternalBraynsApiModelTransferFunction(
    data: unknown
): data is InternalBraynsApiModelTransferFunction {
    try {
        assertObject(data, "transferFunction")
        const { colors, range } = data
        assertVector4Array(colors, "transferFunction.colors")
        assertVector2(range, "transferFunction.range")
        return true
    } catch (ex) {
        console.error(
            "Invalid InternalBraynsApiModelTransferFunction format:",
            data
        )
        console.error(ex)
        return false
    }
}

export function isBraynsApiAddModelOutputArray(
    data: unknown
): data is BraynsApiAddModelOutput[] {
    if (!isArray(data)) return false
    for (const item of data) {
        if (!isBraynsApiGetModelOutput(item)) return false
    }
    return true
}

export function isBraynsApiGetApplicationParametersOutput(
    data: unknown
): data is BraynsApiGetApplicationParametersOutput {
    try {
        assertObject(data, "applicationParameters")
        const { viewport, plugins } = data
        assertVector2(viewport, "applicationParameters.viewport")
        assertStringArray(plugins, "applicationParameters.plugins")
        return true
    } catch (ex) {
        console.error(
            "Invalid BraynsApiGetApplicationParametersOutput format:",
            data
        )
        console.error(ex)
        return false
    }
}
export function isBraynsApiGetModelOutput(
    data: unknown
): data is BraynsApiGetModelOutput {
    try {
        assertObject(data, "model")
        const { bounds, is_visible, info, model_id, transform } = data
        assertBoundingBox(bounds, "model.bounds")
        assertBoolean(is_visible, "model.is_visible")
        if (info) {
            assertObject(info, "model.info")
            const { base_transform, load_info, metadata } = info
            if (base_transform) {
                assertTransform(base_transform, "model.info.base_transform")
            }
            if (metadata) assertObject(metadata, "model.info.metadata")
            if (load_info) {
                const prefix = "model.info.load_info"
                assertObject(load_info, prefix)
                const { load_parameters, loader_name, path, source } = load_info
                assertObject(load_parameters, `${prefix}.load_parameters`)
                assertString(loader_name, `${prefix}.loader_name`)
                assertString(path, `${prefix}.path`)
                assertString(source, `${prefix}.source`)
            }
        }
        assertNumber(model_id, "model.model_id")
        assertTransform(transform, "model.transform")
        return true
    } catch (ex) {
        console.error("Invalid BraynsApiGetModelOutput format:", data)
        console.error(ex)
        return false
    }
}

function assertTransform(
    data: unknown,
    prefix = ""
): asserts data is {
    rotation: Quaternion
    scale: Vector3
    translation: Vector3
} {
    assertObject(data, prefix)
    const { rotation, scale, translation } = data
    assertVector4(rotation, `${prefix}.rotation`)
    assertVector3(scale, `${prefix}.scale`)
    assertVector3(translation, `${prefix}.translation`)
}

export function isBraynsApiGetSceneOutput(
    data: unknown
): data is BraynsApiGetSceneOutput {
    try {
        assertObject(data, "scene")
        const { bounds, models } = data
        assertBoundingBox(bounds, "scene.bounds")
        assertArray(models, "scene.models")
        for (const model of models) {
            assertObject(model, `scene.models[?]`)
            const { bounds, is_visible, metadata, model_id, transform } = model
            if (bounds) assertBoundingBox(bounds, "scene.models[?].bounds")
            if (is_visible)
                assertBoolean(is_visible, "scene.models[?].is_visible")
            if (metadata) assertObject(metadata, "scene.models[?].metadata")
            if (model_id) assertNumber(metadata, "scene.models[?].model_id")
            if (transform) {
                assertObject(transform, "scene.models[?].transform")
                const { rotation, scale, translation } = transform
                if (rotation)
                    assertVector4(
                        rotation,
                        "scene.models[?].transform.rotation"
                    )
                if (scale)
                    assertVector3(scale, "scene.models[?].transform.scale")
                if (translation)
                    assertVector3(
                        translation,
                        "scene.models[?].transform.translation"
                    )
            }
        }
        return true
    } catch (ex) {
        console.error("Invalid BraynsApiGetSceneOutput format:", data)
        console.error(ex)
        return false
    }
}

export function isBraynsApiGetSimulationParametersOutput(
    data: unknown
): data is BraynsApiGetSimulationParametersOutput {
    try {
        assertObject(data, "animation")
        // eslint-disable-next-line camelcase
        const { current, dt, start_frame, end_frame, unit } = data
        assertNumber(current, "animation.current")
        assertNumber(dt, "animation.dt")
        assertNumber(start_frame, "animation.start_frame")
        assertNumber(end_frame, "animation.end_frame")
        assertString(unit, "animation.unit")
        return true
    } catch (ex) {
        console.error("Invalid BraynsApiGetSceneOutput format:", data)
        console.error(ex)
        return false
    }
}

export function isBraynsApiGetStatisticsOutput(
    data: unknown
): data is BraynsApiGetStatisticsOutput {
    try {
        assertObject(data, "statistics")
        // eslint-disable-next-line camelcase
        const { fps, scene_size_in_bytes } = data
        assertNumber(fps, "statistics.fps")
        assertNumber(scene_size_in_bytes, "statistics.scene_size_in_bytes")
        return true
    } catch (ex) {
        console.error("Invalid BraynsApiGetStatisticsOutput format:", data)
        console.error(ex)
        return false
    }
}

export function isBraynsApiSnapshotOutput(
    value: unknown
): value is BraynsApiSnapshotOutput {
    try {
        assertObject(value, "snapshot")
        const { $data, color_buffer } = value
        assertObject(color_buffer, "snapshot.color_buffer")
        assertNumber(color_buffer.offset, "snapshot.color_buffer.offset")
        assertNumber(color_buffer.size, "snapshot.color_buffer.size")
        assertArrayBuffer($data, "snapshot.$data")
        return true
    } catch (ex) {
        console.error("Invalid BraynsApiSnapshotOutput format:", value)
        console.error(ex)
        return false
    }
}

function assertBoundingBox(
    data: unknown,
    suffix = "boundingBox"
): asserts data is BoundingBox {
    assertObject(data, suffix)
    const { min, max } = data
    assertVector3(min, `${suffix}.min`)
    assertVector3(max, `${suffix}.max`)
}

export function assertGetRendererOutput(
    data: unknown
): asserts data is BraynsApiGetRendererOutput {
    assertObject(data)
    const {
        accumulation,
        background_color,
        current,
        head_light,
        max_accum_frames,
        samples_per_pixel,
        subsampling,
        types,
        variance_threshold,
    } = data
    assertBoolean(accumulation, "data.accumulation")
    assertVector3(background_color, "data.background_color")
    assertString(current, "data.current")
    assertBoolean(head_light, "data.head_light")
    assertNumber(max_accum_frames, "data.max_accum_frames")
    assertNumber(samples_per_pixel, "data.samples_per_pixel")
    assertNumber(subsampling, "data.subsampling")
    assertStringArray(types, "data.types")
    assertNumber(variance_threshold, "data.variance_threshold")
}
