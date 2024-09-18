import LoaderParamsFactoryInterface from "@/_old_/contract/factory/loader-params"
import ModelsManagerInterface, {
    isCellPlacementModel,
} from "@/_old_/contract/manager/models"
import { CircuitListInterface } from "@/_old_/contract/manager/models/types/circuit-list"
import { isCircuitModel } from "@/_old_/contract/manager/models/types/circuit-model"
import { MeshListInterface } from "@/_old_/contract/manager/models/types/mesh-list"
import { isMeshModel } from "@/_old_/contract/manager/models/types/mesh-model"
import { MorphologyListInterface } from "@/_old_/contract/manager/models/types/morphology-list"
import { isMorphologyModel } from "@/_old_/contract/manager/models/types/morphology-model"
import { VolumeListInterface } from "@/_old_/contract/manager/models/types/volume-list"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isVolumeModel } from "../../contract/manager/models/types/volume-model"
import CalcInterface from "../../contract/tool/calc"
import CircuitList from "./model-list/circuit"
import MeshList from "./model-list/mesh"
import MorphologyList from "./model-list/morphology"
import VolumeList from "./model-list/volume"
import { CellPlacementListInterface } from "../../contract/manager/models/types/cell-placement-list"
import CellPlacementList from "./model-list/cell-placement"

export default class ModelsManager implements ModelsManagerInterface {
    public readonly cellPlacement: CellPlacementListInterface
    public readonly circuit: CircuitListInterface
    public readonly mesh: MeshListInterface
    public readonly morphology: MorphologyListInterface
    public readonly volume: VolumeListInterface

    constructor(
        brayns: BraynsApiServiceInterface,
        sessionService: SessionStorageServiceInterface,
        loaderParamsFactory: LoaderParamsFactoryInterface,
        calc: CalcInterface
    ) {
        this.cellPlacement = new CellPlacementList(
            brayns,
            sessionService.makeTable(
                "models-manager/cell-placement-list",
                inflexibleConverter(isCellPlacementModel)
            ),
            loaderParamsFactory,
            calc
        )
        this.circuit = new CircuitList(
            brayns,
            sessionService.makeTable(
                "models-manager/circuit-list",
                inflexibleConverter(isCircuitModel)
            ),
            loaderParamsFactory,
            calc
        )
        this.mesh = new MeshList(
            brayns,
            sessionService.makeTable(
                "models-manager/mesh-list",
                inflexibleConverter(isMeshModel)
            ),
            loaderParamsFactory
        )
        this.morphology = new MorphologyList(
            brayns,
            sessionService.makeTable(
                "models-manager/morphology-list",
                inflexibleConverter(isMorphologyModel)
            ),
            loaderParamsFactory
        )
        this.volume = new VolumeList(
            brayns,
            sessionService.makeTable(
                "models-manager/volume-list",
                inflexibleConverter(isVolumeModel)
            ),
            loaderParamsFactory
        )
    }
}
