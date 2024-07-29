let mainJsVersion = null

const start = "src=\"/main.js?"
const end = "\""

const checkVersion = async () => {
    const result = await fetch(`/?v=${new Date().getTime()}`)
    const html = await result.text()
   
    if (!result.ok || html.indexOf(start) === -1) {
        return
    }

    let newMainJsVersion = html.substring(html.indexOf(start) + start.length)
    newMainJsVersion = newMainJsVersion.substring(0, newMainJsVersion.indexOf(end))

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
}, 60000)

checkVersion()