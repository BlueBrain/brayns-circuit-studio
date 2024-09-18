import { useEffect } from "react"

/**
 * `effect` will be executed `delay` milliseconds after
 * `dependencies` items have change.
 */
export function useDebouncedEffect(
    effect: React.EffectCallback,
    dependencies: React.DependencyList,
    timeout: number
) {
    useEffect(() => {
        const id = window.setTimeout(effect, timeout)
        return () => window.clearTimeout(id)
    }, dependencies)
}
