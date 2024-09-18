import * as React from "react"
import { ColorByGIDs } from "@/_old_/contract/service/colors"

export function useColorRanges(): [
    colorRanges: ColorByGIDs[],
    setColorRanges: (colorRanges: ColorByGIDs[]) => void,
    addColorRange: (colorRange: ColorByGIDs) => void,
    removeColorRange: (colorRange: ColorByGIDs) => void,
    updateColorRange: (index: number, colorRange: Partial<ColorByGIDs>) => void,
] {
    const [colorRanges, setColorRanges] = React.useState<ColorByGIDs[]>([])
    const addColorRange = (colorRange: ColorByGIDs) => {
        setColorRanges([...colorRanges, colorRange])
    }
    const removeColorRange = (colorRange: ColorByGIDs) => {
        const [gids] = colorRange.rangeDefinition.split("|")
        setColorRanges(
            colorRanges.filter((colorRange) => {
                const [gids2] = colorRange.rangeDefinition.split("|")
                return gids !== gids2
            })
        )
    }
    const updateColorRange = (
        index: number,
        colorRange: Partial<ColorByGIDs>
    ) => {
        const newColorRanges = [...colorRanges]
        newColorRanges[index] = {
            ...newColorRanges[index],
            ...colorRange,
        }
        setColorRanges(newColorRanges)
    }
    return [
        colorRanges,
        setColorRanges,
        addColorRange,
        removeColorRange,
        updateColorRange,
    ]
}

export function useTargets(
    listTargets: () => Promise<string[]>
): [
    targets: string[],
    setTargets: (target: string) => boolean,
    loadingTargets: boolean,
] {
    const [loading, setLoading] = React.useState(false)
    const [targets, setTargets] = React.useState<string[]>([])
    const refValidator = React.useRef<(value: string) => boolean>(
        (_target: string) => false
    )
    React.useEffect(() => {
        if (targets.length > 0) return

        setLoading(true)
        listTargets()
            .then((targetNames: string[]) => {
                const targetsSet = new Set(targetNames)
                refValidator.current = (value: string) => targetsSet.has(value)
                setTargets(targetNames)
                setLoading(false)
            })
            .catch((ex) => {
                console.error(ex)
                setLoading(false)
            })
    }, [listTargets])
    return [targets, refValidator.current, loading]
}
