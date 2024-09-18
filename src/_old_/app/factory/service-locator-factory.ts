import config from "@/_old_/config"
import { isCollage } from "@/_old_/contract/feature/morphology-collage"
import BackendManagerInterface from "@/_old_/contract/manager/backend"
import ImageStreamInterface from "@/_old_/contract/manager/image-stream"
import ModelsManagerInterface from "@/_old_/contract/manager/models/models"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import ServiceLocatorInterface from "@/_old_/contract/service/locator"
import SessionStorageServiceInterface from "@/_old_/contract/service/storage/session-storage"
import CalcInterface from "@/_old_/contract/tool/calc"
import LoaderParamsFactory from "@/_old_/factory/loader-params/loader-params"
import MorphologyCollageFeature from "@/_old_/feature/morphology-collage/morphology-collage"
import SimpleMovieMakerFeature from "@/_old_/feature/simple-movie-maker/simple-movie-maker"
import PythonScriptMakerFeature from "@/_old_/feature/python-script-maker/python-script-maker"
import BackendManager from "@/_old_/manager/backend"
import CameraManager from "@/_old_/manager/camera"
import CircuitInfoManager from "@/_old_/manager/circuit-info-bbp"
import ColorManager from "@/_old_/manager/colors"
import FileSaver from "@/_old_/manager/file-saver"
import ImageStream from "@/_old_/manager/image-stream"
import LazySnapshotManager from "@/_old_/manager/lazy-snapshot"
import ModelsManager from "@/_old_/manager/models/models-manager"
import OverlayPainter from "@/_old_/manager/overlay-painter/overlay-painter"
import RemoteCommand from "@/_old_/manager/remote-command/remote-command"
import SceneManager from "@/_old_/manager/scene"
import ColorRampCanvasPainter from "@/_old_/painter/color-ramp/color-ramp"
import ScalebarCanvasPainter from "@/_old_/painter/scalebar/scalebar-manager"
import AtlasService from "@/_old_/service/atlas/atlas-service"
import BraynsApiService from "@/_old_/service/brayns-api/brayns-api-service"
import ColorService from "@/_old_/service/colors"
import FileSystemBrowsingService from "@/_old_/service/file-system"
import JsonRpcService from "@/_old_/service/json-rpc/json-rpc-service"
import Nexus from "@/_old_/service/nexus/nexus"
import SonataInfoService from "@/_old_/service/sonata-info/sonata-info"
import SessionStorageService from "@/_old_/storage/session"
import UserStorageService from "@/_old_/storage/user"
import Calc from "@/_old_/tool/calc"
import { makeEvent } from "@/_old_/tool/event"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import ServiceLocator from "@/_old_/tool/locator"
import { createUrl } from "@/_old_/tool/urls"
import { initializeRemoteCommand } from "./make/remote-command"

/**
 * @return `null` if the process has to be interrupted (for instance because of KeyCloak redirection).
 */
