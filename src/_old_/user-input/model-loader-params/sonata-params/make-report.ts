import { CircuitModelReport } from "@/_old_/contract/manager/models/types/circuit-model"
import { Report } from "@/_old_/contract/service/sonata-info"

export function makeReportFromSonata(report: Report): CircuitModelReport {
    const frameDuration = report.delta
    const totalDuration = report.end - report.start
    return {
        colorRamp: [],
        dataUnit: report.unit,
        frames: (report.end - report.start) / report.delta,
        frameDuration,
        frameEndIndex: report.end / frameDuration,
        frameStartIndex: report.start / frameDuration,
        totalDuration,
        name: report.name,
        range: [-80, -10],
        spikeTransitionTime: report.delta * 5,
        timeUnit: "ms",
        type: report.type,
    }
}
