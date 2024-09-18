import * as React from "react"
import Spinner from "@/view/spinner"
import { Button } from "@mui/material"
import "./menu-view.css"
import { BraynsSceneController } from "@/view/BraynsScene/types"

const ACCOUNT = "proj3"
// const NEXUS_MESH_URL =
//     "https://bbp.epfl.ch/nexus/v1/files/bbp/atlas/00d2c212-fa1d-4f85-bd40-0bc217807f5b"
const NEXUS_MESH_URL = "/brain.obj"

export interface MenuViewProps {
    className?: string
    controller: BraynsSceneController | null
    token: string
}

export default function MenuView(props: MenuViewProps) {
    const { controller } = props
    const [ready, setReady] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    const wait = (task: Promise<unknown>) => {
        setBusy(true)
        task.then(() => setBusy(false)).catch((ex) => {
            console.error(ex)
            setBusy(false)
        })
    }
    React.useEffect(() => {
        if (!controller) return

        setReady(true)
    }, [controller])
    if (!controller || !ready) return null

    const handleLoadMeshFromNexus = async () => {
        controller.loadMeshFromURL({
            url: NEXUS_MESH_URL,
            path: "brain.obj",
            token: props.token,
            color: [1, 0.7, 0.4, 0.05],
        })
    }

    return (
        <aside className={getClassNames(props, busy)}>
            {busy && <Spinner>Please wait...</Spinner>}
            <Button
                variant="contained"
                onClick={() => {
                    wait(controller.clear())
                }}
            >
                Clear
            </Button>
            <Button
                variant="contained"
                onClick={() => {
                    wait(controller.setBackgroundColor({ color: [0, 0, 0] }))
                }}
            >
                Black Background
            </Button>
            <Button
                variant="contained"
                onClick={() => {
                    wait(controller.setBackgroundColor({ color: [0, 0, 0.1] }))
                }}
            >
                Blue Background
            </Button>
            <Button
                variant="contained"
                onClick={() => {
                    wait(
                        controller.loadCircuit({
                            path: "/gpfs/bbp.cscs.ch/project/proj134/demos/20221117/out/TXDQLF/build/root__placeholder__emodel_assignment/circuit_config_copy.json",
                        })
                    )
                }}
            >
                Load circuit
            </Button>
            <Button
                variant="contained"
                onClick={() => {
                    wait(
                        controller.loadMesh({
                            path: "/gpfs/bbp.cscs.ch/project/proj3/tolokoban/brain.obj",
                            color: [0.8, 0.9, 1, 0.05],
                        })
                    )
                }}
            >
                Load mesh
            </Button>
            <Button
                variant="contained"
                onClick={() => {
                    wait(handleLoadMeshFromNexus())
                }}
            >
                Load mesh from Nexus
            </Button>
        </aside>
    )
}

function getClassNames(props: MenuViewProps, busy: boolean): string {
    const classNames = ["custom", "view-MenuView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }
    if (busy) classNames.push("busy")

    return classNames.join(" ")
}
