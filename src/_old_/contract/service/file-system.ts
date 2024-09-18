export interface FileSystemItem {
    // Display name of the file/directory.
    name: string
    // File size in bytes.
    size: number
}

export interface FileSystemDirectoryContent {
    files: FileSystemItem[]
    directories: string[]
}

export default abstract class FileSystemServiceInterface {
    /**
     * The filesystem is sandboxed. We cannot go outside the "root" directory.
     */
    abstract getRootDir(): Promise<string>

    /**
     * List immediate content of a directory.
     * Raise an exception if `directoryPath` does not exist.
     */
    abstract listDirectory(
        directoryPath: string
    ): Promise<FileSystemDirectoryContent>
    /**
     * Raise an exception if `directoryPath` does not exist.
     * @returns Path of the parent directory, or null if `directoryUri`
     * is the root directory.
     */
    abstract getDirectoryParent(directoryPath: string): string | null

    abstract directoryExists(directoryPath: string): Promise<boolean>

    abstract fileExists(filePath: string): Promise<boolean>

    abstract saveTextFile(filePath: string, content: string): Promise<void>

    abstract saveBinaryFile(filePath: string, imageURL: string): Promise<void>

    /**
     * Generate an image from the Canvas and save it.
     * The type of the image depends on the `filepath` extension.
     * Accepted extensions are: "jpg" or "png".
     */
    abstract saveAsImage(
        filePath: string,
        canvas: HTMLCanvasElement
    ): Promise<void>

    abstract loadTextFile(filePath: string): Promise<string>
}

export function ensureFileSystemServiceInterface(
    data: unknown
): FileSystemServiceInterface {
    if (data instanceof FileSystemServiceInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type FileSystemServiceInterface!")
}
