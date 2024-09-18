import {
    compareSplittedNames,
    humanFriendlySort,
    humanFriendlySortByKey,
    splitName,
    SplittedName,
} from "./name-splitter"

describe("web-brayns/view/path-selector/path-list/name-splitter.ts", () => {
    describe("splitName()", () => {
        const cases: Array<[string, SplittedName]> = [
            ["", []],
            ["Hello", ["hello"]],
            ["314", [314]],
            ["proj82", ["proj", 82]],
            [
                "My birthday is 2015 January 13",
                ["my birthday is ", 2015, " january ", 13],
            ],
        ]
        cases.forEach(([input, expected]) => {
            it(`should split "${input}" into ${expected}`, () => {
                const got = splitName(input)
                expect(got).toEqual(expected)
            })
        })
    })
    describe(`compareSplittedNames()`, () => {
        const cases: Array<[SplittedName, SplittedName, number]> = [
            [["bob"], ["bob"], 0],
            [[666], [666], 0],
            [["bob", 666], ["bob", 666], 0],
            [[666, "bob"], [666, "bob"], 0],
            [["bob", 666], ["bob"], +1],
            [["bob"], ["bob", 666], -1],
            [["john", "a"], ["john", "b"], -1],
            [["john", "b"], ["john", "a"], +1],
            [["proj", 2], ["proj", 10], -1],
            [["proj", 10], ["proj", 2], +1],
        ]
        cases.forEach(([name1, name2, expected]) => {
            it(`comparing ${name1} and ${name2} should give ${expected}`, () => {
                const got = compareSplittedNames(name1, name2)
                expect(got).toBe(expected)
            })
        })
    })
    describe(`humanFriendlySort`, () => {
        const cases: Array<[string[], string[]]> = [
            [
                ["a", "B", "c"],
                ["a", "B", "c"],
            ],
            [
                ["proj33", "proj2", "proj3", "proj4"],
                ["proj2", "proj3", "proj4", "proj33"],
            ],
        ]
        cases.forEach(([input, expected]) => {
            const got = humanFriendlySort(input)
            expect(got).toEqual(expected)
        })
    })
    describe(`humanFriendlySortByKey`, () => {
        const cases: Array<[{ file: string }[], { file: string }[]]> = [
            [
                [{ file: "a" }, { file: "B" }, { file: "c" }],
                [{ file: "a" }, { file: "B" }, { file: "c" }],
            ],
            [
                [
                    { file: "proj33" },
                    { file: "proj2" },
                    { file: "proj3" },
                    { file: "proj4" },
                ],
                [
                    { file: "proj2" },
                    { file: "proj3" },
                    { file: "proj4" },
                    { file: "proj33" },
                ],
            ],
        ]
        cases.forEach(([input, expected]) => {
            const got = humanFriendlySortByKey(input, (item) => item.file)
            expect(got).toEqual(expected)
        })
    })
})
