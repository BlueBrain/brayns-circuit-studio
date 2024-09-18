import * as React from "react"

import "./aspect-ratio-keeper-view.css"

export interface AspectRatioKeeperViewProps {
    className?: string
    margin: number
    originalWidth: number
    originalHeight: number
    children: React.ReactNode
    /**
     * Callback called everytime the child is resized.
     * @param width
     * @param height
     */
    onResize?(width: number, height: number): void
}

/**
 * This component ensure that its only child always keep its aspect ratio.
 * To do this, it will surround the child with a checkerboard pattern.
 */
export default function AspectRatioKeeperView(
    props: AspectRatioKeeperViewProps
) {
    const ref = React.useRef<null | HTMLDivElement>(null)
    React.useEffect(() => {
        const div = ref.current
        if (!div) return

        const resize = () => {
            const child = div.childNodes[0] as HTMLElement
            if (!child) return

            const { width, height } = div.getBoundingClientRect()
            const scaleW = (width - props.margin) / props.originalWidth
            const scaleH = (height - props.margin) / props.originalHeight
            const scale = Math.min(scaleW, scaleH)
            child.style.width = `${Math.round(props.originalWidth * scale)}px`
            child.style.height = `${Math.round(props.originalHeight * scale)}px`
            if (props.onResize) {
                props.onResize(width, height)
            }
        }
        const observer = new ResizeObserver(resize)
        observer.observe(div)
        resize()
        return () => observer.unobserve(div)
    }, [
        props.margin,
        props.originalWidth,
        props.originalHeight,
        props.children,
        ref.current,
    ])
    return (
        <div className={getClassNames(props)} ref={ref}>
            {props.children}
        </div>
    )
}

function getClassNames(props: AspectRatioKeeperViewProps): string {
    const classNames = ["custom", "view-AspectRatioKeeperView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
