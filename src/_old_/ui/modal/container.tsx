import React from "react"
import { ModalOptions } from "@/_old_/contract/manager/modal"
import Style from "./container.module.css"

export interface ModalContainerProps {
    options: ModalOptions
    onClose(this: void, options: ModalOptions): void
}

export default function ModalContainer({
    options,
    onClose,
}: ModalContainerProps) {
    const style = styleOptions(options)
    const refContainer = React.useRef<HTMLDivElement | null>(null)
    const handleClick = (evt: React.MouseEvent) => {
        if (!options.autoClosable) return

        if (refContainer.current === evt.target) onClose(options)
    }
    React.useEffect(() => {
        const onKeyDown = (evt: KeyboardEvent) => {
            if (evt.key !== "Escape") return

            evt.stopPropagation()
            evt.stopImmediatePropagation()
            evt.preventDefault()
            if (options.autoClosable) onClose(options)
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [options])
    return (
        <div
            className={getClassNames(options)}
            style={style}
            ref={refContainer}
            onClick={handleClick}
        >
            {options.content}
        </div>
    )
}

function getClassNames(options: ModalOptions) {
    const classes = [Style.container]
    for (const align of options.align ?? "") {
        const cls = Style[align]
        if (cls) classes.push(cls)
    }
    return classes.join(" ")
}

function styleOptions(options: ModalOptions) {
    const style: React.CSSProperties = {
        padding: options.padding,
        background: options.background,
    }
    return style
}
