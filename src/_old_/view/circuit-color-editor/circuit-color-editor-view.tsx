import * as React from "react"
import ColorByEType from "./color-by-etype"
import ColorByGID from "./color-by-gid"
import ColorByLayer from "./color-by-layer"
import ColorByMName from "./color-by-mname"
import ColorByMType from "./color-by-mtype"
import ColorBySection from "./color-by-section"
import ColorBySimulation from "./color-by-simulation"
import Combo from "@/_old_/ui/view/combo"
import Spinner from "@/_old_/ui/view/spinner"
import Stack from "@/_old_/ui/view/stack"
import "./circuit-color-editor-view.css"
import {
    CircuitColorManagerInterface,
    ensureColorManagerInterface,
} from "@/_old_/contract/manager/colors"
import { useServiceLocator } from "../../tool/locator"
import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import ErrorView from "../ErrorView"
import {
    CircuitStudioError,
    isCircuitStudioError,
} from "@/_old_/hooks/error-handler"

export interface CircuitColorEditorViewProps {
    className?: string
    circuit: CircuitModel
}

const NO_COLOR_SCHEME = "-"

interface Options {
    [NO_COLOR_SCHEME]: string
    simul?: string
    layer?: string
    etype?: string
    mtype?: string
    mname?: string
    section?: string
    gids?: string
}

const OPTIONS: Options = {
    [NO_COLOR_SCHEME]: "(select a color scheme)",
    simul: "Simulation Report",
    layer: "By layer",
    etype: "By electrical type",
    mtype: "By morphology type",
    mname: "By morphology name",
    section: "By section",
    gids: "By GIDs",
}

export default function CircuitColorEditorView(
    props: CircuitColorEditorViewProps
) {
    const { circuitColors, scene } = useServiceLocator({
        circuitColors: ensureColorManagerInterface,
        scene: ensureSceneManagerInterface,
    })
    const [circuitColorManager, setCircuitColorManager] =
        React.useState<null | CircuitColorManagerInterface>(null)
    const [colorScheme, setColorScheme] = React.useState(NO_COLOR_SCHEME)
    const [error, setError] = React.useState<CircuitStudioError | null>(null)
    React.useEffect(() => {
        setError(null)
        circuitColors
            .getCircuitColorManager(scene, props.circuit)
            .then(setCircuitColorManager)
            .catch((err) => {
                if (isCircuitStudioError(err)) setError(err)
                else if (typeof err === "string")
                    setError({
                        code: -1,
                        message: err,
                    })
                else if (err instanceof Error)
                    setError({
                        code: -1,
                        message: err.message,
                    })
                else
                    setError({
                        code: -1,
                        message: JSON.stringify(err, null, "  "),
                    })
            })
    }, [props.circuit])
    const options: Options = getAvailableOptions(circuitColorManager)
    if (error) {
        return <ErrorView value={error} />
    }
    return !circuitColorManager ? (
        <Spinner label="Loading color information" />
    ) : (
        <div className={getClassNames(props)}>
            <header>
                <Combo
                    wide={true}
                    label={`Color Scheme (#${props.circuit.id})`}
                    value={colorScheme}
                    onChange={setColorScheme}
                    options={castOptions(options)}
                />
            </header>
            <Stack value={colorScheme}>
                <div key={NO_COLOR_SCHEME}>
                    <p>
                        Please select a color scheme in the above combo and you
                        will be able to apply colors to this circuit.
                    </p>
                </div>
                <ColorBySimulation key="simul" manager={circuitColorManager} />
                <ColorByLayer key="layer" manager={circuitColorManager} />
                <ColorByEType key="etype" manager={circuitColorManager} />
                <ColorByMType key="mtype" manager={circuitColorManager} />
                <ColorByMName key="mname" manager={circuitColorManager} />
                <ColorBySection key="section" manager={circuitColorManager} />
                <ColorByGID key="gids" manager={circuitColorManager} />
            </Stack>
        </div>
    )
}

function getClassNames(props: CircuitColorEditorViewProps): string {
    const classNames = ["custom", "view-CircuitColorEditorView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function getAvailableOptions(
    circuitColor: CircuitColorManagerInterface | null
): Options {
    if (!circuitColor) return { [NO_COLOR_SCHEME]: OPTIONS[NO_COLOR_SCHEME] }

    const options = { ...OPTIONS }
    if (circuitColor.colorableLayers.length === 0) delete options.layer
    if (circuitColor.colorableElectricalTypes.length === 0) delete options.etype
    if (circuitColor.colorableMorphologyTypes.length === 0) delete options.mtype
    if (circuitColor.colorableMorphologyNames.length === 0) delete options.mname
    if (circuitColor.colorableMorphologySections.length === 0)
        delete options.section
    if (!circuitColor.canApplyColorFromSimulation) delete options.simul
    return options
}

/**
 * Use this function to cast Options into a combo.
 */
function castOptions(options: Options): { [key: string]: string } {
    return options as unknown as { [key: string]: string }
}
