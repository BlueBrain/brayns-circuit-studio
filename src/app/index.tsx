/**
 * build-react-routes
 *
 * WARNING! this file has been generated automatically.
 * Please do not edit it because it will probably be overwritten.
 *
 * If you find a bug or if you need an improvement, please fill an issue:
 * https://github.com/tolokoban/build-react-routes/issues
 */

export * from "./routes"
export * from "./types"

import React from "react"

import { matchRoute, useRouteContext, ROUTES } from "./routes"
import { RouteMatch, RoutePath } from "./types"

import Layout0 from "./layout"
import Layout6 from "./scene/layout"
const Page0 = React.lazy(() => import("./page"))
const Page1 = React.lazy(() => import("./connection/page"))
const Page2 = React.lazy(() => import("./load/page"))
const Page4 = React.lazy(() => import("./movies/1/page"))
const Page5 = React.lazy(() => import("./movies/simul/page"))
const Page6 = React.lazy(() => import("./scene/page"))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ lang }: { lang?: string }) {
    const context = useRouteContext()
    const fb = <div>Loading...</div>
    const ly0 = Layout0
    const pg0 = Page0
    const pg1 = Page1
    const pg2 = Page2
    const pg4 = Page4
    const pg5 = Page5
    const ly6 = Layout6
    const pg6 = Page6
    return (
        <Route path="/" Page={pg0} Layout={ly0} fallback={fb} context={context}>
            <Route path="/connection" Page={pg1} fallback={fb} context={context}/>
            <Route path="/load" Page={pg2} fallback={fb} context={context}/>
            <Route path="/movies" fallback={fb} context={context}>
                <Route path="/movies/1" Page={pg4} fallback={fb} context={context}/>
                <Route path="/movies/simul" Page={pg5} fallback={fb} context={context}/>
            </Route>
            <Route path="/scene" Page={pg6} Layout={ly6} fallback={fb} context={context}/>
        </Route>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function intl<T extends PageComponent | ContainerComponent | JSX.Element>(
    page: T,
    translations: Record<string, T>,
    lang = ""
): T {
    const candidate1 = translations[lang]
    if (candidate1) return candidate1

    const [prefix] = lang.split("-")
    const candidate2 = translations[prefix]
    if (candidate2) return candidate2

    return page
}

type PageComponent = React.FC<{ params: Record<string, string> }>
type ContainerComponent = React.FC<{
    children: React.ReactNode
    params: Record<string, string>
}>

interface RouteProps {
    path: string
    element?: JSX.Element
    fallback?: JSX.Element
    children?: React.ReactNode
    Page?: PageComponent
    Layout?: ContainerComponent
    Template?: ContainerComponent
    context: RouteMatch | null
}

function Route({
    path,
    fallback,
    children,
    Page,
    Layout,
    Template,
    context,
}: RouteProps) {
    const match = context && matchRoute(context.path, ROUTES[path as RoutePath])

    if (!match) return null

    if (match.distance === 0) {
        if (!Page) return null

        const element = Template ? (
            <Template params={match.params}>
                <Page params={match.params} />
            </Template>
        ) : (
            <Page params={match.params} />
        )
        if (Layout) {
            return (
                <Layout params={match.params}>
                    <React.Suspense fallback={fallback}>
                        {element}
                    </React.Suspense>
                </Layout>
            )
        }
        return <React.Suspense fallback={fallback}>{element}</React.Suspense>
    }
    return Layout ? (
        <Layout params={match.params}>{children}</Layout>
    ) : (
        <>{children}</>
    )
}
