import * as React from "react"
import Button from "@/_old_/ui/view/button"
import CameraModuleInterface from "@/_old_/contract/manager/camera"
import ClippingPlanesRemovalButton from "./clipping-planes-removal-button"
import CollageButton from "./collage-button"
import Flex from "@/_old_/ui/view/flex"
import { half } from "@/_old_/constants"
import { SlicingPageProps } from "./types"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./slicing-page.css"
import {
    ensureTableStorageInterface,
    TableStorageInterface,
} from "@/_old_/contract/storage/table"
import SceneManagerInterface, {
    ensureSceneManagerInterface,
} from "@/_old_/contract/manager/scene"
import CalcInterface, {
    BoundingBox,
    ensureCalcInterface,
    Vector3,
} from "@/_old_/contract/tool/calc"
import MorphologyCollageFeatureInterface, {
    SlicesBezierCurveControlPoint,
    SlicesBezierCurve,
    Collage,
    ensureMorphologyCollageFeatureInterface,
} from "@/_old_/contract/feature/morphology-collage"
import HelpButton from "@/_old_/view/help-button"

/**
 * Page displaying the list of static slices.
 */
export default function SlicingPage(props: SlicingPageProps) {
    const { calc, storageCollage, morphologyCollage, scene } =
        useServiceLocator({
            calc: ensureCalcInterface,
            storageCollage: ensureTableStorageInterface<Collage>,
            morphologyCollage: ensureMorphologyCollageFeatureInterface,
            scene: ensureSceneManagerInterface,
        })
    const collages = storageCollage.useItems()
    const clippingPlanes = scene.clippingPlanes.useClippingPlanes()
    const handleCreateCollage = makeCreateCollageHandler(
        morphologyCollage,
        scene,
        calc,
        storageCollage,
        props
    )
    const handleCollageDelete = (collage: Collage) => {
        void storageCollage.remove(collage.id)
    }
    const handleCollageUpdate = (collage: Collage) => {
        void storageCollage.store(collage)
    }
    return (
        <div className={getClassNames(props)}>
            <ClippingPlanesRemovalButton
                planesCount={clippingPlanes.length}
                scene={scene}
            />
            <h1>Slices set</h1>
            <Flex justifyContent="space-around">
                <Button
                    icon="add"
                    label="Create"
                    onClick={() => void handleCreateCollage()}
                />
                <Button
                    icon="import"
                    label="Load"
                    onClick={() => props.onLoadSlices()}
                />
            </Flex>
            <div className="static-slices">
                {collages.map((collage) => (
                    <CollageButton
                        key={collage.id}
                        value={collage}
                        onEditClick={props.onEditSlices}
                        onViewClick={props.onViewSlices}
                        onCollageDelete={handleCollageDelete}
                        onCollageUpdate={handleCollageUpdate}
                    />
                ))}
            </div>
            <hr />
            <Flex justifyContent="space-around">
                <HelpButton label="Help" topic="slices" />
            </Flex>
        </div>
    )
}

function makeCreateCollageHandler(
    morphologyCollage: MorphologyCollageFeatureInterface,
    scene: SceneManagerInterface,
    calc: CalcInterface,
    storageCollage: TableStorageInterface<Collage>,
    props: SlicingPageProps
) {
    return async () => {
        const collage = await makeCollage(morphologyCollage, scene, calc)
        const collageWithId = await storageCollage.store(collage)
        collageWithId.name = `Collage #${collageWithId.id}`
        await storageCollage.store(collageWithId)
        props.onEditSlices(collageWithId)
    }
}

