import { MinerRequestsSender } from "../../../../lib/miners/minerRequestsSender"
import { auth } from "../auth"

export const minerRequestsSender: MinerRequestsSender = {
    send: async (body: object, timeout?: number): Promise<[boolean, string]> => {
        try {
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), timeout || 5000)
    
            const result = await fetch("/requests/send", {
                method: "POST",
                headers: {
                    ...auth.getAuthorization(),
                    "Content-Type": "application/json;charset=utf-8"
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            })
    
            clearTimeout(id)
    
            if (!result.ok) {
                return [false, null]
            }
    
            return [true, await result.text()]
        } catch (error) {
            console.error(error)
            return [false, null]
        }
    }
}

