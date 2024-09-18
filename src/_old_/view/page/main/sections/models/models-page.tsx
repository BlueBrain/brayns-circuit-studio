import * as React from "react"
import CircuitDetails from "./circuit-details"
import ModelList from "./model-list"
import Wizard from "@/_old_/ui/view/wizard"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./models-page.css"
import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"

export interface ModelsPageProps {
    className?: string
    onLoadClick(this: void, title: string, extensions?: string[]): void
    onResetClick(this: void): void
    onFocus(this: void, modelIds: number[]): void
}

const STEP_CIRCUIT_DETAIL = "circuit-detail"

export default function ModelsPage(props: ModelsPageProps) {
    const { scene } = useServiceLocator({
        scene: ensureSceneManagerInterface,
    })
    const [currentCircuit, setCurrentCircuit] =
        React.useState<null | CircuitModel>(null)
    const [currentStep, setCurrentStep] = React.useState("models")
    const handleCircuitClick = (circuit: CircuitModel) => {
        setCurrentCircuit(circuit)
        setCurrentStep(STEP_CIRCUIT_DETAIL)
    }
    return (
        <Wizard className={getClassNames(props)} step={currentStep}>
            <ModelList
                key="models"
                scene={scene}
                onCircuitSelect={handleCircuitClick}
                onLoadClick={props.onLoadClick}
                onResetClick={props.onResetClick}
                onFocus={props.onFocus}
            />
            <CircuitDetails
                key={STEP_CIRCUIT_DETAIL}
                circuit={currentCircuit}
                onBack={() => setCurrentStep("models")}
            />
        </Wizard>
    )
}

function getClassNames(props: ModelsPageProps): string {
    const classNames = ["custom", "view-page-ModelsPage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
