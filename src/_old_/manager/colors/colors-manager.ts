import CircuitColorManager from "./circuit-colors"
import CircuitColorManagerInterface from "@/_old_/contract/manager/circuit-colors"
import CircuitInfoManagerInterface from "@/_old_/contract/manager/circuit-info-bbp"
import ColorManagerInterface from "@/_old_/contract/manager/colors"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import { ColorServiceInterface } from "@/_old_/contract/service/colors"
import { CircuitModel } from "../../contract/manager/models/types/circuit-model"
import SceneManagerInterface from "@/_old_/contract/manager/scene/scene-manager"

export default class ColorManager extends ColorManagerInterface {
    private readonly circuitColorManagersCache = new Map<
        number,
        CircuitColorManagerInterface
    >()

    constructor(
        private readonly imageStream: ImageStreamInterface,
        private readonly colorsService: ColorServiceInterface,
        private readonly circuitInfo: CircuitInfoManagerInterface
    ) {
        super()
    }

    async getCircuitColorManager(
        scene: SceneManagerInterface,
        circuit: CircuitModel
    ): Promise<CircuitColorManagerInterface> {
        const { circuitColorManagersCache } = this
        if (!circuitColorManagersCache.has(circuit.id)) {
            const { colorsService } = this
            const [modelId] = circuit.modelIds
            const colorSchemes =
                await colorsService.getAvailableColorSchemes(modelId)
            const getOptions = (name: string) =>
                colorSchemes.includes(name)
                    ? colorsService.getColorSchemeOptions(modelId, name)
                    : []
            const hasSimulationData = true
            const simulationColoringActive = false
            const manager = new CircuitColorManager(
                scene,
                circuit,
                colorsService,
                this.circuitInfo,
                this.imageStream,
                await getOptions("layer"),
                await getOptions("mtype"),
                await getOptions("etype"),
                await getOptions("morphology name"),
                await getOptions("morphology section"),
                hasSimulationData,
                simulationColoringActive
            )
            circuitColorManagersCache.set(circuit.id, manager)
        }
        return circuitColorManagersCache.get(
            circuit.id
        ) as CircuitColorManagerInterface
    }
}
