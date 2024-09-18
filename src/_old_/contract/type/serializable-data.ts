/**
 * This type can be converted to/from a string.
 */
type SerializableData =
    | null
    | number
    | string
    | boolean
    | ArrayBuffer
    | [number, number, number]
    | [number, number, number, number]
    | SerializableData[]
    | { [key: string]: SerializableData | undefined }

export default SerializableData
