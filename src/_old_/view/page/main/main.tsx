import * as React from "react"
import FloatingButton from "@/_old_/ui/view/floating-button"
import MainView from "./main-view"
import SidePanel from "./side-panel"
import { Collage } from "@/_old_/contract/feature/morphology-collage"
import { ensureRemoteCommandInterface } from "../../../contract/manager/remote-command"
import { MoviePageOptions } from "./sections/movie"
import { useServiceLocator } from "../../../tool/locator"
import "./main.css"

export interface AppViewProps {
    className?: string
    /** User wnat to see the About window. */
    onAboutClick(this: void): void
    /** User wants to export the scane as a Python script. */
    onPythonClick(this: void): void
    /** User wants to change the scene background color. */
    onBackgroundClick(this: void): void
    /** User want to take a snapshot. */
    onSnapshotClick(this: void): void
    /** User wants to create a simple movie from simulation. */
    onRenderSimpleMovie(this: void, options: MoviePageOptions): void
    /** User want to edit the slices with Bezier curves. */
    onEditSlices(this: void, collage: Collage): void
    /** User wants to browse the slices. */
    onViewSlices(this: void, collage: Collage): void
}

/**
 * Main layout of the application.
 */
export default function AppView({
    className,
    onAboutClick,
    onPythonClick,
    onBackgroundClick,
    onSnapshotClick,
    onRenderSimpleMovie,
    onEditSlices,
    onViewSlices,
}: AppViewProps): JSX.Element {
    const minimalUI = checkIfMinimalUserInterfaceHasBeenRequested()
    const [expanded, setExpanded] = React.useState(!minimalUI)
    const { remoteCommandServer } = useServiceLocator({
        remoteCommandServer: ensureRemoteCommandInterface,
    })
    React.useEffect(() => {
        remoteCommandServer.registerMethod(
            "fullscreen",
            () =>
                new Promise<void>((resolve) => {
                    setExpanded(false)
                    resolve()
                })
        )
        return () => {
            remoteCommandServer.unregisterMethod("fullscreen")
        }
    }, [])
    return (
        <div className={getClassNames(className, expanded)}>
            {!minimalUI && (
                <>
                    <div className="menu-back">
                        <FloatingButton
                            icon="arrow-right"
                            onClick={() => setExpanded(true)}
                        />
                    </div>
                    <SidePanel
                        onAboutClick={onAboutClick}
                        onRenderSimpleMovie={onRenderSimpleMovie}
                        onEditSlices={onEditSlices}
                        onViewSlices={onViewSlices}
                        setExpanded={setExpanded}
                    />
                </>
            )}
            <MainView
                minimalUI={minimalUI}
                onPythonClick={onPythonClick}
                onSnapshotClick={onSnapshotClick}
                onBackgroundClick={onBackgroundClick}
            />
        </div>
    )
}

function getClassNames(
    className: string | undefined,
    expanded: boolean
): string {
    const classNames = ["custom", "view-page-Main", "theme-color-primary"]
    if (typeof className === "string") {
        classNames.push(className)
    }
    if (expanded) classNames.push("expanded")
    return classNames.join(" ")
}

function checkIfMinimalUserInterfaceHasBeenRequested() {
    const args = new URLSearchParams(window.location.search)
    return args.get("ui") === "off"
}
