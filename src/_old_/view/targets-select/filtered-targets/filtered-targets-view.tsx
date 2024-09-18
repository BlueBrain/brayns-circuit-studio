import * as React from "react"
import Touchable from "@/_old_/ui/view/touchable"
import FloatingButton from "@/_old_/ui/view/floating-button"
import Slider from "@/_old_/ui/view/slider"
import { clamp } from "@/_old_/constants"
import "./filtered-targets-view.css"

const BUTTONS_PER_PAGE = 16
const MIN_PAGE_FOR_SLIDER = 5

export interface FilteredTargetsViewProps {
    className?: string
    filter: string
    targets: string[]
    onClick(targetName: string): void
}

/**
 * Display a list of the target names matching the filter.
 * This list is not the whole one. It's limited to a page size:
 * BUTTONS_PER_PAGE.
 * And we will display navigation buttons and even a slider for more than
 * MIN_PAGE_FOR_SLIDER pages.
 */
export default function FilteredTargetsView(props: FilteredTargetsViewProps) {
    const [targetNames, setTargetNames] = React.useState<string[]>([])
    const [page, setPage] = React.useState(0)
    const [pages, setPages] = React.useState(0)
    const [moreAfter, setMoreAfter] = React.useState(0)
    const [moreBefore, setMoreBefore] = React.useState(0)
    useFilter(
        props,
        page,
        setPage,
        setPages,
        setMoreBefore,
        setMoreAfter,
        setTargetNames
    )
    return renderView(
        props,
        pages,
        page,
        setPage,
        moreBefore,
        targetNames,
        moreAfter
    )
}

function renderView(
    props: FilteredTargetsViewProps,
    pages: number,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    moreBefore: number,
    targetNames: string[],
    moreAfter: number
) {
    return (
        <div className={getClassNames(props)}>
            {renderPageSlider(pages, page, setPage)}
            <nav>
                <div className="nav-button">
                    <FloatingButton
                        icon="arrow-left"
                        enabled={moreBefore > 0}
                        onClick={() => setPage(page - 1)}
                    />
                    <p className="hint">{moreBefore} more...</p>
                </div>
                <div className="buttons">
                    {targetNames.map((name) => (
                        <Touchable
                            key={name}
                            className="button theme-color-primary theme-shadow-button"
                            onClick={() => props.onClick(name)}
                        >
                            {name}
                        </Touchable>
                    ))}
                </div>
                <div className="nav-button">
                    <FloatingButton
                        icon="arrow-right"
                        enabled={moreAfter > 0}
                        onClick={() => setPage(page + 1)}
                    />
                    <p className="hint">{moreAfter} more...</p>
                </div>
            </nav>
        </div>
    )
}

function renderPageSlider(
    pages: number,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>
) {
    return (
        <>
            {pages >= MIN_PAGE_FOR_SLIDER && (
                <Slider
                    value={page}
                    min={0}
                    max={pages - 1}
                    steps={1}
                    wide={true}
                    onChange={setPage}
                />
            )}
        </>
    )
}

/**
 * When there are more than `BUTTONS_PER_PAGE` targets,
 * we display them page per page.
 * This hook will update the current page according to the filter.
 */
function useFilter(
    props: FilteredTargetsViewProps,
    page: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    setPages: React.Dispatch<React.SetStateAction<number>>,
    setMoreBefore: React.Dispatch<React.SetStateAction<number>>,
    setMoreAfter: React.Dispatch<React.SetStateAction<number>>,
    setTargetNames: React.Dispatch<React.SetStateAction<string[]>>
) {
    const [targets, setTargets] = React.useState<string[]>(props.targets)
    React.useEffect(() => {
        const filter = props.filter.trim().toLowerCase()
        const filteredTargets =
            filter.length === 0
                ? props.targets
                : props.targets.filter((target) =>
                      target.toLowerCase().includes(filter)
                  )
        setTargets(filteredTargets)
        setPage(0)
    }, [props.filter, props.targets])
    React.useEffect(() => {
        if (targets.length === 0) {
            setPages(0)
            setPage(0)
            setMoreBefore(0)
            setMoreAfter(0)
            return
        }
        const pagesCount = Math.ceil(targets.length / BUTTONS_PER_PAGE)
        setPages(pagesCount)
        const currentPage = clamp(page, 0, pagesCount - 1)
        setPage(currentPage)
        const start = currentPage * BUTTONS_PER_PAGE
        setMoreBefore(start)
        setMoreAfter(
            Math.max(0, targets.length - (currentPage + 1) * BUTTONS_PER_PAGE)
        )
        setTargetNames(targets.slice(start, start + BUTTONS_PER_PAGE))
    }, [targets, page])
}

function getClassNames(props: FilteredTargetsViewProps): string {
    const classNames = ["custom", "view-targetsSelect-FilteredTargetsView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
