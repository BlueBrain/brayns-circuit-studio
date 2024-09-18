import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import { makeClear } from "./clear"
import { makeLoadCircuit } from "./load-circuit"
import { ensureRemoteCommandInterface } from "@/_old_/contract/manager/remote-command"
import { makeLoadMesh } from "./load-mesh"
import { makeSetBackgroundColor } from "./set-background-color"

export function initializeRemoteCommand(locator: ServiceLocatorInterface) {
    const rc = locator.get("remoteCommandServer", ensureRemoteCommandInterface)
    rc.registerMethod("clear", makeClear(locator))
    rc.registerMethod("set-background-color", makeSetBackgroundColor(locator))
    rc.registerMethod("load-circuit", makeLoadCircuit(locator))
    rc.registerMethod("load-mesh", makeLoadMesh(locator))
}
