import Toggle from "../toggle"
import Styles from "./morpho-togglers.module.css"

interface MorphoTogglersCircuit {
    showSoma: boolean
    showDendrites: boolean
    showAxon: boolean
}

export interface MorphoTogglersProps {
    className?: string
    circuit: MorphoTogglersCircuit
    onChange(this: void, circuit: MorphoTogglersCircuit): void
}

export default function MorphoTogglers({
    className,
    circuit,
    onChange,
}: MorphoTogglersProps) {
    const update = (value: Partial<MorphoTogglersCircuit>) => {
        const newCircuit: MorphoTogglersCircuit = { ...circuit, ...value }
        onChange(newCircuit)
    }
    return (
        <div className={[Styles.MorphoTogglers, className].join(" ")}>
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
    )
}
