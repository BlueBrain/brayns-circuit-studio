import React from "react"
import { classNames } from "@/_old_/util/utils"

import { SonataEdge } from "@/_old_/contract/manager/models"
import { EdgePopulation } from "./EdgePopulation"

import styles from "./edge-populations.module.css"

export interface EdgePopulationsProps {
    className?: string
    value: SonataEdge[]
    onChange(value: SonataEdge[]): void
    children: React.ReactNode
}

export function EdgePopulations({
    className,
    value,
    onChange,
    children,
}: EdgePopulationsProps) {
    return (
        <fieldset className={classNames(styles.main, className)}>
            <legend>{children}</legend>
            {value.map((edge, index) => (
                <EdgePopulation
                    key={edge.name}
                    value={edge}
                    onChange={(newEdge) => {
                        const edges = [...value]
                        edges[index] = newEdge
                        onChange(edges)
                    }}
                />
            ))}
        </fieldset>
    )
}
