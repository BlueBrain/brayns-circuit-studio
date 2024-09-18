import ObjectInterface from "@/_old_/contract/tool/object"

const ObjectTool: ObjectInterface = {
    clone<T>(source: T): T {
        return JSON.parse(JSON.stringify(source)) as T
    },
}

export default ObjectTool
