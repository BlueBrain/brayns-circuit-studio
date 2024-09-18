import BbpLogoURL from "./resources/bbp-logo.png"
import EpflLogoURL from "./resources/epfl-logo.png"
import {
    GenerateScriptsForMorphologyCollageOptions,
    GenerateScriptsForMorphologyCollageServices,
} from "./types"

export async function saveBinaryFiles(
    { outputFolder }: GenerateScriptsForMorphologyCollageOptions,
    { fileSystem }: GenerateScriptsForMorphologyCollageServices
) {
    await fileSystem.saveBinaryFile(
        `${outputFolder}/epfl-logo.png`,
        EpflLogoURL
    )
    await fileSystem.saveBinaryFile(`${outputFolder}/bbp-logo.png`, BbpLogoURL)
}
