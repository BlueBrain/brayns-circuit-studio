import * as React from "react"
import { isNotNull } from "@/_old_/tool/validator"
import Runnable from "../runnable"

export interface PagesViewProps {
    className?: string
    value: string
    children: (JSX.Element | null)[]
}

export default function PagesView(props: PagesViewProps) {
    const [isPending, startTransition] = React.useTransition()
    const [page, setPage] = React.useState(props.value)
    React.useEffect(() => {
        startTransition(() => setPage(props.value))
    }, [props.value])
    const children = props.children.filter(isNotNull)
    const child = children.find((child) => child?.key === page) ??
        children[0] ?? <div />
    return (
        <Runnable className={props.className} running={isPending}>
            {child}
        </Runnable>
    )
}
