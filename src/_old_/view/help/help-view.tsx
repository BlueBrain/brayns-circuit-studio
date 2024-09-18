import AsyncTool from "@/_old_/tool/async"
import IconFactory from "@/_old_/ui/factory/icon"
import JSON5 from "json5"
import Markdown from "markdown-to-jsx"
import React from "react"
import ReactDOM from "react-dom"
import SerializableData from "@/_old_/contract/type/serializable-data"
import { isObject, isSerializableData } from "@/_old_/tool/validator"
import "./help-view.css"
import { NODE_STARTUP_SCRIPT } from "@/_old_/service/backend-allocator/startup-scripts"
/* eslint-disable class-methods-use-this */

/**
 * Display Markdown multilingual help topic.
 * Pages are stored in /public/help/<lang>/*.md files
 *
 * When looking for topic "foobar", the search is done for the current
 * language first. If not found, we go for the defaultLanguage.
 */

export interface ICommand {
    commandName: string
    commandData: { [key: string]: SerializableData }
}

export interface IWidgetDefinition extends ICommand {
    topic: string
    component?: string | JSX.Element
}

interface IHelpProps {
    className?: string[]
    topic: string
    defaultLanguage: string
    onPageNotFound?(topic: string, lang: string): void
    onPageLoaded?(topic: string): void
    onWidget?(def: IWidgetDefinition): void
    onClose(): void
}
interface IHelpState {
    // Markdown content of the topic.
    // If undefined, the topic is loading.
    content?: string
    loaded: boolean
}

const NOT_FOUND = -1
const PROCESS_CONTENT_DEBOUNCING_MSEC = 10

export default class Help extends React.Component<IHelpProps, IHelpState> {
    state: IHelpState = { loaded: false }

    private readonly refContent = React.createRef<HTMLDivElement>()

    // Images are relative to the md topic.
    // This variable holds the baseURL of the topic.
    private baseURL = ""

    private readonly widgets = new Map<string, JSX.Element>()

    private topic = this.props.topic

    componentDidMount() {
        void this.loadContent(this.props.topic)
    }

    private async loadContent(topic: string) {
        this.topic = topic
        this.setState({ content: undefined, loaded: false })

        let lang = window.navigator.language
        if (await this.tryToLoad(topic, lang)) return
        lang = this.props.defaultLanguage
        if (
            lang !== window.navigator.language &&
            (await this.tryToLoad(topic, lang))
        )
            return

        const { onPageNotFound } = this.props
        if (typeof onPageNotFound === "function") {
            onPageNotFound(topic, lang)
        }
    }

    private async tryToLoad(topic: string, lang: string) {
        const url = `help/${lang}/${topic}/index.md`
        console.log("🚀 [help-view] url = ", url) // @FIXME: Remove this line written on 2023-09-26 at 16:34
        const lastSlash = url.lastIndexOf("/")
        const base = url.substring(0, lastSlash + 1)
        try {
            const text = await loadTextFromURL(url)
            const content = this.parseWidgets(text)
            this.setState({ content })
            this.baseURL = base
            return true
        } catch (ex) {
            return false
        }
    }

    private parseWidgets(text: string): string {
        this.widgets.clear()

        let out = ""
        let cursor = 0
        try {
            for (;;) {
                const openCurlyBraketsPos = text.indexOf("{{", cursor)
                if (openCurlyBraketsPos === NOT_FOUND) {
                    out += text.substring(cursor)
                    break
                }
                out += text.substring(cursor, openCurlyBraketsPos)
                cursor = openCurlyBraketsPos + "{{".length
                const closeCurlyBraketsPos = text.indexOf("}}", cursor)
                if (closeCurlyBraketsPos === NOT_FOUND) {
                    cursor = openCurlyBraketsPos
                    throw Error('Missing closing "}}"!')
                }
                const widgetCode = `${text.substring(
                    cursor,
                    closeCurlyBraketsPos
                )}`
                // Reset position of cursor in case of exception in the next command.
                cursor = openCurlyBraketsPos
                const command = this.parseWidgetCode(widgetCode)
                const widget = this.createWidget(command)
                if (widget && widget.component) {
                    if (typeof widget.component === "string") {
                        out += widget.component
                    } else {
                        const id = nextID()
                        this.widgets.set(id, widget.component)
                        out += `<span class="manager-help-View-widget" id="${id}"></span>`
                    }
                }
                cursor = closeCurlyBraketsPos + "}}".length
            }
        } catch (ex) {
            out = parseWidgetsFatalError(ex, out, text, cursor)
        }

        return out
    }

