import AbstractObjectManager from "../abstract-object"
import CalcInterface, { Vector4 } from "@/_old_/contract/tool/calc"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { assertNumber, assertObject } from "@/_old_/tool/validator"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import {
    SceneObjectsPlane,
    SceneObjectsPlaneDefinition,
    SceneObjectsPlanesManagerInterface,
    SceneObjectsPlanesSet,
} from "@/_old_/contract/manager/scene/scene-objects-planes"
import {
    isSceneObjectsPlane,
    isSceneObjectsPlaneDefinition4,
} from "./type-guard"

export default class PlanesManager
    extends AbstractObjectManager<SceneObjectsPlanesSet, SceneObjectsPlane>
    implements SceneObjectsPlanesManagerInterface
{
    constructor(
        brayns: JsonRpcServiceInterface,
        private readonly calc: CalcInterface,
        storage: SessionStorageServiceInterface
    ) {
        super(
            brayns,
            storage,
            "scene/objects/planes",
            inflexibleConverter(isSceneObjectsPlane)
        )
    }

    async add(...planes: SceneObjectsPlane[]): Promise<number> {
        const input: Array<{
            color: Vector4
            geometry: { coefficients: Vector4 }
        }> = []
        for (const plane of planes) {
            const { a, b, c, d } = getPlaneEquationCoefficients(
                this.calc,
                plane.definition
            )
            input.push({
                color: plane.color,
                geometry: { coefficients: [a, b, c, d] },
            })
        }
        const result = await this.brayns.exec("add-planes", input)
        try {
            assertObject(result, "data")
            const { model_id: id } = result
            assertNumber(id, "data.model_id")
            await this.storage.store({ id, planes })
            return id
        } catch (ex) {
            console.error(
                `Invalid return type from "add-planes" entrypoint!`,
                result
            )
            console.error(ex)
            throw ex
        }
    }
}

function getPlaneEquationCoefficients(
    calc: CalcInterface,
    definition: SceneObjectsPlaneDefinition
) {
    if (isSceneObjectsPlaneDefinition4(definition)) return definition

    const {
        normal: [a, b, c],
        distance: d,
    } = calc.plane6to4(definition.point, definition.normal)
    return { a, b, c, d }
}
