import CalcInterface, { Vector3 } from "@/_old_/contract/tool/calc"
import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import {
    assertNumber,
    assertObject,
    assertString,
    assertVector3,
} from "@/_old_/tool/validator"
import {
    BraynsApiCamera,
    BraynsApiCameraSettings,
} from "@/_old_/contract/service/brayns-api/camera"

export default class CameraModule implements BraynsApiCamera {
    constructor(
        private readonly brayns: JsonRpcServiceInterface,
        private readonly calc: CalcInterface
    ) {}

    async get(): Promise<BraynsApiCameraSettings> {
        const { calc, brayns } = this
        const type = await brayns.exec("get-camera-type")
        assertString(type, "get-camera-type()")
        const lookat = await brayns.exec("get-camera-view")
        assertCameraLookAt(lookat)
        const { position, target, up: cameraAxisY } = lookat
        const cameraAxisZ = calc.normalizeVector(
            calc.subVectors(position, target)
        )
        const cameraAxisX = calc.crossProduct(cameraAxisZ, cameraAxisY)
        const orientation = calc.getQuaternionFromAxis({
            x: cameraAxisX,
            y: cameraAxisY,
            z: cameraAxisZ,
        })
        const distance = calc.distance(target, position)
        switch (type) {
            case "orthographic":
                return {
                    type: "orthographic",
                    orientation,
                    distance,
                    target,
                    ...(await this.getOrthographicData()),
                }
            case "perspective":
                return {
                    type: "perspective",
                    orientation,
                    distance,
                    target,
                    ...(await this.getPerspectiveData()),
                }
            default:
                throw Error(`[get-camera-type] Unknown camera type: "${type}"!`)
        }
    }

    async set(settings: BraynsApiCameraSettings): Promise<void> {
        const { calc, brayns } = this
        const axis = calc.getAxisFromQuaternion(settings.orientation)
        const position = calc.addVectors(
            settings.target,
            calc.scaleVector(axis.z, settings.distance)
        )
        await brayns.exec("set-camera-view", {
            position,
            target: settings.target,
            up: axis.y,
        })
        switch (settings.type) {
            case "orthographic":
                await brayns.exec("set-camera-orthographic", {
                    height: settings.height,
                })
                break
            case "perspective":
                await brayns.exec("set-camera-perspective", {
                    fovy: settings.fovy,
                })
                break
            default:
                throw Error(
                    `Unknown camera type: "${JSON.stringify(settings)}"!`
                )
        }
    }

    private async getOrthographicData() {
        const orthographicData = await this.brayns.exec(
            "get-camera-orthographic"
        )
        assertOthographicData(orthographicData)
        return orthographicData
    }

    private async getPerspectiveData() {
        const orthographicData = await this.brayns.exec(
            "get-camera-perspective"
        )
        assertPerspectiveData(orthographicData)
        return orthographicData
    }
}

function assertCameraLookAt(data: unknown): asserts data is {
    position: Vector3
    target: Vector3
    up: Vector3
} {
    assertObject(data, "get-camera-lookat()")
    const { position, target, up } = data
    assertVector3(position, "get-camera-lookat().position")
    assertVector3(target, "get-camera-lookat().target")
    assertVector3(up, "get-camera-lookat().up")
}

function assertOthographicData(
    data: unknown
): asserts data is { height: number } {
    assertObject(data, "get-camera-orthographic()")
    const { height } = data
    assertNumber(height, "get-camera-orthographic().height")
}

function assertPerspectiveData(
    data: unknown
): asserts data is { fovy: number } {
    assertObject(data, "get-camera-perspective()")
    const { fovy } = data
    assertNumber(fovy, "get-camera-perspective().fovy")
}
