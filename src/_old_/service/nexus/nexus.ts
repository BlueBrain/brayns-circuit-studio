import AtlasServiceInterface from "@/_old_/contract/service/atlas"
import NexusInterface from "@/_old_/contract/service/nexus"
import { LimitedStringCacheMap } from "@/_old_/tool/cache-map"
import { assertType } from "@/_old_/tool/validator"

const NEXUS_FILES_URL = "https://bbp.epfl.ch/nexus/v1/files/bbp/atlas/"
const NEXUS_VIEWS_URL = "https://bbp.epfl.ch/nexus/v1/views/bbp/atlas/"

export default class Nexus extends NexusInterface {
    private readonly promisedRegionUrlMap: Promise<Map<number, string>>

    private static readonly cache = new LimitedStringCacheMap(100e6)

    constructor(
        private readonly token: string,
        private readonly atlas: AtlasServiceInterface
    ) {
        super()
        this.token = token
        this.promisedRegionUrlMap = loadMeshesMapping(token)
    }

    async loadMeshForRegion(regionId: number): Promise<string> {
        try {
            this.atlas.setBusy(regionId, true)
            const regionUrls = await this.promisedRegionUrlMap
            const { token } = this
            const url =
                regionUrls.get(regionId) ??
                `${NEXUS_FILES_URL}00d2c212-fa1d-4f85-bd40-0bc217807f5b`
            try {
                return await Nexus.cache.get(url, async () => {
                    const response = await fetch(url, {
                        headers: {
                            Accept: "*/*",
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    if (!response.ok) {
                        throw Error(
                            `HTTP error code is ${response.status} (${response.statusText})!`
                        )
                    }
                    const content = await response.text()
                    return content
                })
            } catch (ex) {
                console.error("Unable to fetch mesh from:", url)
                console.error(ex)
                throw ex
            }
        } finally {
            this.atlas.setBusy(regionId, false)
        }
    }
}

async function loadMeshesMapping(token: string): Promise<Map<number, string>> {
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
    const data: unknown = await resp.json()
    assertType<{ hits: { hits: unknown[] } }>(data, {
        hits: { hits: ["array", "unknown"] },
    })
    const list = data.hits.hits
    const map = new Map<number, string>()
    for (const item of list) {
        try {
            assertType<{
                _source: {
                    "@type": string[]
                    distribution: { name: string; contentUrl: string }
                }
            }>(item, {
                _source: {
                    "@type": ["array", "string"],
                    distribution: {
                        contentUrl: "string",
                        name: "string",
                    },
                },
            })
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
