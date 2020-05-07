var filesystem = require("fs")

function update(){
    sets = document.getElementsByClassName("setval")
    for(set of sets){
        set.innerText = set.getAttribute("placeholder") + " " + getVal(set.getAttribute("getval"))
    }
}
function setSetting(setting, value){
    setVal(setting, value);
    update();
}
update();
///////////////////////////////////////////////////////////////////////
//ffmpeg///////////////////////////////////////////////////////////////
var ffmpeg_input = document.getElementById("ffmpeg-input");
ffmpeg_input.value = getVal("ffmpeg");
function change_ffmpeg(){
    var path = dialog.showOpenDialogSync({
        title: "Select ffmpeg executable",
        properties: [
            "openFile"
        ],
        filters: [
            { name: 'ffmpeg.exe', extensions: ['exe'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if(path===undefined){
        path = getVal("ffmpeg");
    }
    if(!filesystem.existsSync(path)){
        path = ""
    }
    if(path.includes(" ")){
        alert("Spaces are not allowed in this path!")
        return;
    }
    setVal("ffmpeg", path);
    ffmpeg_input.value = getVal("ffmpeg");
}