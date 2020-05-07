function loadpage(btn){
    var buts = document.getElementsByClassName("sidebarclass");
    for(let e of buts){e.classList.remove("active");}
    var page = btn.getAttribute("page");
    if(page.includes("https://")){
        loadURL(page);
    }else{
        loadHTML(page);
    }
    btn.classList.add("active");
}
loadpage(document.getElementsByClassName("sel-default")[0], document.getElementsByClassName("sel-default")[0].getAttribute("page"));