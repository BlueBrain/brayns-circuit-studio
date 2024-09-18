import * as React from "react"
import { CircularProgress } from "@mui/material"
import "./spinner-view.css"

export interface SpinnerViewProps {
    className?: string
    children: React.ReactNode
}

export default function SpinnerView(props: SpinnerViewProps) {
    return (
        <div className={getClassNames(props)}>
            <CircularProgress />
            <div>{props.children}</div>
        </div>
    )
}

function getClassNames(props: SpinnerViewProps): string {
    const classNames = ["custom", "view-SpinnerView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