    private createWidget(command: ICommand): IWidgetDefinition | null {
        const onWidget = this.props.onWidget ?? transformWidget
        if (typeof onWidget !== "function") return null
        const def: IWidgetDefinition = {
            topic: this.topic,
            ...command,
        }
        try {
            onWidget(def)
            if (!def.component) return null
            return def
        } catch (ex) {
            console.error("Error while creating widget:", def)
            console.error(ex)
            return null
        }
    }

    private parseWidgetCode(code: string): ICommand {
        try {
            const command: unknown = parseCode(code)
            if (!isObject(command)) {
                throw Error(
                    `Invalid syntax for this command:\n${JSON.stringify(
                        command,
                        null,
                        "  "
                    )}`
                )
            }
            const commandName = command[0]
            if (typeof commandName !== "string") {
                throw Error(
                    `Command must have a name!\n${JSON.stringify(
                        command,
                        null,
                        "  "
                    )}`
                )
            }
            const commandData: { [key: string]: SerializableData } = {}
            for (const key of Object.keys(command)) {
                if (!isNaN(Number(key))) continue

                const value = command[key]
                if (!isSerializableData(value)) continue

                commandData[key] = value
            }
            return { commandName, commandData }
        } catch (ex) {
            console.error(ex)
            throw Error(`Malformed widget code: ${code}`)
        }
    }

    private readonly processContent = AsyncTool.debounce(() => {
        const content = this.refContent.current
        if (!content) return
        this.processLocalImages(content)
        this.processLocalVideos(content)
        this.processLinksToPages(content)
        this.processWidgets(content)
        this.setState({ loaded: true })
    }, PROCESS_CONTENT_DEBOUNCING_MSEC)

    private processWidgets(content: HTMLDivElement) {
        const { widgets } = this
        for (const id of widgets.keys()) {
            const container = content.querySelector(`#${id}`)
            const component = widgets.get(id)
            if (!component) return
            ReactDOM.render(component, container)
        }
    }

    private processLocalImages(content: HTMLDivElement) {
        const images = content.querySelectorAll("img")
        for (const image of images) {
            const src = image.getAttribute("src")
            if (!src) continue
            if (src.startsWith("http:") || src.startsWith("https:")) continue
            // image.setAttribute("src", `${this.baseURL}${src}`)
            image.src = `${this.baseURL}${src}`
            if (src.endsWith(".webp")) {
                // We need a fallback for old/poor Safari.
                const picture = document.createElement("picture")
                const source = document.createElement("source")
                source.setAttribute("type", "image/webp")
                source.setAttribute("srcset", image.src)
                const img = document.createElement("img")
                img.setAttribute(
                    "src",
                    `${image.src.substring(
                        0,
                        image.src.length - ".webp".length
                    )}.png`
                )
                picture.appendChild(source)
                picture.appendChild(img)
                image.replaceWith(picture)
            }
        }
    }

    private processLocalVideos(content: HTMLDivElement) {
        const videos = content.querySelectorAll("video")
        for (const video of videos) {
            const src = video.getAttribute("src")
            if (!src) continue
            if (src.startsWith("http:") || src.startsWith("https:")) continue
            video.src = `${this.baseURL}${src}`
            video.setAttribute("mute", "true")
            video.setAttribute("loop", "true")
            video.setAttribute("autoplay", "true")
            video.setAttribute("controls", "false")
        }
    }

    private processLinksToPages(content: HTMLDivElement) {
        const links = content.querySelectorAll("a[href]")
        for (const link of links) {
            const lnk = link as HTMLAnchorElement
            const href = lnk.getAttribute("href")
            if (!href) continue
            if (href.startsWith(".")) {
                const topic = makeAbsolute(href, this.topic)
                lnk.setAttribute("href", topic)
                lnk.addEventListener("click", (evt) => {
                    evt.preventDefault()
                    evt.stopPropagation()
                    void this.loadContent(topic)
                })
            } else {
                // For external links, make them open in a new tab.
                const target = lnk.getAttribute("target")
                if (target) continue
                lnk.setAttribute("target", "_BLANK")
            }
        }
    }

