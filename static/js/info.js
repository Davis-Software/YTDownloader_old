var { shell } = require("electron")

function openURL(url){
    shell.openExternal(url)
}