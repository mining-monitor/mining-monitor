import { auth } from "./auth"
import { Settings, settingsKey } from "../../../lib/settings"

export interface State {
    autoUpdate: boolean,
}

export interface SettingsProps {
    settings: Settings,
    state: State,
    onChangeSettings: (settings: Settings) => void,
}

const defaultSettings: Settings = { miners: [], notifications: {} }

export const SettingsContainer = {
    save: async (settings: Settings) => await set(settingsKey, settings),
    get: async (): Promise<Settings> => {
        try {
            const [isOk, settings] = await get(settingsKey)
            if (!isOk) {
                return { ...defaultSettings }
            }

            if (!settings.miners) settings.miners = []
            if (!settings.notifications) settings.notifications = {}

            return settings
        } catch (error) {
            console.error(error)
            return { ...defaultSettings }
        }
    },
}

const set = async (key: string, data: any) => {
    const result = await fetch(`/data?key=${key}`, {
        method: "POST",
        headers: {
            ...auth.getAuthorization(),
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data),
    })

    return result.ok
}

const get = async (key: string): Promise<[boolean, Settings | null]> => {
    const result = await fetch(`/data?key=${key}`, {
        headers: {
            ...auth.getAuthorization(),
        },
    })

    if (!result.ok) {
        return [false, null]
    }

    return [result.ok, await result.json()]
}