import React from "react"
import { ViewTouchable } from "@tolokoban/ui"

import { classNames } from "@/util/utils"

import Styles from "./view-folders.module.css"

export interface ViewFilesProps {
    className?: string
    files?: Array<{
        name: string
        path: string
        size: number
    }>
    onClick(path: string): void
}

export function ViewFiles({ className, files, onClick }: ViewFilesProps) {
    return (
        <div className={classNames(Styles.main, className)}>
            {files &&
                files.map((file) => (
                    <ViewTouchable
                        className={classNames(Styles.clickable, Styles.file)}
                        key={file.path}
                        onClick={() => onClick(file.path)}
                    >
                        <div>{file.name}</div>
                        <em>{file.size}</em>
                    </ViewTouchable>
                ))}
        </div>
    )
}
