interface ModelBase {
    /**
     * Ids or the real Brayns models.
     */
    ids: number[]
    name: string
    position: [number, number, number]
    visible: boolean
}

export interface CircuitInterface extends ModelBase {
    path: string
    loaderName: string
    loaderProperties: {
        [key: string]: unknown
    }
    orientation: [number, number, number, number]
    scale: [number, number, number]
}

export interface MeshInterface extends ModelBase {
    path: string
    loaderName: string
    loaderProperties: {
        [key: string]: unknown
    }
    orientation: [number, number, number, number]
    scale: [number, number, number]
}

export interface SphereInterface extends ModelBase {
    data: Array<{
        position: [number, number, number]
        radius: number
        /** Red, Green, Blue, Alpha */
        color: [number, number, number, number]
    }>
}

/**
 * Defines how the user want a circuit to be loaded.
 * `circuit` is what the loader is expecting.
 * The rest if to be applied immediately after loading.
 */
export interface CircuitLoadingOptions {
    circuit: CircuitInterface
    reportDataRange: {
        min: number
        max: number
    }
}
