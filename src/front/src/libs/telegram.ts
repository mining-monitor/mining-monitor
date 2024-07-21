
export const telegram = {
    send: async (message: string, telegramBotToken: string, telegramBotChatId: string) => {
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramBotChatId}&text=${encodeURIComponent(message)}`)
    }
}