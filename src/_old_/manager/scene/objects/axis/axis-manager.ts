import AbstractObjectManager from "../abstract-object"
import CalcInterface, { Vector3, Vector4 } from "@/_old_/contract/tool/calc"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { assertNumber, assertObject } from "@/_old_/tool/validator"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isSceneObjectsAxisSet } from "./type-guard"
import {
    SceneObjectsAxis,
    SceneObjectsAxisManagerInterface,
    SceneObjectsAxisSet,
} from "@/_old_/contract/manager/scene/scene-objects-axis"

export default class AxisListManager
    extends AbstractObjectManager<SceneObjectsAxisSet, SceneObjectsAxis>
    implements SceneObjectsAxisManagerInterface
{
    constructor(
        brayns: JsonRpcServiceInterface,
        private readonly calc: CalcInterface,
        storage: SessionStorageServiceInterface
    ) {
        super(
            brayns,
            storage,
            "scene/objects/axis",
            inflexibleConverter(isSceneObjectsAxisSet)
        )
    }

    async add(...axisList: SceneObjectsAxis[]): Promise<number> {
        const { calc } = this
        const input: Array<{
            color: Vector4
            geometry: { p0: Vector3; r0: number; p1: Vector3; r1: number }
        }> = []
        for (const axis of axisList) {
            const { center, orientation, length, thickness } = axis
            const r0 = thickness
            const r1 = thickness
            const { x, y, z } = calc.getAxisFromQuaternion(orientation)
            input.push(
                {
                    color: [1, 0, 0, 1],
                    geometry: {
                        p0: center,
                        p1: calc.addVectors(
                            center,
                            calc.scaleVector(x, length)
                        ),
                        r0,
                        r1,
                    },
                },
                {
                    color: [0, 1, 0, 1],
                    geometry: {
                        p0: center,
                        p1: calc.addVectors(
                            center,
                            calc.scaleVector(y, length)
                        ),
                        r0,
                        r1,
                    },
                },
                {
                    color: [0, 0, 1, 1],
                    geometry: {
                        p0: center,
                        p1: calc.addVectors(
                            center,
                            calc.scaleVector(z, length)
                        ),
                        r0,
                        r1,
                    },
                }
            )
        }
        const result = await this.brayns.exec("add-capsules", input)
        try {
            assertObject(result, "data")
            const { model_id: id } = result
            assertNumber(id, "data.model_id")
            await this.storage.store({ id, axis: axisList })
            return id
        } catch (ex) {
            console.error(
                `Invalid return type from "add-axisList" entrypoint!`,
                result
            )
            console.error(ex)
            throw ex
        }
    }
}
