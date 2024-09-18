import React from "react"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureCircuitInfoBbpManagerInterface } from "@/_old_/contract/manager/circuit-info-bbp"
import { CircuitModelReport } from "@/_old_/contract/manager/models"

export function useReportList(
    path: string
): null | CircuitModelReport[] | Error {
    const [reports, setReports] = React.useState<
        null | CircuitModelReport[] | Error
    >(null)
    const { circuitInfoBbp } = useServiceLocator({
        circuitInfoBbp: ensureCircuitInfoBbpManagerInterface,
    })
    React.useEffect(() => {
        circuitInfoBbp
            .getReportNames(path)
            .then((names) => {
                const later = async () => {
                    try {
                        const list: CircuitModelReport[] = []
                        for (const name of names) {
                            const report = await circuitInfoBbp.getReport(
                                path,
                                name
                            )
                            if (!report) {
                                console.error(
                                    `Report "${name}" does not exist in:`,
                                    path
                                )
                                continue
                            }
                            const frameDuration =
                                (report.endTime - report.startTime) /
                                report.framesCount
                            list.push({
                                colorRamp: [],
                                dataUnit: report.dataUnit,
                                frames: report.framesCount,
                                frameDuration,
                                frameEndIndex: report.endTime / frameDuration,
                                frameStartIndex:
                                    report.startTime / frameDuration,
                                totalDuration:
                                    report.endTime - report.startTime,
                                name,
                                range: [-80, -10],
                                spikeTransitionTime: frameDuration * 5,
                                timeUnit: report.timeUnit,
                                type: "compartment",
                            })
                        }
                        setReports(list)
                    } catch (ex) {
                        if (ex instanceof Error) setReports(ex)
                        else
                            setReports(
                                Error(
                                    typeof ex === "string"
                                        ? ex
                                        : JSON.stringify(ex)
                                )
                            )
                    }
                }
                void later()
            })
            .catch(setReports)
    }, [path, circuitInfoBbp])
    return reports
}
