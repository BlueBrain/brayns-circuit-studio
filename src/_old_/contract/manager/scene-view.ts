/**
 * Provides everything related to the 3D view of the current scene.
 * This is just the bare screen, without any gizmo, buttons, scalebars, etc.
 * Use `getView()` to get the actual React component.
 */
export default interface SceneViewManagerInterface {
    /**
     * @returns A canvas with the last image received from JsonRpc.
     */
    takeLocalSnapshot(): HTMLCanvasElement

    getView(): JSX.Element
}
