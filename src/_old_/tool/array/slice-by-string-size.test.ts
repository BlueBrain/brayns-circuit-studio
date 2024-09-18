import { sliceByStringSize } from "./slice-by-string-size"

describe("tool/array/slice-by-string-size.ts", () => {
    // @TODO: Implement tests.
    describe("sliceByStringSize()", () => {
        const cases: Array<
            [input: unknown[], limit: number, expected: unknown[][]]
        > = [
            [
                [
                    { name: "John" },
                    { name: "Bob" },
                    { name: "Fernando Mosquito" },
                    { name: "Elon Tusk Fuzzy Bird" },
                    { name: "Billy" },
                    { name: "Joe" },
                ],
                32,
                [
                    [{ name: "John" }, { name: "Bob" }],
                    [{ name: "Fernando Mosquito" }],
                    [{ name: "Elon Tusk Fuzzy Bird" }],
                    [{ name: "Billy" }, { name: "Joe" }],
                ],
            ],
        ]
        for (const [input, limit, expected] of cases) {
            it(`should slice with a limit of ${limit}`, () => {
                expect(sliceByStringSize(input, limit)).toEqual(expected)
            })
        }
    })
})
