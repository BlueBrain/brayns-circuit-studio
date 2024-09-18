import * as React from "react"
import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api"
import GenericEventInterface from "@/_old_/contract/tool/event"
import Runnable from "@/_old_/ui/view/runnable"
import { HitTestCoords } from "../hooks/canvas-click"
import "./cell-detail-view.css"
import {
    HitTestResult,
    isHitTestResultNeuron,
} from "@/_old_/contract/service/brayns-api/hit-test"

export interface CellDetailViewProps {
    className?: string
    eventHitTest: GenericEventInterface<HitTestCoords>
    brayns: BraynsApiServiceInterface
}

export default function CellDetailView(props: CellDetailViewProps) {
    const [hit, busy] = useHitTest(props.eventHitTest, props.brayns)
    return (
        <Runnable className={getClassNames(props)} running={busy}>
            <div>
                {!isHitTestResultNeuron(hit) && (
                    <p>Please click on a cell to get info about it.</p>
                )}
                {isHitTestResultNeuron(hit) && (
                    <div className="neuron">
                        <div>
                            GID: <b>{hit.cellId}</b>
                        </div>
                        {/* <FloatingButton
                            icon="fill"
                            small={true}
                            onClick={() =>
                                void applyCellColor(
                                    props.brayns,
                                    hit.modelId,
                                    hit.cellId
                                )
                            }
                        /> */}
                    </div>
                )}
            </div>
        </Runnable>
    )
}

function getClassNames(props: CellDetailViewProps): string {
    const classNames = ["custom", "view-page-collagePreview-CellDetailView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}

function useHitTest(
    eventHitTest: GenericEventInterface<HitTestCoords>,
    brayns: BraynsApiServiceInterface
): [hit: null | HitTestResult, busy: boolean] {
    const [hit, setHit] = React.useState<null | HitTestResult>(null)
    const [busy, setBusy] = React.useState(false)
    React.useEffect(() => {
        const action = ({ x, y }: HitTestCoords) => {
            setBusy(true)
            brayns
                .hitTest(x, y)
                .then((hit: HitTestResult) => {
                    setBusy(false)
                    setHit(hit)
                })
                .catch((ex) => {
                    console.error("hit test failed for", x, y)
                    console.error(ex)
                    setBusy(false)
                })
        }
        eventHitTest.add(action)
        return () => eventHitTest.remove(action)
    }, [eventHitTest, brayns])
    return [hit, busy]
}
