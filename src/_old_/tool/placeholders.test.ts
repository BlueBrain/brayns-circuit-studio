import { fillPlaceholders } from "./placeholders"

describe("tool/placeholders.ts", () => {
    describe("fillPlaceholders()", () => {
        const cases: Array<
            [
                text: string,
                result: string,
                placeholders?: { [name: string]: string },
            ]
        > = [
            ["Hello world!", "Hello world!"],
            ["Hello world!", "Hello world!", { NAME: "Bob" }],
            ["Hello {{NAME}}!", "Hello Bob!", { NAME: "Bob" }],
            [
                "My {{ATT}} is {{NAME}}, and yours?",
                "My name is Bob, and yours?",
                { ATT: "name", NAME: "Bob" },
            ],
            ["Hello \\{{NAME}}!", "Hello {{NAME}}!", { NAME: "Bob" }],
            ["{{X}}=x", "666=x", { X: "666" }],
            ["{{X}}", "Hello", { X: "Hello" }],
            ["Preserve \\ backspace", "Preserve \\ backspace", { NAME: "Bob" }],
        ]
        for (const [text, expected, placeholders] of cases) {
            it(`should transform "${text}" into "${expected}" for placeholders ${JSON.stringify(
                placeholders
            )}`, () => {
                const got = fillPlaceholders(text, placeholders)
                expect(got).toEqual(expected)
            })
        }
    })
})
