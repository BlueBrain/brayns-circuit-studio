import AbstractObjectManager from "../abstract-object"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { assertNumber, assertObject } from "@/_old_/tool/validator"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isSceneObjectsBox } from "./type-guard"
import {
    SceneObjectsBoxesManagerInterface,
    SceneObjectsBox,
    SceneObjectsBoxDefinition,
} from "@/_old_/contract/manager/scene/scene-objects-boxes"

export default class PlanesManager
    extends AbstractObjectManager<SceneObjectsBox, SceneObjectsBoxDefinition>
    implements SceneObjectsBoxesManagerInterface
{
    constructor(
        brayns: JsonRpcServiceInterface,
        storage: SessionStorageServiceInterface
    ) {
        super(
            brayns,
            storage,
            "scene/objects/boxes",
            inflexibleConverter(isSceneObjectsBox)
        )
    }

    async add(box: SceneObjectsBoxDefinition): Promise<number> {
        const result = await this.brayns.exec("add-boxes", [
            {
                color: box.color,
                geometry: {
                    min: [-0.5, -0.5, -0.5],
                    max: [+0.5, +0.5, +0.5],
                },
            },
        ])
        try {
            assertObject(result, "result")
            const { model_id: id } = result
            assertNumber(id, "result.model_id")
            await this.brayns.exec("update-model", {
                model_id: id,
                model: {
                    transform: {
                        rotation: box.orientation,
                        translation: box.center,
                        scale: [box.width, box.height, box.depth],
                    },
                },
            })
            await this.storage.store({ id, ...box })
            return id
        } catch (ex) {
            console.error(
                `Invalid return type from "add-boxes" entrypoint!`,
                result
            )
            console.error(ex)
            throw ex
        }
    }
}
