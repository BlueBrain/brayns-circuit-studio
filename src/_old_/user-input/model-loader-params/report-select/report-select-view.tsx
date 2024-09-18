import { CircuitModelReport } from "@/_old_/contract/manager/models"
import { isArray } from "@/_old_/tool/validator"
import { useModal } from "@/_old_/ui/modal"
import Combo from "@/_old_/ui/view/combo"
import Label from "@/_old_/ui/view/label"
import Spinner from "@/_old_/ui/view/spinner"
import * as React from "react"
import Style from "./report-select-view.module.css"

export interface ReportSelectViewProps {
    reports: CircuitModelReport[] | Error | null
    value: CircuitModelReport | undefined
    onChange(this: void, value: CircuitModelReport | undefined): void
}

export default function ReportSelectView({
    reports,
    value,
    onChange,
}: ReportSelectViewProps) {
    const modal = useModal()
    if (!reports) {
        return <Spinner label="Still loading..." />
    }
    if (isArray(reports)) {
        if (reports.length === 0)
            return <Label value="This circuit provides no report." />
        return (
            <Combo
                wide={true}
                value={
                    value && reports.find((r) => r.name === value.name)
                        ? value.name
                        : ""
                }
                onChange={(name) =>
                    onChange(reports.find((r) => r.name === name))
                }
                options={makeOptions(reports)}
            />
        )
    }
    return (
        <div
            className={Style.error}
            onClick={() => void modal.error(reports.message)}
        >
            {reports.message}
        </div>
    )
}

function makeOptions(reports: CircuitModelReport[]): { [key: string]: string } {
    const options: { [key: string]: string } = {
        "": "< None >",
    }
    for (const report of reports) {
        options[report.name] =
            `${report.name || report.type}: ${report.dataUnit}, ${report.frameDuration} ${report.timeUnit}`
    }
    return options
}
