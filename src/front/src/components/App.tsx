import * as React from "react"
import { Master } from "./Master"
import { SettingsContainer, State } from "../lib/settings";
import { Settings } from "../../../lib/settings"
import { Miners } from "./Miners/Miners";
import { Head } from "./Head";
import { Auth } from "./Auth/Auth";
import { MinersSearch } from "./Miners/MinersSearch";
import { Accordion } from "react-bootstrap";
import { EdtiSettings } from "./Settings/EdtiSettings";
import { ActivityDetector } from "./Common/ActivityDetector";

export const App = () => {
  const [isAuth, setIsAuth] = React.useState(false)

  if (!isAuth) {
    return (<Auth onAuth={setIsAuth} />)
  }

  return (<Body />)
}

const Body = () => {
  const [settings, setSettings] = React.useState<Settings | null>(null)
  const [state, setState] = React.useState<State | null>({ autoUpdate: true })

  React.useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    const newSettings = await SettingsContainer.get()
    setSettings(newSettings)
  }

  const handleChangeSettings = async (newSettings: Settings) => {
    await SettingsContainer.save(newSettings)
    setSettings(newSettings)
  }

  const handleChangeAutoUpdate = (autoUpdate: boolean) => {
    setState(x => x.autoUpdate !== autoUpdate ? { ...x, autoUpdate } : x)
  }

  if (!settings) {
    return null
  }

  const settingsProps = {
    settings,
    state,
    onChangeSettings: handleChangeSettings,
  }

  return (
    <Master>
      <Head />
      <ActivityDetector onChange={handleChangeAutoUpdate} />
      <Accordion>
        <EdtiSettings {...settingsProps} index="0" />
        <MinersSearch {...settingsProps} index="1" />
      </Accordion>
      <Miners {...settingsProps} />
    </Master>
  )
}