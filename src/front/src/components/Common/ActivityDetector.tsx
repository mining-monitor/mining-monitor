import * as React from "react"

const activityEvents = [
    "click",
    "mousemove",
    "keydown",
    "DOMMouseScroll",
    "mousewheel",
    "mousedown",
    "touchstart",
    "touchmove",
    "focus",
]

const timeout = 5 * 60 * 1000

let scheduledIdleTimeout: NodeJS.Timeout | null = null
let activityEventInterval: NodeJS.Timeout | null = null

interface Props {
    onChange: (isActive: boolean) => void,
}

export const ActivityDetector = (props: Props) => {
    const [timeoutScheduled, setTimeoutScheduled] = React.useState(false)

    React.useEffect(() => {
        attachListeners()
        setTimeoutScheduled(false)

        return () => stop()
    }, [])

    React.useEffect(() => {
        if (!timeoutScheduled) {
            scheduleIdleHandler()
        }

        setTimeoutScheduled(true)
    }, [timeoutScheduled])

    const scheduleIdleHandler = () => {
        clearTimeout(scheduledIdleTimeout)
        
        scheduledIdleTimeout = setTimeout(() => props.onChange(false), timeout)
    }

    const resetTimer = () => {
        clearTimeout(activityEventInterval)

        activityEventInterval = setTimeout(() => setTimeoutScheduled(false), 200)
    }

    const handleUserActivityEvent = () => {
        resetTimer()

        props.onChange(true)
    }

    const stop = () => {
        detachListeners()
        clearTimeout(scheduledIdleTimeout)
        clearTimeout(activityEventInterval)
    }

    const attachListeners = () => {
        activityEvents.forEach((eventName) =>
            window.addEventListener(eventName, handleUserActivityEvent)
        )
    }

    const detachListeners = () => {
        activityEvents.forEach((eventName) =>
            window.removeEventListener(eventName, handleUserActivityEvent)
        )
    }

    return timeoutScheduled
}