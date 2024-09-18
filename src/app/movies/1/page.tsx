import React from "react"
import Styles from "./page.module.css"

import VideoURL from "./video-1.mp4"

export default function Page() {
    const ref = React.useRef<null | HTMLVideoElement>(null)
    return (
        <div className={Styles.main}>
            <video
                ref={ref}
                controls={false}
                src={VideoURL}
                onClick={() => {
                    const video = ref.current
                    if (video) void video.play()
                }}
            ></video>
            <div>
                <div></div>
            </div>
        </div>
    )
}
