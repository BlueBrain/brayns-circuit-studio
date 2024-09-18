import { BRAYNS_VERSION } from "@/_old_/constants"
import ActivateShFileContent from "./resources/activate.sh"
import AgentPyFileContent from "./resources/agent.py"
import CalcPyFileContent from "./resources/calc.py"
import CellsPyFileContent from "./resources/cells.py"
import BraynsPyFileContent from "./resources/brayns.py"
import LogPyFileContent from "./resources/log.py"
import MakeSlicesPyFileContent from "./resources/make-slices.py"
import RequirementsTxtFileContent from "./resources/requirements.txt"
import StartShFileContent from "./resources/start.sh"
import { fillPlaceholders } from "@/_old_/tool/placeholders"
import {
    GenerateScriptsForMorphologyCollageOptions,
    GenerateScriptsForMorphologyCollageServices,
} from "./types"

export async function saveTextFiles(
    { account, outputFolder }: GenerateScriptsForMorphologyCollageOptions,
    { fileSystem }: GenerateScriptsForMorphologyCollageServices
) {
    const FILES: Array<[string, string, { [name: string]: string | number }?]> =
        [
            ["activate.sh", ActivateShFileContent],
            ["agent.py", AgentPyFileContent],
            ["brayns.py", BraynsPyFileContent],
            ["calc.py", CalcPyFileContent],
            ["cells.py", CellsPyFileContent],
            ["log.py", LogPyFileContent],
            ["make-slices.py", MakeSlicesPyFileContent],
            ["requirements.txt", RequirementsTxtFileContent],
            [
                "start.sh",
                StartShFileContent,
                { ACCOUNT: account, BRAYNS_VERSION },
            ],
        ]
    for (const [name, content, placeholders] of FILES) {
        await fileSystem.saveTextFile(
            `${outputFolder}/${name}`,
            fillPlaceholders(content, placeholders)
        )
    }
}
