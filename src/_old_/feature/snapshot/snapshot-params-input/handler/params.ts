import * as React from "react"
import { SnapshotParams } from ".."
import { SnapshotParamsInputViewProps } from "../snapshot-params-input-view"

/**
 * The `update` function allows you to update just a part of the params
 * and it always triggers a `onChange` event.
 */
export function useSnapshotParams(
    props: SnapshotParamsInputViewProps
): [
    params: SnapshotParams,
    update: (partialParams: Partial<SnapshotParams>) => void,
] {
    const [params, setParams] = React.useState(props.value)
    const update = (data: Partial<SnapshotParams> = {}) => {
        const newParams = {
            ...params,
            ...data,
        }
        setParams(newParams)
        props.onChange(newParams)
    }
    React.useEffect(() => {
        props.onChange(params)
    }, [])
    return [params, update]
}
