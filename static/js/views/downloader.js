const { ipcRenderer } = require("electron")
const ffmeta = require("ffmetadata")

let fs = require("fs")
let { dialog } = require('electron').remote

let info
let path
let thumb


let url_input = document.getElementById("urlbar-input");
let url_apply = document.getElementById("urlbar-apply");
let url_apply_pr = document.getElementById("urlbar-applying");
let url_change = document.getElementById("urlbar-change");
let control_div = document.getElementById("video-spec");
let controls = document.getElementsByClassName("video-spec-controll");

let preview = document.getElementById("video-preview");

let video_thumbnail = document.getElementById("video-thumbnail");
let video_views = document.getElementById("video-views");
let video_author = document.getElementById("video-author");
let video_length = document.getElementById("video-lenght");
let video_title = document.getElementById("video-title");

let dwn_formatselect = document.getElementById("dwn-formatselect");
let dwn_savepath = document.getElementById("dwn-savepath");
let customNamecheck = document.getElementById("customNamecheck");
let dwn_customname_div = document.getElementById("dwn-customname-div");
let convertcheck = document.getElementById("convertcheck");
let dwn_convertformat = document.getElementById("dwn-convert-div")
let dwn_songmodecheck_div = document.getElementById("songmodecheck-div");
let dwn_songmodecheck = document.getElementById("songmodecheck");
let dwn_artist = document.getElementById("dwn-artist");
let dwn_title = document.getElementById("dwn-title");
let dwn_customname = document.getElementById("dwn-customname");
let dwn_start = document.getElementById("dwn-start");
let dwn_prog = document.getElementById("dwn-prog");
let dwn_abort = document.getElementById("dwn-abort");
let dwn_progressbar = document.getElementById("dwn-progress");



function download(){
    let ready = false;
    let save_to = `${dwn_savepath.value}/`;
    let itag = dwn_formatselect.options[dwn_formatselect.selectedIndex].value;
    let custom_format;
    if(fs.existsSync(dwn_savepath.value)){
        function teststringsupp(str){
            let unsup_list = ["/", "\\", ":", "*", "?", '"', "<", ">", "|"];
            for (let x of unsup_list){
                if(str.includes(x)){
                    return {"state": false, "chr": x};
                }
            }
            return {"state": true};
        }
        let title;
        if(customNamecheck.checked){
            if(dwn_customname.value !== ""){
                title = dwn_customname.value;
            }else{
                show_alert("No Custom Filename given")
            }
        }else{
            title = info.player_response.videoDetails.title;
        }
        let resp_of_check = teststringsupp(title);
        if(resp_of_check.state){
            save_to += title;
            ready = true
        }else{
            show_alert(`Unsupported character in savename: ${resp_of_check.chr}`)
            return;
        }
        let export_format = ipcRenderer.sendSync("format", info.formats, {quality: itag})
        if(convertcheck.checked){
            custom_format = dwn_convertformat[dwn_convertformat.selectedIndex].value;
        }else{
            custom_format = export_format.container;
        }
        if(ready){
            dwn_start.hidden = true;
            dwn_prog.hidden = false;
            dwn_abort.hidden = false;

            dwn_abort.addEventListener("click", () => {
                ipcRenderer.send("abort")
            })

            let meta = dwn_songmodecheck.checked ? {
                title: dwn_title.value,
                artist: dwn_artist.value
                } : {
                title: title,
                artist: info.player_response.videoDetails.author
            }
            meta.thumbnail = thumb

            if (itag === "highest"){
                let export_format_video = ipcRenderer.sendSync("format", info.formats, {filter: "videoonly", quality: "highestvideo"})
                let export_format_audio = ipcRenderer.sendSync("format", info.formats, {filter: "audioonly", quality: "highestaudio"})
                export_format = {video: export_format_video.container, audio: export_format_audio.container}
            }

            ipcRenderer.send("download", url_input.value, itag, export_format, `${save_to}.${custom_format}`, meta)

        }
    }else{
        show_alert("Save Path invalid")
    }
}

