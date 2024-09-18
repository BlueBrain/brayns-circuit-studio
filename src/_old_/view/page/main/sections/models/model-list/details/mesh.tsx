import { MeshModel } from "@/_old_/contract/manager/models"
import Details from "@/_old_/view/details"
import MeshButton from "../mesh-button"

export interface MeshListViewProps {
    meshes: MeshModel[]
    onLoadClick(this: void, title: string, extensions: string[]): void
}

export function MeshListView({ meshes, onLoadClick }: MeshListViewProps) {
    return (
        <Details
            label="Meshes"
            count={meshes.length}
            onImportClick={() => onLoadClick("Mesh", [".stl", ".off", ".obj"])}
        >
            {meshes.map((mesh) => (
                <MeshButton key={mesh.id} mesh={mesh} />
            ))}
            {meshes.length === 0 && (
                <div className="hint">No mesh has been loaded yet.</div>
            )}
        </Details>
    )
}
