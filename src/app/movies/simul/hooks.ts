import React from "react"

export function usePlayback(
    step: number,
    setStep: (step: number) => void,
    steps: number
): [playing: boolean, handlePlay: () => void, handlePause: () => void] {
    const refInterval = React.useRef(0)
    const refInitialTime = React.useRef(0)
    const refInitialStep = React.useRef(0)
    const [playing, setPlaying] = React.useState(false)
    return [
        playing,
        React.useCallback(() => {
            window.clearInterval(refInterval.current)
            setPlaying(true)
            refInitialStep.current = step
            refInitialTime.current = Date.now()
            refInterval.current = window.setInterval(() => {
                const newStep =
                    Math.round(
                        refInitialStep.current +
                            (Date.now() - refInitialTime.current) * 0.05
                    ) % steps
                setStep(newStep)
            }, 20)
        }, [step, setStep, steps]),
        React.useCallback(() => {
            window.clearInterval(refInterval.current)
            refInterval.current = -1
            setPlaying(false)
        }, []),
    ]
}
