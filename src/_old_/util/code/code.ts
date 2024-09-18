import {
    isNumberArray,
    isObject,
    isVector3,
    isVector4,
} from "@/_old_/tool/validator"

export type CodeBloc = string | CodeBloc[]

export function codeToString(
    code: CodeBloc,
    indentString = "    ",
    level = -1
): string {
    const indent = "".padEnd(
        Math.max(0, level) * indentString.length,
        indentString
    )
    if (typeof code === "string") return `${indent}${code}`

    return code
        .map((item) => codeToString(item, indentString, level + 1))
        .join("\n")
}

export function pythonObjectToCode(obj: unknown): CodeBloc {
    if (obj === true) return "True"
    if (obj === false) return "False"
    if (obj === null || typeof obj === "undefined") return "None"
    if (isNumberArray(obj) && obj.length < 17) return JSON.stringify(obj)
    if (Array.isArray(obj)) {
        return [
            "[",
            obj.map((item) => prefixCode(pythonObjectToCode(item), "", ",")),
            "]",
        ]
    }
    if (isObject(obj)) {
        return [
            "{",
            Object.keys(obj).map((key) =>
                prefixCode(
                    pythonObjectToCode(obj[key]),
                    `${JSON.stringify(key)}: `,
                    ","
                )
            ),
            "}",
        ]
    }
    return JSON.stringify(obj)
}

export function prefixCode(
    code: CodeBloc,
    prefix: string,
    suffix = ""
): CodeBloc {
    if (typeof code === "string") {
        return `${prefix}${code}${suffix}`
    }
    let array = code
    let [head] = array
    while (Array.isArray(head)) {
        array = head
        head = array[0]
    }
    array[0] = `${prefix}${head}`
    let tail = array[array.length - 1]
    while (Array.isArray(tail)) {
        array = tail
        tail = array[array.length - 1]
    }
    array[array.length - 1] = `${tail}${suffix}`
    return code
}
