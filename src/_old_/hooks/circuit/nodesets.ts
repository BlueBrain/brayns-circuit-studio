import { ensureBackendManagerInterface } from "@/_old_/contract/manager/backend"
import { LimitedCacheMap } from "@/_old_/tool/cache-map"
import { useServiceLocator } from "@/_old_/tool/locator"
import React from "react"

const cache = new LimitedCacheMap<string, string[]>(128)

/**
 *
 * @param circuitPath Full path to a SONATA file
 * @returns
 * - `undefined`: query in progress
 * - `null`: not found (or error)
 * - `string[]`: list of nodesets names.
 */
export function useCircuitNodesets(
    circuitPath: string
): string[] | undefined | null {
    const { backend } = useServiceLocator({
        backend: ensureBackendManagerInterface,
    })
    const [nodesets, setNodesets] = React.useState<string[] | undefined | null>(
        undefined
    )
    React.useEffect(() => {
        const action = async () => {
            setNodesets(undefined)
            try {
                const list = await cache.get(circuitPath, async () =>
                    backend.listNodeSets(circuitPath)
                )
                setNodesets(list)
            } catch (ex) {
                console.error(
                    `Unable to load NodeSets for circuit "${circuitPath}"!`,
                    ex
                )
                setNodesets(null)
            }
        }
        void action()
    }, [circuitPath])
    return nodesets
}
