import GenericEvent from "@/_old_/tool/event"
import { assertType, isNumberArray } from "@/_old_/tool/validator"
import AtlasServiceInterface from "../../contract/service/atlas"
import { SessionStorageVariable } from "../../tool/storage"
import React from "react"

const PREFERRED_ROOT_ACRONYM = "grey"

export type CompressedRegion = [
    id: number,
    acronym: string,
    name: string,
    color: string,
    children?: CompressedRegion[],
]

export interface AtlasRegion {
    id: number
    acronym: string
    name: string
    color: string
    children: AtlasRegion[]
    parent?: number
}

export default class AtlasService extends AtlasServiceInterface {
    static async load(): Promise<AtlasServiceInterface> {
        const response = await fetch("./data/regions.json")
        const data: unknown = await response.json()
        assertType<CompressedRegion[]>(data, ["array", "unknown"])
        return new AtlasService(data)
    }

    private readonly root: AtlasRegion[] = []
    private readonly regions = new Map<number, AtlasRegion>()
    private readonly regionsByName = new Map<string, AtlasRegion>()
    private readonly regionsByAcronym = new Map<string, AtlasRegion>()
    private readonly busyRegions = new Set<number>()
    private readonly visibleRegions = new Set<number>()

    /**
     * Triggered when the list of busy (loading) regions changed.
     * @see setBusy()
     * @see isBusy()
     */
    public readonly eventBusy = new GenericEvent<number[]>()

    /**
     * Triggered when the list of displayed regions changed.
     * @see setVisible()
     * @see isVisible()
     */
    public readonly eventVisible = new GenericEvent<number[]>()

    private readonly visibleRegionStorage = new SessionStorageVariable<
        number[]
    >("AtlasService/visibleRegions", [], isNumberArray)

    private constructor(regions: CompressedRegion[]) {
        super()
        // Retrieve visible regions from session storage.
        for (const id of this.visibleRegionStorage.get()) {
            this.visibleRegions.add(id)
        }
        this.addToMaps(regions)
    }

    useBusyRegion(regionId: number): boolean {
        const [busy, setBusy] = React.useState(this.isBusy(regionId))
        React.useEffect(() => {
            const update = () => setBusy(this.isBusy(regionId))
            this.eventBusy.add(update)
            return () => this.eventBusy.remove(update)
        }, [this])
        return busy
    }

    isBusy(regionId: number): boolean {
        return this.busyRegions.has(regionId)
    }

    setBusy(regionId: number, busy: boolean) {
        const currentlyBusy = this.busyRegions.has(regionId)
        if (currentlyBusy === busy) return

        if (busy) this.busyRegions.add(regionId)
        else this.busyRegions.delete(regionId)
        this.eventBusy.trigger(Array.from(this.busyRegions.values()))
    }

    isVisible(regionId: number): boolean {
        return this.visibleRegions.has(regionId)
    }

    setVisible(regionId: number, visible: boolean) {
        const currentlyVisible = this.visibleRegions.has(regionId)
        if (currentlyVisible === visible) return

        if (visible) {
            this.visibleRegions.add(regionId)
        } else this.visibleRegions.delete(regionId)
        this.eventVisible.trigger(Array.from(this.visibleRegions.values()))
        this.visibleRegionStorage.set(Array.from(this.visibleRegions))
    }

    getVisibleRegions(): number[] {
        return Array.from(this.visibleRegions)
    }

    getRootRegions() {
        return [...this.root].sort(sortByName)
    }

    getAllRegions() {
        const fringe = this.getRootRegions()
        const regions: AtlasRegion[] = []
        while (fringe.length > 0) {
            const region = fringe.shift()
            if (!region) continue

            regions.push(region)
            fringe.push(...region.children)
        }
        return regions.sort(sortByName)
    }

    findRegionById(id: number): AtlasRegion | undefined {
        return this.regions.get(id)
    }

    findRegionByName(name: string): AtlasRegion | undefined {
        return this.regionsByName.get(name)
    }

    findRegionByAcronym(acronym: string): AtlasRegion | undefined {
        return this.regionsByAcronym.get(acronym)
    }

    private addToMaps(regions: CompressedRegion[], parent?: AtlasRegion) {
        // We prefer to choose an arbitrary root for our regions.
        // That's because we just need the brans regions, and not
        // anything related to "fiber tracts", "grooves", ...
        let preferredRootRegion: AtlasRegion | null = null
        for (const [id, acronym, name, color, children] of regions) {
            const region: AtlasRegion = {
                id,
                acronym,
                name,
                color,
                parent: parent?.id,
                children: [],
            }
            if (acronym === PREFERRED_ROOT_ACRONYM) {
                preferredRootRegion = region
                region.name = "Mouse Brain"
            }
            this.regions.set(region.id, region)
            this.regionsByName.set(region.name, region)
            this.regionsByAcronym.set(region.acronym, region)
            if (parent) {
                parent.children.push(region)
                parent.children.sort(sortByName)
            } else {
                this.root.push(region)
            }
            if (children) {
                this.addToMaps(children, region)
            }
        }
        if (preferredRootRegion)
            this.root.splice(0, this.root.length, preferredRootRegion)
    }

    triggerVisible() {
        this.eventVisible.trigger(this.getVisibleRegions())
    }
}

function sortByName(a: AtlasRegion, b: AtlasRegion): number {
    const nameA = a.name.toLowerCase()
    const nameB = b.name.toLowerCase()
    if (nameA < nameB) return -1
    if (nameA > nameB) return +1
    return 0
}
