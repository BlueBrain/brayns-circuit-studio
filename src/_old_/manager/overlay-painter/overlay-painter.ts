import { PainterGhost } from "./PainterGhost/PainterGhost"
import React from "react"

import CameraModuleInterface from "@/_old_/contract/manager/camera"
import AtlasServiceInterface, {
    AtlasRegion,
} from "@/_old_/contract/service/atlas"
import NexusInterface from "@/_old_/contract/service/nexus"
import CalcInterface from "@/_old_/contract/tool/calc"
import State from "@/_old_/state"
// import { useServiceLocator } from "@/tool/locator"
import OverlayPainterInterface, {
    ensureOverlayPainterInterface,
} from "../../contract/manager/overlay-painter"
import SceneManagerInterface from "../../contract/manager/scene/scene-manager"
import {
    TgdCameraOrthographic,
    TgdContext,
    TgdDataset,
    TgdGeometry,
    tgdLoadArrayBuffer,
    tgdLoadGlb,
    TgdPainterClear,
    TgdPainterGroup,
    TgdVec4,
} from "@tolokoban/tgd"
import { colorToRGBA } from "@/_old_/util/colors"
import { useServiceLocator } from "@/_old_/tool/locator"
import { debounce, squash } from "@/_old_/tool/async"

export default class OverlayPainter extends OverlayPainterInterface {
    private context: TgdContext | null = null
    private readonly regionsPainterGroup = new TgdPainterGroup()
    private readonly braynsCamera: CameraModuleInterface
    /**
     * Key: Region id.
     * Val: PainterGhost.
     */
    private readonly currentlyVisiblePainters = new Map<number, PainterGhost>()
    /**
     * Attached canvas is refreshed as soon as the camera moves, a meshes is added
     * or removed from the scene, and if its size changes.
     * There can be only one attached canvas at a time.
     */
    private canvas: HTMLCanvasElement | null = null

    static useOverlayCanvasRef() {
        const refOverlay = React.useRef<null | HTMLCanvasElement>(null)
        const { overlayPainter } = useServiceLocator({
            overlayPainter: ensureOverlayPainterInterface,
        })
        React.useEffect(() => {
            const canvas = refOverlay.current
            if (!canvas) return

            overlayPainter.attach(canvas)
            return () => {
                overlayPainter.detach()
            }
        }, [refOverlay.current])
        return refOverlay
    }

    constructor(
        private readonly atlas: AtlasServiceInterface,
        private readonly nexus: NexusInterface,
        scene: SceneManagerInterface,
        private readonly calc: CalcInterface
    ) {
        super()
        this.braynsCamera = scene.camera
        // this.observer = new ResizeObserver(() => {
        //     const { canvas } = this
        //     if (canvas) {
        //         canvas.width = canvas.clientWidth
        //         canvas.height = canvas.clientHeight
        //     }
        //     this.updatePainterCamera()
        // })
    }

    async snapshot(
        width: number,
        height: number,
        _braynsCamera?: CameraModuleInterface
    ): Promise<HTMLImageElement> {
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const img = new Image()
        img.src = canvas.toDataURL()
        return new Promise((resolve) => {
            img.onload = () => resolve(img)
        })
        // const savedCanvas = this.canvas
        // this.attach(canvas)
        // const { painter } = this
        // const meshes = this.getMeshesForRegionIds(
        //     this.atlas.getVisibleRegions()
        // )
        // painter.setMeshes(meshes)
        // painter.setCamera(braynsCamera ?? this.braynsCamera)
        // painter.paint()
        // if (savedCanvas) this.attach(savedCanvas)
        // else this.detach()
        // return painter.snapshot()
    }

    attach(canvas: HTMLCanvasElement) {
        this.detach()

        console.log("Attaching", canvas)
        this.canvas = canvas
        const ctx = new TgdContext(canvas, {
            camera: new TgdCameraOrthographic({
                near: 1,
                far: 1e6,
            }),
        })
        this.context = ctx
        ctx.add(
            new TgdPainterClear(ctx, { color: [0, 0, 0, 0] }),
            this.regionsPainterGroup
        )
        this.handleVisibleRegionsChange(this.atlas.getVisibleRegions())
        State.overlay.meshes.opacity.addListener(this.handleOpacityChange)
        State.overlay.meshes.brightness.addListener(this.handleBrightnessChange)
        State.overlay.meshes.thickness.addListener(this.handleThicknessChange)
        this.atlas.eventVisible.add(this.handleVisibleRegionsChange)
        this.braynsCamera.eventChange.add(this.updatePainterCamera)
        this.updatePainterCamera()
    }

