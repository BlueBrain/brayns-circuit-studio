const FS = require("fs")
const Path = require("path")

class Processor {
    constructor(source, destination) {
        this.source = source
        this.destination = destination
    }

    /**
     * @returns List of files this one links to.
     */
    process(filename) {
        const srcPath = Path.resolve(this.source, filename)
        const makeRelative = dep => {
            return Path.relative(
                this.source,
                Path.resolve(Path.dirname(srcPath), dep)
            )
        }
        const content = FS.readFileSync(srcPath).toString()
        const dependencies = []
        let output = ""
        let mode = ""
        let cursor = 0
        let escape = false
        for (let i = 0; i < content.length; i++) {
            if (escape) {
                escape = false
                continue
            }
            const c = content.charAt(i)
            if (c === "\\") {
                escape = true
                continue
            }
            switch (mode) {
                case "[":
                    if (c === "]") mode = "]"
                    break
                case "]":
                    if (c === "(") {
                        output += content.substring(cursor, i + 1)
                        cursor = i + 1
                        mode = "("
                    } else {
                        mode = ""
                    }
                    break
                case "(":
                    if (c === ")") {
                        const dep = content.substring(cursor, i)
                        if (isRelativeURL(dep)) {
                            if (isAsset(dep)) {
                                this.copyAsset(makeRelative(dep))
                            } else {
                                cursor = i
                                const completePath = this.completePath(
                                    makeRelative(dep)
                                )
                                dependencies.push(completePath)
                                output += Path.relative(
                                    Path.resolve(srcPath, '..'),
                                    Path.resolve(this.source, completePath)
                                )
                            }
                        }
                        mode = ""
                    }
                    break
                default:
                    if (c === "[") mode = "["
            }
        }
        output += content.substr(cursor)
        const dstFilename = Path.resolve(this.destination, filename)
        FS.mkdirSync(Path.dirname(dstFilename), {
            recursive: true
        })
        FS.writeFileSync(dstFilename, output)
        return dependencies
    }

    /**
     * If the path is a folder, we want to target the `index.md` inside.
     */
    completePath(path) {
        if (!FS.existsSync(Path.resolve(this.source, path))) {
            throw Error(`This link points nowhere: "${path}"!`)
        }
        path = `${path}/index.md`
        if (!FS.existsSync(Path.resolve(this.source, path))) {
            throw Error(`This folder has no "index.md" inside: "${path}"!`)
        }
        return path
    }

    copyAsset(filename) {
        console.log("Copy asset:", filename)
        const dstDir = Path.resolve(this.destination, Path.dirname(filename))
        FS.mkdirSync(dstDir, { recursive: true })
        FS.copyFileSync(
            Path.resolve(this.source, filename),
            Path.resolve(this.destination, filename)
        )
    }
}

function isRelativeURL(url) {
    return !url.startsWith("http:") && !url.startsWith("https:")
}

function isAsset(url) {
    const ext = (url.split(".").pop() ?? "").toLowerCase()
    return ["webp", "png", "jpg"].includes(ext)
}

module.exports = Processor
