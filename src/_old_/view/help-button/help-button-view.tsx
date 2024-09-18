import * as React from "react"
import Button from "@/_old_/ui/view/button"
import { useModal } from "@/_old_/ui/modal"
import Help from "../help/help-view"
import Icon from "../../ui/view/icon"
import { IconName } from "../../ui/factory/icon/icon-factory"

export interface HelpButtonViewProps {
    className?: string
    label?: string
    topic: string
    icon?: IconName
    flat?: boolean
}

export default function HelpButtonView({
    className,
    label,
    topic,
    icon = "help",
    flat = false,
}: HelpButtonViewProps) {
    const modal = useModal()
    const handleClick = (topic: string) => {
        const hide = modal.show({
            content: (
                <Help
                    topic={topic}
                    onClose={() => {
                        hide()
                    }}
                    defaultLanguage="en"
                />
            ),
        })
    }
    handleClick
    if (!label) {
        return <Icon name={icon} onClick={() => handleClick(topic)} />
    }
    return (
        <Button
            className={className}
            label={label}
            icon={icon}
            tag={topic}
            flat={flat}
            onClick={handleClick}
        />
    )
}
