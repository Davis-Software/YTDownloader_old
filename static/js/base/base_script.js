let { remote } = require('electron')
let win = remote.getCurrentWindow()


function window_minimize(){
    win.minimize()
}
function window_close(){
    win.close()
}


function loadPage(page){
    $("#main").load(`./views/${page}.html`)
}


String.prototype.replaceAll = function(search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};
