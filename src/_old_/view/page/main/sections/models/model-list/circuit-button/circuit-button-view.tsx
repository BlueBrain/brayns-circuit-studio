import {
    CircuitModel,
    CircuitModelReport,
} from "@/_old_/contract/manager/models"
import FloatingButton from "@/_old_/ui/view/floating-button"
import * as React from "react"

import "./circuit-button-view.css"

export interface CircuitButtonViewProps {
    className?: string
    circuit: CircuitModel
    onClick(this: void, circuit: CircuitModel): void
    onDelete(this: void, circuitId: number): void
    onVisibleChange(this: void, circuitId: number, visible: boolean): void
    onFocus(this: void, modelIds: number[]): void
}

export default function CircuitButtonView(props: CircuitButtonViewProps) {
    const { circuit, onClick, onDelete } = props
    return (
        <div className={getClassNames(props)}>
            <div className="label" title={circuit.path}>
                #{circuit.id} {circuit.name}
                {renderReportName(circuit.report)}
            </div>
            <FloatingButton
                icon={circuit.visible ? "show" : "hide"}
                small={true}
                theme={circuit.visible ? "light" : "dark"}
                onClick={() =>
                    props.onVisibleChange(circuit.id, !circuit.visible)
                }
            />
            <FloatingButton
                icon="focus"
                small={true}
                onClick={() => props.onFocus(circuit.modelIds)}
            />
            <FloatingButton
                icon="edit"
                small={true}
                onClick={() => onClick(circuit)}
            />
            <FloatingButton
                icon="delete"
                small
                accent
                onClick={() => onDelete(circuit.id)}
            />
        </div>
    )
}

function getClassNames(props: CircuitButtonViewProps): string {
    const classNames = [
        "custom",
        "view-page-models-CircuitButtonView",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function renderReportName(report?: CircuitModelReport): React.ReactNode {
    if (!report) return null

    switch (report.type) {
        case "spikes":
            return <span className="report spikes">Spikes</span>
        default:
            return <span className="report compartment">{report.name}</span>
    }
}
