import * as React from "react"
import ServiceLocatorInterface, {
    ServiceName,
} from "@/_old_/contract/service/locator"

export const ServiceLocatorContext =
    React.createContext<ServiceLocatorInterface | null>(null)

type Ensure<T> = (service: unknown) => T

export function useServiceLocator<
    T extends Partial<Record<ServiceName, unknown>>,
>(def: {
    [key in keyof T]: Ensure<T[key]>
}) {
    const locator = React.useContext(ServiceLocatorContext)
    if (!locator) {
        throw Error(
            `Context provider is missing!
Please use <ServiceLocatorContext.Provider value={...}> around the root component.`
        )
    }
    const services: { [key: string]: unknown } = {}
    for (const key of Object.keys(def)) {
        const ensure = def[key as keyof T]
        services[key] = locator.get(key as ServiceName, ensure)
    }
    return services as T
}

export default class ServiceLocator implements ServiceLocatorInterface {
    constructor(
        private readonly services: { [serviceName in ServiceName]: unknown }
    ) {}

    get<T>(serviceName: ServiceName, ensureType: (data: unknown) => T): T {
        const service = this.services[serviceName] ?? null
        try {
            if (service === null) {
                throw Error(`Service not found: "${serviceName}"!`)
            }

            try {
                return ensureType(service)
            } catch (ex) {
                const message =
                    ex instanceof Error ? ex.message : JSON.stringify(ex)
                console.error(
                    `Unexpected type for service "${serviceName}":`,
                    typeof service,
                    service
                )
                throw Error(
                    `Service "${serviceName}" is not of the expected type!\n${message}`
                )
            }
        } catch (ex) {
            const message =
                ex instanceof Error ? ex.message : JSON.stringify(ex)
            throw Error(
                `[ServiceLocator] ${message}\nAvailable services: ${Object.keys(
                    this.services
                )
                    .filter((name) => this.services[name])
                    .map((name) => `"${name}"`)
                    .join(", ")}`
            )
        }
    }
}
