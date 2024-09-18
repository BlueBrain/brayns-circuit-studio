import { Service } from "@/service/service"
import { useThrowableAsyncEffect } from "@tolokoban/ui"
import React from "react"

export function useRootPath() {
    const [rootPath, setRootPath] = React.useState<string | null>(null)
    useThrowableAsyncEffect(async () => {
        const path = await Service.backend.fileSystem.getRootPath()
        setRootPath(path)
    }, [])
    return rootPath
}

export interface FilesAndDirs {
    files: Array<{
        name: string
        path: string
        size: number
    }>
    directories: Array<{
        name: string
        path: string
    }>
}

export function useFilesAndDirectories(path: string): FilesAndDirs | null {
    const [dir, setDir] = React.useState<FilesAndDirs | null>(null)
    useThrowableAsyncEffect(async () => {
        try {
            setDir(null)
            setDir(await Service.backend.fileSystem.listDir(path))
        } catch (ex) {
            console.error("Unable to list dir:", path)
            console.error(ex)
        }
    }, [path])
    return dir
}
