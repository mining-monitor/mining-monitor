export const settingsKey = "settings"

export const defaultSettings: Settings = {
    miners: [],
    notifications: {},
}

export interface Settings {
    miners: MinerSettings[],
    notifications: NotificationsSettings,
    proxy?: string,
}

export interface Credentials {
    login: string,
    password: string,
}

export interface MinerSettings {
    ip: string,
    name: string,
    miner: string,
    credentials: Credentials,
}

export interface NotificationsSettings {
    enabled?: boolean,
    telegramBotToken?: string,
    telegramBotUsername?: string,
    telegramBotChatId?: string,
}