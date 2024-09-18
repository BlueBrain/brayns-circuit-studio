import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import { assertNumber, assertObject } from "@/_old_/tool/validator"
import { bubbleError } from "@/_old_/tool/error"
import BraynsApiClippingPlanesInterface, {
    BraynsClippingPlane,
} from "@/_old_/contract/service/brayns-api/clipping-planes"

export default class BraynsApiClippingPlanes
    implements BraynsApiClippingPlanesInterface
{
    constructor(private readonly brayns: JsonRpcServiceInterface) {}

    async add(clippingPlane: Omit<BraynsClippingPlane, "id">): Promise<number> {
        try {
            const data = exportBraynsClippingPlane({ id: 0, ...clippingPlane })
            const response = await this.brayns.exec("add-clip-plane", {
                coefficients: data.plane,
            })
            assertObject(response, "ClippingPlane")
            assertNumber(response.model_id, "ClippingPlane.model_id")
            return response.model_id
        } catch (ex) {
            bubbleError("Unable to add clipping plane!", ex)
        }
    }

    async update(...clippingPlanes: BraynsClippingPlane[]): Promise<void> {
        try {
            for (const clippingPlane of clippingPlanes) {
                // eslint-disable-next-line no-await-in-loop
                await this.brayns.exec("update-clip-plane", {
                    id: clippingPlane.id,
                    plane: exportBraynsClippingPlane(clippingPlane).plane,
                })
            }
        } catch (ex) {
            bubbleError("Unable to update clipping planes!", ex)
        }
    }

    async remove(planeId: number): Promise<void> {
        try {
            await this.brayns.exec("remove-clip-planes", { ids: [planeId] })
        } catch (ex) {
            bubbleError(`Unable to remove clipping plane ${planeId}!`, ex)
        }
    }

    async removeMany(planeIds: number[]): Promise<void> {
        try {
            await this.brayns.exec("remove-clip-planes", { ids: planeIds })
        } catch (ex) {
            bubbleError(
                `Unable to remove clipping planes ${JSON.stringify(planeIds)}!`,
                ex
            )
        }
    }

    async clear(): Promise<void> {
        try {
            await this.brayns.exec("clear-clip-planes")
        } catch (ex) {
            bubbleError("Unable to clear all clipping planes!", ex)
        }
    }
}

interface ExternalBraynsClippingPlane {
    id: number
    /**
     * A plan can be defined by a point and a normal.
     * The normal points to the hemi-space that must be discarded.
     */
    plane: [normalX: number, NormalY: number, normalZ: number, distance: number]
}

function exportBraynsClippingPlane(
    braynsClippingPlane: BraynsClippingPlane
): ExternalBraynsClippingPlane {
    return {
        id: braynsClippingPlane.id,
        plane: [...braynsClippingPlane.normal, braynsClippingPlane.distance],
    }
}
