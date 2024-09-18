import "./color-view.css"

import * as React from "react"
import ColorPicker from "../../color-picker"
import Color from "../../../color"
import Label from "../../label"
import Touchable from "@/_old_/ui/view/touchable"
import Icon from "@/_old_/ui/view/icon"
import { useModal } from "@/_old_/ui/modal"
import Dialog from "@/_old_/ui/view/dialog"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"

const ID = "ui-view-input-ColorView"
const BLACK = Color.newBlack()
const WHITE = Color.newWhite()

export interface ColorViewProps {
    className?: string
    label?: string
    enabled?: boolean
    size?: number
    /**
     * If `true` the color picker will appear on top left of the screen
     * an the background will be transparent to let you see the screen.
     */
    transparentColorPicker?: boolean
    value: string
    onChange?(this: void, value: string): void
    onEnterPressed?(this: void, value: string): void
}

const DEFAULT_INPUT_SIZE = 6

export default function ColorView(props: ColorViewProps) {
    const modal = useModal()
    const {
        value,
        size,
        label,
        enabled,
        onChange,
        onEnterPressed,
        transparentColorPicker,
    } = props
    const [id, setId] = React.useState("")
    const [code, setCode] = React.useState(value.toUpperCase())
    const valid = Color.isValid(code)
    React.useEffect(() => setId(nextId()), [])
    React.useEffect(() => setCode(value.toUpperCase()), [value])
    const colors: React.CSSProperties = {
        color: "currentcolor",
        backgroundColor: "transparent",
    }
    if (valid) {
        const color = new Color(code)
        colors.backgroundColor = code
        colors.color = Color.bestContrast(color, BLACK, WHITE).stringify()
    }
    const handleChange = useHandleChange(setCode, onChange)
    const handleKeyDown = useHandleKeydown(valid, onEnterPressed, code)
    return (
        <div className={getClassNames(props, valid)}>
            <Label value={label} target={id} />
            <div className="button">
                {renderInput(
                    id,
                    colors,
                    size,
                    code,
                    enabled,
                    handleChange,
                    handleKeyDown
                )}
                {renderButton(
                    modal,
                    label,
                    code,
                    setCode,
                    transparentColorPicker ?? false,
                    onChange
                )}
            </div>
        </div>
    )
}

let globalId = 1

function renderInput(
    id: string,
    colors: React.CSSProperties,
    size: number | undefined,
    code: string,
    enabled: boolean | undefined,
    handleChange: (evt: React.ChangeEvent<HTMLInputElement>) => void,
    handleKeyDown: (evt: React.KeyboardEvent<HTMLInputElement>) => void
) {
    return (
        <div className="input-background">
            <input
                id={id}
                style={colors}
                size={size ?? DEFAULT_INPUT_SIZE}
                value={code}
                disabled={enabled === false ? true : undefined}
                onChange={handleChange}
                onKeyDownCapture={handleKeyDown}
            />
        </div>
    )
}

function renderButton(
    modal: ModalManagerInterface,
    label: string | undefined,
    code: string,
    setCode: React.Dispatch<React.SetStateAction<string>>,
    transparentColorPicker: boolean,
    onChange: ((this: void, value: string) => void) | undefined
) {
    return (
        <Touchable
            className="color-picker-button theme-color-primary"
            onClick={() =>
                openColorPicker(
                    modal,
                    transparentColorPicker,
                    label ?? "Pick a color",
                    code,
                    (value) => {
                        setCode(value)
                        if (onChange && Color.isValid(value)) {
                            onChange(value)
                        }
                    }
                )
            }
        >
            <Icon name="edit" />
        </Touchable>
    )
}

function useHandleKeydown(
    valid: boolean,
    onEnterPressed: ((this: void, value: string) => void) | undefined,
    code: string
) {
    return (evt: React.KeyboardEvent<HTMLInputElement>) => {
        if (!valid) return
        if (typeof onEnterPressed !== "function") return
        if (evt.key === "Enter") onEnterPressed(code)
    }
}

function useHandleChange(
    setCode: React.Dispatch<React.SetStateAction<string>>,
    onChange: ((this: void, value: string) => void) | undefined
) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
        const newCode = evt.target.value
        setCode(newCode.toUpperCase())
        if (Color.isValid(newCode) && onChange) {
            onChange(newCode)
        }
    }
}

function nextId() {
    return `${ID}-${globalId++}`
}

function getClassNames(props: ColorViewProps, valid: boolean): string {
    const classNames = ["custom", "ui-view-input-ColorView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (!valid) classNames.push("invalid")

    return classNames.join(" ")
}

function openColorPicker(
    modal: ModalManagerInterface,
    transparentColorPicker: boolean,
    title: string,
    code: string,
    setCode: React.Dispatch<React.SetStateAction<string>>
): void {
    const color = new Color(code)
    color.rgb2hsl()
    const hide = modal.show({
        align: transparentColorPicker ? "TL" : undefined,
        background: transparentColorPicker ? "transparent" : undefined,
        onClose: () => setCode(code),
        content: (
            <Dialog
                title={title}
                onOK={() => hide()}
                onCancel={() => {
                    setCode(code)
                    hide()
                }}
            >
                <ColorPicker
                    hue={color.H}
                    sat={color.S}
                    lum={color.L}
                    onChange={(hue, sat, lum) => {
                        color.H = hue
                        color.S = sat
                        color.L = lum
                        color.hsl2rgb()
                        setCode(color.stringify().toUpperCase())
                    }}
                />
            </Dialog>
        ),
    })
}
