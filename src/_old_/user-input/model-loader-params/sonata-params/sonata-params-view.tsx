import * as React from "react"

import { clamp } from "@/_old_/constants"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { CircuitModelSonata, SonataEdge } from "@/_old_/contract/manager/models"
import SonataInfoServiceInterface, {
    Edge,
    Population,
    Report,
    ensureSonataInfoServiceInterface,
} from "@/_old_/contract/service/sonata-info"
import { useErrorHandler } from "@/_old_/hooks/error-handler"
import { useServiceLocator } from "@/_old_/tool/locator"
import { useModal } from "@/_old_/ui/modal"
import Checkbox from "@/_old_/ui/view/checkbox"
import Dialog from "@/_old_/ui/view/dialog"
import Label from "@/_old_/ui/view/label"
import Runnable from "@/_old_/ui/view/runnable"
import Spinner from "@/_old_/ui/view/spinner"
import ErrorView from "@/_old_/view/ErrorView"
import CircuitSonataEditor from "./circuit-sonata-editor/circuit-sonata-editor-view"
import { makeReportFromSonata } from "./make-report"

import Styles from "./sonata-params-view.module.css"

export interface SonataParamsViewProps {
    className?: string
    path: string
    nodesets: string[]
    onOK(this: void, circuits: CircuitModelSonata[]): void
    onCancel(this: void): void
}

