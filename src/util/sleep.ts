export async function sleep(durationInMilliSecs: number) {
    return new Promise((resolve) =>
        window.setTimeout(resolve, durationInMilliSecs)
    )
}
