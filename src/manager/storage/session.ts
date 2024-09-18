import { Storage } from "./storage"

export class SessionStorage<T> extends Storage<T> {
    getItem(key: string): string | null {
        return sessionStorage.getItem(key)
    }

    setItem(key: string, item: string): void {
        sessionStorage.setItem(key, item)
    }

    removeItem(key: string): void {
        sessionStorage.removeItem(key)
    }
}
