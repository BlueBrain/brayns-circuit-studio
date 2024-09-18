import React from "react"
import Button from "@/_old_/ui/view/button"
import FileBrowserView from "./file-browser"
import { ensureFileSystemServiceInterface } from "@/_old_/contract/service/file-system"
import { useModal } from "@/_old_/ui/modal"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureStorageInterface } from "@/_old_/contract/storage/storage"
import { FoldernameUserInputOptions } from "@/_old_/contract/user-input/foldername"

export function useAskFoldername(): (
    options: FoldernameUserInputOptions
) => Promise<string | null> {
    const modal = useModal()
    const { fileSystem, userStorage } = useServiceLocator({
        fileSystem: ensureFileSystemServiceInterface,
        userStorage: ensureStorageInterface,
    })
    return React.useCallback(
        async (options: FoldernameUserInputOptions) => {
            return new Promise<string | null>((resolve) => {
                let foldername: null | string = null
                const hide = modal.show({
                    onClose: () => resolve(null),
                    content: (
                        <div className="service-FileSystemBrowsing">
                            {options.title && <header>{options.title}</header>}
                            <FileBrowserView
                                className="body"
                                foldersOnly={true}
                                persistenceService={userStorage}
                                storageKey={options.storageKey}
                                fileSystemService={fileSystem}
                                onFolderSelect={(value) => {
                                    foldername = value
                                }}
                            />
                            <footer>
                                <Button
                                    label="Cancel"
                                    flat={true}
                                    onClick={() => {
                                        hide()
                                        resolve(null)
                                    }}
                                />
                                <Button
                                    label="OK"
                                    onClick={() => {
                                        hide()
                                        resolve(foldername)
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
