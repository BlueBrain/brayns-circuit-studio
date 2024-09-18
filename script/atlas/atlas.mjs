import FS from "fs"
import URL from "url"
import Path from "path"

/**
 * Hexa colors can sometimes be made shorter.
 * Like "#FFDD33", which is equivalent to "#FD3".
 * @param {string} color
 * @returns {string}
 */
function zipColor(color) {
    const R1 = color.charAt(0)
    const R2 = color.charAt(1)
    if (R1 !== R2) return color

    const G1 = color.charAt(2)
    const G2 = color.charAt(3)
    if (G1 !== G2) return color

    const B1 = color.charAt(4)
    const B2 = color.charAt(5)
    if (B1 !== B2) return color

    return `${R1}${G1}${B1}`
}

/**
 *
 * @param {Array<{
 *  id: number
 *  acronym: string
 *  name: string
 *  color_hex_triplet: string
 *  children?: unknown[]
 * }>} regions
 */
function crawlRegions(regions, output) {
    for (const region of regions) {
        const item = [
            region.id,
            region.acronym,
            region.name,
            zipColor(region.color_hex_triplet),
        ]
        output.push(item)
        if (Array.isArray(region.children) && region.children.length > 0) {
            const children = []
            item.push(children)
            crawlRegions(region.children, children)
        }
    }
}

const __filename = URL.fileURLToPath(import.meta.url)
const path = Path.resolve(Path.dirname(__filename), "./hierarchy_l23split.json")
const content = FS.readFileSync(path).toString()
const data = JSON.parse(content)
const regions = data.msg
const output = []
crawlRegions(regions, output)
const linearisation = JSON.stringify(output)
console.log(linearisation)
