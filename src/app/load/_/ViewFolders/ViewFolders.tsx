import React from "react"
import { classNames } from "@/util/utils"

import { humanFriendlySort } from "@/util/name-splitter/name-splitter"
import { useRootPath } from "../hooks"

import Styles from "./view-folders.module.css"
import { ViewTouchable } from "@tolokoban/ui"

export interface ViewFoldersProps {
    className?: string
    directories?: Array<{
        name: string
        path: string
    }>
    onClick(path: string): void
}

export function ViewFolders({
    className,
    directories,
    onClick,
}: ViewFoldersProps) {
    const rootPath = useRootPath()
    const hierarchy = useHierarchy(rootPath ?? "/", directories)
    return (
        <div className={classNames(Styles.main, className)}>
            <Level
                hierarchy={hierarchy}
                rootPath={rootPath ?? "/"}
                onClick={onClick}
            />
        </div>
    )
}

export function Level({
    hierarchy,
    rootPath,
    onClick,
}: {
    hierarchy: Hierarchy
    rootPath: string
    onClick(path: string): void
}) {
    return (
        <div>
            {hierarchy.path.startsWith(rootPath) ? (
                <ViewTouchable
                    className={Styles.clickable}
                    onClick={() => onClick(hierarchy.path)}
                >
                    {hierarchy.name}/
                </ViewTouchable>
            ) : (
                <div title={hierarchy.path}>{hierarchy.name}/</div>
            )}
            {hierarchy.children.length > 0 && (
                <div className={Styles.indent}>
                    {hierarchy.children.map((child) => (
                        <Level
                            key={child.path}
                            hierarchy={child}
                            rootPath={rootPath}
                            onClick={onClick}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface Hierarchy {
    name: string
    path: string
    children: Hierarchy[]
}

/**
 * For this function to work properly, we assume that the directories
 * all have the save basename. So if we split then by "/" the resulting
 * arrays all have the same length.
 */
function useHierarchy(
    rootPath: string,
    directories?: Array<{
        name: string
        path: string
    }>
): Hierarchy {
    return React.useMemo(() => {
        const folders = humanFriendlySort(
            (directories ?? [])
                .map((item) => item.path)
                .filter((name) => name.startsWith(rootPath ?? "/"))
        )
        const hierarchy: Hierarchy = {
            name: "",
            path: "",
            children: [],
        }
        let current = hierarchy
        const [folder] = folders
        if (folder) {
            const [, ...parts] = folder.split("/")
            parts.pop()
            for (const part of parts) {
                const next: Hierarchy = {
                    name: part,
                    path: `${current.path}/${part}`,
                    children: [],
                }
                current.children.push(next)
                current = next
            }
            for (const folder of folders) {
                const tail = folder.split("/").pop() ?? ""
                current.children.push({
                    name: tail,
                    path: `${current.path}/${tail}`,
                    children: [],
                })
            }
        }
        return hierarchy
    }, [directories, rootPath])
}
