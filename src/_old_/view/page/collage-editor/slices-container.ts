import { makeEvent } from "@/_old_/tool/event"
import MorphologyCollageFeatureInterface, {
    SlicesBezierCurve,
    Slices,
} from "@/_old_/contract/feature/morphology-collage"

export default class SlicesContainer {
    public readonly eventChange = makeEvent<SlicesContainer>()
    private _slices: Slices = {
        width: 320,
        height: 240,
        depth: 1,
        positions: [],
    }
    private _bezier: SlicesBezierCurve = {
        width: 320,
        height: 240,
        depthScale: 1,
        slicesCount: 12,
        pointStart: {
            center: [0, 0, 0],
            handleLength: 50,
            orientation: [0, 0, 0, 1],
            type: "start",
        },
        pointEnd: {
            center: [0, 0, 0],
            handleLength: 50,
            orientation: [0, 0, 0, 1],
            type: "end",
        },
    }

    constructor(
        private readonly morphologyCollage: MorphologyCollageFeatureInterface
    ) {}

    get bezier() {
        return copy(this._bezier)
    }

    set bezier(bezier: SlicesBezierCurve) {
        this._bezier = copy(bezier)
        this.fire()
    }

    get slices() {
        return this._slices
    }

    updateBezier(update: Partial<SlicesBezierCurve>) {
        this.bezier = {
            ...this.bezier,
            ...update,
        }
        this.fire()
    }

    private fire() {
        this._slices = this.morphologyCollage.computeSlicesFromBezierCurve(
            this._bezier
        )
        this.eventChange.trigger(this)
    }
}

function copy(value: SlicesBezierCurve): SlicesBezierCurve {
    return JSON.parse(JSON.stringify(value)) as SlicesBezierCurve
}
