import * as React from "react"
import Button from "@/_old_/ui/view/button"
import "./app-menu-view.css"

type Page = string

export interface AppMenuViewProps {
    className?: string
    onChange(this: void, page: Page): void
}

export default function AppMenuView(props: AppMenuViewProps) {
    const { onChange } = props
    return (
        <div className={getClassNames(props)}>
            {renderYourData(onChange)}
            {renderSlicingTools(onChange)}
            {renderMovieStudio(onChange)}
            {renderNeuraltracing(onChange)}
        </div>
    )
}

function renderNeuraltracing(onChange: (this: void, page: Page) => void) {
    return (
        <div>
            <Button
                label="Neural Tracing"
                wide={true}
                tag="neural-tracing"
                onClick={onChange}
            />
            <p>highlight afferent and efferent cells.</p>
        </div>
    )
}

function renderMovieStudio(onChange: (this: void, page: Page) => void) {
    return (
        <div>
            <Button
                label="Movie Studio"
                wide={true}
                tag="movie"
                onClick={onChange}
            />
            <p>Generate movie.</p>
        </div>
    )
}

function renderSlicingTools(onChange: (this: void, page: Page) => void) {
    return (
        <div>
            <Button
                label="Slicing Tools"
                wide={true}
                tag="slicing"
                onClick={onChange}
            />
            <p>
                Use these tools to create slices. Usefull for morphology
                collage.
            </p>
        </div>
    )
}

function renderYourData(onChange: (this: void, page: Page) => void) {
    return (
        <div>
            <Button
                label="Your Data"
                wide={true}
                tag="models"
                onClick={onChange}
            />
            <p>
                You will find the list of all loaded circuits, meshes and
                geometrical objects here. It's also where you can maniplate them
                and add new ones.
            </p>
        </div>
    )
}

function getClassNames(props: AppMenuViewProps): string {
    const classNames = ["custom", "view-app-AppMenuView"]
    if (typeof props.className === "string") {
        classNames.push(props.className)
    }

    return classNames.join(" ")
}
