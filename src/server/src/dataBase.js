const { LocalStorage } = require("node-localstorage")
const CryptoJS = require("crypto-js")
const { v4: uuidv4 } = require("uuid")
const os = require("os")
const fs = require("fs")

const localStorage = new LocalStorage("./.db")

exports.dataBase = {
    set: (key, item) => set(key, item),
    get: (key) => get(key),
    key: (key) => !!get(key),
    clear: () => localStorage.clear(),
}

const get = (key) => {
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

const set = (key, item) => {
    const json = JSON.stringify(item)
    const encryptedJson = CryptoJS.AES.encrypt(json, getSecretKey()).toString()
    localStorage.setItem(key, encryptedJson)
}

// *** Secret key ***

let secretKeyCache = null
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