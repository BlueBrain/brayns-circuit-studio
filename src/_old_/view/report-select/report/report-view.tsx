import * as React from "react"
import { CircuitDataReport } from "../types"
import "./report-view.css"

export interface ReportViewProps {
    className?: string
    report: CircuitDataReport
    selected: boolean
    onClick(this: void, name: string): void
}

export default function ReportView(props: ReportViewProps) {
    const { report, onClick } = props
    return (
        <div
            className={getClassNames(props)}
            tabIndex={0}
            onClick={() => onClick(report.name)}
        >
            <div className="name">
                {report.name}{" "}
                <span className="unit">
                    ({report.dataUnit} / {report.timeUnit})
                </span>
            </div>
            <div>{report.startTime}</div>
            <div>{report.endTime}</div>
            <div>{report.framesCount}</div>
        </div>
    )
}

function getClassNames(props: ReportViewProps): string {
    const classNames = ["custom", "view-reportSelect-ReportView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (props.selected) classNames.push("selected")

    return classNames.join(" ")
}
