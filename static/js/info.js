var { shell } = require("electron")
var remote = require("electron").remote

document.getElementById("version").innerText = remote.app.getVersion();
document.getElementById("dwns").innerText = getCacheVal("downloads");

function openURL(url){
    shell.openExternal(url)
}