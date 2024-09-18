import JSON5 from "json5"
import { CircuitStudioError } from "@/_old_/hooks/error-handler"

import Styles from "./error-view.module.css"

export interface ErrorViewProps {
    value: CircuitStudioError
}

export default function ErrorView({ value }: ErrorViewProps) {
    console.log("🚀 [ErrorView] value = ", value) // @FIXME: Remove this line written on 2024-01-31 at 10:41
    return (
        <div className={Styles.ErrorView}>
            <h2>Error {value.code}</h2>
            <pre>{value.message}</pre>
            {value.data && (
                <details>
                    <summary>More details...</summary>
                    <pre>{value.data}</pre>
                </details>
            )}
            {value.entrypoint && (
                <details>
                    <summary>{value.entrypoint}</summary>
                    <pre>
                        {JSON5.stringify(
                            value.params ?? value.param ?? value,
                            null,
                            "  "
                        )}
                    </pre>
                </details>
            )}
            <hr />
            What can you do?
            <ul>
                <li>
                    <a
                        href={
                            "https://bluebrainproject.slack.com/archives/C02RWJ8QLAV"
                        }
                        target="slack"
                    >
                        Ask <b>Viz Team</b> for support.
                    </a>
                </li>
                <li>
                    <a
                        href={
                            "https://bbpteam.epfl.ch/project/issues/projects/BCS/summary"
                        }
                        target="jira"
                    >
                        Create a JIRA ticket.
                    </a>
                </li>
            </ul>
        </div>
    )
}
