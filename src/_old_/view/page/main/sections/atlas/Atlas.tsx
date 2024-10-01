import React from "react"

import { ensureFileSaverInterface } from "@/_old_/contract/manager/file-saver"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import {
    AtlasRegion,
    ensureAtlasServiceInterface,
} from "@/_old_/contract/service/atlas"
import { ensureNexusInterface } from "@/_old_/contract/service/nexus"
import { useCancellableTaskHandler } from "@/_old_/tool/hooks/cancellable-task-handler"
import { useEventValue } from "@/_old_/tool/hooks/event"
import { useServiceLocator } from "@/_old_/tool/locator"
import { SessionStorageVariable } from "@/_old_/tool/storage"
import { isNumberArray } from "@/_old_/tool/validator"
import { useModal } from "@/_old_/ui/modal"
import Button from "@/_old_/ui/view/button/button-view"
import InputView from "@/_old_/ui/view/input/text"
import { useAskLoaderParamsForCircuitSonata } from "@/_old_/user-input/model-loader-params/model-loader-params"
import { colorToRGBA } from "@/_old_/util/colors"
import Region from "./region"

import Styles from "./Atlas.module.css"

/**
 * The last know file for the full brain with regions acronyms as nosesets.
 */
const FULL_BRAIN =
    "/gpfs/bbp.cscs.ch/project/proj3/cloned_circuits/FullBrainSoma/config.json"

export interface AtlasProps {
    className?: string
}

const expandedNodesStorage = new SessionStorageVariable<number[]>(
    "Atlas/expandedNodes",
    [],
    isNumberArray
)

export default function (props: AtlasProps) {
    const taskHandler = useCancellableTaskHandler()
    const askParams = useAskLoaderParamsForCircuitSonata()
    const { atlas, scene } = useServiceLocator({
        atlas: ensureAtlasServiceInterface,
        scene: ensureSceneManagerInterface,
    })
    const downloadMesh = useMeshDownloader()
    const [selectedRegion, setSelectedRegion] = React.useState<
        AtlasRegion | undefined
    >(undefined)
    const allRegions = React.useMemo(() => atlas.getAllRegions(), [atlas])
    const [expandedNodes, setExpandedNodes] = expandedNodesStorage.use()
    const [find, setFind] = React.useState("")
    const handleExpand = (id: number) => {
        setSelectedRegion(atlas.findRegionById(id))
        setExpandedNodes([...expandedNodes, id])
    }
    const handleCollapse = (id: number) => {
        setExpandedNodes(expandedNodes.filter((nodeId) => nodeId !== id))
    }
    const visibleRegions = useEventValue(atlas.eventVisible, [])
    const reveal = (targetRegion: AtlasRegion) => {
        let region: AtlasRegion | undefined = atlas.findRegionById(
            targetRegion.parent ?? -1
        )
        const selection: number[] = []
        while (region) {
            if (!region.parent) region = undefined
            else {
                selection.push(region.id)
                region = atlas.findRegionById(region.parent)
            }
        }
        setExpandedNodes(selection)
    }
    const load = async (targetRegion: AtlasRegion) => {
        const modelInputs = await askParams(FULL_BRAIN, {
            nodesets: [targetRegion.acronym],
        })
        if (!modelInputs) return

        for (const modelInput of modelInputs) {
            modelInput.colors.method = "solid"
            modelInput.colors.values = {
                color: colorToRGBA(`#${targetRegion.color}`),
            }
            modelInput.name = `${targetRegion.acronym} - ${targetRegion.name} (${targetRegion.id})`
            const model = await scene.models.circuit.load(
                modelInput,
                taskHandler
            )
            if (!model) return false

            await scene.focusOnModel(model.modelIds)
        }
    }
    const onFindClick = () => {
        const region =
            allRegions.find((region) => find === getRegionLabel(region)) ??
            allRegions.find((region) => region.acronym === find)
        setSelectedRegion(region)
    }

    return (
        <div className={getClassName(props)}>
            {atlas.getRootRegions().map((region) => (
                <Region
                    key={region.id}
                    services={{ atlas }}
                    value={region}
                    highlight={selectedRegion?.id ?? -1}
                    visibleRegions={visibleRegions}
                    expandedNodes={ensureRootIsAlwaysExpanded(expandedNodes)}
                    onCollapse={handleCollapse}
                    onExpand={handleExpand}
                />
            ))}
            <hr />
            <div>
                <InputView
                    wide={true}
                    label="Select a region and press entrer to reveal it in the tree"
                    value={find}
                    onChange={setFind}
                    suggestions={allRegions.map(getRegionLabel)}
                    onEnterPressed={onFindClick}
                />
                {selectedRegion && (
                    <>
                        <div
                            className={Styles.selectedRegion}
                            style={{
                                border: `.5em solid #${selectedRegion.color}`,
                            }}
                        >
                            <div>Region id:</div>
                            <div>{selectedRegion.id}</div>
                            <div>Name:</div>
                            <div>{selectedRegion.name}</div>
                            <div>Acronym:</div>
                            <div>{selectedRegion.acronym}</div>
                            <div>Color:</div>
                            <div>#{selectedRegion.color}</div>
                        </div>
                        <div className={Styles.selectedRegionActions}>
                            <Button
                                label="Download"
                                icon="export"
                                onClick={() =>
                                    void downloadMesh(selectedRegion)
                                }
                            />
                            <Button
                                label="Reveal"
                                icon="tree"
                                onClick={() => reveal(selectedRegion)}
                            />
                            <Button
                                label="Load"
                                icon="import"
                                onClick={() => void load(selectedRegion)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function getClassName({ className }: AtlasProps) {
    const classes = [Styles["Atlas"]]
    if (className) classes.push(className)
    return classes.join(" ")
}

function getRegionLabel(region: AtlasRegion) {
    return `${region.name} (${region.acronym})`
}

function useMeshDownloader() {
    const { nexus, fileSaver } = useServiceLocator({
        atlas: ensureAtlasServiceInterface,
        nexus: ensureNexusInterface,
        fileSaver: ensureFileSaverInterface,
    })
    const modal = useModal()
    return React.useCallback(
        async (region: AtlasRegion) => {
            const action = async () => {
                const regionId = region.id
                const meshContent = await nexus.loadMeshForRegion(regionId)
                const filename = `${region.acronym}.obj`
                fileSaver.saveText(meshContent, filename)
                await modal.info(
                    <div>
                        <b>
                            <code>{filename}</code>
                        </b>{" "}
                        ({Math.ceil(meshContent.length / 1024)} Kb) has been
                        saved in your <b>Download</b> folder.
                    </div>
                )
            }
            await modal.wait(
                <div>
                    Downloading{" "}
                    <b>
                        {region.name} ({region.acronym})
                    </b>
                    ...
                </div>,
                action()
            )
        },
        [modal, nexus, fileSaver]
    )
}

function ensureRootIsAlwaysExpanded(expandedNodes: number[]): number[] {
    const root = 8
    return expandedNodes.includes(root)
        ? expandedNodes
        : [root, ...expandedNodes]
}
