import StorageInterface from "@/_old_/contract/storage"
import { inflexibleConverter } from "@/_old_/tool/inflexible-converter"
import { isCollage } from "@/_old_/contract/feature/morphology-collage"

export function makeStorageCollageTable(storage: StorageInterface) {
    return storage.makeTable("collage", inflexibleConverter(isCollage))
}
