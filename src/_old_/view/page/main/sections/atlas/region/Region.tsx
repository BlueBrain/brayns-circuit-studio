import * as React from "react"

import AtlasServiceInterface, {
    AtlasRegion,
} from "@/_old_/contract/service/atlas"
import Color from "@/_old_/ui/color"
import Icon from "@/_old_/ui/view/icon"
import Spinner from "@/_old_/ui/view/spinner"
import Styles from "./Region.module.css"

export interface RegionProps {
    className?: string
    value: AtlasRegion
    highlight?: number
    services: {
        atlas: AtlasServiceInterface
    }
    visibleRegions: number[]
    expandedNodes: number[]
    onExpand(this: void, id: number): void
    onCollapse(this: void, id: number): void
}

function Region({
    className,
    value,
    highlight = -1,
    services,
    visibleRegions,
    expandedNodes,
    onExpand,
    onCollapse,
}: RegionProps) {
    const { atlas } = services
    const busy = atlas.useBusyRegion(value.id)
    const expanded = expandedNodes.includes(value.id)
    const hasChildren = value.children.length > 0
    const handleClick = () => {
        const { id } = value
        if (expanded) onCollapse(id)
        else onExpand(id)
    }
    const isVisible = atlas.isVisible(value.id)
    const handleVisibleClick = () => {
        const regionId = value.id
        atlas.setVisible(regionId, !isVisible)
    }
    const style: React.CSSProperties = {}
    if (isVisible) {
        style.background = `#${value.color}`
        style.color = onColor(value.color)
    }
    return (
        <div className={getClassName(expanded, isVisible, className)}>
            <header title={`${value.name} (${value.acronym})`}>
                <Icon
                    className={Styles.chevron}
                    name={hasChildren ? "chevron-right" : "bullet"}
                    onClick={handleClick}
                />
                <div onClick={handleClick} style={style}>
                    {highlight === value.id ? (
                        <b>{value.name}</b>
                    ) : (
                        <span>{value.name}</span>
                    )}
                </div>
                {busy ? (
                    <Spinner />
                ) : (
                    <Icon
                        name={isVisible ? "show" : "hide"}
                        onClick={handleVisibleClick}
                    />
                )}
            </header>
            {expanded && hasChildren && (
                <section>
                    {value.children.map((child) => (
                        <Region
                            key={child.id}
                            services={services}
                            value={child}
                            highlight={highlight}
                            visibleRegions={visibleRegions}
                            expandedNodes={expandedNodes}
                            onCollapse={onCollapse}
                            onExpand={onExpand}
                        />
                    ))}
                </section>
            )}
        </div>
    )
}

export default Region

function getClassName(expanded: boolean, visible: boolean, className?: string) {
    const classes = [Styles.Region]
    if (className) classes.push(className)
    if (expanded) classes.push(Styles.expanded)
    if (visible) classes.push(Styles.visible)
    return classes.join(" ")
}

function onColor(hexa: string): string {
    const color = new Color(`#${hexa}`)
    return color.luminanceStep() === 0 ? "#fff" : "#000"
}
