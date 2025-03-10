import { assertType, isString } from "@/_old_/tool/validator"
import { joinPath } from "../../tool/filename"
import { NODE_STARTUP_SCRIPT } from "@/_old_/service/backend-allocator/startup-scripts"

export interface UnicoreserviceOptions {
    token: string
    url: string
}

export interface JobOptions {
    // "proj3", "proj85", ...
    account: string
}

export interface JobStatus {
    hostname: string
    status: "RUNNING" | "WAITING" | "ERROR"
    startTime: Date | null
}

export default class UnicoreService {
    constructor(private readonly options: UnicoreserviceOptions) {}

    /**
     * @returns Job ID.
     */
    async createJob({ account }: JobOptions): Promise<string> {
        console.info(NODE_STARTUP_SCRIPT)
        const response = await this.post("jobs", {
            Name: "BCS-Backend",
            Executable: NODE_STARTUP_SCRIPT,
            Project: account,
            Partition: "prod",
            Resources: {
                Nodes: 1,
                Runtime: "2h",
                Memory: 0,
                Exclusive: "true",
                Comment: "certs",
            },
        })
        if (response.status !== 201) {
            console.error("Unable to create UNICORE Job!", response)
            throw Error(`Error #${response.status}: ${response.statusText}`)
        }
        const jobURL = response.headers.get("Location")
        if (!jobURL) {
            throw Error(
                "Unable to creat UNICORE Job: location response header is missing!"
            )
        }
        const pos = jobURL.lastIndexOf("/jobs/")
        const jobId = jobURL.substring(pos + "/jobs/".length)
        return jobId
    }

    async getJobStatus(jobId: string): Promise<JobStatus> {
        const response = await this.get(joinPath("jobs", jobId, "details"))
        const jobStatus: JobStatus = {
            hostname: "?",
            status: "WAITING",
            startTime: null,
        }
        let previousJobDetails = ""
        try {
            const data: unknown = await response.json()
            const currentJobDetails = JSON.stringify(data)
            if (previousJobDetails !== currentJobDetails) {
                previousJobDetails = currentJobDetails
                console.log(JSON.stringify(data, null, "    "))
            }
            assertJobDetails(data)
            return parseJobDetails(data)
        } catch (ex) {
            console.error(ex)
            jobStatus.status = "ERROR"
        }
        return jobStatus
    }

    /**
     * @returns Content of a text file, or `null` if the file does not exist.
     */
    async loadTextFile(
        jobId: string,
        filename: string
    ): Promise<string | null> {
        const response = await this.get(
            joinPath("storages", `${jobId}-uspace`, "files", filename),
            {},
            "application/octet-stream"
        )
        if (response.ok) return response.text()

        if (response.status === 404) {
            // The file does not exist.
            return null
        }
        console.error("Unable to load file:", filename)
        await response.text()
        throw Error(`Unable to read content of file "${filename}"!`)
    }

    private async post(path: string, data: unknown): Promise<Response> {
        const { url, token } = this.options
        return fetch(joinPath(url, path), {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            redirect: "follow",
            referrer: "no-referrer",
            body: JSON.stringify(data),
        })
    }

    private async get(
        path: string,
        params: Record<string, string> = {},
        contentType = "application/json"
    ): Promise<Response> {
        const { url, token } = this.options
        const search = new URLSearchParams()
        for (const name of Object.keys(params)) {
            const value = params[name]
            search.set(name, value)
        }
        const options: RequestInit = {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "include",
            headers: {
                Accept: contentType,
                Authorization: `Bearer ${token}`,
            },
            redirect: "follow",
            referrer: "no-referrer",
        }
        return fetch(`${joinPath(url, path)}${search.toString()}`, options)
    }
}

function assertJobDetails(
    data: unknown
): asserts data is Record<string, string> {
    assertType(data, ["map", "string"], "JobDetails")
}

const REGEX_NODE_NAME = /[a-z0-9]+/

function parseJobDetails(data: Record<string, string>): JobStatus {
    const { rawDetailsData } = data
    if (isString(rawDetailsData))
        return parseJobDetailsOldVersion(rawDetailsData)

    const jobStatus: JobStatus = {
        hostname: "",
        status: "WAITING",
        startTime: null,
    }
    if (data.StartTime) {
        // Try to get the estimate time of allocation.
        const eta = new Date(data.StartTime)
        if (!isNaN(eta.valueOf())) jobStatus.startTime = eta
    }
    switch (data.JobState) {
        case "RUNNING":
            jobStatus.status = "RUNNING"
            break
        case "ERROR":
            jobStatus.status = "ERROR"
            break
        default:
            jobStatus.status = "WAITING"
    }
    if (data.NodeList) {
        let hostname: string = data.NodeList
        if (REGEX_NODE_NAME.test(hostname)) {
            hostname = `${hostname}.bbp.epfl.ch`
        }
        jobStatus.hostname = hostname
    }

    return jobStatus
}

function parseJobDetailsOldVersion(rawDetailsData: string): JobStatus {
    const jobStatus: JobStatus = {
        hostname: "",
        status: "WAITING",
        startTime: null,
    }
    const items: Record<string, string> = {}
    for (const rawLine of rawDetailsData.split("\n")) {
        const line = rawLine.trim()
        const pos = line.indexOf("=")
        if (pos < 0) continue

        const name = line.substring(0, pos).trim()
        const value = line.substring(pos + 1).trim()
        switch (name) {
            case "BatchHost":
                jobStatus.hostname = value
                break
            case "JobState":
                switch (value.split(" ")[0] ?? "WAITING") {
                    case "RUNNING":
                        jobStatus.status = "RUNNING"
                        break
                    case "ERROR":
                        jobStatus.status = "ERROR"
                        break
                }
        }
        items[name] = value
    }
    return jobStatus
}
