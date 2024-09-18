import * as React from "react"
import { FileSystemItem } from "@/_old_/contract/service/file-system"
import "./files-list-view.css"

export interface FilesListViewProps {
    className?: string
    files: FileSystemItem[]
    onClick(this: void, file: FileSystemItem): void
}

export default function FilesListView(props: FilesListViewProps) {
    const { files, onClick } = props
    return (
        <div className={getClassNames(props)}>
            {files.map((file) => (
                <FileItemView key={file.name} file={file} onClick={onClick} />
            ))}
            {files.length === 0 && (
                <p>
                    No file of expected type has been found in this directory.
                </p>
            )}
        </div>
    )
}

function getClassNames(props: FilesListViewProps): string {
    const classNames = ["custom", "fileSystemBrowser-view-FilesListView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

interface FileItemProps {
    file: FileSystemItem
    onClick(file: FileSystemItem): void
}

function FileItemView(props: FileItemProps) {
    return (
        <button className="file-item" onClick={() => props.onClick(props.file)}>
            <div>{props.file.name}</div>
            <div>{props.file.size}</div>
        </button>
    )
}
