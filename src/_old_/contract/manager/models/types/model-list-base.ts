import GenericEventInterface from "@/_old_/contract/tool/event"

export type ModelOptions<T extends { path: string }> = Partial<T> & {
    path: string
}

export abstract class ModelListBaseInterface<T extends { id: number }> {
    abstract readonly eventChange: GenericEventInterface<
        ModelListBaseInterface<T>
    >
    abstract useItems(): T[]
    abstract useIds(): number[]
    abstract getItems(): Promise<T[]>
    abstract getIds(): Promise<number[]>
    abstract get(id: number): Promise<T | undefined>
    abstract remove(...ids: number[]): Promise<void>
    abstract clear(): Promise<void>
}
