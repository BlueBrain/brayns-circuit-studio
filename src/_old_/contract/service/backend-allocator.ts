export interface BackendAllocationOptions {
    account: string
    partition: string
    memory: string
    onProgress(message: string): void
}
export default interface BackendAllocatorServiceInterface {
    /**
     * If alocate returns `null`, that means that there is a redirect
     * in progress.
     */
    allocate(
        options?: Partial<BackendAllocationOptions> & { account: string }
    ): Promise<string | null>
}
