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
