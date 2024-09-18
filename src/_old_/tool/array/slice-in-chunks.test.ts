import { sliceInChunks } from "./slice-in-chunks"

describe("tool/array/slice-in-chunks.ts", () => {
    describe("sliceInChunks()", () => {
        const cases: Array<
            [input: number[], size: number, expected: number[][]]
        > = [
            [[], 5, []],
            [[1, 2, 3, 4, 5, 6, 7, 8, 9], 4, [[1, 2, 3, 4], [5, 6, 7, 8], [9]]],
            [[1, 2, 3, 4, 5, 6, 7, 8, 9], 99, [[1, 2, 3, 4, 5, 6, 7, 8, 9]]],
        ]
        for (const [input, size, expected] of cases) {
            it(`should slice [${input}] in chunks of ${size}`, () => {
                expect(sliceInChunks(input, size)).toEqual(expected)
            })
        }
    })
})
