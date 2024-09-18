import React from "react"
import { LongTask } from "@/_old_/contract/service/json-rpc"
import { useModal } from "@/_old_/ui/modal"
import ProgressView from "@/_old_/view/progress/progress-view"

/**
 * @returns Returns a function that will display a modal progress bar
 * with Cancel button.
 */
export function useCancellableTaskHandler() {
    const modal = useModal()
    return React.useCallback(
        (task: LongTask) => {
            const handleCancel = async () => {
                const confirm = await modal.confirm({
                    content: "Are you sure you want to cancel the loading?",
                    labelOK: "Yes, cancel it!",
                    labelCancel: "No, please proceed",
                    align: "T",
                })
                if (!confirm) return

                hide()
                task.cancel()
            }
            const hide = modal.show({
                autoClosable: false,
                content: (
                    <ProgressView
                        eventProgress={task.eventProgress}
                        onCancel={() => void handleCancel()}
                    />
                ),
            })
            task.promise.then(hide).catch(hide)
        },
        [modal]
    )
}
