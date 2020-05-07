function loadHTML(filename){
    $("#mainpage").load("./../templates/pages/" + filename);
}
function loadURL(url){
    $("#mainpage").load(url);
}