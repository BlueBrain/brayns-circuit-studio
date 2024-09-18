import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import Expand from "@/_old_/ui/view/expand"
import Button from "@/_old_/ui/view/button"
import FloatingButton from "@/_old_/ui/view/floating-button"
import CircuitColorEditor from "@/_old_/view/circuit-color-editor"

import "./circuit-details-view.css"

export interface CircuitDetailsViewProps {
    className?: string
    circuit: CircuitModel | null
    onBack(this: void): void
}

const GROUP = "CircuitDetailsView/Sections"

export default function CircuitDetailsView(props: CircuitDetailsViewProps) {
    const { circuit } = props
    if (!circuit) return null

    const braynsModelsIds = circuit.modelIds

    return (
        <div className={getClassNames(props)}>
            <header>
                <FloatingButton
                    icon="arrow-left"
                    small
                    onClick={props.onBack}
                />
                <h1>
                    {circuit.name}{" "}
                    <span className="ids">{braynsModelsIds.join(", ")}</span>
                </h1>
            </header>
            <main>
                <Expand label="Colors" group={GROUP}>
                    {braynsModelsIds.map((id) => (
                        <CircuitColorEditor key={id} circuit={circuit} />
                    ))}
                </Expand>
                <code onClick={() => console.log(circuit)}>{circuit.path}</code>
                <Button
                    label="Go back to the list of circuits"
                    wide
                    flat
                    icon="arrow-left"
                    onClick={props.onBack}
                />
            </main>
        </div>
    )
}

function getClassNames(props: CircuitDetailsViewProps): string {
    const classNames = ["custom", "view-page-models-CircuitDetailsView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
