import SimpleMovieMakerFeatureInterface from "@/_old_/contract/feature/simple-movie-maker"
import { ModalManagerInterface } from "@/_old_/contract/manager/modal"
import { FoldernameUserInputOptions } from "@/_old_/contract/user-input/foldername"
import { MoviePageOptions } from "../../page/main/sections/movie"

export function useMovieRenderingHandler(
    askFoldername: (
        options: FoldernameUserInputOptions
    ) => Promise<string | null>,
    modal: ModalManagerInterface,
    movieMakerSimple: SimpleMovieMakerFeatureInterface
) {
    return async (options: MoviePageOptions) => {
        const destinationFolder = await askFoldername({
            title: "Select destination folder for the scripts",
            storageKey: "MovieMaker",
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
            "Generating Python movie scripts...",
            movieMakerSimple.generateMovieScripts({
                destinationFolder,
                ...options,
            }),
            { progress: movieMakerSimple.eventProgress }
        )
        if (success) {
            await modal.info(
                <div>
                    <p>
                        All the needed files have been sent to{" "}
                        <code>{destinationFolder}</code>.<br />
                        Please use the code below to start rendering the movie
                        on BB5 with <b>4</b> nodes:
                    </p>
                    <pre>{`ssh bbpv1
cd "${destinationFolder}"
chmod a+x activate.sh
./activate.sh 4`}</pre>
                    <p>
                        Note that you don't need to allocate any node by
                        yourself. The script will take care of this for you.
                    </p>
                    <p>
                        Each node will generate a piece of the final movie, but
                        they will all load the whole circuit for that.
                        <br />
                        That will increase the traffic on GPFS, therefore
                        slowing down the whole process.
                        <br />
                        So, please, do not use too much nodes.
                    </p>
                </div>
            )
        }
    }
}
