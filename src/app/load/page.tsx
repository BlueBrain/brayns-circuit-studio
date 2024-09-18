import {
    ViewButton,
    ViewInputText,
    ViewLabel,
    ViewPanel,
    ViewSpinner,
    ViewStrip,
    useDebouncedEffect,
} from "@tolokoban/ui"
import React from "react"

import { useFilesAndDirectories, useRootPath } from "./_/hooks"
import { ViewFolders, ViewFiles } from "./_/ViewFolders"

export default function PageSceneLoad() {
    const rootPath = useRootPath()
    const [fullpath, setFullpath] = React.useState<string>(rootPath ?? "/")
    useDebouncedEffect(() => {
        if (rootPath) setFullpath(rootPath)
    }, [rootPath])
    const dir = useFilesAndDirectories(fullpath)
    console.log("🚀 [page] dir = ", dir) // @FIXME: Remove this line written on 2024-07-02 at 14:32
    return (
        <ViewStrip
            template="*1"
            orientation="column"
            color="neutral-5"
            position="absolute"
            fullsize
        >
            <ViewPanel
                display="grid"
                gridTemplateColumns="auto 1fr auto"
                gridTemplateRows="auto auto"
                placeItems="center stretch"
                gap="S"
                padding="M"
            >
                <div></div>
                <ViewLabel value="Full path of the file to load:"></ViewLabel>
                <div></div>
                <ViewButton variant="text" color="secondary-5">
                    Cancel
                </ViewButton>
                <ViewInputText value={fullpath} onChange={setFullpath} />
                <ViewButton>Load</ViewButton>
            </ViewPanel>
            <ViewStrip template="11" orientation="row">
                <Panel>
                    <ViewFolders
                        directories={dir?.directories}
                        onClick={setFullpath}
                    />
                </Panel>
                <ViewPanel
                    display="grid"
                    gridTemplateColumns="1fr"
                    gridTemplateRows="1fr auto"
                    gap="S"
                >
                    <Panel>
                        <ViewFiles files={dir?.files} onClick={setFullpath} />
                    </Panel>
                    <Panel>Description</Panel>
                </ViewPanel>
            </ViewStrip>
            {!dir && (
                <ViewPanel
                    position="absolute"
                    display="grid"
                    placeItems="center"
                >
                    <ViewSpinner />
                </ViewPanel>
            )}
        </ViewStrip>
    )
}

function Panel({ children }: { children: React.ReactNode }) {
    return (
        <ViewPanel
            color="neutral-1"
            padding="M"
            margin="M"
            borderRadius=".5em"
            overflow="auto"
        >
            {children}
        </ViewPanel>
    )
}