// 6eslint-disable-next-line max-statements
export async function makeServiceLocator(
    token: string,
    showProgress: (message: string) => void,
    backendUrl: URL,
    braynsInputUrl?: URL
): Promise<ServiceLocatorInterface | null> {
    showProgress("Allocating Backend Server")
    const calc = new Calc()
    const loaderParamsFactory = new LoaderParamsFactory()

    // Create Backend service
    const backend = await getBackendService(backendUrl, showProgress)
    const { sessionStorage: sessionStorage, userStorage: userStorage } =
        makeStorage(backend)

    // Create Brayns service
    const backendBaseBraynsUrl = createUrl({
        host: backendUrl.host,
        port: config.braynsPort,
        protocol: backendUrl.protocol,
    })
    const braynsUrl = braynsInputUrl ? braynsInputUrl : backendBaseBraynsUrl
    const brayns = await makeBrayns(braynsUrl, calc, showProgress)

    const models = new ModelsManager(
        brayns,
        sessionStorage,
        loaderParamsFactory,
        calc
    )
    const imageStream = new ImageStream(brayns, makeEvent)
    const colorService = new ColorService(brayns.jsonRpcService)
    const circuitInfoManager = new CircuitInfoManager(backend.service)
    const circuitColors = new ColorManager(
        imageStream,
        colorService,
        circuitInfoManager
    )
    const fileSystem = new FileSystemBrowsingService(backend)
    const scene = await getScene(
        brayns,
        models,
        sessionStorage,
        imageStream,
        calc
    )
    const lazySnapshot = new LazySnapshotManager(brayns, makeEvent)
    const scalebarPainter = new ScalebarCanvasPainter()
    const morphologyCollage = new MorphologyCollageFeature(calc, userStorage)
    const atlas = await AtlasService.load()
    const nexus = new Nexus(token, atlas)
    const movieMakerSimple = new SimpleMovieMakerFeature(
        brayns,
        scene,
        fileSystem,
        calc,
        loaderParamsFactory,
        atlas,
        nexus
    )
    const pythonScriptMaker = new PythonScriptMakerFeature(
        brayns,
        scene,
        fileSystem,
        calc,
        loaderParamsFactory,
        atlas,
        nexus
    )
    const sonataInfoService = new SonataInfoService(backend.service)
    const locator: ServiceLocatorInterface = new ServiceLocator({
        atlas,
        backend,
        brayns,
        calc,
        circuitColors,
        circuitInfoBbp: new CircuitInfoManager(backend.service),
        colorrampPainter: new ColorRampCanvasPainter(),
        fileSaver: new FileSaver(),
        fileSystem,
        lazySnapshot,
        loaderParamsFactory,
        models,
        morphologyCollage,
        movieMakerSimple,
        nexus,
        overlayPainter: new OverlayPainter(atlas, nexus, scene, calc),
        pythonScriptMaker,
        refresh: imageStream.askForNextFrame,
        remoteCommandServer: new RemoteCommand("BCS"),
        scalebarPainter,
        scene,
        sonataInfoService,
        storageCollage: userStorage.makeTable(
            "collage",
            inflexibleConverter(isCollage)
        ),
        sessionStorage: sessionStorage,
        userStorage: userStorage,
    })
    initializeRemoteCommand(locator)
    return locator
}

function makeStorage(backend: BackendManagerInterface) {
    return {
        userStorage: new UserStorageService(backend),
        sessionStorage: new SessionStorageService(backend),
    }
}

function cleanBraynsUrl(dirtyUrl: URL): URL {
    if (!dirtyUrl.port) {
        dirtyUrl.port = config.braynsPort
    }
    if (!dirtyUrl.protocol) {
        dirtyUrl.protocol = config.braynsProtocol
    }
    return dirtyUrl
}

async function makeBrayns(
    braynsInputUrl: URL,
    calc: CalcInterface,
    showProgress: (msg: string) => void
) {
    try {
        showProgress("Starting Brayns")
        const braynsUrl = cleanBraynsUrl(braynsInputUrl)

        showProgress(`Connecting Brayns at ${braynsUrl.toString()}`)
        const braynsService = new JsonRpcService(braynsUrl, makeEvent)
        await braynsService.connect()
        console.log("Brayns is connected!")
        const brayns = new BraynsApiService(braynsService, calc, makeEvent)
        await brayns.renderer.set({
            type: "interactive",
            ambientOcclusionSamples: 4,
            enableShadows: false,
            maxRayBounces: 0,
            samplesPerPixel: 2,
        })
        return brayns
    } catch (ex) {
        console.error("Unable to connect to Brayns:", ex)
        console.log("URL:", braynsInputUrl)
        throw ex
    }
}

async function getScene(
    brayns: BraynsApiServiceInterface,
    models: ModelsManagerInterface,
    sessionStorage: SessionStorageServiceInterface,
    imageStream: ImageStreamInterface,
    calc: CalcInterface
) {
    const camera = new CameraManager(brayns, calc, imageStream, makeEvent)
    await camera.initialize()
    const scene = new SceneManager(
        brayns,
        models,
        sessionStorage,
        camera,
        imageStream,
        calc,
        makeEvent
    )
    await scene.initialize()
    return scene
}

function cleanBackendUrl(dirtyUrl: URL) {
    if (!dirtyUrl.port) {
        dirtyUrl.port = config.backendPort
    }
    if (!dirtyUrl.protocol) {
        dirtyUrl.protocol = config.backendProtocol
    }
    return dirtyUrl
}

async function getBackendService(
    backendInputUrl: URL,
    showProgress: (msg: string) => void
) {
    const backendUrl = cleanBackendUrl(backendInputUrl)

    showProgress(`Initializing Backend Server at ${backendUrl.toString()}`)
    const backend = new BackendManager(backendUrl, makeEvent)
    await backend.connect()
    console.log("Backend connected!")
    return backend
}
