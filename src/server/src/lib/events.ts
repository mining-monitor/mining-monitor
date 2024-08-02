interface Subscriber {
    event: string,
    callback: () => Promise<void>,
}

const eventsArray: string[] = []
const subscribers: Subscriber[] = []

export const events = {
    subscribe: (subscriber: Subscriber) => subscribers.push(subscriber),
    getSubscribers: (event: string) => subscribers.filter(x => x.event === event),

    addEvent: (event: string) => eventsArray.push(event),
    getEvent: () => eventsArray.pop(),
}