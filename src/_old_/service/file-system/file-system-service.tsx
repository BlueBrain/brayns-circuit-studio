import { getFileExtension } from "@/_old_/tool/filename"
import { isObject, isString } from "@/_old_/tool/validator"
import "./file-system-service.css"
import FileSystemServiceInterface, {
    FileSystemDirectoryContent,
} from "@/_old_/contract/service/file-system"

/* eslint-disable class-methods-use-this */

export interface FileSystemBackendInterface {
    fsSetContent(path: string, content: string, base64: boolean): Promise<void>
    fsGetContent(path: string, base64: boolean): Promise<string>
    fsGetRootDir(): Promise<string>
    fsListDir(path: string): Promise<FileSystemDirectoryContent>
    fsExists(path: string): Promise<boolean>
    fsIsDirectory(path: string): Promise<boolean>
    fsIsFile(path: string): Promise<boolean>
}

export default class FileSystemService extends FileSystemServiceInterface {
    constructor(private readonly backend: FileSystemBackendInterface) {
        super()
    }

    async saveAsImage(
        filePath: string,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        const extension = getFileExtension(filePath)
        if (!["jpg", "png", "webp"].includes(extension)) {
            throw Error(`Unsupported image file extension: "${extension}!`)
        }
        const mimetype = `image/${extension}`
        const dataURI = canvas.toDataURL(mimetype, 1)
        const commaPos = dataURI.indexOf(",")
        const content = dataURI.substring(commaPos + 1)
        await this.backend.fsSetContent(filePath, content, true)
    }

    async saveTextFile(filePath: string, content: string): Promise<void> {
        await this.backend.fsSetContent(filePath, content, false)
    }

    async saveBinaryFile(filePath: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then((response) => response.blob())
                .then(
                    (blob) =>
                        new Promise((resolveBlob, rejectBlob) => {
                            const reader = new FileReader()
                            reader.onloadend = () => resolveBlob(reader.result)
                            reader.onerror = rejectBlob
                            reader.readAsDataURL(blob)
                        })
                )
                .then((dataURI: string) => {
                    const commaPos = dataURI.indexOf(",")
                    const content = dataURI.substring(commaPos + 1)
                    this.backend
                        .fsSetContent(filePath, content, true)
                        .then(resolve, reject)
                })
                .catch(reject)
        })
    }

    async loadTextFile(filePath: string): Promise<string> {
        const response = await this.backend.fsGetContent(filePath, false)
        if (!isObject(response) || !isString(response.content)) {
            console.error('Bad response for "fs-get-content":', response)
            throw Error(`Unable to read the content of file "${filePath}"!`)
        }
        return response.content
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getRootDir(): Promise<string> {
        try {
            // The Backend will be the one to give us the root, later.
            return await this.backend.fsGetRootDir()
        } catch (ex) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw Error(`"Unable to get the filesystem root!\n${ex}`)
        }
    }

    async listDirectory(path: string): Promise<FileSystemDirectoryContent> {
        try {
            return await this.backend.fsListDir(path)
        } catch (ex) {
            throw Error(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `"Unable to get the directory content of "${path}"!\n${ex}`
            )
        }
    }

    getDirectoryParent(directoryPath: string): string | null {
        if (directoryPath === "/") return null

        const parts = directoryPath.split("/")
        parts.pop()
        return parts.join("/")
    }

    async directoryExists(path: string): Promise<boolean> {
        return await this.backend.fsIsDirectory(path)
    }

    async fileExists(path: string): Promise<boolean> {
        return await this.backend.fsIsFile(path)
    }
}
