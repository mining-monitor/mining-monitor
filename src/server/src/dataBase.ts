import { LocalStorage } from "node-localstorage"
import * as CryptoJS from "crypto-js"
import { v4 as uuidv4 } from "uuid"
import * as os from "os"
import * as fs from "fs"

const localStorage = new LocalStorage("./.db")

export const dataBase = {
    set: (key: string, item: any) => set(key, item),
    get: (key: string) => get(key),
    key: (key: string) => !!get(key),
    clear: () => localStorage.clear(),
}

const get = (key: string) => {
    const encryptedJson = localStorage.getItem(key)
    if (!encryptedJson) {
        return null
    }

    try {
        const json = CryptoJS.AES.decrypt(encryptedJson, getSecretKey()).toString(CryptoJS.enc.Utf8)
        return JSON.parse(json)
    } catch (error) {
        console.log(error)
    }
}

const set = (key: string, item: any) => {
    const json = JSON.stringify(item)
    const encryptedJson = CryptoJS.AES.encrypt(json, getSecretKey()).toString()
    localStorage.setItem(key, encryptedJson)
}

// *** Secret key ***

let secretKeyCache: string | null = null
const secretFileName = `${os.homedir()}/miningMonitor`

const getSecretKey = () => {
    if (!secretKeyCache) {
        const isExists = fs.existsSync(secretFileName)
        if (isExists) {
            secretKeyCache = fs.readFileSync(secretFileName).toString()
        }
    }

    if (!secretKeyCache) {
        secretKeyCache = uuidv4()
        fs.writeFileSync(secretFileName, secretKeyCache)
    }

    return secretKeyCache;
}