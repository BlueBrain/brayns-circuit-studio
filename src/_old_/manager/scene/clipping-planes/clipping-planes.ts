import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import CalcInterface, { Vector3 } from "@/_old_/contract/tool/calc"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { ClippingPlanesModuleInterface } from "@/_old_/contract/manager/scene"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isNumber, isObject, isVector3 } from "@/_old_/tool/validator"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

export interface ClippingPlane {
    id: number
    center: Vector3
    direction: Vector3
}

export default class ClippingPlanesModule
    implements ClippingPlanesModuleInterface
{
    private readonly storage: TableStorageInterface<ClippingPlane>

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        private readonly calc: CalcInterface,
        session: SessionStorageServiceInterface
    ) {
        this.storage = session.makeTable<ClippingPlane>(
            "clipping-planes",
            inflexibleConverter(isClippingPlane)
        )
    }

    useClippingPlanes(): ClippingPlane[] {
        return this.storage.useItems()
    }

    /**
     * Remove all existing clipping planes.
     */
    async clear(): Promise<void> {
        await this.brayns.clippingPlanes.clear()
        await this.storage.clear()
    }

    /**
     * Create a clipping plane and return its Id.
     * @params center - Any point of this plane.
     * @params direction -  Normal vector of this plane.
     */
    async add(center: Vector3, direction: Vector3): Promise<number> {
        const id = await this.brayns.clippingPlanes.add(
            this.calc.plane6to4(center, direction)
        )
        await this.storage.store({ id, center, direction })
        return id
    }
}

function isClippingPlane(data: unknown): data is ClippingPlane {
    if (!isObject(data)) return false

    const { id, center, direction } = data
    return isNumber(id) && isVector3(center) && isVector3(direction)
}
