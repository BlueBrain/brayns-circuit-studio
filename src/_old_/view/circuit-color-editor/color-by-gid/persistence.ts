import {
    assertArray,
    assertString,
    assertVector4,
} from "@/_old_/tool/validator"
import { ColorByGIDs } from "@/_old_/contract/service/colors"
import { ColorRGBA } from "@/_old_/contract/manager/circuit-colors"
import FileSaverInterface from "@/_old_/contract/manager/file-saver"

type FileFormat = Array<[color: ColorRGBA, range: string]>

export function saveColorRanges(
    colorRanges: ColorByGIDs[],
    fileSaver: FileSaverInterface
) {
    const data: FileFormat = []
    for (const { color, rangeDefinition } of colorRanges) {
        data.push([color, rangeDefinition])
    }
    fileSaver.saveJSON(data, "colors-by-gids.json", true)
}

export async function loadColorRanges(
    files: FileList
): Promise<ColorByGIDs[] | null> {
    const colorRanges: ColorByGIDs[] = []
    for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const content = await file.text()
        try {
            const data = JSON.parse(content) as unknown
            assertFileFormat(data)
            for (const [color, rangeDefinition] of data) {
                colorRanges.push({
                    color,
                    rangeDefinition,
                })
            }
        } catch (ex) {
            console.error("Unable to load GIDs colors file!")
            console.error("Content:", content)
            console.error(ex)
            throw ex
        }
    }
    return colorRanges
}

function assertFileFormat(data: unknown): asserts data is FileFormat {
    assertArray(data)
    for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const prefix = `data[${i}]`
        assertArray(item, prefix)
        const [color, range] = item
        assertVector4(color, `${prefix}[0]`)
        assertString(range, `${prefix}[1]`)
    }
}
