import {
    IconChevronDoubleLeft,
    IconChevronDoubleRight,
    IconChevronLeft,
    IconChevronRight,
    IconPause,
    IconPlay,
    ViewPanel,
    ViewSlider,
    ViewStrip,
    useHotKey,
} from "@tolokoban/ui"
import React from "react"

import { Bullet } from "./_/Bullet"
import { SimulViewer } from "./_/SimulViewer"
import { useCamera } from "./_/SimulViewer/hooks"
import { usePlayback } from "./hooks"

import Styles from "./page.module.css"
import { ActiveValue } from "./_/active-value"

const MAX_STEPS = 4000

export default function Page() {
    const activeStep = React.useMemo(() => {
        return new ActiveValue(0)
    }, [])
    const camera = useCamera()
    const [step, setStepReact] = React.useState(0)
    const setStep = (value: number) => {
        setStepReact(value)
        activeStep.value = value
    }
    const [playing, handlePlay, handlePause] = usePlayback(
        step,
        setStep,
        MAX_STEPS
    )

    return (
        <ViewStrip
            className={Styles.main}
            orientation="column"
            template="1**"
            fullsize
        >
            <ViewPanel
                className={Styles.views}
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gridTemplateRows="1fr 1fr"
                gap="2px"
            >
                <SimulViewer
                    index={0}
                    step={activeStep}
                    camera={camera}
                    concentration={1.1}
                    seed={2}
                />
                <SimulViewer
                    index={1}
                    step={activeStep}
                    camera={camera}
                    concentration={0.8}
                    seed={2}
                />
                <SimulViewer
                    index={2}
                    step={activeStep}
                    camera={camera}
                    concentration={1.1}
                    seed={1}
                />
                <SimulViewer
                    index={3}
                    step={activeStep}
                    camera={camera}
                    concentration={0.8}
                    seed={1}
                />
            </ViewPanel>
            <ViewPanel
                fontSize="150%"
                padding="M"
                display="grid"
                gridTemplateColumns="1fr auto auto"
                gridTemplateRows="1fr"
                gap="M"
            >
                <ViewPanel
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-around"
                    alignItems="stretch"
                    gap="M"
                >
                    <ViewSlider
                        value={step}
                        onChange={setStep}
                        min={0}
                        max={MAX_STEPS - 1}
                    />
                    <ViewPanel
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <em>0 ms</em>
                        <em>4000 ms</em>
                    </ViewPanel>
                </ViewPanel>
                <ViewPanel
                    margin={[0, "L"]}
                    fontSize="3em"
                    position="relative"
                    width="4rem"
                    height="4rem"
                >
                    <div className={Styles.play}>
                        {playing ? (
                            <IconPause onClick={handlePause} />
                        ) : (
                            <IconPlay onClick={handlePlay} />
                        )}
                    </div>
                </ViewPanel>
                <ViewPanel
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gridTemplateRows="1fr 1fr"
                >
                    <div>
                        Speed: <b>1 / 4</b>
                    </div>
                    <div>
                        Step size: 0.1 <em>ms</em>
                    </div>
                    <ViewPanel
                        gridColumn="1/-1"
                        display="flex"
                        justifyContent="space-around"
                        alignItems="center"
                        gap="M"
                    >
                        <IconChevronDoubleLeft
                            onClick={() => {
                                setStep(Math.max(0, step - 10))
                            }}
                        />
                        <IconChevronLeft
                            onClick={() => {
                                setStep(Math.max(0, step - 1))
                            }}
                        />
                        <div>
                            <b>{step}</b> / <em>{MAX_STEPS}</em>
                        </div>
                        <IconChevronRight
                            onClick={() => {
                                setStep(Math.min(MAX_STEPS - 1, step + 1))
                            }}
                        />
                        <IconChevronDoubleRight
                            onClick={() => {
                                setStep(Math.min(MAX_STEPS - 1, step + 10))
                            }}
                        />
                    </ViewPanel>
                </ViewPanel>
            </ViewPanel>
            <ViewPanel
                display="flex"
                gap="M"
                justifyContent="space-between"
                alignItems="center"
                padding="S"
            >
                <ViewPanel
                    display="flex"
                    gap="M"
                    justifyContent="flex-start"
                    alignItems="center"
                    flex="1 1 auto"
                >
                    <Bullet
                        color="rgb(255, 105, 105)"
                        label="desired_connected_pro..."
                    />
                    <Bullet
                        color="rgb(0, 233, 191)"
                        label="depol_stdev_mean_ratio"
                    />
                    <Bullet
                        color="rgb(224, 55, 207)"
                        label="extracellular_calcium"
                    />
                    <Bullet color="rgb(255, 247, 64)" label="vpm_pct" />
                    <Bullet
                        color="rgb(99, 191, 242)"
                        label="additional_dimension_number"
                    />
                </ViewPanel>
                <button className={Styles.button}>
                    <div>Generate full movie</div>
                </button>
            </ViewPanel>
        </ViewStrip>
    )
}

function shift(step: number, index: number): number {
    if (index === 0) return step

    return step
}
