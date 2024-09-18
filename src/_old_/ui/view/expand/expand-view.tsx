import { IconName } from "../../factory/icon/icon-factory"
import Icon from "../icon"
import Touchable from "../touchable"
import "./expand-view.css"
import { useExpanded } from "./hook"

export interface SectionViewProps {
    className?: string
    icon?: IconName
    label: string
    /** In a group, only one section is expanded at a time. */
    group?: string
    children: JSX.Element | JSX.Element[]
}

export default function SectionView(props: SectionViewProps) {
    const [expanded, toggle] = useExpanded(props.label, props.group)
    return (
        <div className={getClassNames(props)}>
            <Touchable
                className={`header ${
                    expanded
                        ? "theme-color-primary-light expanded"
                        : "theme-color-primary"
                }`}
                onClick={toggle}
            >
                <Icon className="left-icon" name="chevron-right" />
                <div>{props.label}</div>
                {props.icon && <Icon name={props.icon} />}
            </Touchable>
            {expanded && <div className="body">{props.children}</div>}
        </div>
    )
}

function getClassNames(props: SectionViewProps): string {
    const classNames = [
        "custom",
        "view-SectionView",
        "theme-shadow-button",
        "theme-color-section",
    ]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
