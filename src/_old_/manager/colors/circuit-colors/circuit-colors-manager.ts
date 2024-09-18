import CircuitInfoManagerInterface from "@/_old_/contract/manager/circuit-info-bbp"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import {
    ColorByGIDs,
    ColorServiceInterface,
} from "@/_old_/contract/service/colors"
import { optimizeRange } from "../../scene/tools"
import CircuitColorManagerInterface, {
    ColorRGBA,
    ColorGradient,
} from "@/_old_/contract/manager/circuit-colors"
import { CircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import SceneManagerInterface from "@/_old_/contract/manager/scene/scene-manager"

export default class CircuitcolorManager
    implements CircuitColorManagerInterface
{
    private _simulationColoringActive = false
    private readonly _cacheForGIDs = new Map<string, number[]>()
    private _cacheForTargets: string[] | null = null
    public readonly canApplyColorFromSimulation: boolean

    constructor(
        private readonly scene: SceneManagerInterface,
        private readonly circuit: CircuitModel,
        private readonly service: ColorServiceInterface,
        private readonly circuitInfo: CircuitInfoManagerInterface,
        private readonly imageStream: ImageStreamInterface,
        public readonly colorableLayers: string[],
        public readonly colorableMorphologyTypes: string[],
        public readonly colorableElectricalTypes: string[],
        public readonly colorableMorphologyNames: string[],
        public readonly colorableMorphologySections: string[],
        hasSimulationData: boolean,
        simulationColoringActive: boolean
    ) {
        this.canApplyColorFromSimulation = hasSimulationData
        this._simulationColoringActive =
            simulationColoringActive && hasSimulationData
    }

    async listTargets(): Promise<string[]> {
        if (this._cacheForTargets) return this._cacheForTargets

        this._cacheForTargets = await this.circuitInfo.getTargets(
            this.circuit.path
        )
        this._cacheForTargets.sort()
        return this._cacheForTargets
    }

    async listGIDs(): Promise<number[]> {
        const gidsFromCache = this._cacheForGIDs.get("")
        if (gidsFromCache) return gidsFromCache

        const gids = await this.circuitInfo.getGIDs(this.circuit.path)
        gids.sort((a, b) => a - b)
        this._cacheForGIDs.set("", gids)
        return gids
    }

    async listGIDsForTarget(target: string): Promise<number[]> {
        const gidsFromCache = this._cacheForGIDs.get(target)
        if (gidsFromCache) return gidsFromCache

        const gids = await this.circuitInfo.getGIDs(this.circuit.path, [target])
        gids.sort((a, b) => a - b)
        this._cacheForGIDs.set(target, gids)
        return gids
    }

    async getColorRamp(): Promise<{
        gradient: ColorGradient
        range: [min: number, max: number]
    }> {
        return await this.service.getGradient(this.modelId)
    }

    get isSimulationColoringActive(): boolean {
        return this._simulationColoringActive
    }

    async applySingleColor(color: ColorRGBA): Promise<void> {
        await this.service.applyUniqueColor(this.modelId, color)
    }

    async applyColorFromSimulation(
        gradient: ColorGradient,
        minRange: number,
        maxRange: number
    ): Promise<boolean> {
        if (!this.canApplyColorFromSimulation) return false

        await this.service.setGradient(
            this.modelId,
            gradient,
            minRange,
            maxRange
        )
        this._simulationColoringActive = true
        await this.imageStream.askForNextFrame()
        return true
    }

    async applyColorByGIDs(
        colors: ColorByGIDs[],
        setProgress?: (percent: number) => void
    ): Promise<boolean> {
        await this.imageStream.transaction(async () => {
            await this.service.applyColorToCells(
                this.modelId,
                optimizeColorsForSpace(colors),
                setProgress
            )
        })
        return true
    }

    async applyColorByLayers(colors: {
        [layer: string]: ColorRGBA
    }): Promise<boolean> {
        if (!isSubsetOf(Object.keys(colors), this.colorableLayers)) return false

        await this.applyScheme("layer", colors)
        return true
    }

    async applyColorByMorphologyTypes(colors: {
        [morphologyType: string]: ColorRGBA
    }): Promise<boolean> {
        if (!isSubsetOf(Object.keys(colors), this.colorableMorphologyTypes))
            return false

        await this.applyScheme("mtype", colors)
        return true
    }

    async applyColorByElectricalTypes(colors: {
        [electricalType: string]: ColorRGBA
    }): Promise<boolean> {
        if (!isSubsetOf(Object.keys(colors), this.colorableElectricalTypes))
            return false

        await this.applyScheme("etype", colors)
        return true
    }

    async applyColorByMorphologyNames(colors: {
        [morphologyName: string]: ColorRGBA
    }): Promise<boolean> {
        if (!isSubsetOf(Object.keys(colors), this.colorableMorphologyNames))
            return false

        await this.applyScheme("morphology name", colors)
        return true
    }

    async applyColorByMorphologySections(colors: {
        [morphologySection: string]: ColorRGBA
    }): Promise<boolean> {
        if (!isSubsetOf(Object.keys(colors), this.colorableMorphologySections))
            return false

        await this.applyScheme("morphology section", colors)
        return true
    }

    private get modelId() {
        return this.circuit.modelIds[0]
    }

    private async applyScheme(
        method: string,
        values: { [name: string]: ColorRGBA }
    ) {
        await this.scene.models.circuit.updateColor(this.circuit.id, {
            method,
            values,
        })
        // await this.service.applyColorScheme(this.modelId, schemeName, colors)
        await this.imageStream.askForNextFrame()
    }
}

/**
 * @returns `true` is all elements of `items` is also element of `referenceList`.
 */
function isSubsetOf(items: string[], referenceList: string[]): boolean {
    for (const item of items) {
        if (!referenceList.includes(item)) return false
    }
    return true
}

function optimizeColorsForSpace(colors: ColorByGIDs[]): ColorByGIDs[] {
    return colors.map((color) => {
        const [rangeDefinition] = color.rangeDefinition.split("|")
        return {
            color: color.color,
            rangeDefinition: optimizeRange(rangeDefinition),
        }
    })
}
