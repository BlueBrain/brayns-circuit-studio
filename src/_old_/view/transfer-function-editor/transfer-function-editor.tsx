import InputFloat from "@/_old_/ui/view/input/float"
import React from "react"
import { ensureSceneManagerInterface } from "../../contract/manager/scene"
import { ColorrampDefinition } from "../../contract/manager/scene/scene-colorramp"
import { useServiceLocator } from "../../tool/locator"
import { useModal } from "../../ui/modal"
import Button from "../../ui/view/button"
import Spinner from "../../ui/view/spinner"
import Styles from "./transfer-function-editor.module.css"

export interface TransferFunctionEditorProps {
    className?: string
    modelId: number
}

export default function TransferFunctionEditor({
    modelId,
    className,
}: TransferFunctionEditorProps) {
    const modal = useModal()
    const { scene } = useServiceLocator({ scene: ensureSceneManagerInterface })
    const [currentState, setCurrentState] = React.useState("")
    const [transferFunction, setTransferFunction] =
        React.useState<null | ColorrampDefinition>(null)
    React.useEffect(() => {
        scene.colorramp
            .get(modelId)
            .then((value) => {
                console.log("🚀 [transfer-function-editor] value = ", value) // @FIXME: Remove this line written on 2024-06-05 at 16:28
                setCurrentState(JSON.stringify(value))
                setTransferFunction(value)
            })
            .catch(console.error)
    }, [scene, modelId])
    if (!transferFunction) return <Spinner label="Loading color ramp..." />

    const handleUpdateClick = async () => {
        await modal.wait(
            "Updating color ramp...",
            scene.colorramp.set(modelId, transferFunction)
        )
        void scene.imageStream.askForNextFrame()
    }
    const [min, max] = transferFunction.range
    return (
        <div className={getClassName(className)}>
            <div className="range">
                <InputFloat
                    label="Min"
                    value={min}
                    max={max}
                    onChange={(value) =>
                        setTransferFunction({
                            ...transferFunction,
                            range: [value, max],
                        })
                    }
                />
                <InputFloat
                    label="Max"
                    value={max}
                    min={min}
                    onChange={(value) =>
                        setTransferFunction({
                            ...transferFunction,
                            range: [min, value],
                        })
                    }
                />
            </div>
            <Button
                label="Update color ramp"
                accent={true}
                enabled={currentState !== JSON.stringify(transferFunction)}
                onClick={() => void handleUpdateClick()}
            />
        </div>
    )
}

function getClassName(className: string | undefined): string | undefined {
    const classes = [Styles.TransferFunction]
    if (className) classes.push(className)
    return classes.join(" ")
}
