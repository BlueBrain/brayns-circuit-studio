import { Collage } from "@/_old_/contract/feature/morphology-collage"
import { ensureSceneManagerInterface } from "@/_old_/contract/manager/scene"
import { useServiceLocator } from "@/_old_/tool/locator"
import { ensureFunction } from "@/_old_/tool/validator"
import { useLocalStorageState } from "@/_old_/ui/hooks"
import Icon from "@/_old_/ui/view/icon"
import Touchable from "@/_old_/ui/view/touchable"
import Wizard from "@/_old_/ui/view/wizard"
import { useModal } from "../../../../ui/modal"
import HelpButton from "../../../help-button"
import PageAtlas from "../sections/atlas"
import PageCamera from "../sections/camera"
import PageModels from "../sections/models"
import PageMovie, { MoviePageOptions } from "../sections/movie"
import PageSlicing from "../sections/slicing"
import AppMenu from "./app-menu"
import { makeFocusHandler, makeResetClickHandler } from "./handler"
import { useLoadModelHandler } from "./hooks/load-model-handler"
import "./side-panel.css"
import TabHeaders from "./tab-headers"

export interface AppNavViewProps {
    className?: string
    setExpanded(this: void, value: boolean): void
    onAboutClick(this: void): void
    onRenderSimpleMovie(this: void, options: MoviePageOptions): void
    onEditSlices(this: void, collage: Collage): void
    onViewSlices(this: void, collage: Collage): void
}

export default function AppNavView(props: AppNavViewProps) {
    const modal = useModal()
    const { setExpanded, onAboutClick } = props
    const { refresh, scene } = useServiceLocator({
        refresh: ensureFunction,
        scene: ensureSceneManagerInterface,
    })
    const [page, setPage] = useLocalStorageState(
        "models",
        "view/main/side-panel/page"
    )
    const handleResetClick = makeResetClickHandler(modal, scene)
    const handleLoadClick = useLoadModelHandler()
    const handleFocus = makeFocusHandler(scene, refresh)
    const handleLoadSlices = () => {
        alert("Loading slices...")
    }
    return (
        <nav className={getClassNames(props)}>
            {renderHeader(onAboutClick, setExpanded)}
            <menu className="theme-color-frame">
                <TabHeaders id={page} onClick={setPage} />
                <Wizard className="pages" step={page}>
                    <PageModels
                        key="models"
                        onLoadClick={(title: string, extensions?: string[]) =>
                            void handleLoadClick(title, extensions)
                        }
                        onResetClick={handleResetClick}
                        onFocus={handleFocus}
                    />
                    <PageAtlas key="atlas" />
                    <PageSlicing
                        key="slicing"
                        onEditSlices={props.onEditSlices}
                        onViewSlices={props.onViewSlices}
                        onLoadSlices={handleLoadSlices}
                    />
                    <div key="neural-tracing">
                        <h1>Neural Tracing</h1>
                        <p>Not implemented yet...</p>
                    </div>
                    <PageMovie
                        key="movie"
                        scene={scene}
                        onRender={props.onRenderSimpleMovie}
                    />
                    <PageCamera key="camera" camera={scene.camera} />
                    <AppMenu key="menu" onChange={setPage} />
                </Wizard>
            </menu>
        </nav>
    )
}

function renderHeader(
    onAboutClick: (this: void) => void,
    setExpanded: (this: void, value: boolean) => void
) {
    return (
        <header className="theme-header">
            <img src="gfx/epfl-logo.svg" alt="EPFL" />
            <Touchable onClick={onAboutClick}>Brayns Circuit Studio</Touchable>
            <HelpButton topic="welcome" />
            <Icon name="arrow-left" onClick={() => setExpanded(false)} />
        </header>
    )
}

function getClassNames(props: AppNavViewProps): string {
    const classNames = ["custom", "view-app-AppNavView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
