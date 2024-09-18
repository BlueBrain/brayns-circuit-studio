import { ensureSonataInfoServiceInterface } from "@/_old_/contract/service/sonata-info"
import { assertString } from "@/_old_/tool/validator"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import { assertObject } from "@/_old_/tool/validator"

interface LoadCircuitParams {
    path: string
}

export function makeLoadCircuit(locator: ServiceLocatorInterface) {
    return async (params: unknown) => {
        assertLoadCircuitParams(params)
        const sonataInfoService = locator.get(
            "sonataInfoService",
            ensureSonataInfoServiceInterface
        )
        const info = await sonataInfoService.getInfo(params.path)
        const [population] = info.populations
        if (!population) return -1

        const scene = locator.get("scene", ensureSceneManagerInterface)
        const circuit = await scene.models.circuit.load(
            {
                path: params.path,
                population,
            },
            () => {
                // In the future, we will send progress to the parent.
            }
        )
        if (!circuit) return -1

        void scene.focusOnModel(circuit.modelIds)
        return `circ/${circuit.id}`
    }
}

function assertLoadCircuitParams(
    data: unknown
): asserts data is LoadCircuitParams {
    assertObject(data)
    const { path } = data
    assertString(path, `data.path`)
}
