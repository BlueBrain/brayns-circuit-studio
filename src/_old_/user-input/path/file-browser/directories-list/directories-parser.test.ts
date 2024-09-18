import { DirItem, getTreeFromDirList } from "./directories-parser"

describe("user-input/path/file-browser/directories-list/directories-parser.ts", () => {
    // @TODO: Implement tests.
    describe("DirectoriesParser.foo()", () => {
        const cases: Array<[input: string[], expected: DirItem[]]> = [
            [
                ["/media/video/mice"],
                [
                    { path: "/", label: "/", indentation: 0 },
                    { path: "/media/", label: "media/", indentation: 1 },
                    { path: "/media/video/", label: "video/", indentation: 2 },
                    {
                        path: "/media/video/mice/",
                        label: "mice/",
                        indentation: 3,
                    },
                ],
            ],
            [
                ["/media/video/mice/"],
                [
                    { path: "/", label: "/", indentation: 0 },
                    { path: "/media/", label: "media/", indentation: 1 },
                    { path: "/media/video/", label: "video/", indentation: 2 },
                    {
                        path: "/media/video/mice/",
                        label: "mice/",
                        indentation: 3,
                    },
                ],
            ],
            [
                ["/media/video/mice", "/media/video/rats/"],
                [
                    { path: "/", label: "/", indentation: 0 },
                    { path: "/media/", label: "media/", indentation: 1 },
                    { path: "/media/video/", label: "video/", indentation: 2 },
                    {
                        path: "/media/video/mice/",
                        label: "mice/",
                        indentation: 3,
                    },
                    {
                        path: "/media/video/rats/",
                        label: "rats/",
                        indentation: 3,
                    },
                ],
            ],
            [
                [
                    "/media/video/mice",
                    "/media/video/rats/",
                    "/media/img/dogs",
                    "/media/img/cats",
                    "/home/henry/presentations",
                ],
                [
                    { path: "/", label: "/", indentation: 0 },
                    { path: "/home/", label: "home/", indentation: 1 },
                    { path: "/home/henry/", label: "henry/", indentation: 2 },
                    {
                        path: "/home/henry/presentations/",
                        label: "presentations/",
                        indentation: 3,
                    },
                    { path: "/media/", label: "media/", indentation: 1 },
                    { path: "/media/img/", label: "img/", indentation: 2 },
                    {
                        path: "/media/img/cats/",
                        label: "cats/",
                        indentation: 3,
                    },
                    {
                        path: "/media/img/dogs/",
                        label: "dogs/",
                        indentation: 3,
                    },
                    { path: "/media/video/", label: "video/", indentation: 2 },
                    {
                        path: "/media/video/mice/",
                        label: "mice/",
                        indentation: 3,
                    },
                    {
                        path: "/media/video/rats/",
                        label: "rats/",
                        indentation: 3,
                    },
                ],
            ],
        ]
        for (const [input, expected] of cases) {
            it(`should work for ${JSON.stringify(input)}`, () => {
                expect(getTreeFromDirList(input)).toEqual(expected)
            })
        }
    })
})