    render() {
        const classes = ["manager-help-View"]
        if (typeof this.props.className === "string") {
            classes.push(this.props.className)
        }
        const { content, loaded } = this.state
        if (!loaded) classes.push("hide")

        if (!loaded && content) {
            // Raw content has been loaded, we need to
            // process it now.
            void this.processContent()
        }

        return (
            <div className={classes.join(" ")}>
                <header>
                    <div>Online Documentation</div>
                    <button onClick={this.props.onClose}>
                        {IconFactory.make("close")}
                    </button>
                </header>
                <div className="content" ref={this.refContent}>
                    {content && (
                        <Markdown
                            options={{
                                forceBlock: true,
                            }}
                        >
                            {content}
                        </Markdown>
                    )}
                </div>
            </div>
        )
    }
}

let globalID = 1

function parseWidgetsFatalError(
    ex: unknown,
    initialOut: string,
    text: string,
    cursor: number
) {
    let out = initialOut
    if (typeof ex !== "string") {
        console.error(ex)
        out += `<div class="manager-help-View-error">Error!</div>`
    } else {
        out += `<div class="manager-help-View-error">${ex}</div>`
    }
    out += "\n\n```\n"
    out += extractCodeAtIndex(text, cursor)
    out += "\n```\n"
    return out
}

function nextID(): string {
    return `brayns-view-Help__${globalID++}`
}

/**
 * @param href Path relative to `topic`.
 * @param topic Absolute path.
 * @returns `makeAbsolute("../view", "main/section") === "main/view"`
 */
function makeAbsolute(href: string, topic: string): string {
    const path = topic.split("/")
    for (const item of href.split("/")) {
        if (item === ".") continue
        if (item === "..") path.pop()
        else path.push(item)
    }
    return path.join("/")
}

function loadTextFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((response: Response) => {
                if (!response.ok) {
                    reject(
                        Error(
                            `Error ${response.status}: ${response.statusText}!`
                        )
                    )
                }

                return response.text()
            })
            .then(resolve)
            .catch(reject)
    })
}

const DEFAULT_LINES_AROUND = 3

function extractCodeAtIndex(
    text: string,
    index: number,
    showLinesAround = DEFAULT_LINES_AROUND
): string {
    const textWithoutTabs = text.split("\t").join("    ")
    const { line, pos } = findLineAndPosFromIndex(textWithoutTabs, index)
    const lines = textWithoutTabs.split("\n")
    const TEN = 10
    const NUMBER_PADDING = Math.ceil(
        Math.log(lines.length + 1 + 1) / Math.log(TEN)
    )
    const minLine = Math.max(1, line - showLinesAround)
    const maxLine = Math.min(lines.length, line + showLinesAround)
    const output: string[] = []

    for (let k = minLine; k <= maxLine; k++) {
        const prefix = k === line ? "> " : "  "
        const SEP = " | "
        output.push(
            `${prefix}${padNumber(k, NUMBER_PADDING, " ")}${SEP}${lines[k - 1]}`
        )
        if (k === line) {
            output.push(
                `${fillString(
                    pos + NUMBER_PADDING + prefix.length + SEP.length,
                    " "
                )}   ^`
            )
        }
    }

    return output.join("\n")
}

function findLineAndPosFromIndex(text: string, index: number) {
    let lineNumber = 1
    let lastNewLineIndex = 0

    const end = Math.min(index, text.length - 1)
    let cursor = 0
    while (cursor < end) {
        const char = text.charAt(cursor)
        if (char === "\n") {
            lineNumber++
            lastNewLineIndex = cursor + 1
        }
        cursor++
    }
    return { line: lineNumber, pos: cursor - lastNewLineIndex }
}

const DEFAULT_NUMBER_PAD = 6

function padNumber(
    value: number,
    size = DEFAULT_NUMBER_PAD,
    fillWith = " "
): string {
    let text = `${value}`
    while (text.length < size) {
        text = fillWith.charAt(0) + text
    }

    return text
}

function fillString(size: number, fillWithChar = " ") {
    let out = ""
    const char =
        fillWithChar && fillWithChar.length > 0 ? fillWithChar.charAt(0) : " "
    while (out.length < size) out += char
    return out
}

function transformWidget(widget: IWidgetDefinition) {
    console.log("🚀 [help-view] widget = ", widget) // @FIXME: Remove this line written on 2023-11-08 at 12:29
    if (widget.commandName !== "NODE_STARTUP_SCRIPT") return

    widget.component = (
        <details>
            <summary>start.sh</summary>
            <pre>{NODE_STARTUP_SCRIPT}</pre>
        </details>
    )
}

function parseCode(raw: string) {
    const text = raw.trim()
    const comma = text.indexOf(",")
    if (comma < 0) return { 0: text }

    const obj: object = JSON5.parse(`{${text.substring(comma + 1)}}`)
    obj[0] = text.substring(0, comma).trim()
    return
}
