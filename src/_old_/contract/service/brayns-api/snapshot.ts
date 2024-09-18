import { BraynsApiCameraSettings } from "./camera"
import {
    OrthographicProjection,
    PerspectiveProjection,
} from "@/_old_/contract/manager/scene"
import { ModalManagerInterface } from "../../manager/modal"

export enum BraynsSnapshotQualityEnum {
    Low = 0,
    Medium = 1,
    High = 2,
}

export interface BraynsSnapshotInput {
    quality: BraynsSnapshotQualityEnum
    /** If transparent, render a PNG, otherwise render a JPEG */
    transparent: boolean
    size: [width: number, height: number]
    /** If undef, the current camera will be used */
    camera?: BraynsApiCameraSettings
    projection?: OrthographicProjection | PerspectiveProjection
}

export default interface SnapshotModuleInterface {
    takeImage(params: BraynsSnapshotInput): Promise<HTMLImageElement>
    /**
     * Take a snapshot that you can cancel programmatically
     * by calling the return `cancel()` function.
     */
    takeCancellableImage(params: BraynsSnapshotInput): Promise<{
        cancel: () => void
        promisedImage: Promise<HTMLImageElement | null>
    }>
    /**
     * Take a snapshot with a progress bar displayed.
     * the user can cancel it.
     */
    takeImageWithCancelOption(
        params: BraynsSnapshotInput,
        modal: ModalManagerInterface
    ): Promise<HTMLImageElement | null>
}
