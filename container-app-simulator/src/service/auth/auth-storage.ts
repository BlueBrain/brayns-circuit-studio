import JSON5 from "json5"
import { isNumber, isString } from "@/tool/validator"

export default class AuthStorage {
    async load(
        name: string,
        defaultValue?: string | number | null
    ): Promise<string | number | null | undefined> {
        return new Promise((resolve) => {
            const value = localStorage.getItem(name)
            if (value === null) {
                resolve(defaultValue ?? null)
                return
            }

            try {
                const data: unknown = JSON5.parse(value)
                resolve(
                    data === null || isString(data) || isNumber(data)
                        ? data
                        : defaultValue ?? null
                )
            } catch (ex) {
                console.error("Invalid JSON syntax for AuthStorage:", value)
                resolve(defaultValue ?? null)
            }
        })
    }

    async save(name: string, value: string | number): Promise<void> {
        return new Promise((resolve) => {
            localStorage.setItem(name, JSON5.stringify(value))
            resolve()
        })
    }

    async delete(name: string): Promise<void> {
        return new Promise((resolve) => {
            localStorage.removeItem(name)
            resolve()
        })
    }
}
