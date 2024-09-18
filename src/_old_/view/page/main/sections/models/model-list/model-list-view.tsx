import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import SceneManagerInterface from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureFunction } from "@/_old_/tool/validator"
import Button from "@/_old_/ui/view/button"
import Icon from "@/_old_/ui/view/icon"
import Details from "@/_old_/view/details"
import CellPlacementButton from "./cell-placement-button"
import CircuitButton from "./circuit-button"
import { MeshListView } from "./details/mesh"
import { VolumeListView } from "./details/volume"
import { useCellPlacementHandlers } from "./hooks/cell-placement"
import { useMorphologyHandlers } from "./hooks/morphology"
import MorphologyButton from "./morphology-button"

import { useModal } from "@/_old_/ui/modal"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { CircuitListInterface } from "@/_old_/contract/manager/models/types/circuit-list"

import "./model-list-view.css"

export interface ModelsListViewProps {
    className?: string
    scene: SceneManagerInterface
    onCircuitSelect(this: void, circuit: CircuitModel): void
    onFocus(this: void, modelIds: number[]): void
    onLoadClick(this: void, title: string, extensions?: string[]): void
    onResetClick(this: void): void
}

export default function ModelsListView(props: ModelsListViewProps) {
    const { refresh } = useServiceLocator({ refresh: ensureFunction })
    const modal = useModal()
    const cellPlacementList = props.scene.models.cellPlacement
    const circuitList = props.scene.models.circuit
    const meshList = props.scene.models.mesh
    const morphologyList = props.scene.models.morphology
    const volumeList = props.scene.models.volume
    const cellPlacements = cellPlacementList.useItems()
    const circuits = circuitList.useItems()
    const meshes = meshList.useItems()
    const morphologies = props.scene.models.morphology.useItems()
    const volumes = volumeList.useItems()
    const {
        handleMorphologyColorClick,
        handleMorphologyDeleteClick,
        handleMorphologyVisibleClick,
    } = useMorphologyHandlers(morphologyList, refresh)
    const {
        handleCellPlacementRename,
        handleCellPlacementVisible,
        handleCellPlacementDelete,
    } = useCellPlacementHandlers(cellPlacementList, refresh)
    const { handleCircuitVisibleChange, handleCircuitDelete } =
        useCircuitHandlers(circuitList, refresh, modal)
    const modelsCount = circuits.length + meshes.length + morphologies.length
    return (
        <div className={getClassNames(props)}>
            {modelsCount === 0 && (
                <div className="hint">
                    <p>Your workspace is empty.</p>
                    <p>
                        Please use one of the below buttons to load a circuit, a
                        mesh, a morphology, a volume...
                    </p>
                    <div
                        style={{
                            width: "100%",
                            textAlign: "right",
                            paddingRight: ".75em",
                        }}
                    >
                        <Icon name="arrow-down" className="icon" />
                    </div>
                </div>
            )}
            <Details
                label="Circuits & Simulations"
                count={circuits.length}
                onImportClick={() =>
                    props.onLoadClick("Circuits & Simulations", [
                        ".json",
                        "BlueConfig",
                        "CircuitConfig",
                    ])
                }
            >
                {circuits.map((circuit) => (
                    <CircuitButton
                        key={circuit.id}
                        circuit={circuit}
                        onClick={props.onCircuitSelect}
                        onVisibleChange={handleCircuitVisibleChange}
                        onDelete={(modelIds) =>
                            void handleCircuitDelete(modelIds)
                        }
                        onFocus={(modelIds) => props.onFocus(modelIds)}
                    />
                ))}
                {circuits.length === 0 && (
                    <div className="hint">No circuit has been loaded yet.</div>
                )}
            </Details>
            <Details
                label="Cell Placement"
                count={cellPlacements.length}
                onImportClick={() =>
                    props.onLoadClick("Cell Placement", [
                        "circuit.morphologies.h5",
                    ])
                }
            >
                {cellPlacements.map((cellPlacement) => (
                    <CellPlacementButton
                        key={cellPlacement.id}
                        cellPlacement={cellPlacement}
                        onFocus={(modelIds) => props.onFocus(modelIds)}
                        onRename={handleCellPlacementRename}
                        onShow={() =>
                            handleCellPlacementVisible(cellPlacement, true)
                        }
                        onHide={() =>
                            handleCellPlacementVisible(cellPlacement, false)
                        }
                        onDelete={handleCellPlacementDelete}
                    />
                ))}
                {cellPlacements.length === 0 && (
                    <div className="hint">
                        No cell placement has been loaded yet.
                    </div>
                )}
            </Details>
            <MeshListView meshes={meshes} onLoadClick={props.onLoadClick} />{" "}
            <Details
                label="Morphologies"
                count={morphologies.length}
                onImportClick={() =>
                    props.onLoadClick("Morphology", [".h5", ".asc", ".swc"])
                }
            >
                {morphologies.map((morphology) => (
                    <MorphologyButton
                        key={morphology.id}
                        morphology={morphology}
                        onDelete={handleMorphologyDeleteClick}
                        onColorClick={handleMorphologyColorClick}
                        onVisibleClick={handleMorphologyVisibleClick}
                        onNameChange={() => {
                            console.log("NameChange")
                        }}
                        onFocus={(model) => props.onFocus(model.modelIds)}
                    />
                ))}
                {morphologies.length === 0 && (
                    <div className="hint">
                        No morphology has been loaded yet.
                    </div>
                )}
            </Details>
            <VolumeListView volumes={volumes} onLoadClick={props.onLoadClick} />{" "}
            <div className="hint">
                <hr />
                <p>
                    You can get help by pressing <code>F1</code>, or by clicking
                    the help icon <Icon name="help" className="inline-icon" />{" "}
                    in the header.
                </p>
                <hr />
            </div>
            {modelsCount > 0 && (
                <footer>
                    <ResetButton onResetClick={props.onResetClick} />
                </footer>
            )}
        </div>
    )
}

function useCircuitHandlers(
    circuitList: CircuitListInterface,
    refresh: () => void,
    modal: ModalManagerInterface
) {
    const handleCircuitVisibleChange = (
        circuitId: number,
        visible: boolean
    ) => {
        circuitList
            .updateVisible(circuitId, visible)
            .then(refresh)
            .catch(console.error)
    }
    const handleCircuitDelete = async (circuitId: number) => {
        const circuit = await circuitList.get(circuitId)
        if (!circuit) return

        const confirm = await modal.confirm({
            title: "Remove a Circuit",
            content: (
                <div style={{ maxWidth: "480px" }}>
                    <p>You are about to remove this circuit!</p>
                    <p>
                        <b>
                            #{circuit.id} - ${circuit.name}
                        </b>
                    </p>
                    <hr />
                    <ul>
                        <li>
                            <b>Path</b>: {circuit.path}
                        </li>
                        {circuit.report && (
                            <li>
                                <b>Report</b>: {circuit.report.name}
                            </li>
                        )}
                    </ul>
                </div>
            ),
        })
        if (!confirm) return

        await circuitList.remove(circuitId)
        refresh
    }
    return { handleCircuitVisibleChange, handleCircuitDelete }
}

function getClassNames(props: ModelsListViewProps): string {
    const classNames = ["custom", "view-page-models-ModelsListView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function ResetButton(props: { onResetClick(this: void): void }) {
    return (
        <Button
            wide={true}
            accent={true}
            icon="delete"
            label="Reset Everything"
            onClick={props.onResetClick}
        />
    )
}
