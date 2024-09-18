import React from "react"
import GenericEvent from "../../tool/event"

export type ModalParams = Partial<Modal> & { content: React.ReactNode }

export interface ConfirmParams extends ModalParams {
    /** If defined, it will be the header of the modal dialog box. */
    title?: string
    /** Default to `false`. If `true`, OK button will be accented (secondary color). */
    accent?: boolean
    /** Default to `title` or "OK" if undefined. */
    labelOK?: string
    /** Default to "Cancel". */
    labelCancel?: string
}

export interface InputParams<
    T,
    G extends { value: T; onChange(value: T): void },
> {
    /** If defined, it will be the header of the modal dialog box. */
    title?: string
    /**
     * A component that can edit a value.
     * For instance `InputText`.
     */
    content: (props: G) => React.ReactElement<G>
    /**
     * You can set the initial value like this:
     * ```
     * props: { value: "Bob" }
     * ```
     *
     * If you need more props for the content component,
     * add them in this object.
     */
    props: Omit<G, "onChange">
}

export interface ModalOptions {
    content: React.ReactNode
    align: "" | "L" | "R" | "T" | "B" | "BL" | "LB" | "BR" | "TL" | "LT" | "TR"
    padding: string | 0
    transitionDuration: number
    /**
     * By default the background is a semi-transparent black,
     * but you can put any valid CSS color in this attribute.
     */
    background: string
    /**
     * Default to `true`. If `true` the modal window can be closed by
     * clicking outside its frame or by pressing ESC on the keyboard.
     */
    autoClosable: boolean
    /**
     * This function is called when the modal window is closed by
     * the ESC key or by a click outside its frame.
     */
    onClose(this: void): void
}

export interface Modal extends ModalOptions {
    status: "new" | "open" | "closing" | "closed"
}

export interface ModalManagerInterface {
    /**
     * Show a new modal and return a function to hide it.
     */
    show(params: ModalParams): () => void

    progress<T>(
        action: (setProgress: (node: React.ReactNode) => void) => Promise<T>
    ): Promise<T>

    wait<T>(
        content: React.ReactNode,
        promise: Promise<T>,
        params?: Partial<
            Omit<Modal, "content"> & { progress?: GenericEvent<string> }
        >
    ): Promise<T>

    error(content: unknown, params?: Partial<Modal>): Promise<void>

    confirm(params: ConfirmParams): Promise<boolean>

    /**
     * Example:
     * ```
     * const name = await modal.input({
     *   content: InputText,
     *   props: {
     *     value: "Bob",
     *     label: "What's your name, pal?" }
     *   }
     * })
     * ```
     * @returns If __Cancel__ has been clicked, return `value`.
     */
    input<T, G extends { value: T; onChange(value: T): void }>(
        params: InputParams<T, G>
    ): Promise<T>

    info(
        content: React.ReactNode,
        params?: Partial<Omit<Modal, "content">>
    ): Promise<void>
}
