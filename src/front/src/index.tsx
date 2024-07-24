import * as React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./components/App"
import { minerRequestsSenderSetup } from "./lib/miners/minersRequestsSender"

minerRequestsSenderSetup.setup()

const container = document.getElementById("app")
const root = createRoot(container!)

root.render(<App />)