export default function SonataParamsView(props: SonataParamsViewProps) {
    const modal = useModal()
    const [error, setError] = useErrorHandler()
    const { sonataInfoService } = useServiceLocator({
        sonataInfoService: ensureSonataInfoServiceInterface,
    })
    const [circuits, setCircuits] = React.useState<null | CircuitModelSonata[]>(
        null
    )
    const [selectedPopulations, setSelectedPopulations] = React.useState<
        boolean[]
    >([])
    useAsyncSonataInfo(
        sonataInfoService,
        props,
        modal,
        setCircuits,
        setSelectedPopulations,
        setError
    )
    const update = (value: CircuitModelSonata, index: number) => {
        if (!circuits) return

        circuits[index] = {
            ...circuits[index],
            ...value,
        }
        setCircuits([...circuits])
    }
    if (error) {
        return (
            <Dialog
                className={props.className}
                title="Load SONATA file"
                accent
                labelOK="Close"
                hideCancel
                onOK={() => props.onCancel()}
            >
                <ErrorView value={error} />
            </Dialog>
        )
    }
    return (
        <Runnable running={circuits === null}>
            <Dialog
                className={props.className}
                title="Load SONATA file"
                accent
                labelOK="Load"
                labelCancel="Cancel"
                valid={Boolean(
                    (circuits ?? []).find(
                        (_, index) => selectedPopulations[index] === true
                    )
                )}
                onCancel={props.onCancel}
                onOK={() => {
                    if (circuits)
                        props.onOK(
                            circuits.filter(
                                (_circuit, index) =>
                                    selectedPopulations[index] === true
                            )
                        )
                }}
            >
                <div className={Styles.sonataParams}>
                    {circuits && (
                        <>
                            {circuits.length > 1 && (
                                <>
                                    <Label value="What population do you want to load?" />
                                    <div>
                                        {circuits.map((circuit, index) => (
                                            <PopulationCheckbox
                                                key={circuit.name}
                                                circuit={circuit}
                                                value={
                                                    selectedPopulations[index]
                                                }
                                                onChange={(value) => {
                                                    const list = [
                                                        ...selectedPopulations,
                                                    ]
                                                    list[index] = value
                                                    setSelectedPopulations(list)
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <hr />
                                </>
                            )}
                            {circuits.map((circuit, index) => (
                                <>
                                    {selectedPopulations[index] ? (
                                        <>
                                            {index > 0 && (
                                                <hr
                                                    key={`hr/${circuit.name}-${index}`}
                                                />
                                            )}
                                            <CircuitSonataEditor
                                                key={`${circuit.name}-${index}`}
                                                reports={circuit.reports}
                                                circuit={circuit}
                                                onChange={(value) =>
                                                    update(value, index)
                                                }
                                            />
                                        </>
                                    ) : (
                                        <PopulationCheckbox
                                            key={circuit.name}
                                            circuit={circuit}
                                            value={selectedPopulations[index]}
                                            onChange={(value) => {
                                                const list = [
                                                    ...selectedPopulations,
                                                ]
                                                list[index] = value
                                                setSelectedPopulations(list)
                                            }}
                                        />
                                    )}
                                </>
                            ))}
                        </>
                    )}
                    {!circuits && <Spinner label="Still loading..." />}
                </div>
            </Dialog>
        </Runnable>
    )
}

function useAsyncSonataInfo(
    sonataInfoService: SonataInfoServiceInterface,
    props: SonataParamsViewProps,
    modal: ModalManagerInterface,
    setCircuits: React.Dispatch<
        React.SetStateAction<CircuitModelSonata[] | null>
    >,
    setSelectedPopulations: React.Dispatch<React.SetStateAction<boolean[]>>,
    setError: (value: unknown) => void
) {
    React.useEffect(() => {
        sonataInfoService
            .getInfo(props.path)
            .then((info) => {
                if (info.populations.length === 0) {
                    modal
                        .error(
                            <div>
                                This file has no population!
                                <hr />
                                <code>{props.path}</code>
                            </div>
                        )
                        .then(props.onCancel)
                        .catch(console.error)
                }
                const list = info.populations.map((population) =>
                    makeCircuitFromPopulation(
                        props.path,
                        population,
                        info.reports,
                        info.edges,
                        props.nodesets
                    )
                )
                setCircuits(list)
                // By default we select all the populations.
                setSelectedPopulations(list.map(() => true))
            })
            .catch(setError)
    }, [])
}

function PopulationCheckbox({
    circuit,
    value,
    onChange,
}: {
    circuit: CircuitModelSonata
    value: boolean
    onChange(value: boolean): void
}) {
    return (
        <Checkbox
            label={`${circuit.name} (${circuit.size} cells)`}
            wide={true}
            value={value}
            onChange={onChange}
        />
    )
}

function makeCircuitFromPopulation(
    path: string,
    population: Population,
    allReports: Report[],
    edges: Edge[],
    nodeSets: string[]
): CircuitModelSonata {
    const reports = filterReports(allReports, population)
    const circuit: CircuitModelSonata = {
        type: "SONATA loader",
        id: 0,
        path,
        loader: {
            name: "SONATA loader",
            data: {},
        },
        name: population.name,
        population,
        nodeSets,
        boundingBox: { min: [-1, -1, -1], max: [+1, +1, +1] },
        cameraTarget: [0, 0, 0],
        colors: { method: "solid", values: { color: [1, 0.8, 0.6, 1] } },
        density: 1,
        thickness: 1,
        modelIds: [],
        modelTypes: [],
        showAxon: false,
        showDendrites: false,
        showSoma: false,
        visible: true,
        size: population.size,
        report:
            reports.length > 0 ? makeReportFromSonata(reports[0]) : undefined,
        reports: reports.map(makeReportFromSonata),
        afferent: filterEdgePopulations(population.name, edges, "source"),
        efferent: filterEdgePopulations(population.name, edges, "target"),
    }
    switch (population.type) {
        case "vasculature":
            circuit.colors = {
                method: "solid",
                values: { color: [0.9, 0.1, 0.1, 1] },
            }
            circuit.thickness = 1
            circuit.showAxon = false
            circuit.showDendrites = false
            circuit.showSoma = false
            break
        case "astrocyte":
            circuit.colors = {
                method: "solid",
                values: { color: [0.1, 0.6, 0.9, 1] },
            }
            break
    }
    return circuit
}

function filterEdgePopulations(
    populationName: string,
    edges: Edge[],
    att: "source" | "target"
): SonataEdge[] {
    return edges
        .filter((edge) => edge[att] === populationName)
        .map((edge) => {
            const result: SonataEdge = {
                ...edge,
                density: clamp(Math.round(1e11 / edge.size), 1, 100000) * 1e-3,
                radius: 100,
                enabled: false,
            }
            return result
        })
}

function filterReports(
    reports: Report[],
    population: { type: string; name: string }
): Report[] {
    return reports.filter((report) => {
        if (population.type === "vasculature") {
            return report.type.startsWith("bloodflow")
        } else {
            return !report.type.startsWith("bloodflow")
        }
    })
}
