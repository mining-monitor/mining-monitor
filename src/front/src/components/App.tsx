import * as React from "react"
import { Master } from "./Master"
import { Settings, SettingsContainer } from "../libs/settings";
import { Miners } from "./Miners/Miners";
import { Head } from "./Head";
import { Auth } from "./Auth/Auth";
import { MinersSearch } from "./Miners/MinersSearch";

export const App = () => {
  const [isAuth, setIsAuth] = React.useState(false)

  if (!isAuth) {
    return (<Auth onAuth={setIsAuth} />)
  }

  return (<Body />)
}

const Body = () => {
  const [settings, setSettings] = React.useState<Settings | null>(null)

  React.useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    const newSettings = await SettingsContainer.get()
    setSettings(newSettings)
  }

  const handleChangeSettings = async (newSettings: Settings) => {
    await SettingsContainer.save(newSettings)
    setSettings(newSettings)
  }

  if (!settings) {
    return null
  }

  return (
    <Master>
      <Head />
      <MinersSearch settings={settings} onChangeSettings={handleChangeSettings} />
      <Miners settings={settings} onChangeSettings={handleChangeSettings} />
    </Master>
  )
}