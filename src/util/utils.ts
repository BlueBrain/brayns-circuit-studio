import { Theme } from "@tolokoban/ui"

export function classNames(...items: unknown[]): string {
    return Theme.classNames.join(...items)
}
