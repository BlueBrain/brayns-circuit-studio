import * as React from "react"
import Styles from "./KeyFramesEditor.module.css"
import Button from "@/_old_/ui/view/button"
import KeyFrameItem from "../KeyFrameItem"
import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"
import { createKeyframeFromCurrentCamera } from "../utils"
import SceneManagerInterface from "@/_old_/contract/manager/scene/scene-manager"
import FloatingButton from "@/_old_/ui/view/floating-button"

export interface KeyFrame {
    duration: number
    target: Vector3
    distance: number
    orientation: Quaternion
    height: number
    snapshot: string
}

export interface KeyFramesEditorProps {
    className?: string
    keyframes: KeyFrame[]
    onChange(this: void, keyframes: KeyFrame[]): void
    scene: SceneManagerInterface
}

export default function ({
    className,
    keyframes,
    onChange,
    scene,
}: KeyFramesEditorProps) {
    const handleReset = () => {
        onChange([])
    }
    const handleAddKeyFrame = () => {
        onChange([...keyframes, createKeyframeFromCurrentCamera(scene)])
    }
    const insertKeyFrame = (index: number) => {
        const list = [...keyframes]
        list.splice(index, 0, createKeyframeFromCurrentCamera(scene))
        onChange(list)
    }
    const deleteKeyframe = (index: number) => {
        const list = [...keyframes]
        list.splice(index, 1)
        onChange(list)
    }
    const importKeyframe = (index: number) => {
        const list = [...keyframes]
        list[index] = createKeyframeFromCurrentCamera(scene)
        onChange(list)
    }
    const exportKeyframe = (index: number) => {
        const keyframe = keyframes[index]
        if (!keyframe) return

        scene.camera.updateParams(keyframe)
    }
    return (
        <div className={getClassName(className)}>
            {keyframes.map((keyframe, index) => (
                <>
                    <FloatingButton
                        title="Add new Key Frame"
                        icon="add"
                        onClick={() => insertKeyFrame(index)}
                    />
                    <KeyFrameItem
                        keyframe={keyframe}
                        onDelete={() => deleteKeyframe(index)}
                        onExport={() => exportKeyframe(index)}
                        onImport={() => importKeyframe(index)}
                    />
                    <FloatingButton
                        title="Add new Key Frame"
                        icon="add"
                        onClick={() => insertKeyFrame(index + 1)}
                    />
                </>
            ))}
            {keyframes.length === 0 && (
                <Button
                    label="Add new Key Frame"
                    icon="add"
                    wide={true}
                    onClick={handleAddKeyFrame}
                />
            )}
            {keyframes.length > 0 && (
                <Button
                    label="Delete all keyframes"
                    icon="delete"
                    accent={true}
                    wide={true}
                    onClick={handleReset}
                />
            )}
        </div>
    )
}

function getClassName(className?: string) {
    const classes = [Styles["KeyFramesEditor"]]
    if (className) classes.push(className)
    return classes.join(" ")
}
