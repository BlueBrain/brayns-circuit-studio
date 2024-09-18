import React from "react"
import TargetsSelect from "@/_old_/view/targets-select"
import { useModal } from "@/_old_/ui/modal"
import Dialog from "@/_old_/ui/view/dialog"
import { useTargetList } from "./target-list"
import { isError } from "@/_old_/tool/validator"
import Runnable from "@/_old_/ui/view/runnable"

export function useTargetSelector(path: string) {
    const modal = useModal()
    const availableTargets = useTargetList(path)
    return React.useCallback(
        (targets: string[]) =>
            new Promise<string[]>((resolve) => {
                const hide = modal.show({
                    onClose() {
                        resolve(targets)
                    },
                    content: (
                        <Selector
                            availableTargets={availableTargets}
                            targets={targets}
                            onOK={(value) => {
                                hide()
                                resolve(value)
                            }}
                        />
                    ),
                })
            }),
        [modal, availableTargets]
    )
}

function Selector(props: {
    availableTargets: string[] | null | Error
    targets: string[]
    onOK: (targets: string[]) => void
}) {
    const [targets, setTargets] = React.useState(props.targets)
    if (isError(props.availableTargets)) {
        return (
            <Dialog title="Error while getting targets list">
                <pre
                    className="theme-color-error"
                    style={{
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {props.availableTargets.message}
                </pre>
            </Dialog>
        )
    }
    return (
        <Dialog
            title="Select targets"
            onOK={() => props.onOK(targets)}
            onCancel={() => props.onOK(props.targets)}
            valid={!!props.availableTargets}
        >
            <Runnable running={!props.availableTargets}>
                <TargetsSelect
                    availableTargets={props.availableTargets ?? []}
                    selectedTargets={targets}
                    onChange={setTargets}
                />
            </Runnable>
        </Dialog>
    )
}
