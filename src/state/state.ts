import AtomicState from "@tolokoban/react-state"
import { isNumber, isString } from "@tolokoban/type-guards"

export const State = {
    service: {
        host: new AtomicState<string | null>(null, {
            storage: {
                id: "service/host",
                guard: isString,
            },
        }),
        portBrayns: new AtomicState(5000, {
            storage: {
                id: "service/portBrayns",
                guard: isNumber,
            },
        }),
        portBackend: new AtomicState(8000, {
            storage: {
                id: "service/portBackend",
                guard: isNumber,
            },
        }),
    },
}
