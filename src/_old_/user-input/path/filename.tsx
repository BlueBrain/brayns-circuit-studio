import * as React from "react"
import Button from "@/_old_/ui/view/button"
import FileBrowserView from "./file-browser"
import { ensureFileSystemServiceInterface } from "@/_old_/contract/service/file-system"
import { FilenameUserInputOptions } from "@/_old_/contract/user-input/filename"
import { useModal } from "@/_old_/ui/modal"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureStorageInterface } from "@/_old_/contract/storage/storage"

export function useAskFilename(): (
    options: FilenameUserInputOptions
) => Promise<string | null> {
    const modal = useModal()
    const { fileSystem, userStorage } = useServiceLocator({
        fileSystem: ensureFileSystemServiceInterface,
        userStorage: ensureStorageInterface,
    })
    return React.useCallback(
        async (options: FilenameUserInputOptions) => {
            return new Promise<string | null>((resolve) => {
                const hide = modal.show({
                    onClose: () => resolve(null),
                    content: (
                        <div className="service-FileSystemBrowsing">
                            {options.title && <header>{options.title}</header>}
                            <FileBrowserView
                                className="body"
                                persistenceService={userStorage}
                                storageKey={options.storageKey}
                                filter={options.filter}
                                fileSystemService={fileSystem}
                                onFileSelect={(filename) => {
                                    resolve(filename)
                                    hide()
                                }}
                            />
                            <footer>
                                <Button
                                    label="Cancel"
                                    onClick={() => {
                                        hide()
                                        resolve(null)
                                    }}
                                />
                            </footer>
                        </div>
                    ),
                })
            })
        },
        [modal, fileSystem, userStorage]
    )
}
