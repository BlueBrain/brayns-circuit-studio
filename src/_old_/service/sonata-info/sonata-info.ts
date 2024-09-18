import JsonRpcServiceInterface from "@/_old_/contract/service/json-rpc"
import SonataInfoServiceInterface, {
    Edge,
    Population,
    Report,
} from "@/_old_/contract/service/sonata-info"
import { assertType } from "@/_old_/tool/validator"

export default class SonataInfoService extends SonataInfoServiceInterface {
    constructor(private readonly backend: JsonRpcServiceInterface) {
        super()
    }

    async getInfo(path: string): Promise<{
        populations: Population[]
        reports: Report[]
        edges: Edge[]
    }> {
        const data = await this.backend.exec("sonata-list-populations", {
            path,
        })
        assertListPopulationResult(data)
        return data
    }
}

interface ListPopulationResult {
    populations: Population[]
    reports: Report[]
    edges: Edge[]
}

function assertListPopulationResult(
    data: unknown
): asserts data is ListPopulationResult {
    assertType(data, {
        populations: [
            "array",
            {
                name: "string",
                type: "string",
            },
        ],
        reports: [
            "array",
            {
                name: "string",
                type: "string",
                start: "number",
                end: "number",
                unit: "string",
                cells: "string",
            },
        ],
        edges: [
            "array",
            {
                name: "string",
                size: "number",
                source: "string",
                target: "string",
            },
        ],
    })
}
