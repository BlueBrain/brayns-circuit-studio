import { expandRange, isValidRange } from "./range"

describe("manager/scene/loader/circuit/range.ts", () => {
    // @TODO: Implement tests.
    describe("Range.expanRange()", () => {
        const cases: Array<[title: string, input: string, expected: number[]]> =
            [
                ["empty strings", "", []],
                ["single GID", "27", [27]],
                ["single GID with one digit", "6", [6]],
                ["list", "2,3,5,8", [2, 3, 5, 8]],
                ["unordered list", "5,8,2,3", [2, 3, 5, 8]],
                ["fake range", "27-27", [27]],
                ["simple range", "3-8", [3, 4, 5, 6, 7, 8]],
                ["no duplicate", "2,1-4,3", [1, 2, 3, 4]],
                ["reverded range", "8-3", [3, 4, 5, 6, 7, 8]],
                [
                    "mix between GIDs and ranges",
                    "1,4,9-12,3,10-14",
                    [1, 3, 4, 9, 10, 11, 12, 13, 14],
                ],
                [
                    "and ignore spaces",
                    "1, 4,9 -12,3   , 10  - 14",
                    [1, 3, 4, 9, 10, 11, 12, 13, 14],
                ],
            ]
        for (const [title, input, expected] of cases) {
            it(`should expand ${title}`, () => {
                expect(expandRange(input)).toEqual(expected)
            })
        }
    })
    describe(`Range.isValidRange`, () => {
        const casesTrue: string[] = [
            "1",
            "27",
            "1,2,3",
            "5-45",
            "1,4,9-12,3,10-14",
            "1, 4,9 -12,3   , 10  - 14",
        ]
        for (const input of casesTrue) {
            it(`should validate "${input}"`, () => {
                expect(isValidRange(input)).toBe(true)
            })
        }
    })
})
