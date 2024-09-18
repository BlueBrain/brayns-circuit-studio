export default abstract class NexusInterface {
    abstract loadMeshForRegion(regionId: number): Promise<string>
}

export function ensureNexusInterface(data: unknown): NexusInterface {
    if (data instanceof NexusInterface) return data

    console.error("Expected NexusInterface but got:", data)
    throw Error("Service is not of type NexusInterface!")
}
