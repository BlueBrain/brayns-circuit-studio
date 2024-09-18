import { Collage } from "@/_old_/contract/feature/morphology-collage"

export interface SlicingPageProps {
    className?: string
    onEditSlices(this: void, collage: Collage): void
    onViewSlices(this: void, collage: Collage): void
    onLoadSlices(): void
}
