import React from "react"

import { classNames } from "@/_old_/util/utils"
import { SonataEdge } from "@/_old_/contract/manager/models"
import Checkbox from "@/_old_/ui/view/checkbox"

import styles from "./edge-population.module.css"
import Flex from "@/_old_/ui/view/flex"
import FloatView from "@/_old_/ui/view/input/float/float-view"

export interface EdgePopulationProps {
    className?: string
    value: SonataEdge
    onChange(value: SonataEdge): void
}

export function EdgePopulation({
    className,
    value,
    onChange,
}: EdgePopulationProps) {
    const update = (props: Partial<SonataEdge>) => {
        onChange({ ...value, ...props })
    }
    return (
        <div className={classNames(styles.main, className)}>
            <Checkbox
                value={value.enabled}
                onChange={(enabled) => update({ enabled })}
                label={value.name}
            />
            {value.enabled && (
                <div>
                    <Flex>
                        <FloatView
                            value={value.density}
                            onChange={(density) => update({ density })}
                            label="Synapse density (%)"
                        />
                        <FloatView
                            size={4}
                            value={value.radius}
                            onChange={(radius) => update({ radius })}
                            label="Display size (%)"
                        />
                    </Flex>
                    <p>
                        <b>
                            {format(
                                Math.round(value.size * value.density * 1e-2)
                            )}
                        </b>{" "}
                        / <small>{format(value.size)}</small> synapes (
                        {value.density} %)
                    </p>
                </div>
            )}
        </div>
    )
}

const F = new Intl.NumberFormat()

function format(value: number): string {
    return F.format(value)
}
