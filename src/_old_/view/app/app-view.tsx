import * as React from "react"
import Pages from "@/_old_/ui/view/pages"
import Spinner from "@/_old_/ui/view/spinner/spinner-view"
import { ensureTableStorageInterface } from "@/_old_/contract/storage/table"
import { useServiceLocator } from "@/_old_/tool/locator"
import "./app-view.css"
import {
    Collage,
    ensureMorphologyCollageFeatureInterface,
    SlicesBezierCurve,
} from "@/_old_/contract/feature/morphology-collage"
import { useAboutHandler } from "./hook/about"
import { useBackgroundEditor } from "../../app/hooks/background-editor"
import { useSnapshot } from "../../feature/snapshot/snapshot-feature"
import { ensureSimpleMovieMakerFeatureInterface } from "../../contract/feature/simple-movie-maker"
import { useModal } from "../../ui/modal"
import { useAskFoldername } from "../../user-input/path/foldername"
import { useMovieRenderingHandler } from "./hook/movie-rendering-handler"
import { usePythonScriptHandler } from "./hook/python-script-handler"
import { ensurePythonScriptMakerFeatureInterface } from "@/_old_/contract/feature/python-script-maker"

const MainPage = React.lazy(() => import("../page/main"))
const CollageEditPage = React.lazy(
    () => import("@/_old_/view/page/collage-editor")
)
const CollageViewPage = React.lazy(
    () => import("../page/collage-preview/collage-preview-page")
)

const MAIN_PAGE = "main-page"
const COLLAGE_EDIT_PAGE = "morphology-collage-edit-page"
const COLLAGE_VIEW_PAGE = "morphology-collage-view-page"

export interface AppViewProps {
    className?: string
}

/**
 * Main layout of the application.
 */
export default function AppView(props: AppViewProps): JSX.Element {
    const modal = useModal()
    const askFoldername = useAskFoldername()
    const snapshot = useSnapshot()
    const handleBackgroundClick = useBackgroundEditor()
    const {
        storageCollage,
        morphologyCollage,
        movieMakerSimple,
        pythonScriptMaker,
    } = useServiceLocator({
        storageCollage: ensureTableStorageInterface<Collage>,
        morphologyCollage: ensureMorphologyCollageFeatureInterface,
        movieMakerSimple: ensureSimpleMovieMakerFeatureInterface,
        pythonScriptMaker: ensurePythonScriptMakerFeatureInterface,
    })
    const [currentPage, setCurrentPage] = React.useState(MAIN_PAGE)
    const [currentCollage, setCurrentCollage] = React.useState<null | Collage>(
        null
    )
    const handleEditSlices = (collage: Collage) => {
        setCurrentCollage(collage)
        setCurrentPage(COLLAGE_EDIT_PAGE)
    }
    const handleViewSlices = (collage: Collage) => {
        setCurrentCollage(collage)
        setCurrentPage(COLLAGE_VIEW_PAGE)
    }
    const handleCollageEditValidate = (bezierCurve: SlicesBezierCurve) => {
        if (!currentCollage) return

        const collage: Collage = {
            ...currentCollage,
            bezierCurve,
            slices: morphologyCollage.computeSlicesFromBezierCurve(bezierCurve),
        }
        void storageCollage.store(collage)
        setCurrentCollage(collage)
        setCurrentPage(COLLAGE_VIEW_PAGE)
    }
    const handleAboutClick = useAboutHandler()
    const handleSnapshot = () => {
        void snapshot.takeInteractiveSnapshot()
    }
    const handleMovieRendering = useMovieRenderingHandler(
        askFoldername,
        modal,
        movieMakerSimple
    )
    const handlePythonClick = usePythonScriptHandler(
        askFoldername,
        modal,
        pythonScriptMaker
    )
    return (
        <React.Suspense
            fallback={
                <Spinner label="Your application should start very soon..." />
            }
        >
            <Pages value={currentPage} className="view-AppView">
                <MainPage
                    key={MAIN_PAGE}
                    className={getClassNames(props.className)}
                    onAboutClick={handleAboutClick}
                    onPythonClick={() => void handlePythonClick()}
                    onBackgroundClick={() => void handleBackgroundClick()}
                    onRenderSimpleMovie={(options) =>
                        void handleMovieRendering(options)
                    }
                    onSnapshotClick={handleSnapshot}
                    onEditSlices={handleEditSlices}
                    onViewSlices={handleViewSlices}
                />
                {currentCollage && (
                    <CollageEditPage
                        key={COLLAGE_EDIT_PAGE}
                        className={getClassNames(props.className)}
                        collage={currentCollage}
                        onCancel={() => setCurrentPage(MAIN_PAGE)}
                        onValidate={handleCollageEditValidate}
                    />
                )}
                {currentCollage && (
                    <CollageViewPage
                        key={COLLAGE_VIEW_PAGE}
                        collage={currentCollage}
                        onClose={() => setCurrentPage(MAIN_PAGE)}
                        onSnapshotClick={handleSnapshot}
                    />
                )}
            </Pages>
        </React.Suspense>
    )
}

function getClassNames(className: string | undefined): string {
    const classNames = ["custom", "view-AppView", "theme-color-primary"]
    if (typeof className === "string") classNames.push(className)
    return classNames.join(" ")
}
