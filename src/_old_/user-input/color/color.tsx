import { Vector4 } from "@/_old_/contract/tool/calc"
import Color from "@/_old_/ui/color"
import { useModal } from "@/_old_/ui/modal"
import ColorPicker from "@/_old_/ui/view/color-picker"
import Dialog from "@/_old_/ui/view/dialog"
import Runnable from "@/_old_/ui/view/runnable"
import Tabstrip from "@/_old_/ui/view/tabstrip"
import * as React from "react"

import Style from "./color.module.css"

export interface AskColorParams {
    currentColor?: Vector4 | (() => Promise<Vector4>)
    title?: string
    showOpacity?: boolean
}

export type AskColor = (params: AskColorParams) => Promise<Vector4 | null>

export function useAskColor(): AskColor {
    const modal = useModal()
    return React.useCallback(
        async ({
            currentColor = [1, 0.5, 0, 1],
            title = "Select a Color",
            showOpacity = false,
        }: AskColorParams): Promise<Vector4 | null> => {
            return new Promise((resolve) => {
                const hide = modal.show({
                    align: "LT",
                    autoClosable: false,
                    content: (
                        <AskColorView
                            title={title}
                            showAlpha={showOpacity}
                            initialColor={currentColor}
                            onClose={(color) => {
                                resolve(color)
                                hide()
                            }}
                        />
                    ),
                    onClose() {
                        resolve(null)
                    },
                })
            })
        },
        [modal]
    )
}

function AskColorView({
    title,
    initialColor,
    onClose,
    showAlpha = false,
}: {
    title: string
    initialColor: Vector4 | (() => Promise<Vector4>)
    onClose: (color: Vector4 | null) => void
    showAlpha: boolean
}) {
    const [tab, setTab] = React.useState(0)
    const refColor = React.useRef<Vector4 | null>(null)
    const [busy, setBusy] = React.useState(typeof initialColor === "function")
    const [color, setColor] = React.useState<Vector4>([1, 1, 1, 1])
    React.useEffect(() => {
        if (typeof initialColor === "function") {
            setBusy(true)
            initialColor()
                .then((c) => {
                    refColor.current = c
                    setColor(c)
                    setBusy(false)
                })
                .catch(console.error)
        } else {
            refColor.current = initialColor
            setColor(initialColor)
            setBusy(false)
        }
    }, [initialColor])
    const [hue, sat, lum, alpha] = getHSLA(...color)
    return (
        <Runnable running={busy}>
            <Dialog
                title={title}
                onCancel={() => {
                    onClose(null)
                }}
                onOK={() => {
                    onClose(refColor.current)
                }}
            >
                <Tabstrip
                    value={tab}
                    onChange={setTab}
                    headers={["Presets", "Custom"]}
                >
                    <div key="presets" className={Style.presets}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                            <ColorButton
                                key={`preset-${k}`}
                                S={0}
                                L={k / 8}
                                onClose={onClose}
                            />
                        ))}
                        {PRESETS.hues.map((H) => (
                            <>
                                {PRESETS.luminances.map((L) => (
                                    <ColorButton
                                        key={`${H}/${L}`}
                                        H={H}
                                        L={L}
                                        onClose={onClose}
                                    />
                                ))}
                            </>
                        ))}
                    </div>
                    <ColorPicker
                        key="custom"
                        hue={hue}
                        sat={sat}
                        lum={lum}
                        alpha={showAlpha ? alpha : undefined}
                        onChange={(H, S, L, A) => {
                            const color = Color.fromHSLA(H, S, L, A)
                            refColor.current = color.toArrayRGBA()
                        }}
                    />
                </Tabstrip>
            </Dialog>
        </Runnable>
    )
}

function ColorButton({
    H = 0,
    S = 1,
    L,
    onClose,
}: {
    H?: number
    S?: number
    L: number
    onClose: (color: [R: number, G: number, B: number, A: number]) => void
}) {
    const A = 1
    return (
        <button
            key={`${H}/${L}`}
            style={{
                background: Color.fromHSL(H, S, L).stringify(),
            }}
            onClick={() => {
                const newColor: Vector4 = Color.fromHSLA(
                    H,
                    S,
                    L,
                    A
                ).toArrayRGBA()
                onClose(newColor)
            }}
        />
    )
}

const PRESETS = {
    hues: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    luminances: [0.02, 0.13, 0.24, 0.37, 0.5, 0.63, 0.76, 0.87, 0.98],
}

function getHSLA(
    red: number,
    green: number,
    blue: number,
    alpha: number
): [hue: number, sat: number, lum: number, alpha: number] {
    const color = Color.fromArrayRGBA([red, green, blue, alpha])
    color.rgb2hsl()
    return [color.H, color.S, color.L, color.A]
}
