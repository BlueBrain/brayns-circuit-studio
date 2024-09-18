import * as React from "react"
import CameraModuleInterface from "@/_old_/contract/manager/camera"

export function useOrthographicCamera(
    camera: CameraModuleInterface
): [
    isOrthographicCamera: boolean,
    setOrthographicCamera: (value: boolean) => void,
] {
    const [orthoMode, setOrthoMode] = React.useState(
        camera.hasOrthographicProjection()
    )
    React.useEffect(() => {
        const handleCameraChange = () => {
            setOrthoMode(camera.hasOrthographicProjection())
        }
        camera.eventChange.add(handleCameraChange)
        return () => camera.eventChange.remove(handleCameraChange)
    }, [camera])
    return [
        orthoMode,
        (orthographicProjection: boolean) =>
            setCameraProjection(camera, orthographicProjection),
    ]
}

function setCameraProjection(
    camera: CameraModuleInterface,
    orthographicProjection: boolean
): void {
    const { params } = camera
    if (!orthographicProjection) {
        if (params.type === "perspective") return

        // Switch to Perspective projection.
        camera.params = {
            type: "perspective",
            distance: params.height,
            target: params.target,
            orientation: params.orientation,
            fovy: 45,
        }
    } else {
        if (params.type === "orthographic") return

        // Switch to Orthographic projection.
        camera.params = {
            type: "orthographic",
            distance: params.distance,
            target: params.target,
            orientation: params.orientation,
            height: params.distance,
        }
    }
}
