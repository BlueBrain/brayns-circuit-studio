import { removeFromArray } from "./remove-from"

type Case<T> = [
    array: T[],
    element: T,
    result: T[],
    comparator?: (a: T, b: T) => boolean,
]

describe("tool/array/remove-from.ts", () => {
    const check = <T>(
        array: T[],
        element: T,
        expected: T[],
        comparator?: (a: T, b: T) => boolean
    ) => {
        it(`should remove ${JSON.stringify(element)} from ${JSON.stringify(
            array
        )}${comparator ? " with comparator " : ""} ang get ${JSON.stringify(
            expected
        )}`, () => {
            const got = removeFromArray(array, element, comparator)
            expect(got).toEqual(expected)
        })
    }
    describe("removeFromArray()", () => {
        check([], 7, [])
        check([7], 7, [])
        check([1, 2, 3], 7, [1, 2, 3])
        check([1, 7, 3], 7, [1, 3])
        const cmp = (
            a: { id: number; [key: string]: unknown },
            b: { id: number; [key: string]: unknown }
        ) => a.id === b.id
        check(
            [
                { id: 1, name: "One" },
                { id: 3, name: "Three" },
            ],
            { id: 2, name: "Two" },
            [
                { id: 1, name: "One" },
                { id: 3, name: "Three" },
            ],
            cmp
        )
        check(
            [
                { id: 1, name: "One" },
                { id: 2, name: "deux" },
                { id: 3, name: "Three" },
            ],
            { id: 2, name: "Two" },
            [
                { id: 1, name: "One" },
                { id: 3, name: "Three" },
            ],
            cmp
        )
    })
})
