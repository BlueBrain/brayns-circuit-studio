import BraynsApiServiceInterface from "@/_old_/contract/service/brayns-api/brayns-api"
import { SEC_PER_MS } from "@/_old_/constants"
import { SimulationModuleInterface } from "@/_old_/contract/manager/scene"
import { TriggerableEventInterface } from "@/_old_/contract/tool/event"

const DEFAULT_SPEED_STEPS_PER_SECOND = 15

export default class SimulationModule implements SimulationModuleInterface {
    public readonly eventChange: TriggerableEventInterface<SimulationModuleInterface>
    private _playing = false
    private _speed = DEFAULT_SPEED_STEPS_PER_SECOND
    private _currentStep = 0
    private _enabled = false
    /** When `stepsCount` is zero, `_enabled` is always false. */
    private _stepsCount = 0
    private _timeBetweenSteps = 0
    private _timeUnit = "?"
    private _firstStep = -1
    private _lastPlayedStepTime = 0
    private _lastPlayedStepIndex = 0

    constructor(
        private readonly brayns: BraynsApiServiceInterface,
        private readonly askForNextFrame: () => void,
        makeEvent: <T>() => TriggerableEventInterface<T>
    ) {
        this.eventChange = makeEvent()
    }

    get playing(): boolean {
        return this._playing
    }
    set playing(value) {
        if (value === this._playing) return

        this._playing = value
        if (value) {
            this._lastPlayedStepIndex = this._currentStep
            this._lastPlayedStepTime = 0
            window.requestAnimationFrame(this.playNextStep)
        }
        this.trigger()
    }

    get speed(): number {
        return this._speed
    }
    set speed(value) {
        this._speed = value
        this.trigger()
    }

    get currentStep(): number {
        return this._currentStep
    }
    set currentStep(value) {
        if (!this._enabled || this._currentStep === value) return

        this._currentStep = value % this.stepsCount
        this.trigger()
        this.brayns
            .setAnimationParameters({
                current: Math.floor(this.currentStep + this._firstStep),
            })
            .then(() => this.askForNextFrame())
            .catch(console.error)
    }

    get enabled(): boolean {
        return this._enabled
    }

    get stepsCount(): number {
        return this._stepsCount
    }

    get timeBetweenSteps(): number {
        return this._timeBetweenSteps
    }

    get timeUnit(): string {
        return this._timeUnit
    }

    /**
     * Used for animation playback.
     * Must be called in a `requestAnimation()` function.
     */
    private readonly playNextStep = (time: number) => {
        if (!this.playing || !this._enabled) return

        let step = this._lastPlayedStepIndex
        if (this._lastPlayedStepTime > 0) {
            const deltaTimeInSec =
                (time - this._lastPlayedStepTime) * SEC_PER_MS
            step += deltaTimeInSec * this.speed
        }
        step %= this._stepsCount
        this._lastPlayedStepTime = time
        this._lastPlayedStepIndex = step
        this._currentStep = Math.floor(this._firstStep + step)
        this.trigger()
        this.brayns
            .setAnimationParameters({ current: this._currentStep })
            .then(() => {
                this.askForNextFrame()
                window.requestAnimationFrame(this.playNextStep)
            })
            .catch(console.error)
    }

    async reloadParameters() {
        const data = await this.brayns.getSimulationParameters()
        const stepsCount = data.end_frame - data.start_frame
        this._stepsCount = stepsCount
        this._enabled = stepsCount > 0
        this._firstStep = data.start_frame
        this._currentStep = data.current - data.start_frame
        this._timeBetweenSteps = data.dt
        this._timeUnit = data.unit
        this.trigger()
    }

    private trigger() {
        this.eventChange.trigger(this)
    }
}
