import { CircuitModel } from "./models/types/circuit-model"
import CircuitColorManagerInterface from "./circuit-colors"
import SceneManagerInterface from "./scene"
export { default as CircuitColorManagerInterface } from "./circuit-colors"

export function ensureColorManagerInterface(
    data: unknown
): ColorManagerInterface {
    if (data instanceof ColorManagerInterface) return data

    console.error("Expected SceneManagerInterface but got:", data)
    throw Error("Service is not of type ColorManagerInterface!")
}

/**
 * This manager deals with all the logic about colors.
 * It does not use any Brayns entrypoint directly, but rather
 * use the ColorServiceInterface for this.
 */
export default abstract class ColorManagerInterface {
    /**
     * Dependeing on the model type, they are different ways of applying colors
     * on it. For circuits, this is managed by an instance of
     * `CircuitColorManagerInterface`.
     * @throws If the model with id equal to `circuitId` is not a circuit.
     * @see CircuitColorManagerInterface
     */
    abstract getCircuitColorManager(
        scene: SceneManagerInterface,
        circuit: CircuitModel
    ): Promise<CircuitColorManagerInterface>
}
