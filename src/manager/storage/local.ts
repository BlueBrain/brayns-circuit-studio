import { Storage } from "./storage"

export class LocalStorage<T> extends Storage<T> {
    getItem(key: string): string | null {
        return localStorage.getItem(key)
    }

    setItem(key: string, item: string): void {
        localStorage.setItem(key, item)
    }

    removeItem(key: string): void {
        localStorage.removeItem(key)
    }
}