ipcRenderer.on("download_start", (e) => {
    dwn_formatselect.disabled = true
    customNamecheck.disabled = true
    convertcheck.disabled = true
    dwn_songmodecheck.disabled = true
    dwn_artist.disabled = true
    dwn_title.disabled = true
    dwn_customname.disabled = true
})
ipcRenderer.on("download_progress", (e, progress) => {
    win.setProgressBar(progress.percent/100)
    dwn_progressbar.style.width = progress.percent + "%"
    dwn_progressbar.innerText = progress.percent + "%"
})
ipcRenderer.on("download_convert", (e) => {
    win.setProgressBar(100)
    dwn_progressbar.classList.add("progress-bar-striped");
    dwn_progressbar.classList.add("progress-bar-animated")
    dwn_progressbar.style.width = "100%";
    dwn_progressbar.innerText = "Converting";
})
ipcRenderer.on("download_apply", (e) => {
    win.setProgressBar(100)
    dwn_progressbar.classList.add("progress-bar-striped");
    dwn_progressbar.classList.add("progress-bar-animated")
    dwn_progressbar.style.width = "100%";
    dwn_progressbar.innerText = "Applying Metadata";
})
ipcRenderer.on("download_abort", (e) => {
    show_alert("Download aborted")
    dwn_reset()
})
ipcRenderer.on("download_complete", (e, file, meta) => {
    // ffmeta.write(file, {title: meta.title, artist: meta.artist}, () => {
    dwn_reset()
    // })
})


function set_preconfig(info){
    let format_obj = "<option value='{{value}}'>{{name}}</option>";
    let formats = info.formats
    for(let format of formats){
        let audio = false;
        if(format.audioChannels >=1 ){audio = true;}
        let name = `Type: ${format.mimeType.split(";", 1)} | Quality: ${format.qualityLabel} | Audio: ${audio} | File: ${format.container}`

        dwn_formatselect.innerHTML += format_obj.replace("{{value}}", format.itag).replace("{{name}}", name)
    }
}
function setsavepath(){
    path = dialog.showOpenDialogSync({
        title: "Select a Directory to save the File to",
        properties: [
            "openDirectory"
        ]
    })
    if(path===undefined || path === ""){
        path = ""
    }else{
        dwn_savepath.value = path;
    }
}
function set_preview(info){
    let name = info.player_response.videoDetails.title
    let author = info.player_response.videoDetails.author
    let authorURL = info.videoDetails.author.channel_url
    let views = info.player_response.videoDetails.viewCount
    let length = info.player_response.videoDetails.lengthSeconds
    thumb = info.player_response.videoDetails.thumbnail.thumbnails.pop().url
    video_thumbnail.src = thumb
    video_views.innerText = `Views: ${views}`
    video_author.innerHTML = `Channel: <br><a style="padding-left: 10px;" domain="${authorURL}" onclick="open_domain(this);" href="#">${author}</a>`
    video_length.innerHTML = `Length: <br><span style="padding-left: 10px;">approx. ${Math.round(length/60)} min</span>`
    video_title.innerText = name

    dwn_artist.value = name.split(" - ")[0]
    dwn_title.value = name.split(" - ")[1]
}

function open_domain(btn){
    require('electron').shell.openExternal(btn.getAttribute("domain")).then()
}

function apply_url(){
    url_apply.hidden = true
    url_apply_pr.hidden = false
    ipcRenderer.invoke("info", url_input.value).then((video_info) => {
        console.log(video_info)
        info = video_info
        set_preview(info)
        set_preconfig(info)
        url_input.disabled = true
        url_apply_pr.hidden = true
        url_change.hidden = false
        control_div.hidden = false
    }).catch((err) => {
        show_alert(err)
        reset()
    })
}

function reset(){
    url_input.disabled = false;
    url_apply.hidden = false;
    url_apply_pr.hidden = true;
    url_change.hidden = true;
    control_div.hidden = true;
    dwn_reset();
}
function dwn_reset(){
    dwn_formatselect.disabled = false
    customNamecheck.disabled = false
    convertcheck.disabled = false
    dwn_songmodecheck.disabled = false
    dwn_artist.disabled = false
    dwn_title.disabled = false
    dwn_customname.disabled = false

    dwn_start.hidden = false;
    dwn_prog.hidden = true;
    dwn_abort.hidden = true;
    dwn_progressbar.classList.remove("progress-bar-striped");
    dwn_progressbar.classList.remove("progress-bar-animated")
    dwn_progressbar.style.width = "0%"
    dwn_progressbar.innerText = ""
    win.setProgressBar(0)
}

function show_alert(message){
    let alert = new OverlayError("overlay", "err-1", message)
    alert.modal()
}






dwn_songmodecheck.addEventListener("click", function(){
    dwn_songmodecheck_div.hidden = !dwn_songmodecheck.checked;
})

customNamecheck.addEventListener("click", function(){
    dwn_customname_div.hidden = !customNamecheck.checked;
});

convertcheck.addEventListener("click", function(){
    dwn_convertformat.hidden = !convertcheck.checked;
});