import React from "react"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureCircuitInfoBbpManagerInterface } from "@/_old_/contract/manager/circuit-info-bbp"

export function useTargetList(path: string): null | string[] | Error {
    const [targets, setTargets] = React.useState<null | string[] | Error>(null)
    const { circuitInfoBbp } = useServiceLocator({
        circuitInfoBbp: ensureCircuitInfoBbpManagerInterface,
    })
    React.useEffect(() => {
        circuitInfoBbp.getTargets(path).then(setTargets).catch(setTargets)
    }, [path, circuitInfoBbp])
    return targets
}
