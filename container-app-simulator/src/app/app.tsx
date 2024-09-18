import * as React from "react"
import Menu from "../view/menu"
import "./app.css"
import BraynsScene from "@/view/BraynsScene"
import { BraynsSceneController } from "@/view/BraynsScene/types"
import Spinner from "@/view/spinner"

const ACCOUNT = "proj3"

export default function App(props: { token: string }) {
    const [controller, setController] =
        React.useState<null | BraynsSceneController>(null)
    return (
        <div className="App">
            <BraynsScene
                className={`scene ${controller ? "" : "loading"}`}
                token={props.token}
                account={ACCOUNT}
                onReady={setController}
            />
            {!controller && (
                <div className="wait">
                    <Spinner>Loading Brayns Scene...</Spinner>
                </div>
            )}
            <Menu controller={controller} token={props.token} />
        </div>
    )
}
