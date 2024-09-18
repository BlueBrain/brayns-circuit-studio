import * as React from "react"
import { CircuitModelBbp } from "@/_old_/contract/manager/models"
import Style from "./bbp-params-view.module.css"
import Dialog from "@/_old_/ui/view/dialog"
import Runnable from "@/_old_/ui/view/runnable"
import { getBasename } from "@/_old_/tool/filename"
import InputText from "@/_old_/ui/view/input/text"
import InputFloat from "@/_old_/ui/view/input/float"
import Toggle from "@/_old_/view/toggle"
import { useReportList } from "./hooks/report-list"
import ReportSelect from "../report-select"
import TargetsSelect from "./targets-select"
import { useTargetSelector } from "./hooks/target-selector"

export interface BbpParamsViewProps {
    className?: string
    path: string
    onOK(this: void, params: CircuitModelBbp): void
    onCancel(this: void): void
}

const DEFAULT_CIRCUIT_MODEL: CircuitModelBbp = {
    boundingBox: { min: [-1, -1, -1], max: [+1, +1, +1] },
    cameraTarget: [0, 0, 0],
    colors: { method: "solid", values: { color: [1, 0.8, 0.6, 1] } },
    density: 1,
    gids: "",
    id: 0,
    modelIds: [],
    modelTypes: [],
    name: "",
    path: "",
    loader: {
        name: "",
        data: {},
    },
    showAfferentSynapses: false,
    showAxon: false,
    showDendrites: false,
    showEfferentSynapses: false,
    showSoma: false,
    targets: [],
    thickness: 1,
    type: "BBP loader",
    visible: true,
}

export default function BbpParamsView(props: BbpParamsViewProps) {
    const [circuit, setCircuit] = React.useState<CircuitModelBbp>({
        ...DEFAULT_CIRCUIT_MODEL,
        name: getBasename(props.path),
        path: props.path,
    })
    const targetSelector = useTargetSelector(props.path)
    const reports = useReportList(props.path)
    const update = (partial: Partial<CircuitModelBbp>) => {
        setCircuit({ ...circuit, ...partial })
    }
    const handleTargetSelectClick = () => {
        targetSelector(circuit.targets)
            .then((targets) => update({ targets }))
            .catch(console.error)
    }
    return (
        <Dialog
            className={getClassNames(props)}
            title="Load BBP file"
            accent={true}
            valid={circuit !== null}
            labelOK="Load"
            labelCancel="Cancel"
            onCancel={props.onCancel}
            onOK={() => {
                if (circuit) props.onOK(circuit)
            }}
        >
            <Runnable running={circuit === null}>
                <div className={Style.twoCols}>
                    <label>Name:</label>
                    <InputText
                        value={circuit.name}
                        onChange={(name) => update({ name })}
                    />
                    <label>Density (%):</label>
                    <InputFloat
                        value={circuit.density * 100}
                        min={0}
                        max={100}
                        onChange={(density) =>
                            update({ density: density / 100 })
                        }
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
                    <label>
                        Targets <em>({circuit.targets.length})</em>:
                    </label>
                    <TargetsSelect
                        targets={circuit.targets}
                        onClick={handleTargetSelectClick}
                    />
                    <label>GIDs:</label>
                    <InputText
                        value={circuit.gids}
                        onChange={(gids) => update({ gids })}
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
                    <Toggle
                        label="Afferent synapses"
                        value={circuit.showAfferentSynapses}
                        onChange={(showAfferentSynapses) =>
                            update({ showAfferentSynapses })
                        }
                    />
                    <Toggle
                        label="Efferent synapses"
                        value={circuit.showEfferentSynapses}
                        onChange={(showEfferentSynapses) =>
                            update({ showEfferentSynapses })
                        }
                    />
                </div>
            </Runnable>
        </Dialog>
    )
}

function getClassNames(props: BbpParamsViewProps): string {
    const classNames = [Style.bbpParams]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
