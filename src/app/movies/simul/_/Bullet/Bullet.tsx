import React from "react"
import { classNames } from "@/util/utils"

import styles from "./bullet.module.css"

export interface BulletProps {
    className?: string
    color: string
    label?: string
    children?: React.ReactNode
}

export function Bullet({ className, color, label, children }: BulletProps) {
    return (
        <div className={classNames(styles.main, className)}>
            <div style={{ background: color }}></div>
            <div>{children ?? label}</div>
        </div>
    )
}
