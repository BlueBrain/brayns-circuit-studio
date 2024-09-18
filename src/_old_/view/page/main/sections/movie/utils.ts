import { KeyFrame } from "./KeyFramesEditor"
import SceneManagerInterface from "@/_old_/contract/manager/scene/scene-manager"

export function createKeyframeFromCurrentCamera(
    scene: SceneManagerInterface
): KeyFrame {
    const { distance, orientation, target } = scene.camera.params
    const snapshot = scene.imageStream.takeLocalSnapshot({
        width: 200,
        height: 200,
    })
    return {
        duration: 1,
        distance,
        orientation,
        target,
        height: scene.camera.getHeightAtTarget(),
        snapshot: snapshot.toDataURL("image/jpeg", 0.7),
    }
}
