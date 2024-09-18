export interface ColorrampDefinition {
    colors: Array<[red: number, green: number, blue: number, alpha: number]>
    range: [min: number, max: number]
}

export default interface SceneColorrampInterface {
    get(modelId: number): Promise<ColorrampDefinition>
    set(modelId: number, colorramp: ColorrampDefinition): Promise<void>
}
