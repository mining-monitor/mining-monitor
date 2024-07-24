declare module "node-localstorage" {
    export class LocalStorage {
        constructor(directory: string)
        getItem(key: string): string
        setItem(key: string, value: string): void
        clear(): void
    }
 }