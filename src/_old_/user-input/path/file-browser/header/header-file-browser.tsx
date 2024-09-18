import * as React from "react"
import InputText from "@/_old_/ui/view/input/text"
import { useDebouncedEffect } from "@/_old_/ui/hooks/debounced-effect"
import "./header-file-browser.css"

export interface HeaderFileBrowserProps {
    className?: string
    currentPath: string
    error: string | null
    favouriteDirectories: string[]
    onDirectoryClick(this: void, directory: string): void
}

const CHANGE_DEBOUNCING_DELAY = 200

export default function HeaderFileBrowser(props: HeaderFileBrowserProps) {
    const { currentPath, error, favouriteDirectories, onDirectoryClick } = props
    const [path, setPath] = React.useState(currentPath)
    React.useEffect(() => setPath(currentPath), [currentPath])
    useDebouncedEffect(
        () => onDirectoryClick(path),
        [path],
        CHANGE_DEBOUNCING_DELAY
    )
    return (
        <header className={getClassNames(props)}>
            <InputText
                label="Full path (press ENTER to select)"
                value={path}
                wide={true}
                error={error}
                suggestions={favouriteDirectories}
                onEnterPressed={() => onDirectoryClick(path)}
                onChange={setPath}
            />
        </header>
    )
}

function getClassNames(props: HeaderFileBrowserProps): string {
    const classNames = ["custom", "view-fileBrowser-HeaderFileBrowser"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
