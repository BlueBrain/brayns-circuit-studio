import RemoteCommandInterface from "@/_old_/contract/manager/remote-command"
import { isObject, isString } from "@/_old_/tool/validator"

export default class RemoteCommand extends RemoteCommandInterface {
    private readonly methods = new Map<
        string,
        (params?: unknown) => Promise<unknown>
    >()

    constructor(private readonly prefix = "BCS") {
        super()
        window.addEventListener("message", this.handleMessage, false)
    }

    triggerEvent(name: string, data?: unknown): void {
        this.send({
            type: `${this.prefix}-Event`,
            name,
            data,
        })
    }

    registerMethod(
        name: string,
        method: (params?: unknown) => Promise<unknown>
    ): void {
        this.methods.set(name, method)
        console.log("Register remote command:", name, method)
    }

    unregisterMethod(name: string): void {
        this.methods.delete(name)
    }

    private readonly handleMessage = (evt: MessageEvent) => {
        const payload: unknown = evt.data
        if (!isObject(payload)) return
        if (payload.type !== `${this.prefix}-Query`) return

        const { id, method, params } = payload
        console.log(
            "🚀 [remote-command] id, method, params = ",
            id,
            method,
            params
        ) // @FIXME: Remove this line written on 2022-11-07 at 15:44
        if (!isString(id) || !isString(method)) return

        const callback = this.methods.get(method)
        if (!callback) {
            console.error(`Method "${method}" is missing! Available ones are:`)
            for (const key of this.methods.keys()) {
                console.log("     >> ", key)
            }
            this.send({
                type: `${this.prefix}-Error`,
                id,
                code: 1000001,
                messsage: `Method "${method}" is unknown!`,
            })
        } else {
            const asyncFunction = async () => {
                try {
                    console.log("🚀 [remote-command] method = ", method) // @FIXME: Remove this line written on 2023-01-25 at 12:15
                    const data = await callback(params)
                    console.log("🚀 [remote-command] data = ", data) // @FIXME: Remove this line written on 2023-01-25 at 12:12
                    this.send({
                        type: `${this.prefix}-Response`,
                        id,
                        data,
                    })
                } catch (ex) {
                    console.error(`Error in remote command "${method}"!`)
                    console.error("   params:", params)
                    console.error("   error:", ex)
                    this.send({
                        type: `${this.prefix}-Error`,
                        id,
                        code: 1000002,
                        messsage: JSON.stringify(ex),
                    })
                }
            }
            void asyncFunction()
        }
    }

    private send(data: Record<string, unknown>) {
        const { parent } = window
        if (!parent) return

        parent.postMessage(data, "*")
    }
}

// const query = ((child: HTMLIFrameElement) => {
//     return (method: string, params?: any) =>
//         new Promise((resolve, reject) => {
//             const id = queryId.toString(16)
//             pendingQueries.set(id, { resolve, reject })
//             child.contentWindow?.postMessage(
//                 {
//                     type: "BCS-Query",
//                     id,
//                     method,
//                     params,
//                 },
//                 "*"
//             )
//         })
// })(document.getElementById("My-IFrame") as HTMLIFrameElement)
