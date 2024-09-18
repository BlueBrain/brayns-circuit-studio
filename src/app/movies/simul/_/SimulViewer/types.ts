export interface SimulData {
    dataCoords: Float32Array
    dataReport: Float32Array
    bounds: {
        x: [min: number, max: number]
        y: [min: number, max: number]
        z: [min: number, max: number]
        v: [min: number, max: number]
    }
}
