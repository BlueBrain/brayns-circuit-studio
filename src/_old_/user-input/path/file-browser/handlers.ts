import { humanFriendlySort } from "@/_old_/tool/name-splitter/name-splitter"
import FileSystemServiceInterface, {
    FileSystemItem,
} from "@/_old_/contract/service/file-system"

export function makeEnterPressedHandler(
    service: FileSystemServiceInterface,
    onFileSelect: (this: void, filePath: string) => void,
    setCurrentPath: (path: string) => void,
    setLoading: (value: boolean) => void,
    setDirectories: (dirs: string[]) => void,
    setNotFound: (value: boolean) => void,
    setFiles: (files: FileSystemItem[]) => void,

    filter?: (this: void, filename: string) => boolean
) {
    return (path: string) => {
        const later = async () => {
            try {
                setLoading(true)
                if (await service.fileExists(path)) {
                    onFileSelect(path)
                    return
                }
                if (await service.directoryExists(path)) {
                    void listFolder(
                        path,
                        service,
                        setCurrentPath,
                        setLoading,
                        setDirectories,
                        setFiles,
                        filter
                    )
                    return
                }
                setNotFound(true)
            } catch (ex) {
                console.error(ex)
            } finally {
                setLoading(false)
            }
        }
        void later()
    }
}

export async function initializeRootFolder(
    service: FileSystemServiceInterface,
    setRoot: React.Dispatch<React.SetStateAction<string>>,
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setDirectories: React.Dispatch<React.SetStateAction<string[]>>,
    setFiles: React.Dispatch<React.SetStateAction<FileSystemItem[]>>,
    filter?: (filename: string) => boolean
): Promise<void> {
    try {
        setLoading(true)
        const root = await service.getRootDir()
        setRoot(root)
        setCurrentPath(root)
        await listFolder(
            root,
            service,
            setCurrentPath,
            setLoading,
            setDirectories,
            setFiles,
            filter
        )
    } catch (ex) {
        console.error(ex)
    } finally {
        setLoading(false)
    }
}

export async function listFolder(
    path: string,
    service: FileSystemServiceInterface,
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setDirectories: React.Dispatch<React.SetStateAction<string[]>>,
    setFiles: React.Dispatch<React.SetStateAction<FileSystemItem[]>>,
    filter?: (filename: string) => boolean
): Promise<void> {
    try {
        setLoading(true)
        const dir = await service.listDirectory(path)
        setCurrentPath(path)
        setFiles(filter ? dir.files.filter((f) => filter(f.name)) : dir.files)
        setDirectories(humanFriendlySort(dir.directories))
    } catch (ex) {
        console.error(ex)
    } finally {
        setLoading(false)
    }
}
