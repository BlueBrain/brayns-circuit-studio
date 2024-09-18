import { assertType } from "@tolokoban/type-guards"

import JsonRpcService from "../json-rpc"
import { imageLoad } from "@/util/image"
import { FileSystem } from "./file-system"

export interface SnapshotOptions {
    width: number
    height: number
}

export class Backend {
    public readonly fileSystem: FileSystem

    constructor(private readonly getBackend: () => JsonRpcService) {
        this.fileSystem = new FileSystem(getBackend)
    }

    async getVersion(): Promise<string> {
        const data = await this.getBackend().exec("version")
        assertType<{
            version: string
        }>(data, {
            version: "string",
        })
        return data.version
    }
}
