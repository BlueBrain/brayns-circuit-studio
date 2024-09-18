import React from "react"
import { ViewInputText, ViewInputTextProps } from "@tolokoban/ui"
import { classNames } from "@/util/utils"

import styles from "./input-text.module.css"

export interface InputTextProps {
    className?: string
}

export function InputText(props: ViewInputTextProps) {
    const innerProps = { ...props }
    delete innerProps.className
    return (
        <div className={classNames(styles.main, props.className)}>
            <ViewInputText {...innerProps} />
        </div>
    )
}
