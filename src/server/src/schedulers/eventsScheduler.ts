import { events } from "../lib/events"

export const eventsScheduler = {
    work: async () => {
        const event = events.getEvent()
        if (!event) {
            return
        }

        var subscribers = events.getSubscribers(event)
        if (!subscribers.length) {
            return
        }

        await Promise.all(
            subscribers.map(x => x.callback())
        )
    }
} 