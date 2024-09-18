import { NOT_FOUND } from "@/_old_/constants"

const CELL_PLACEMENT_EXTENSIONS = ["circuit.morphologies.h5"]
const CELL_MORPHOLOGY_EXTENSIONS = [".h5", ".asc", ".swc"]
const MESH_EXTENSIONS = [".stl", ".off", ".obj"]
const VOLUME_EXTENSIONS = [".nrrd"]

export function isPathOfBbpCircuitOrSimulation(path: string): boolean {
    const base = getBaseName(path)
    return base.includes("BlueConfig") || base.includes("CircuitConfig")
}

export function isPathOfSonataFile(path: string): boolean {
    const base = getBaseName(path)
    return base.includes(".json")
}

export function isPathOfCellPlacement(path: string): boolean {
    return hasOneOfTheseExtensions(path, CELL_PLACEMENT_EXTENSIONS)
}

export function isPathOfCellMorphology(path: string): boolean {
    return hasOneOfTheseExtensions(path, CELL_MORPHOLOGY_EXTENSIONS)
}

export function isPathOfVolume(path: string): boolean {
    return hasOneOfTheseExtensions(path, VOLUME_EXTENSIONS)
}

export function isPathOfGenericMesh(path: string): boolean {
    return hasOneOfTheseExtensions(path, MESH_EXTENSIONS)
}

function getBaseName(path: string): string {
    const lastSlashPos = path.lastIndexOf("/")
    if (lastSlashPos === NOT_FOUND) return path
    return path.substring(lastSlashPos + 1)
}

function hasOneOfTheseExtensions(path: string, extensions: string[]): boolean {
    for (const ext of extensions) {
        if (path.endsWith(ext)) return true
    }
    return false
}
