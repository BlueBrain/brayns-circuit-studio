import {
    CircuitModelReport,
    CircuitModelSonata,
} from "@/_old_/contract/manager/models"
import InputFloat from "@/_old_/ui/view/input/float"
import InputColor from "@/_old_/ui/view/input/color"
import NodeSets from "./NodeSets"
import ReportSelect from "../../report-select"
import MorphoTogglers from "@/_old_/view/MorphoTogglers/MorphoTogglers"
import { EdgePopulations } from "./EdgePopulations"
import { ColorRGBA } from "@/_old_/contract/service/colors"
import Color from "@/_old_/ui/color"
import { isType } from "@/_old_/tool/validator"

import AstrocyteURL from "./gfx/astrocyte.webp"
import AxonURL from "./gfx/axon.webp"
import DendriteURL from "./gfx/dendrite.webp"
import SomaURL from "./gfx/soma.webp"
import VasculatureURL from "./gfx/vasculature.webp"

import Style from "./circuit-sonata-editor-view.module.css"

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
        <div
            className={`${Style.circuitSonataEditor} ${className ?? ""}`}
            style={{
                backgroundImage: `url(${figureOutBackgroundImage(circuit)})`,
            }}
        >
            <div className={Style.twoCols}>
                <label>Population:</label>
                <div>
                    <b title={circuit.population.type}>
                        {circuit.population.name}
                    </b>{" "}
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
                {circuit.population.type !== "vasculature" &&
                    circuit.report?.type === "spikes" && (
                        <>
                            <label>Spiking time (ms)</label>
                            <InputFloat
                                value={circuit.report.spikeTransitionTime}
                                min={0}
                                max={1000}
                                onChange={(spikeTransitionTime) => {
                                    const { report } = circuit
                                    if (!report) return

                                    update({
                                        report: {
                                            ...report,
                                            spikeTransitionTime,
                                        },
                                    })
                                }}
                            />
                        </>
                    )}
                <label>Color:</label>
                <InputColor
                    value={stringifyColor(getColor(circuit))}
                    onChange={(value) =>
                        update({
                            colors: {
                                method: "solid",
                                values: { color: parseColor(value) },
                            },
                        })
                    }
                />
            </div>
            <MorphoTogglers
                className={Style.spaceAround}
                circuit={circuit}
                onChange={update}
            />
            {circuit.afferent.length > 0 && (
                <EdgePopulations
                    value={circuit.afferent}
                    onChange={(afferent) =>
                        onChange({
                            ...circuit,
                            afferent,
                        })
                    }
                >
                    Afferent synapses (source)
                </EdgePopulations>
            )}
            {circuit.efferent.length > 0 && (
                <EdgePopulations
                    value={circuit.efferent}
                    onChange={(efferent) =>
                        onChange({
                            ...circuit,
                            efferent,
                        })
                    }
                >
                    Efferent synapses (target)
                </EdgePopulations>
            )}
        </div>
    )
}

function stringifyColor(rgba: ColorRGBA): string {
    const color = Color.fromRGBA(...rgba)
    return color.stringify()
}

function parseColor(value: string): ColorRGBA {
    const color = new Color(value)
    return color.toArrayRGBA()
}

function getColor(circuit: CircuitModelSonata): ColorRGBA {
    const { colors } = circuit
    if (
        isType<{ values: { color: ColorRGBA } }>(colors, {
            values: { color: ["array", "number"] },
        })
    ) {
        return colors.values.color
    }
    return [0.8, 0.8, 0.8, 1]
}

function figureOutBackgroundImage(circuit: CircuitModelSonata) {
    switch (circuit.population.type) {
        case "astrocyte":
            return AstrocyteURL
        case "vasculature":
            return VasculatureURL
        default:
            if (circuit.showAxon) return AxonURL
            if (circuit.showDendrites) return DendriteURL
            return SomaURL
    }
}
