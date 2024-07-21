
export const telegram = {
    send: async (message: string, token: string, chatId: string) => {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    },

    getChatId: async (username: string, token: string) => {
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
        const result = await response.json()

        const messages = result?.result as any[]
        if(!messages || messages.length === 0) {
            return ""
        }

        const message = messages.find(x => x.message.chat.username === username)
        return message?.message?.chat?.id?.toString() || ""
    },
}