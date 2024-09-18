import GenericEvent from "@/_old_/contract/tool/event"

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

export default abstract class AtlasServiceInterface {
    /**
     * Trigger event `eventVisible`.
     */
    abstract triggerVisible()

    abstract readonly eventBusy: GenericEvent<number[]>

    /**
     * Trigger a list of region Ids.
     */
    abstract readonly eventVisible: GenericEvent<number[]>

    abstract getAllRegions(): AtlasRegion[]

    abstract getVisibleRegions(): number[]

    abstract getRootRegions(): AtlasRegion[]

    abstract findRegionById(id: number): AtlasRegion | undefined

    abstract findRegionByName(name: string): AtlasRegion | undefined

    abstract findRegionByAcronym(acronym: string): AtlasRegion | undefined

    abstract useBusyRegion(regionId: number): boolean

    abstract isBusy(regionId: number): boolean

    abstract setBusy(regionId: number, busy: boolean): void

    abstract isVisible(regionId: number): boolean

    abstract setVisible(regionId: number, visible: boolean): void
}

export function ensureAtlasServiceInterface(
    data: unknown
): AtlasServiceInterface {
    if (data instanceof AtlasServiceInterface) return data

    console.error("Expected AtlasServiceInterface but got:", data)
    throw Error("Service is not of type AtlasServiceInterface!")
}
