const PREFIX = "keycloak/"

export function storageLoad(name: string): string | null {
    return globalThis.window?.sessionStorage.getItem(key(name))
}

export function storageSave(name: string, value: string) {
    globalThis.window?.sessionStorage.setItem(key(name), value)
}

export function storageDelete(name: string) {
    globalThis.window?.sessionStorage.removeItem(key(name))
}

function key(name: string) {
    return `${PREFIX}${name}`
}
