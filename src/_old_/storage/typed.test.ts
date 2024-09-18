import StorageInterface from "@/contract/storage"
import TypedStorage from "./typed"
import { inflexibleConverter } from "@/tool/inflexible-converter"
import { TableStorageInterface } from "@/contract/storage/table"

describe("storage/typed.ts", () => {
    class StorageMock implements StorageInterface {
        private readonly map = new Map<string, unknown>()

        load(name: string, defaultValue?: unknown): Promise<unknown> {
            return new Promise<unknown>((resolve) => {
                resolve(this.map.get(name) ?? defaultValue)
            })
        }
        save(name: string, value: unknown): Promise<void> {
            return new Promise<void>((resolve) => {
                this.map.set(name, value)
                resolve()
            })
        }
        delete(name: string): Promise<void> {
            return new Promise<void>((resolve) => {
                this.map.delete(name)
                resolve()
            })
        }
        makeTable<T extends { id: number }>(
            _tableName: string,
            _typeConverter: (arg: unknown) => T | undefined
        ): TableStorageInterface<T> {
            throw new Error("No table can be created from this Mock!")
        }
    }
    describe("class TypedStorage", () => {
        it("should save/load numbers", async () => {
            const storage = new StorageMock()
            const typedStorage = new TypedStorage<number>(
                storage,
                "planes",
                inflexibleConverter(isNumber)
            )
            await typedStorage.save("answer", 42)
            const got = await typedStorage.load("answer", 27)
            const exp = 42
            expect(got).toEqual(exp)
        })
    })
})

function isNumber(data: unknown): data is number {
    return typeof data === "number"
}
