import { getBasename, getFileExtension, removeExtension } from "./filename"

describe("tool/filename.ts", () => {
    describe("getBaseName()", () => {
        const cases: Array<[input: string, expected: string]> = [
            ["foo.bar", "foo.bar"],
            ["/home/picwick/cell.png", "cell.png"],
        ]
        for (const [input, expected] of cases) {
            it(`should get "${expected}" from "${input}"`, () => {
                expect(getBasename(input)).toEqual(expected)
            })
        }
    })
})
