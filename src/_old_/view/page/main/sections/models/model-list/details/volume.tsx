import { VolumeModel } from "@/_old_/contract/manager/models"
import Details from "@/_old_/view/details"
import VolumeButton from "../volume-button"

export interface VolumeListViewProps {
    volumes: VolumeModel[]
    onLoadClick(this: void, title: string, extensions: string[]): void
}

export function VolumeListView({ volumes, onLoadClick }: VolumeListViewProps) {
    return (
        <Details
            label="Volumes"
            count={volumes.length}
            onImportClick={() => onLoadClick("Volume", [".nrrd"])}
        >
            {volumes.map((volume) => (
                <VolumeButton key={volume.id} volume={volume} />
            ))}
            {volumes.length === 0 && (
                <div className="hint">No volume has been loaded yet.</div>
            )}
        </Details>
    )
}
