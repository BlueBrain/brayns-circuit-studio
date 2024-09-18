export interface Snapshot {
    canvas: HTMLCanvasElement
    filename: string
}

export function ensureSnapshotFeatureInterface(
    data: unknown
): SnapshotFeatureInterface {
    if (data instanceof SnapshotFeatureInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type SnapshotFeatureInterface!")
}

export default abstract class SnapshotFeatureInterface {
    /**
     * Open a dialog box for the user to enter snapshot
     * name, dimension and quality.
     * Can return `null` if the user cancelled the operation.
     */
    abstract takeInteractiveSnapshot(): Promise<Snapshot[] | null>
}
