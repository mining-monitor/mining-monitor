import { events } from "../lib/events"
import { safeExecute } from "../lib/utils"

export const eventsScheduler = {
    work: async () => {
        await safeExecute(async () => {
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
        })
    }
} 