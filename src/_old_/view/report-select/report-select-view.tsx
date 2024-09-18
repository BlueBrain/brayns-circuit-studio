import "./report-select-view.css"

import * as React from "react"

import Report from "./report"
import { CircuitDataReport } from "./types"

export interface ReportSelectViewProps {
    className?: string
    value?: string
    reports: CircuitDataReport[]
    onChange(this: void, value?: string): void
}

export default function ReportSelectView(props: ReportSelectViewProps) {
    const { value, reports, onChange } = props
    const [report, setReport] = React.useState(value)
    React.useEffect(() => setReport(value), [value])
    const handleReportClick = (reportName: string) => {
        const newReportName: undefined | string =
            report === reportName ? undefined : reportName
        setReport(newReportName)
        onChange(newReportName)
    }
    return (
        <div className={getClassNames(props)}>
            {reports.length === 0 && <div>This circuit has no report.</div>}
            {reports.length > 0 && (
                <fieldset>
                    <legend>You can select a simulation's report</legend>
                    <header>
                        <div className="name"></div>
                        <div>Start</div>
                        <div>End</div>
                        <div>Steps</div>
                    </header>
                    {reports.map((item) => (
                        <Report
                            key={item.name}
                            selected={item.name === report}
                            onClick={handleReportClick}
                            report={item}
                        />
                    ))}
                </fieldset>
            )}
        </div>
    )
}

function getClassNames(props: ReportSelectViewProps): string {
    const classNames = ["custom", "view-ReportSelectView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
