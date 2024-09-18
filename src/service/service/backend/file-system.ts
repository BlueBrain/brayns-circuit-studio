import { assertString, assertType } from "@tolokoban/type-guards"
import JsonRpcService from "../json-rpc"

export class FileSystem {
    private _rootPath: string | null = null

    constructor(private readonly getBackend: () => JsonRpcService) {}

    async getRootPath(): Promise<string> {
        if (this._rootPath) return this._rootPath

        const backend = this.getBackend()
        const data = await backend.exec("fs-get-root")
        assertString(data)
        this._rootPath = data
        return data
    }

    async listDir(path: string): Promise<{
        files: Array<{
            name: string
            path: string
            size: number
        }>
        directories: Array<{
            name: string
            path: string
        }>
    }> {
        const backend = this.getBackend()
        const data = await backend.exec("fs-list-dir", { path })
        assertType<{
            files?: Array<{
                name: string
                path: string
                size: number
            }>
            directories?: Array<{
                name: string
                path: string
            }>
        }>(data, {
            files: [
                "?",
                [
                    "array",
                    {
                        name: "string",
                        path: "string",
                        size: "number",
                    },
                ],
            ],
            directories: [
                "?",
                [
                    "array",
                    {
                        name: "string",
                        path: "string",
                    },
                ],
            ],
        })
        return {
            files: data.files ?? [],
            directories: data.directories ?? [],
        }
    }
}
