import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button"
import InputText from "@/_old_/ui/view/input/text"
import Label from "@/_old_/ui/view/label"
import Chip from "@/_old_/ui/view/chip"
import Styles from "./NodeSets.module.css"
import { useCircuitNodesets } from "@/_old_/hooks/circuit/nodesets"
import Spinner from "@/_old_/ui/view/spinner"

export interface NodeSetsProps {
    className?: string
    /** Circuit path. */
    path: string
    value: string[]
    onChange(value: string[]): void
}

export default function ({ className, path, value, onChange }: NodeSetsProps) {
    const nodesets = useCircuitNodesets(path)
    console.log("🚀 [NodeSets] nodesets = ", nodesets) // @FIXME: Remove this line written on 2023-10-10 at 16:46
    const modal = useModal()
    const handleAddClick = async () => {
        const name: string = await modal.input({
            content: InputText,
            props: {
                value: "",
                label: "Node set name",
                autoFocus: true,
                suggestions: nodesets ?? [],
            },
        })
        const cleanName = name.trim()
        if (cleanName.length === 0 || value.includes(cleanName)) return

        onChange([...value, cleanName])
    }
    if (Array.isArray(nodesets) && nodesets.length === 0) {
        return (
            <div style={{ color: "var(--theme-color-error)" }}>
                This circuit has no NodeSet!
            </div>
        )
    }
    return (
        <div className={getClassName(className)}>
            {typeof nodesets === "undefined" ? (
                <Spinner label="Loading..." />
            ) : (
                <>
                    {value.length === 0 && (
                        <Label value="None selected yet..." />
                    )}
                    {value.map((name) => (
                        <Chip
                            label={name}
                            key={name}
                            removable={true}
                            onRemove={() => {
                                if (!value.includes(name)) return

                                onChange(value.filter((item) => item !== name))
                            }}
                        />
                    ))}
                    <Button
                        label="Add"
                        icon="add"
                        flat={true}
                        onClick={() => void handleAddClick()}
                    />
                </>
            )}
        </div>
    )
}

function getClassName(className?: string) {
    const classes = [Styles["NodeSets"]]
    if (className) classes.push(className)
    return classes.join(" ")
}
