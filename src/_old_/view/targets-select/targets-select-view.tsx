import * as React from "react"
import Chip from "@/_old_/ui/view/chip"
import TextInput from "@/_old_/ui/view/input/text"
import FilteredTargets from "./filtered-targets"
import "./targets-select-view.css"
import { isString } from "@/_old_/tool/validator"

export interface TargetsSelectViewProps {
    className?: string
    availableTargets: string[] | string
    selectedTargets: string[]
    onChange(this: void, selectedTargets: string[]): void
}

export default function TargetsSelectView(props: TargetsSelectViewProps) {
    const { availableTargets, selectedTargets, onChange } = props
    const [target, setTarget] = React.useState("")
    const handleRemoveTarget = makeRemoveTargetHandler(
        setTarget,
        onChange,
        selectedTargets
    )
    const handleAddTarget = makeAddTargetHandler(
        availableTargets,
        target,
        onChange,
        selectedTargets,
        setTarget
    )
    if (isString(availableTargets)) {
        return (
            <div className={getClassNames(props)}>
                <div className="theme-color-error">
                    <h1>Unable to load targets</h1>
                    <pre>{availableTargets}</pre>
                </div>
            </div>
        )
    }
    return renderTargetsSelectView(
        props,
        availableTargets,
        target,
        selectedTargets,
        onChange,
        setTarget,
        handleAddTarget,
        handleRemoveTarget
    )
}

function renderTargetsSelectView(
    props: TargetsSelectViewProps,
    availableTargets: string[],
    target: string,
    selectedTargets: string[],
    onChange: (this: void, newSelectedTargets: string[]) => void,
    setTarget: React.Dispatch<React.SetStateAction<string>>,
    handleAddTarget: () => void,
    handleRemoveTarget: (targetName: string) => void
) {
    return (
        <div className={getClassNames(props)}>
            <p>
                This circuit provides {availableTargets.length} target
                {availableTargets.length > 1 ? "s" : ""}.
            </p>
            <FilteredTargets
                filter={target}
                targets={availableTargets.filter(
                    (t) => !selectedTargets.includes(t)
                )}
                onClick={(newTargetName) => {
                    onChange([
                        newTargetName,
                        ...selectedTargets.filter((t) => t !== newTargetName),
                    ])
                }}
            />
            <TextInput
                label="Start typing to search a target by name:"
                wide={true}
                value={target}
                onChange={setTarget}
                onEnterPressed={handleAddTarget}
            />
            {renderSelection(selectedTargets, handleRemoveTarget)}
        </div>
    )
}

function makeRemoveTargetHandler(
    setTarget: React.Dispatch<React.SetStateAction<string>>,
    onChange: (this: void, newSelectedTargets: string[]) => void,
    selectedTargets: string[]
) {
    return (targetName: string) => {
        setTarget(targetName)
        onChange(selectedTargets.filter((t) => t !== targetName))
    }
}

function makeAddTargetHandler(
    availableTargets: string[] | string,
    target: string,
    onChange: (this: void, newSelectedTargets: string[]) => void,
    selectedTargets: string[],
    setTarget: React.Dispatch<React.SetStateAction<string>>
) {
    return () => {
        if (isString(availableTargets)) return

        const matchingTarget = availableTargets.find(
            (name) => name.toLowerCase() === target.toLowerCase()
        )
        if (!matchingTarget) return

        onChange([
            matchingTarget,
            ...selectedTargets.filter((t) => t !== matchingTarget),
        ])
        setTarget("")
    }
}

function renderSelection(
    selectedTargets: string[],
    handleRemoveTarget: (targetName: string) => void
) {
    return (
        <>
            <hr />
            {selectedTargets.length === 0 && (
                <p className="hint">
                    You have not selected any target filter yet: that means that
                    you want all the available cells.
                </p>
            )}
            {selectedTargets.length > 0 && (
                <p className="hint">
                    Only cells belonging to below target
                    {selectedTargets.length > 1 ? "s" : ""} will be loaded.
                </p>
            )}
            <div className="selection">
                {selectedTargets.map((targetName) => (
                    <Chip
                        color="primary-light"
                        label={targetName}
                        removable={true}
                        tag={targetName}
                        onClick={handleRemoveTarget}
                        onRemove={handleRemoveTarget}
                    />
                ))}
            </div>
            {selectedTargets.length > 0 && (
                <p className="hint">
                    Click a target to remove it from the list.
                </p>
            )}
        </>
    )
}

function getClassNames(props: TargetsSelectViewProps): string {
    const classNames = ["custom", "view-TargetsSelectView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
