import * as React from "react"
import { TableStorageInterface } from "@/_old_/contract/storage/table"

/**
 * Check a TableStorage for any change and retrigger the renderer is any.
 */
export function useTableStorage<T extends { id: number }>(
    tableStorage: TableStorageInterface<T>
) {
    const [updatesCounter, setUpdatesCounter] = React.useState(0)
    React.useEffect(() => {
        const incrementUpdatesCounter = () =>
            setUpdatesCounter(updatesCounter + 1)
        tableStorage.eventChange.add(incrementUpdatesCounter)
        return () => tableStorage.eventChange.remove(incrementUpdatesCounter)
    }, [tableStorage, updatesCounter])
    return tableStorage
}
