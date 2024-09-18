export default abstract class SonataInfoServiceInterface {
    /**
     * @param path Full path to a SONATA file.
     */
    abstract getInfo(path: string): Promise<{
        populations: Population[]
        reports: Report[]
        edges: Edge[]
    }>
}

export interface Population {
    name: string
    type: string
    size: number
}

export interface Report {
    name: string
    type: string
    start: number
    end: number
    delta: number
    unit: string
    cells: string
}

export interface Edge {
    name: string
    size: number
    source: string
    target: string
}

export function ensureSonataInfoServiceInterface(
    data: unknown
): SonataInfoServiceInterface {
    if (data instanceof SonataInfoServiceInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type SonataInfoServiceInterface!")
}
