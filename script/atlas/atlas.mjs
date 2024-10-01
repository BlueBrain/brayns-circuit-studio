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

/** @type {Set<number>} */
const setRegions = new Set()

/**
 * @typedef {{
 *  id: number
 *  acronym: string
 *  name: string
 *  color_hex_triplet: string
 *  children?: Region[]
 * }} Region
 *
 * @typedef {[id: number, acronym: string, name: string, color: string, children?: Item[]]} Item
 *
 * @param {Region[]} regions
 */
function crawlRegions(regions, output) {
    for (const region of regions) {
        setRegions.add(region.id)
        /** @typedef {Item} */
        const item = [
            region.id,
            region.acronym,
            region.name,
            zipColor(region.color_hex_triplet),
        ]
        output.push(item)
        if (Array.isArray(region.children) && region.children.length > 0) {
            /**
             * @type {Item[]}
             */
            const children = []
            item.push(children)
            crawlRegions(region.children ?? [], children)
        }
    }
}

const NEXUS_FILES_URL = "https://bbp.epfl.ch/nexus/v1/files/bbp/atlas/"
const NEXUS_VIEWS_URL = "https://bbp.epfl.ch/nexus/v1/views/bbp/atlas/"

/**
 * @param {string} token
 * @returns {Promise<Map<number, string>>}
 */
async function loadMeshesMapping(token) {
    const url = `${NEXUS_VIEWS_URL}${encodeURIComponent(
        "https://bbp.epfl.ch/neurosciencegraph/data/420e53b8-db21-4f70-a534-d799c4b59b5d"
    )}/_search`
    const resp = await fetch(url, {
        method: "POST",
        headers: {
            accept: "*/*",
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            size: 10000,
            query: {
                bool: {
                    must: [
                        {
                            match: {
                                "@type": "Mesh",
                            },
                        },
                        {
                            match: {
                                "atlasRelease.@id":
                                    "https://bbp.epfl.ch/neurosciencegraph/data/4906ab85-694f-469d-962f-c0174e901885",
                            },
                        },
                    ],
                },
            },
        }),
    })
    const data = await resp.json()
    const list = data.hits.hits
    /** @type {Map<number, string>} */
    const map = new Map()
    for (const item of list) {
        try {
            if (!item._source["@type"].includes("Mesh")) continue

            const { distribution } = item._source
            const [start] = distribution.name.split(".")
            const regionId = parseInt(start)
            map.set(regionId, distribution.contentUrl)
        } catch (ex) {
            // This item is not a mesh
            console.error(ex)
        }
    }
    return map
}

/**
 *
 * @param {string} token
 */
async function downloadMeshes(token) {
    let failures = 0
    const map = await loadMeshesMapping(token)
    for (const regionId of Array.from(setRegions)) {
        const url = map.get(regionId)
        console.log("Loading mesh for region", regionId, ":", url)
        if (!url) {
            failures++
            console.error("URL not found!")
            continue
        }
        const response = await fetch(url, {
            headers: {
                Accept: "*/*",
                Authorization: `Bearer ${token}`,
            },
        })
        if (response.ok) {
            const content = await response.text()
            FS.writeFileSync(`../../public/atlas/${regionId}.obj`, content)
        } else {
            console.error(
                `HTTP error code is ${response.status} (${response.statusText})!`
            )
            failures++
        }
    }
    console.log("Failures:", failures, "/", map.size)
}

const __filename = URL.fileURLToPath(import.meta.url)
const path = Path.resolve(Path.dirname(__filename), "./hierarchy_l23split.json")
const content = FS.readFileSync(path).toString()
const data = JSON.parse(content)
const regions = data.msg
const output = []
crawlRegions(regions, output)
// const linearisation = JSON.stringify(output)
// console.log(linearisation)

console.log("Number of regions:", setRegions.size)
console.log()

const [, , token] = process.argv
if (!token) {
    console.error("We expect one argument: the Nexus token.")
    console.log()
    process.exit(1)
}
void downloadMeshes(token)
