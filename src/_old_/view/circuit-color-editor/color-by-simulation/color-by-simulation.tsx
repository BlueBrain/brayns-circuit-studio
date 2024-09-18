import * as React from "react"
import Button from "@/_old_/ui/view/button"
import ColorRampEditor, { ColorRampStep } from "@/_old_/view/colorramp-editor"
import ColorStepView from "./color-step"
import InputFloat from "@/_old_/ui/view/input/float"
import { useModal } from "@/_old_/ui/modal"
import "./color-by-simulation.css"
import CircuitColorManagerInterface, {
    ColorGradient,
} from "@/_old_/contract/manager/circuit-colors"

export interface ColorBySimulationProps {
    className?: string
    manager: CircuitColorManagerInterface
}

const DEFAULT_COLORS: ColorRampStep[] = [
    { color: [0, 1, 0], offset: 0, transparentSection: false },
    { color: [1, 1, 0], offset: 0.5, transparentSection: false },
    { color: [1, 0, 0], offset: 1, transparentSection: false },
]

export default function ColorBySimulation(props: ColorBySimulationProps) {
    const [colors, setColors] = React.useState<ColorRampStep[]>(DEFAULT_COLORS)
    const [rangeMin, setRangeMin] = React.useState(-100)
    const [rangeMax, setRangeMax] = React.useState(0)
    const handleColorClick = useColorClickHandler(
        colors,
        rangeMin,
        rangeMax,
        setColors
    )
    React.useEffect(() => {
        props.manager
            .getColorRamp()
            .then((transferFunction) => {
                console.log(
                    "🚀 [color-by-simulation] transferFunction = ",
                    transferFunction
                ) // @FIXME: Remove this line written on 2024-06-05 at 16:29
                const [min, max] = transferFunction.range
                setRangeMin(min)
                setRangeMax(max)
                setColors(
                    transferFunction.gradient.map(({ offset, color }) => {
                        const [red, green, blue, alpha] = color
                        return {
                            color: [red, green, blue],
                            offset,
                            transparentSection: alpha < 1,
                        }
                    })
                )
            })
            .catch(console.error)
    }, [props.manager])
    return (
        <div className={getClassNames(props)}>
            <div className="range">
                <div>Values range:</div>
                <InputFloat
                    size={4}
                    label="Minimum"
                    value={rangeMin}
                    onChange={setRangeMin}
                />
                <InputFloat
                    size={4}
                    label="Maximum"
                    value={rangeMax}
                    onChange={setRangeMax}
                />
            </div>
            <ColorRampEditor
                colors={colors}
                onChange={setColors}
                onColorClick={handleColorClick}
            />
            <p>
                Click the color ramp to add a handle.
                <br />
                Click a handle to change its color.
                <br />
                Drag a handle beyond its neighbor to remove it.
            </p>
            <Button
                label="Apply Color from Simulation Report"
                accent={true}
                wide={true}
                onClick={() => {
                    void props.manager.applyColorFromSimulation(
                        makeGradient(colors),
                        rangeMin,
                        rangeMax
                    )
                }}
            />
        </div>
    )
}

function useColorClickHandler(
    colors: ColorRampStep[],
    rangeMin: number,
    rangeMax: number,
    setColors: React.Dispatch<React.SetStateAction<ColorRampStep[]>>
) {
    const modal = useModal()
    return React.useCallback(
        (colorIndex: number) => {
            let color = { ...colors[colorIndex] }
            if (!color) return

            modal
                .confirm({
                    title: "Edit color ramp handle",
                    labelOK: "OK",
                    content: (
                        <ColorStepView
                            value={color}
                            minVoltage={rangeMin}
                            maxVoltage={rangeMax}
                            onChange={(value) => {
                                color = { ...value }
                            }}
                        />
                    ),
                })
                .then((confirmed) => {
                    if (!confirmed) return

                    colors[colorIndex] = color
                    setColors([...colors])
                })
                .catch(console.error)
        },
        [rangeMin, rangeMax, colors]
    )
}

function getClassNames(props: ColorBySimulationProps): string {
    const classNames = ["custom", "view-circuitColorEditor-ColorBySimulation"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function makeGradient(colors: ColorRampStep[]): ColorGradient {
    const grad: ColorGradient = []
    let previousSectionWasTransparent = false
    for (const { color, offset, transparentSection } of colors) {
        if (transparentSection !== previousSectionWasTransparent) {
            grad.push({
                color: [...color, previousSectionWasTransparent ? 0 : 1],
                offset,
            })
            previousSectionWasTransparent = transparentSection
        }
        grad.push({
            color: [...color, transparentSection ? 0 : 1],
            offset,
        })
    }
    return grad
}
