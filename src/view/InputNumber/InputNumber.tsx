import { ViewInputNumber, ViewInputNumberProps } from "@tolokoban/ui"
import { classNames } from "@/util/utils"

import styles from "./input-number.module.css"

export interface InputNumberProps {
    className?: string
}

export function InputNumber(props: ViewInputNumberProps) {
    const innerProps: ViewInputNumberProps = { ...props }
    delete innerProps.className
    return (
        <div className={classNames(styles.main, props.className)}>
            <ViewInputNumber {...innerProps} />
        </div>
    )
}
