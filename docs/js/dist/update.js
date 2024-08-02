let mainJsVersion = null

const checkVersion = async () => {
    const result = await fetch(`https://mining-monitor.github.io/mining-monitor/js/dist/main.js.VERSION.txt?v=${new Date().getTime()}`)
    if (!result.ok) {
        return
    }

    const newMainJsVersion = (await result.text()).trim()
    console.log(`Check update version. Current version ${mainJsVersion}. New version ${newMainJsVersion}`)

    if (!mainJsVersion) {
        console.log("Current version is not exists. Set it")
        mainJsVersion = newMainJsVersion
        return
    }

    if (mainJsVersion == newMainJsVersion) {
        console.log("Versions are equals. Nothing doing")
        return
    }

    console.log("Versions are not equals. Reload page")
    location.reload()
}

setInterval(async () => {
    await checkVersion()
}, 5000)

checkVersion()