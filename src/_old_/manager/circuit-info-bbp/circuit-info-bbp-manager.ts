import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
/* eslint-disable camelcase */
import CircuitInfoManagerInterface, {
    CIGetTargetNamesResponse,
    CircuitReport,
    SimulationReportNamesResponse,
} from "@/_old_/contract/manager/circuit-info-bbp"
import {
    assertNumber,
    assertObject,
    assertString,
    isObject,
    isStringArray,
} from "@/_old_/tool/validator"

const ERROR_UNKNOWN_TARGET = 1
const ERROR_CIRCUIT_NOT_FOUND = 9

export default class CircuitInfoBbpManager extends CircuitInfoManagerInterface {
    private readonly cacheReports = new Map<
        string,
        Promise<CircuitReport | null>
    >()
    private readonly cacheReportNames = new Map<string, Promise<string[]>>()
    private readonly cacheTargets = new Map<string, Promise<string[]>>()

    constructor(private readonly backend: JsonRpcServiceInterface) {
        super()
    }

    async getReport(
        circuitPath: string,
        reportName: string
    ): Promise<CircuitReport | null> {
        const { cacheReports } = this
        const key = `${reportName}\n${circuitPath}`
        const fromCache = cacheReports.get(key)
        if (fromCache) return fromCache

        const task = new Promise<CircuitReport | null>((resolve, reject) => {
            this.backend
                .exec("ci-get-report-info", {
                    path: circuitPath,
                    report: reportName,
                })
                .then((data) => {
                    if (!isReportInfo(data)) {
                        resolve(null)
                        return
                    }
                    resolve({
                        name: reportName,
                        dataUnit: `${data.data_unit}`,
                        endTime: data.end_time,
                        frameSize: data.frame_size,
                        framesCount: data.frame_count,
                        startTime: data.start_time,
                        timeStep: data.time_step,
                        timeUnit: `${data.time_unit}`,
                    })
                })
                .catch(reject)
        })
        cacheReports.set(key, task)
        return task
    }

    async getReportNames(circuitPath: string): Promise<string[]> {
        const { cacheReportNames } = this
        const key = circuitPath
        const fromCache = cacheReportNames.get(key)
        if (fromCache) return fromCache

        const task = new Promise<string[]>((resolve, reject) => {
            this.backend
                .exec("ci-get-report-names", {
                    path: circuitPath,
                })
                .then((data: SimulationReportNamesResponse) => {
                    const reportNames: string[] = data.report_names
                    if (!isReportsNamesList(reportNames)) {
                        reject(
                            Error(
                                `Unable to list reports: ${JSON.stringify(
                                    data
                                )}!`
                            )
                        )
                        return
                    }
                    resolve(reportNames)
                })
                .catch(reject)
        })
        cacheReportNames.set(key, task)
        return task
    }

    async getTargets(circuitPath: string): Promise<string[]> {
        const { cacheTargets } = this
        const key = circuitPath
        const fromCache = cacheTargets.get(key)
        if (fromCache) return fromCache

        const task = new Promise<string[]>((resolve, reject) => {
            this.backend
                .exec("ci-get-targets", {
                    path: circuitPath,
                })
                .then((data: CIGetTargetNamesResponse) => {
                    if (!isTargetsNamesList(data)) {
                        console.error(
                            `Invalid return from "ci-get-targets":`,
                            data
                        )
                        reject(JSON.stringify(data))
                        return
                    }
                    resolve(data.targets)
                })
                .catch(reject)
        })
        cacheTargets.set(key, task)
        return task
    }

    async getGIDs(circuitPath: string, targets?: string[]): Promise<number[]> {
        const data = await this.backend.exec("ci-get-cell-ids", {
            path: circuitPath,
            targets: targets ?? [],
        })
        const { ids, error, message } = data as {
            ids?: number[]
            error?: number
            message?: string
        }
        if (error === ERROR_UNKNOWN_TARGET) {
            console.error("There is an unknown target:", targets)
            console.error("  Circuit:", circuitPath)
            console.error("  Error:", message)
            return []
        }
        if (error === ERROR_CIRCUIT_NOT_FOUND) {
            console.error("Circuit not found:", circuitPath)
            console.error("  Error:", message)
            return []
        }
        return ids ?? []
    }
}

interface ReportInfo {
    data_unit: string
    end_time: number
    frame_size: number
    frame_count: number
    start_time: number
    time_step: number
    time_unit: string
}

function isReportInfo(data: unknown): data is ReportInfo {
    try {
        assertObject(data)
        const {
            data_unit,
            end_time,
            frame_size,
            frame_count,
            start_time,
            time_step,
            time_unit,
        } = data
        assertString(data_unit, "data.data_unit")
        assertNumber(end_time, "data.end_time")
        assertNumber(frame_size, "data.frame_size")
        assertNumber(frame_count, "data.frame_count")
        assertNumber(start_time, "data.start_time")
        assertNumber(time_step, "data.time_step")
        assertString(time_unit, "data.time_unit")
        return true
    } catch (ex) {
        console.error("Not a valid report info:", data)
        console.error(ex)
        return false
    }
}

interface ReportsNamesList {
    reports: string[]
}

function isReportsNamesList(data: unknown): data is ReportsNamesList {
    return isStringArray(data)
}

interface TargetsNamesList {
    targets: string[]
}

function isTargetsNamesList(data: unknown): data is TargetsNamesList {
    if (!isObject(data)) return false
    const { targets } = data
    return isStringArray(targets)
}
