/**
 * Placeholder are portions of a text that will be replaced by another string.
 * The syntax for a placeholder is an uppercase name surrounded by two curly braces.
 * A placeholder can appear several times in the text.
 *
 * Backslash is the excape character.
 *
 * Example:
 * ```
 * fillPlaceholders(
 *   "Hello {{NAME}} \\{{NAME}}!",
 *   { NAME: "Bob" }
 * ) === "Hello Bob {{NAME}}!"
 * ```
 * @param text
 * @param placeholders
 */
export function fillPlaceholders(
    text: string,
    placeholders?: { [name: string]: string | number }
) {
    if (!placeholders) return text

    const names = Object.keys(placeholders)
    if (names.length === 0) return text

    const parser = new Parser(text, placeholders)
    return parser.getResult()
}

class Parser {
    private readonly index = 0
    private cursor = 0
    private result = ""
    private placeholderName = ""
    private parse: (char?: string) => void

    constructor(
        private readonly text: string,
        private readonly placeholders: { [name: string]: string | number }
    ) {
        this.parse = this.parseText
        for (this.index = 0; this.index < text.length; this.index++) {
            const char = text.charAt(this.index)
            this.parse(char)
        }
        // Parse the end of the text.
        this.parse()
    }

    public getResult() {
        return this.result
    }

    private flush(end?: number) {
        const nextCursor = end ?? this.index
        this.result += this.text.substring(this.cursor, nextCursor)
        this.cursor = nextCursor
    }

    private readonly parseText = (char?: string) => {
        if (!char) return this.flush()

        switch (char) {
            case "\\":
                this.flush()
                this.parse = this.parseEscape
                break
            case "{":
                this.flush()
                this.parse = this.parseOpen
        }
    }

    private readonly parseOpen = (char?: string) => {
        if (!char) return this.flush()

        if (char == "{") {
            this.placeholderName = ""
            this.parse = this.parsePlaceholder
            return
        }
        this.parse = this.parseText
    }

    private readonly parsePlaceholder = (char?: string) => {
        if (!char) return this.flush()

        if (char == "}") {
            this.parse = this.parseClose
            return
        }
        this.placeholderName += char
    }

    private readonly parseClose = (char?: string) => {
        if (!char) return this.flush()

        if (char == "}") {
            this.parse = this.parseClose2
            return
        }
        this.parse = this.parseText
    }

    private readonly parseClose2 = () => {
        const replacement = this.placeholders[this.placeholderName]
        if (typeof replacement === "string") {
            this.result += `${replacement}`
            this.cursor = this.index
        }
        this.parse = this.parseText
    }

    private readonly parseEscape = (char?: string) => {
        if (char === "{") this.cursor++
        this.parse = this.parseText
    }
}
