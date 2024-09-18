import FloatingButton from "@/_old_/ui/view/floating-button"
import { KeyFrame } from "../KeyFramesEditor"
import Styles from "./KeyFrameItem.module.css"

export interface KeyFrameItemProps {
    className?: string
    keyframe: KeyFrame
    onDelete(this: void): void
    onExport(this: void): void
    onImport(this: void): void
}

export default function ({
    className,
    keyframe,
    onDelete,
    onExport,
    onImport,
}: KeyFrameItemProps) {
    return (
        <div className={getClassName(className)}>
            <div
                className={Styles.snapshot}
                style={{
                    backgroundImage: `url(${keyframe.snapshot})`,
                }}
            ></div>
            <FloatingButton small={true} icon="arrow-left" onClick={onImport} />
            <FloatingButton
                small={true}
                icon="delete"
                accent={true}
                onClick={onDelete}
            />
            <FloatingButton
                small={true}
                icon="arrow-right"
                onClick={onExport}
            />
        </div>
    )
}

function getClassName(className?: string) {
    const classes = [Styles["KeyFrameItem"]]
    if (className) classes.push(className)
    return classes.join(" ")
}
