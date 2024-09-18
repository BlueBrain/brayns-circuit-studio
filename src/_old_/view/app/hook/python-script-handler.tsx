import PythonScriptMakerFeatureInterface from "@/_old_/contract/feature/python-script-maker"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { FoldernameUserInputOptions } from "@/_old_/contract/user-input/foldername"

export function usePythonScriptHandler(
    askFoldername: (
        options: FoldernameUserInputOptions
    ) => Promise<string | null>,
    modal: ModalManagerInterface,
    pythonScriptMaker: PythonScriptMakerFeatureInterface
) {
    return async () => {
        const destinationFolder = await askFoldername({
            title: "Select destination folder for the scripts",
            storageKey: "PythonScript",
        })
        if (!destinationFolder) return

        const confirm = await modal.confirm({
            content: (
                <div>
                    <p>
                        Are you sure you want to generate scripts in this
                        folder?
                    </p>
                    <code>{destinationFolder}</code>
                </div>
            ),
            accent: true,
            labelOK: "Yes",
            labelCancel: "No",
        })
        if (!confirm) return

        const success = await modal.wait(
            "Generating Python scripts...",
            pythonScriptMaker.generatePythonScripts({
                destinationFolder,
                account: "proj3",
                width: 1920,
                height: 1080,
            }),
            { progress: pythonScriptMaker.eventProgress }
        )
        if (success) {
            await modal.info(
                <div>
                    All the needed files have been sent to{" "}
                    <code>{destinationFolder}</code>.<br />
                    Please use the code below to start Brayns and execute your
                    script on BB5:
                    <pre>{`ssh bbpv1
cd "${destinationFolder}"
sh ./allocate.sh
sh ./start.sh`}</pre>
                </div>
            )
        }
    }
}