function getClassNames(props: SlicingPageProps): string {
    const classNames = ["custom", "view-page-SlicingPage"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

async function makeCollage(
    morphologyCollage: MorphologyCollageFeatureInterface,
    scene: SceneManagerInterface,
    calc: CalcInterface
): Promise<Collage> {
    const bounds: BoundingBox = await getBounds(scene, calc)
    const bezierCurve: SlicesBezierCurve = {
        slicesCount: 12,
        ...makeEdgeSlicesFromBounds(bounds, calc),
    }
    return {
        id: 0,
        name: "Collage",
        slices: morphologyCollage.computeSlicesFromBezierCurve(bezierCurve),
        bezierCurve,
    }
}

/**
 * Get the bounding box of the last loaded Circuit.
 * If nothing is loaded yet, create a bounding box from where
 * the camera is heading.
 */
async function getBounds(
    scene: SceneManagerInterface,
    calc: CalcInterface
): Promise<BoundingBox> {
    const circuitIds = await scene.models.circuit.getIds()
    const [circuitId] = circuitIds
    if (!circuitId) return makeBoundsFromCamera(scene.camera, calc)

    const circuit = await scene.models.circuit.get(circuitId)
    return circuit?.boundingBox ?? makeBoundsFromCamera(scene.camera, calc)
}

function makeBoundsFromCamera(
    camera: CameraModuleInterface,
    calc: CalcInterface
): BoundingBox {
    const radius = half(camera.getHeightAtTarget())
    return {
        min: calc.addVectors(camera.params.target, [-radius, -radius, -radius]),
        max: calc.addVectors(camera.params.target, [+radius, +radius, +radius]),
    }
}

function makeEdgeSlicesFromBounds(
    bounds: BoundingBox,
    calc: CalcInterface
): Omit<SlicesBezierCurve, "cameraManager" | "slicesCount"> {
    const size = calc.subVectors(bounds.max, bounds.min)
    return makeEdgeSlicesForAxisY(bounds, size, calc)
    // const [sizeX, sizeY, sizeZ] = size
    // if (sizeX > sizeY) {
    //     // SizeX > SizeY
    //     if (sizeX > sizeZ)
    //         return makeEdgeSlicesForAxisX(bounds, size, calc)
    //     makeEdgeSlicesForAxisZ(bounds, size, calc)
    // } else {
    //     // SizeY > SizeX
    //     if (sizeY > sizeZ)
    //         return makeEdgeSlicesForAxisY(bounds, size, calc)
    //     makeEdgeSlicesForAxisZ(bounds, size, calc)
    // }
}

function _makeEdgeSlicesForAxisX(
    bounds: BoundingBox,
    size: Vector3,
    calc: CalcInterface
): Omit<SlicesBezierCurve, "cameraManager" | "slicesCount"> {
    const center = calc.computeBoundingBoxCenter(bounds)
    const [sizeX, sizeY, sizeZ] = size
    const width = sizeZ
    const height = sizeY
    const pointA: SlicesBezierCurveControlPoint = {
        center: calc.addVectors(center, [+half(sizeX), 0, 0]),
        handleLength: half(half(sizeX)),
        orientation: calc.getQuaternionFromAxis({
            z: [1, 0, 0],
            x: [0, 1, 0],
            y: [0, 0, 1],
        }),
        type: "start",
    }
    const pointB: SlicesBezierCurveControlPoint = {
        center: calc.addVectors(center, [-half(sizeX), 0, 0]),
        handleLength: half(half(sizeX)),
        orientation: calc.getQuaternionFromAxis({
            z: [1, 0, 0],
            x: [0, 1, 0],
            y: [0, 0, 1],
        }),
        type: "end",
    }
    return {
        width,
        height,
        depthScale: 1,
        pointStart: pointA,
        pointEnd: pointB,
    }
}

function makeEdgeSlicesForAxisY(
    bounds: BoundingBox,
    size: Vector3,
    calc: CalcInterface
): Omit<SlicesBezierCurve, "cameraManager" | "slicesCount"> {
    const center = calc.computeBoundingBoxCenter(bounds)
    const [sizeX, sizeY, sizeZ] = size
    const width = sizeZ
    const height = sizeY
    const pointA: SlicesBezierCurveControlPoint = {
        center: calc.addVectors(center, [0, +half(sizeX), 0]),
        handleLength: half(half(sizeX)),
        orientation: calc.getQuaternionFromAxis({
            y: [1, 0, 0],
            z: [0, 1, 0],
            x: [0, 0, 1],
        }),
        type: "start",
    }
    const pointB: SlicesBezierCurveControlPoint = {
        center: calc.addVectors(center, [0, -half(sizeX), 0]),
        handleLength: half(half(sizeX)),
        orientation: calc.getQuaternionFromAxis({
            y: [1, 0, 0],
            z: [0, 1, 0],
            x: [0, 0, 1],
        }),
        type: "end",
    }
    return {
        width,
        height,
        depthScale: 1,
        pointStart: pointA,
        pointEnd: pointB,
    }
}
