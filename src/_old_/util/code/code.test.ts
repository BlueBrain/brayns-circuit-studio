import { CodeBloc, codeToString } from "./code"

describe("util/code/code.ts", () => {
    // @TODO: Implement tests.
    describe("codeToString()", () => {
        it("should work", () => {
            const got = codeToString([
                "for i in range(10):",
                ["a = i**2", "print(a)"],
                "# End",
            ])
            const exp = `for i in range(10):
    a = i**2
    print(a)
# End`
            expect(got).toEqual(exp)
        })
    })
})
