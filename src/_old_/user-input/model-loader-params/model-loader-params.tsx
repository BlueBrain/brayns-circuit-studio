import {
    CellPlacementModel,
    CircuitModelBbp,
    CircuitModelSonata,
    VolumeModel,
} from "@/_old_/contract/manager/models"
import { useModal } from "@/_old_/ui/modal"
import React from "react"
import BbpParams from "./bbp-params"
import SonataParams from "./sonata-params"
import VolumeParams from "./volume-params"
import CellPlacementParams from "./cell-placement-params"

export function useAskLoaderParamsForVolume(): (
    path: string
) => Promise<VolumeModel | null> {
    const modal = useModal()
    return React.useCallback(
        (path: string) =>
            new Promise((resolve) => {
                const hide = modal.show({
                    autoClosable: true,
                    onClose: () => resolve(null),
                    content: (
                        <VolumeParams
                            path={path}
                            onCancel={() => {
                                hide()
                                resolve(null)
                            }}
                            onOK={(value) => {
                                hide()
                                resolve(value)
                            }}
                        />
                    ),
                })
            }),
        [modal]
    )
}

export function useAskLoaderParamsForCircuitSonata(): (
    path: string,
    defaults?: {
        /**
         * We can give default nodesets to load.
         */
        nodesets?: string[]
    }
) => Promise<CircuitModelSonata[] | null> {
    const modal = useModal()
    return React.useCallback(
        (path: string, defaults: { nodesets?: string[] } = {}) =>
            new Promise((resolve) => {
                const hide = modal.show({
                    autoClosable: true,
                    onClose: () => resolve(null),
                    align: "T",
                    content: (
                        <SonataParams
                            path={path}
                            nodesets={defaults.nodesets ?? []}
                            onCancel={() => {
                                hide()
                                resolve(null)
                            }}
                            onOK={(value) => {
                                hide()
                                resolve(value)
                            }}
                        />
                    ),
                })
            }),
        [modal]
    )
}

export function useAskLoaderParamsForCellPlacement(): (
    path: string
) => Promise<CellPlacementModel | null> {
    const modal = useModal()
    return React.useCallback(
        (path: string) =>
            new Promise((resolve) => {
                const hide = modal.show({
                    autoClosable: true,
                    onClose: () => resolve(null),
                    content: (
                        <CellPlacementParams
                            path={path}
                            onCancel={() => {
                                hide()
                                resolve(null)
                            }}
                            onOK={(value) => {
                                hide()
                                resolve(value)
                            }}
                        />
                    ),
                })
            }),
        [modal]
    )
}

export function useAskLoaderParamsForCircuitBbp(): (
    path: string
) => Promise<CircuitModelBbp | null> {
    const modal = useModal()
    return React.useCallback(
        (path: string) =>
            new Promise((resolve) => {
                const hide = modal.show({
                    autoClosable: true,
                    onClose: () => resolve(null),
                    content: (
                        <BbpParams
                            path={path}
                            onCancel={() => {
                                hide()
                                resolve(null)
                            }}
                            onOK={(value) => {
                                hide()
                                resolve(value)
                            }}
                        />
                    ),
                })
            }),
        [modal]
    )
}
