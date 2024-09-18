const MATCHERS_DEF = {
    spc: "[ \t\r\n,]+",
    num: "-?(([0-9]+(\\.[0-9]+)?)|(\\.[0-9]+))(-?[e][0-9]+)?",
    ".": "\\.",
    ":": ":",
    "[": "\\[",
    "]": "\\]",
    "{": "\\{",
    "}": "\\}",
    str: "(\"([^\"]+|\\\\\"])*\")|('([^']+|\\\\')*')",
    var: "\\$[a-z_][a-z_0-9]+",
    name: "[a-z_][a-z_0-9]+",
}

export type TokenType = keyof typeof MATCHERS_DEF

const MATCHERS: Array<[key: TokenType, rx: RegExp]> = Object.keys(
    MATCHERS_DEF
).map((key: TokenType) => [key, new RegExp(`^${MATCHERS[key] as string}`, "i")])

export interface Token {
    type: TokenType
    value: string
    position: number
}

export function parseTokens(code: string) {
    const tokens: Token[] = []
    let i = 0
    while (i < code.length) {
        const tkn: Token = nextToken(code, i)
        if (tkn.type !== "spc") tokens.push(tkn)
        i += tkn.value.length
    }
    return tokens
}

function nextToken(code: string, i: number): Token {
    const part = code.substring(i)
    for (const [type, rx] of MATCHERS) {
        rx.lastIndex = -1
        const match = rx.exec(part)
        if (match) {
            return { type, value: match[0], position: i }
        }
    }
    throw Error(`Unexpected token at position ${i}!\n${getCodeCursor(code, i)}`)
}

function getCodeCursor(code: string, i: number) {
    let k = 0
    const lines = code.split("\n")
    const output: string[] = []
    for (const line of lines) {
        output.push(line)
        const j = k
        k += line.length + "\n".length
        if (j <= i && k > i) {
            output.push(`${" ".repeat(i - j)}^`)
        }
    }
    return output.join("\n")
}
