import APP_CONFIG from "../../config"
import UnicoreService, { JobStatus } from "./unicore-service"
import BackendAllocatorServiceInterface, {
    BackendAllocationOptions,
} from "@/_old_/contract/service/backend-allocator"

const UNICORE_URL = APP_CONFIG.unicoreUrl

export default class BackendAllocatorService
    implements BackendAllocatorServiceInterface
{
    private readonly unicoreService: UnicoreService

    constructor(token: string) {
        this.unicoreService = new UnicoreService({
            token,
            url: UNICORE_URL,
        })
    }

    /**
     * There are three different use cases here, depending on the URL params.
     * 1. There is a valid "host" URL param:
     *    we connect to this backend.
     * 2. There is a valid "unicore" URL param:
     *    we use the value of this param as the account to allocate
     *    a node on BB5 through UNICORE.
     *    This will give us the backend address that we put into "host"
     *    URL param and we reload the page.
     * 3. None of these URL params have been set:
     *    we ask the user for an account or an address and we set
     *    the URL param accordingly before reloading the page.
     * @returns The backend address for use case 1. Otherwise `null`,
     * which means that we have to wait for a page reload.
     */
    async allocate(
        options: Partial<BackendAllocationOptions> & { account: string }
    ): Promise<string | null> {
        const opts: BackendAllocationOptions = {
            partition: APP_CONFIG.allocationPartition,
            memory: APP_CONFIG.allocationMemory,
            onProgress(message) {
                console.log("[Allocation] ", message)
            },
            ...options,
        }

        try {
            opts.onProgress("Contacting UNICORE...")
            const jobId = await this.unicoreService.createJob({
                account: options.account,
            })
            opts.onProgress("Waiting for an available node on BB5...")
            let status: JobStatus = {
                hostname: "?",
                status: "WAITING",
                startTime: null,
            }
            let lastDisplayedStatus = ""
            do {
                await sleep(300)
                status = await this.unicoreService.getJobStatus(jobId)
                if (status.status !== lastDisplayedStatus) {
                    lastDisplayedStatus = status.status
                    console.log("Job status: ", status.status)
                }
                if (status.startTime) {
                    opts.onProgress(
                        `Next available node: ${new Intl.DateTimeFormat(
                            "en-US",
                            {
                                dateStyle: "short",
                                timeStyle: "medium",
                            }
                        ).format(status.startTime)}`
                    )
                }
            } while (status.status === "WAITING")
            if (status.status === "ERROR")
                throw Error("Unable to allocate a node on BB5!")

            opts.onProgress("Backend service is starting...")
            const backendIsStarted =
                await this.waitForBackendToBeUpAndRunning(jobId)
            if (!backendIsStarted) {
                console.error("Backend is not started!")
                return null
            }

            return status.hostname
        } catch (ex) {
            console.error("Error during UNICORE step:", ex)
            return null
        }
    }

    /**
     * @returns `true` if the backend has started successfuly.
     */
    private async waitForBackendToBeUpAndRunning(
        jobId: string
    ): Promise<boolean> {
        let backendIsStarted = false
        let braynsIsStarted = false
        let lastStdout = ""
        let lastStderr = ""
        let loop = 180
        while (loop > 0) {
            loop--
            await sleep(1000)
            const stdout =
                (await this.unicoreService.loadTextFile(jobId, "stdout")) ?? ""
            if (stdout !== lastStdout) {
                lastStdout = stdout
                console.info(
                    "%c%s",
                    "font-family:monospace;background:#7f7;color:#000;font-size:80%",
                    stdout
                )
                braynsIsStarted = includesLine(
                    stdout,
                    "Brayns service started."
                )
                // backendIsStarted = includesLine(stdout, "Server running on")
                // The backend stdout is not working for now...
                backendIsStarted = true
            }
            const stderr =
                (await this.unicoreService.loadTextFile(jobId, "stderr")) ?? ""
            if (stderr !== lastStderr) {
                lastStderr = stderr
                console.info(
                    "%c%s",
                    "font-family:monospace;background:#f77;color:#000;font-size:80%",
                    stderr
                )
            }
            if (braynsIsStarted && backendIsStarted) return true
        }
        console.warn(`Backend startup timeout: omre than 3 minutes!`)
        return false
    }
}

async function sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, timeout)
    })
}

function includesLine(content: string, stringToFind: string): boolean {
    return (
        content.split("\n").filter((line) => line.includes(stringToFind))
            .length > 0
    )
}
