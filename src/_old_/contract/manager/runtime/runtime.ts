import { parseTokens } from "./tokenizer"

export type RuntimeData =
    | null
    | undefined
    | boolean
    | number
    | string
    | RuntimeData[]
    | { [key: string]: RuntimeData }

export default class Runtime {
    private readonly vars = new Map<string, RuntimeData>()

    setVar(name: string, value: RuntimeData) {
        this.vars.set(name, value)
    }

    getVar(name: string): RuntimeData {
        return this.vars.get(name)
    }

    evalExpression(expression: string): RuntimeData {
        const tokens = parseTokens(expression)
        return JSON.stringify(tokens)
    }
}
