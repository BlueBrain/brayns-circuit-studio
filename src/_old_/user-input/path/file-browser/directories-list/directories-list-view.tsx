import * as React from "react"
import { DirItem, getTreeFromDirList } from "./directories-parser"
import "./directories-list-view.css"

// Indentation width in pixels for directory tree.
const INDENTATION_SIZE = 0.5

interface DirListViewProps {
    className?: string
    rootDir: string | null
    currentPath: string | null
    directories: string[]
    onClick(this: void, path: string): void
}

export default function DirListView(props: DirListViewProps) {
    const { rootDir, currentPath, directories, onClick } = props
    return (
        <div className={getClassNames(props)}>
            {rootDir &&
                currentPath &&
                getTreeFromDirList(directories).map((item) => (
                    <DirItemView
                        key={item.path}
                        enabled={item.path.startsWith(rootDir)}
                        highlight={
                            item.path === ensureTailingSlash(currentPath)
                        }
                        item={item}
                        onClick={onClick}
                    />
                ))}
        </div>
    )
}

function getClassNames(props: DirListViewProps): string {
    const classNames = ["custom", "fileSystemBrowser-view-DirListView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

/**
 * Return `directory` with a slash at the end.
 */
function ensureTailingSlash(directory: string): string {
    return directory.endsWith("/") ? directory : `${directory}/`
}

interface DirItemViewProps {
    item: DirItem
    enabled: boolean
    highlight: boolean
    onClick(this: void, path: string): void
}

function DirItemView(props: DirItemViewProps) {
    const { enabled, item, highlight, onClick } = props
    const padding = `${item.indentation * INDENTATION_SIZE}em`
    const classes = ["dir-item"]
    if (highlight) classes.push("highlight")
    classes.push(enabled === false || highlight ? "disabled" : "enabled")
    return (
        <button
            className={classes.join(" ")}
            onClick={() => onClick(item.path)}
        >
            <div style={{ paddingLeft: padding }}>{item.label}</div>
        </button>
    )
}
