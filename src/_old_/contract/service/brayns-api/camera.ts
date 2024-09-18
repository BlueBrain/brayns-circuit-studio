import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"

export interface BraynsApiCamera {
    get(): Promise<BraynsApiCameraSettings>
    set(settings: BraynsApiCameraSettings): Promise<void>
}

export type BraynsApiCameraSettings =
    | CameraSettingsOrthographic
    | CameraSettingsPerspective

export type CameraSettings =
    | CameraSettingsOrthographic
    | CameraSettingsPerspective

interface CameraSettingsCommon {
    target: Vector3
    distance: number
    orientation: Quaternion
}

export interface CameraSettingsOrthographic extends CameraSettingsCommon {
    type: "orthographic"
    /** Camera orthographic projection height */
    height: number
}

export interface CameraSettingsPerspective extends CameraSettingsCommon {
    type: "perspective"
    /** Camera vertical field of view (in degrees) */
    fovy: number
}
