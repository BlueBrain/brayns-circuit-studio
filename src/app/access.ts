import { RoutePath } from "./types"
import { Service } from "@/service/service"
import { State } from "@/state"

export default async function (
    path: RoutePath
): Promise<RoutePath | undefined> {
    if (path === "/connection") return

    const hostname = State.service.host.value ?? ""
    const ports = {
        brayns: State.service.portBrayns.value,
        backend: State.service.portBackend.value,
    }
    const isConnected = await Service.connect(hostname, ports)
    if (!isConnected) return "/connection"

    return
}
