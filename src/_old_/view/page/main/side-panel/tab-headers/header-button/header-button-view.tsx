import { IconName } from "@/_old_/ui/factory/icon/icon-factory"
import Icon from "@/_old_/ui/view/icon"
import Touchable from "@/_old_/ui/view/touchable"
import "./header-button-view.css"

export interface HeaderButtonViewProps {
    className?: string
    id: string
    icon: IconName
    label: string
    selected: boolean
    onClick(id: string): void
}

export default function HeaderButtonView(props: HeaderButtonViewProps) {
    return (
        <Touchable
            className={getClassNames(props)}
            onClick={() => props.onClick(props.id)}
            title={props.label}
        >
            <Icon name={props.icon} />
            <div className="label">{props.label}</div>
        </Touchable>
    )
}

function getClassNames({ className, selected }: HeaderButtonViewProps): string {
    const classNames = ["custom", "view-app-appNav-tabHeaders-HeaderButtonView"]
    if (typeof className === "string") {
        classNames.push(className)
    }
    if (selected) classNames.push("selected")

    return classNames.join(" ")
}
