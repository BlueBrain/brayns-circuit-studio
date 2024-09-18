import {
    CircuitModelReport,
    CircuitModelSonata,
} from "@/_old_/contract/manager/models"
import InputFloat from "@/_old_/ui/view/input/float"
import NodeSets from "./NodeSets"
import Toggle from "@/_old_/view/toggle"
import Style from "./circuit-sonata-editor-view.module.css"
import ReportSelect from "../../report-select"

export interface CircuitSonataEditorViewProps {
    className?: string
    reports: CircuitModelReport[]
    circuit: CircuitModelSonata
    onChange(value: CircuitModelSonata): void
}

export default function CircuitSonataEditorView({
    className,
    circuit,
    reports,
    onChange,
}: CircuitSonataEditorViewProps) {
    const update = (partial: Partial<CircuitModelSonata>) => {
        onChange({ ...circuit, ...partial })
    }
    return (
        <div className={`${Style.circuitSonataEditor} ${className ?? ""}`}>
            <div className={Style.twoCols}>
                <label>Population:</label>
                <div>
                    <b>{circuit.population.name}</b>{" "}
                    <em>({circuit.size} cells)</em>
                </div>
                <label>Node sets</label>
                <NodeSets
                    path={circuit.path}
                    value={circuit.nodeSets}
                    onChange={(nodeSets) => update({ nodeSets })}
                />
                <label>Density (%):</label>
                <InputFloat
                    value={circuit.density * 100}
                    min={0}
                    max={100}
                    onChange={(density) => update({ density: density / 100 })}
                />
                <label>Thickness (%):</label>
                <InputFloat
                    value={circuit.thickness * 100}
                    min={0}
                    max={1000}
                    onChange={(thickness) =>
                        update({ thickness: thickness / 100 })
                    }
                />
                <label>Report:</label>
                <ReportSelect
                    reports={reports}
                    value={circuit.report}
                    onChange={(report) => update({ report })}
                />
            </div>
            <div className={Style.toggles}>
                <Toggle
                    label="Soma"
                    value={circuit.showSoma}
                    onChange={(showSoma) => update({ showSoma })}
                />
                <Toggle
                    label="Dendrites"
                    value={circuit.showDendrites}
                    onChange={(showDendrites) => update({ showDendrites })}
                />
                <Toggle
                    label="Axon"
                    value={circuit.showAxon}
                    onChange={(showAxon) => update({ showAxon })}
                />
            </div>
        </div>
    )
}
