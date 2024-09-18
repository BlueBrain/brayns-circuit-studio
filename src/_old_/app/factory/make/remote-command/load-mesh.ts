import {
    assertString,
    assertVector4,
    isArrayBuffer,
    isString,
} from "@/_old_/tool/validator"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import { assertObject } from "@/_old_/tool/validator"
import { Vector4 } from "@/_old_/contract/tool/calc"

export interface LoadMeshParams {
    path: string
    data?: string | ArrayBuffer
    color: Vector4
}

export function makeLoadMesh(locator: ServiceLocatorInterface) {
    return async (params: unknown) => {
        try {
            assertLoadMeshParams(params)
            const scene = locator.get("scene", ensureSceneManagerInterface)
            const mesh = await scene.models.mesh.load(
                {
                    colors: {
                        method: "solid",
                        values: { color: params.color },
                    },
                    path: params.path,
                    data: params.data,
                },
                () => {
                    // In the future, we will send progress to the parent.
                }
            )
            if (!mesh) return -1

            void scene.focusOnModel(mesh.modelIds)
            return `mesh/${mesh.id}`
        } catch (ex) {
            console.error(ex)
            return -1
        }
    }
}

function assertLoadMeshParams(obj: unknown): asserts obj is LoadMeshParams {
    assertObject(obj)
    const { path, data, color } = obj
    assertString(path, `data.path`)
    if (data) {
        if (!isString(data) && !isArrayBuffer(data)) {
            throw Error(
                "meshParams.data was expected to be a String or an ArrayBuffer!"
            )
        }
    }
    assertVector4(color, `data.color`)
}
