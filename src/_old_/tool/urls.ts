export function getQueryParam(key: string) {
    const params = new URLSearchParams(document.location.search)
    return params.get(key)
}

interface CreateUrlParams {
    host: string
    protocol: string
    port: string
}

export function createUrl(params: Partial<CreateUrlParams>) {
    const url = new URL("ws://0.0.0.0")
    Object.entries(params).forEach(([key, value]) => {
        url[key] = value
    })
    return url
}
