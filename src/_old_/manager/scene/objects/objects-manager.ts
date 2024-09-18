import AxisListManager from "./axis/axis-manager"
import BoxesManager from "./boxes/boxes-manager"
import CalcInterface from "@/_old_/contract/tool/calc"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import PlanesManager from "./planes/planes-manager"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { SceneObjectsAxisManagerInterface } from "@/_old_/contract/manager/scene/scene-objects-axis"
import { SceneObjectsBoxesManagerInterface } from "@/_old_/contract/manager/scene/scene-objects-boxes"
import { SceneObjectsManagerInterface } from "@/_old_/contract/manager/scene/scene-objects"
import { SceneObjectsPlanesManagerInterface } from "@/_old_/contract/manager/scene/scene-objects-planes"

export default class ObjectsManager implements SceneObjectsManagerInterface {
    public readonly axis: SceneObjectsAxisManagerInterface
    public readonly boxes: SceneObjectsBoxesManagerInterface
    public readonly planes: SceneObjectsPlanesManagerInterface

    constructor(
        brayns: JsonRpcServiceInterface,
        calc: CalcInterface,
        sessionStorage: SessionStorageServiceInterface
    ) {
        this.axis = new AxisListManager(brayns, calc, sessionStorage)
        this.boxes = new BoxesManager(brayns, sessionStorage)
        this.planes = new PlanesManager(brayns, calc, sessionStorage)
    }

    async clear(): Promise<void> {
        try {
            await this.axis.clear()
            await this.boxes.clear()
            await this.planes.clear()
        } catch (ex) {
            console.warn("Error while deleting objects:", ex)
        }
    }
}
