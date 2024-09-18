import * as React from "react"
import GenericEvent from "@/_old_/tool/event"

const STORAGE_PREFIX = "ui/view/expand/#"

class ExpandContext {
    public readonly event = new GenericEvent<string>()

    private _key = ""

    private static readonly _map = new Map<string, ExpandContext>()

    public static getByName(name: string): ExpandContext {
        if (!ExpandContext._map.has(name)) {
            const context = new ExpandContext(name)
            ExpandContext._map.set(name, context)
            return context
        }
        return ExpandContext._map.get(name) as ExpandContext
    }

    private constructor(private readonly name: string) {
        this._key =
            window.sessionStorage.getItem(`${STORAGE_PREFIX}${name}`) ?? ""
    }

    get key() {
        return this._key
    }

    set key(value: string) {
        this._key = value
        window.sessionStorage.setItem(`${STORAGE_PREFIX}${this.name}`, value)
        this.event.trigger(value)
    }
}

/**
 * In a group of expandable sections, only one can be expanded at a time.
 *
 * @param key Key of the current expandable section.
 * @param contextName Name used to identify a group of sections.
 * @returns `[expanded, toggle()]`
 */
export function useExpanded(
    key: string,
    contextName?: string
): [expanded: boolean, toggle: () => void] {
    const context = ExpandContext.getByName(
        contextName ?? getRandomContextName(key)
    )
    const [expanded, setExpanded] = React.useState(key === context.key)
    React.useEffect(() => {
        const update = (value: string) => setExpanded(key === value)
        context.event.add(update)
        return () => context.event.remove(update)
    }, [context, key])
    return [
        expanded,
        () => {
            if (expanded) {
                context.key = ""
            } else {
                context.key = key
            }
        },
    ]
}

/**
 * Having a random name for a context ensures that the expanded section
 * will be alone in that context.
 */
function getRandomContextName(key: string): string {
    return `${Math.random()}\n${key}\n${Date.now()}`
}
