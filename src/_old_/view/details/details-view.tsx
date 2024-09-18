import * as React from "react"
import "./details-view.css"
import FloatingButton from "@/_old_/ui/view/floating-button"

export interface DetailsViewProps {
    className?: string
    label: string
    count?: number
    open?: boolean
    onImportClick?(this: void): void
    children: React.ReactNode
}

export default function DetailsView({
    className,
    open,
    label,
    count,
    onImportClick,
    children,
}: DetailsViewProps) {
    return (
        <details
            className={getClassNames(className, Boolean(onImportClick))}
            open={open === true}
        >
            <summary>
                <div>
                    <div className="label">{label}</div>
                    {onImportClick && (
                        <FloatingButton
                            icon="import"
                            accent={true}
                            small={true}
                            onClick={onImportClick}
                        />
                    )}
                    {typeof count === "number" ? (
                        <div className="count">{count}</div>
                    ) : null}
                </div>
            </summary>
            {children}
        </details>
    )
}

function getClassNames(className?: string, bigSize?: boolean): string {
    const classNames = ["custom", "view-DetailsView"]
    if (typeof className === "string") {
        classNames.push(className)
    }
    if (bigSize === true) {
        classNames.push("big")
    }

    return classNames.join(" ")
}
