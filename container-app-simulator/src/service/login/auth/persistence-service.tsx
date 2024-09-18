import JSON5 from "json5"
import { PersistenceServiceInterface, PersistentData } from "./types"

export default class PersistenceService implements PersistenceServiceInterface {
    async load(
        name: string,
        defaultValue: PersistentData
    ): Promise<PersistentData> {
        const value = window.localStorage.getItem(name)
        if (!value) return defaultValue

        try {
            return JSON5.parse(value) as PersistentData
        } catch (ex) {
            console.error(
                `Persistent variable "${name}" has an invalid JSON5 format:`,
                value
            )
            console.error(ex)
            return defaultValue
        }
    }

    async save(name: string, value: PersistentData): Promise<void> {
        window.localStorage.setItem(name, JSON5.stringify(value))
    }
}
