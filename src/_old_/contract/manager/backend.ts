import JsonRpcServiceInterface, {
    JsonRpcServiceAddress,
} from "../service/json-rpc"

export function ensureBackendManagerInterface(
    data: unknown
): BackendManagerInterface {
    return data as BackendManagerInterface
}

export interface FileSystemFileItem {
    // Display name of the file/directory.
    name: string
    // File size in bytes.
    size: number
}

export interface FileSystemDirectoryItem {
    name: string
    path: string
}

export interface FileSystemDirectoryContent {
    files: FileSystemFileItem[]
    directories: string[]
}

export default interface BackendManagerInterface {
    readonly address: JsonRpcServiceAddress

    readonly service: JsonRpcServiceInterface

    /**
     * Connect the JSON-RPC service.
     */
    connect(): Promise<void>

    /**
     * @returns Brayns service address. If needed, Brayns is started.
     */
    fsSetContent(path: string, content: string, base64: boolean): Promise<void>

    fsGetContent(path: string, base64: boolean): Promise<string>

    fsGetRootDir(): Promise<string>

    fsListDir(path: string): Promise<FileSystemDirectoryContent>

    fsExists(path: string): Promise<boolean>

    fsIsDirectory(path: string): Promise<boolean>

    fsIsFile(path: string): Promise<boolean>

    listNodeSets(circuitPath: string): Promise<string[]>

    volumeParseHeader(path: string): Promise<Record<string, string>>
}
