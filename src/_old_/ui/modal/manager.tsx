import JSON5 from "json5"
import { EMPTY_FUNCTION } from "@/_old_/constants"
import React from "react"
import Dialog from "../view/dialog"
import Style from "./manager.module.css"
import {
    ConfirmParams,
    InputParams,
    Modal,
    ModalManagerInterface,
    ModalParams,
} from "@/_old_/contract/manager/modal"
import GenericEvent from "@/_old_/tool/event"
import Spinner from "../view/spinner/spinner-view"
import { assertType } from "@/_old_/tool/validator"
import { isCircuitStudioError } from "@/_old_/hooks/error-handler"
import ErrorView from "@/_old_/view/ErrorView"

export default class ModalManager implements ModalManagerInterface {
    public modals: Modal[] = []
    public setModals: (modals: Modal[]) => void = EMPTY_FUNCTION

    show(params: ModalParams) {
        const modal: Modal = {
            align: "",
            padding: "1em",
            transitionDuration: 300,
            autoClosable: true,
            background: "var(--theme-color-screen-opacity-40)",
            onClose: EMPTY_FUNCTION,
            status: "new",
            ...params,
        }
        this.setModals([...this.modals, modal])
        return () => {
            modal.status = "closing"
            this.setModals(this.modals.filter((m) => m !== modal))
        }
    }

    async progress<T>(
        action: (setProgress: (node: React.ReactNode) => void) => Promise<T>
    ): Promise<T> {
        const event = new GenericEvent<React.ReactNode>()
        return this.wait(
            <Progress eventContentChange={event} />,
            action(event.trigger)
        )
    }

    async wait<T>(
        content: React.ReactNode,
        promise: Promise<T>,
        params?: Partial<
            Omit<Modal, "content"> & { progress?: GenericEvent<string> }
        >
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const hide = this.show({
                ...params,
                content: (
                    <div className={Style.wait}>
                        <Spinner label={content} event={params?.progress} />
                    </div>
                ),
            })
            promise
                .then((arg: T) => {
                    hide()
                    window.setTimeout(() => resolve(arg))
                })
                .catch((ex) => {
                    hide()
                    window.setTimeout(() => reject(ex))
                })
        })
    }

    async error(content: unknown, params?: Partial<Modal>): Promise<void> {
        return new Promise((resolve) => {
            const hide = this.show({
                ...params,
                onClose() {
                    if (params?.onClose) params.onClose()
                    hide()
                    resolve()
                },
                content: (
                    <Dialog
                        hideCancel={true}
                        labelOK="OK"
                        onOK={() => {
                            hide()
                            resolve()
                        }}
                    >
                        <div className={Style.error}>
                            <div>
                                {renderHumanFriendlyErrorContent(content)}
                            </div>
                        </div>
                    </Dialog>
                ),
            })
        })
    }

    async confirm(params: ConfirmParams): Promise<boolean> {
        return new Promise((resolve) => {
            const hide = this.show({
                ...params,
                onClose() {
                    if (params.onClose) params.onClose()
                    resolve(false)
                },
                content: (
                    <Dialog
                        onCancel={() => {
                            hide()
                            resolve(false)
                        }}
                        onOK={() => {
                            hide()
                            resolve(true)
                        }}
                        title={params.title}
                        accent={params.accent}
                        labelCancel={params.labelCancel ?? "Cancel"}
                        labelOK={
                            params.labelOK ??
                            (typeof params.content === "string"
                                ? params.content
                                : "OK")
                        }
                    >
                        {params.content}
                    </Dialog>
                ),
            })
        })
    }

    async input<T, G extends { value: T; onChange(value: T): void }>(
        params: InputParams<T, G>
    ): Promise<T> {
        const Input = params.content
        return new Promise((resolve) => {
            let value = params.props.value
            const props = {
                ...params.props,
                onChange: (newValue: T) => {
                    value = newValue
                },
            } as G
            const hide = this.show({
                onClose() {
                    resolve(params.props.value)
                },
                content: (
                    <Dialog
                        onCancel={() => {
                            hide()
                            resolve(params.props.value)
                        }}
                        onOK={() => {
                            hide()
                            resolve(value)
                        }}
                        title={params.title}
                    >
                        <Input {...props} />
                    </Dialog>
                ),
            })
        })
    }

    info(
        content: React.ReactNode,
        params?: Partial<Omit<Modal, "content">> | undefined
    ): Promise<void> {
        return new Promise((resolve) => {
            const hide = this.show({
                ...params,
                onClose() {
                    if (params?.onClose) params.onClose()
                    hide()
                    resolve()
                },
                content: (
                    <Dialog
                        hideCancel={true}
                        flat={true}
                        labelOK="Got it"
                        onOK={() => {
                            hide()
                            resolve()
                        }}
                    >
                        {content}
                    </Dialog>
                ),
            })
        })
    }
}

export function renderHumanFriendlyErrorContent(
    error: unknown
): React.ReactNode {
    if (isCircuitStudioError(error)) {
        return <ErrorView value={error} />
    }
    if (typeof error === "string")
        return <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
    if (error instanceof Error)
        return (
            <div>
                <div>{error.message}</div>
                <hr />
                {isErrorWithCauseMessage(error) && <b>{error.cause.message}</b>}
            </div>
        )
    if (typeof error === "object" && React.isValidElement(error)) return error
    return <pre>{JSON5.stringify(error, null, "  ")}</pre>
}

function Progress(props: {
    eventContentChange: GenericEvent<React.ReactNode>
}) {
    const [content, setContent] = React.useState<React.ReactNode>(null)
    React.useEffect(() => {
        props.eventContentChange.add(setContent)
        return () => props.eventContentChange.remove(setContent)
    }, [props.eventContentChange])
    return <div className="progress-container">{content}</div>
}

function isErrorWithCauseMessage(
    data: unknown
): data is { cause: { message: string } } {
    try {
        assertType(data, { cause: { message: "string" } })
        return true
    } catch (ex) {
        console.error(ex)
        return false
    }
}
