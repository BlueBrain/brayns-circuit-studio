export function classNames(...names: unknown[]) {
    return names.filter((name) => typeof name === "string").join(" ")
}
