import * as React from "react"
import HeaderButton from "./header-button"
import "./tab-headers-view.css"
import { IconName } from "../../../../../ui/factory/icon/icon-factory"

export interface TabHeadersViewProps {
    className?: string
    /** Name of the current highlighted tab */
    id: string
    onClick(id: string): void
}

const TABS: Array<{
    id: string
    icon: IconName
    label: string
}> = [
    { id: "models", icon: "folder", label: "Data" },
    { id: "atlas", icon: "atlas", label: "Atlas" },
    { id: "slicing", icon: "cut-on", label: "Slices" },
    { id: "movie", icon: "movie", label: "Movie" },
    { id: "camera", icon: "camera", label: "Camera" },
    // { id: "menu", icon: "menu", label: "Menu" },
]

/**
 * Buttons used to switch between all the side panel tabs.
 * Current button is highlighted.
 */
export default function TabHeadersView(props: TabHeadersViewProps) {
    return (
        <div className={getClassNames(props)}>
            {TABS.map(({ id, icon, label }) => (
                <HeaderButton
                    id={id}
                    key={id}
                    icon={icon}
                    label={label}
                    selected={id === props.id}
                    onClick={() => props.onClick(id)}
                />
            ))}
        </div>
    )
}

function getClassNames(props: TabHeadersViewProps): string {
    const classNames = [
        "custom",
        "view-app-appNav-TabHeadersView",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
