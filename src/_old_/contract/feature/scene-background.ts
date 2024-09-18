import { ModalManagerInterface } from "../manager/modal"

export default interface SceneBackgroundFeatureInterface {
    /**
     * Open a dialog box for the user to edit the background color.
     */
    changeBackgroundColor(modal: ModalManagerInterface): Promise<void>
}