    detach() {
        const { canvas } = this
        if (!canvas) return

        this.canvas = null
        // if (canvas) this.observer.unobserve(canvas)

        if (this.context) {
            this.regionsPainterGroup.removeAll()
            this.context.destroy()
            this.context = null
        }
        this.atlas.eventVisible.remove(this.handleVisibleRegionsChange)
        // this.braynsCamera.eventChange.remove(this.updatePainterCamera)
        State.overlay.meshes.opacity.removeListener(this.handleOpacityChange)
        State.overlay.meshes.brightness.removeListener(
            this.handleBrightnessChange
        )
        State.overlay.meshes.thickness.removeListener(
            this.handleThicknessChange
        )
    }

    private readonly loadMesh = async (
        regionId: number
    ): Promise<TgdGeometry> => {
        const url = `atlas/${regionId}.glb`
        console.log("Loading", url)
        const asset = await tgdLoadGlb(url)
        if (!asset) {
            throw Error(`Unable to load mesh from: ${url}!`)
        }
        return asset.makeGeometry({ computeNormals: true })
    }

    private readonly updatePainterCamera = () => {
        const { context, braynsCamera } = this
        if (!context) return

        const { camera } = context
        camera.spaceHeightAtTarget = braynsCamera.getHeightAtTarget()
        camera.setOrientation(...braynsCamera.params.orientation)
        camera.target.set(braynsCamera.params.target)
        context.paint()
    }

    private readonly handleVisibleRegionsChange = squash(
        async (regionIds: number[]) => {
            const { currentlyVisiblePainters, context } = this

            if (!context) {
                console.log("No context!")
                return
            }

            void this.debug()
            const regionIdsToRemove: number[] = []
            currentlyVisiblePainters.forEach((painter, regionId) => {
                if (regionIds.includes(regionId)) {
                    console.log("Remove painter:", regionId, painter)
                    this.regionsPainterGroup.remove(painter)
                    regionIdsToRemove.push(regionId)
                }
            })
            context.paint()
            regionIdsToRemove.forEach((regionId) =>
                currentlyVisiblePainters.delete(regionId)
            )
            const meshes = this.getMeshesForRegionIds(regionIds)
            for (const mesh of meshes) {
                const { region } = mesh
                if (!currentlyVisiblePainters.has(region.id)) {
                    try {
                        const geometry = await this.loadMesh(region.id)
                        const painter = new PainterGhost(context, {
                            name: `${mesh.id} - ${mesh.region.acronym}`,
                            geometry,
                            color: new TgdVec4(...mesh.color),
                        })
                        currentlyVisiblePainters.set(region.id, painter)
                        this.regionsPainterGroup.add(painter)
                        context.paint()
                    } catch (ex) {
                        console.error(`Unable to load region ${region.id}:`, ex)
                    }
                }
            }
            this.updatePainterCamera()
            context.paint()
        }
    )

    private readonly debug = debounce(() => {
        console.log(
            JSON.stringify(
                this.regionsPainterGroup.debugHierarchy(),
                null,
                "  "
            )
        )
    }, 1000)

    private readonly handleOpacityChange = (_opacity: number) => {}

    private readonly handleBrightnessChange = (_brightness: number) => {}

    private readonly handleThicknessChange = (_thickness: number) => {}

    private getMeshesForRegionIds(regionIds: number[]) {
        const regions: AtlasRegion[] = regionIds
            .map((id) => this.atlas.findRegionById(id))
            .filter(Boolean) as AtlasRegion[]
        let maxLevel = 0
        const meshes = regions.map((region) => {
            const mesh = this.getMeshForRegion(region)
            console.log(">", mesh.region.name)
            let level = 0
            let parent = region.parent
            while (parent) {
                const region = this.atlas.findRegionById(parent)
                if (!region) break

                console.log("    parent: ", region.name)
                if (this.atlas.isVisible(region.id)) {
                    level++
                    maxLevel = Math.max(maxLevel, level)
                }
                parent = region.parent
            }
            // mesh.color[3] = level
            return mesh
        })
        const minOpacity = 0.3
        // meshes.forEach((mesh) => {
        //     const level = maxLevel > 0 ? mesh.color[3] / maxLevel : 1
        //     const opacity = level * level
        //     mesh.color[3] = minOpacity + (1 - minOpacity) * opacity
        // })
        return meshes
    }

    private getMeshForRegion(region: AtlasRegion): AtlasMesh {
        const { id, color } = region
        const mesh: AtlasMesh = {
            id: `${id}`,
            region,
            color: colorToRGBA(`#${color}`),
        }
        return mesh
    }
}

interface AtlasMesh {
    // extends AtlasMeshOptions {
    id: string
    region: AtlasRegion
    color: [red: number, green: number, blue: number, alpha: number]
}
