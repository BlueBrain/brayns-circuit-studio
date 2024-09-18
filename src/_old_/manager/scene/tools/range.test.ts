import { expandRange, isValidRange, optimizeRange } from "./range"

describe("manager/scene/tools/range.ts", () => {
    describe("Range.isValidRange()", () => {
        const validCases = [
            "1",
            "9,4,3,5",
            "8-45",
            "1,9-12",
            "3-9 ,18",
            "1, 9-12",
            "3-9,18",
            "9,15-48,50",
            "1-3,5,7-9",
            "98-45",
        ]
        for (const validCase of validCases) {
            it(`should validate "${validCase}"`, () => {
                expect(isValidRange(validCase)).toBe(true)
            })
        }
        const invalidCases = [
            "",
            "1-",
            ",4,3,5",
            "1;9-12",
            "3-9 18",
            "9,1.5-48,50",
        ]
        for (const invalidCase of invalidCases) {
            it(`should invalidate "${invalidCase}"`, () => {
                expect(isValidRange(invalidCase)).toBe(false)
            })
        }
    })
    describe("Range.expandRange()", () => {
        const cases: Array<[input: string, expected: number[]]> = [
            ["5", [5]],
            ["5,3,9", [3, 5, 9]],
            ["3-9", [3, 4, 5, 6, 7, 8, 9]],
            ["1-9,3,7-12", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
        ]
        for (const [input, expected] of cases) {
            it(`should expand "${input}"`, () => {
                expect(expandRange(input)).toEqual(expected)
            })
        }
    })
    describe("Range.optimizeRange()", () => {
        const cases: Array<[input: string, expected: string]> = [
            ["1,2,3,4,5", "1-5"],
            ["1,3,4,5,6,8", "1,3-6,8"],
        ]
        for (const [input, expected] of cases) {
            it(`should optimize "${input}" into ${expected}`, () => {
                expect(optimizeRange(input)).toBe(expected)
            })
        }
    })
})
