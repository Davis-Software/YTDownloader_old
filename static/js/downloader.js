var ytdl = require('ytdl-core');
var filesystem = require("fs")
var { dialog } = require('electron').remote
var { shell } = require('electron')
// var { exec } = require('child_process');
var { execSync } = require('child_process');
var info;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var urlinput = document.getElementById("urlbar-input");
var applyurl = document.getElementById("urlbar-apply");
var applyurlpr = document.getElementById("urlbar-applying");
var changurl = document.getElementById("urlbar-change");
var controldiv = document.getElementById("video-spec");
var controlls = document.getElementsByClassName("video-spec-controll");

var preview = document.getElementById("video-preview");

var video_thumbnail = document.getElementById("video-thumbnail");
var video_views = document.getElementById("video-views");
var video_author = document.getElementById("video-author");
var video_length = document.getElementById("video-lenght");
var video_title = document.getElementById("video-title");

var dwn_formatselect = document.getElementById("dwn-formatselect");
var dwn_savepath = document.getElementById("dwn-savepath");
var customNamecheck = document.getElementById("customNamecheck");
var dwn_customname_div = document.getElementById("dwn-customname-div");
var dwn_customname = document.getElementById("dwn-customname");
var dwn_start = document.getElementById("dwn-start");
var dwn_prog = document.getElementById("dwn-prog");
var dwn_abort = document.getElementById("dwn-abort");
var dwn_progressbar = document.getElementById("dwn-progress");


function download(){
    var ready = false;
    var saveto = `${dwn_savepath.value}/`;
    var itag = dwn_formatselect.options[dwn_formatselect.selectedIndex].value;
    if(itag=="highest" && getVal("ffmpeg")==""){show_alert("Highest Video&Audio requires ffmpeg, please specify in Settings!", "danger")}
    else{
        if(filesystem.existsSync(dwn_savepath.value)){
            if(customNamecheck.checked){
                if(dwn_customname.value != ""){
                    saveto += dwn_customname.value;
                    ready = true;
                }else{
                    show_alert("No Custom Filename given", "warning")
                }
            }else{
                saveto += info.player_response.videoDetails.title.replaceAll(" ", "\ ");
                ready = true;
            }
            var exportformat = ytdl.chooseFormat(info.formats, {quality: itag});
            saveto += `.${exportformat.container}`
            if(ready){
                dwn_start.hidden = true;
                dwn_prog.hidden = false;
                dwn_abort.hidden = false;
                if(itag=="highest"){
                    var videostream = ytdl(urlinput.value, {
                        filter: "videoonly",
                        quality: "highestvideo"
                    });
                    var audiostream = ytdl(urlinput.value, {
                        filter: "audioonly",
                        quality: "highestaudio"
                    });
                    dwn_abort.addEventListener("click", function(ev){videostream.destroy(); audiostream.destroy(); dwn_reset();});
                    videostream.addListener("progress", function(chunk, downloaded, total){
                        var percent = `${Math.round(((downloaded/total)*100)/2)}%`
                        dwn_progressbar.style.width = percent
                        dwn_progressbar.innerText = `1/2: ${percent}`
                    });
                    audiostream.addListener("progress", function(chunk, downloaded, total){
                        var percent = `${Math.round((((downloaded/total)*100)/2)+50)}%`
                        dwn_progressbar.style.width = percent
                        dwn_progressbar.innerText = `2/2: ${percent}`
                    });
                    videostream.addListener("end", dwn_aud_part); audiostream.addListener("end", comnine_parts);
                    videostream.addListener("close", dwn_reset); audiostream.addListener("close", dwn_reset);
                    videostream.addListener("error", dwn_reset); audiostream.addListener("error", dwn_reset);
                    var tempvid = `${cachedir}tempv_vid.${exportformat.container}`
                    var tempaud = `${cachedir}tempv_aud.${exportformat.container}`
                    dwn_vid_part();
                    function dwn_vid_part(){
                        try {
                            videostream.pipe(fs.createWriteStream(tempvid));
                        } catch (error) {
                            show_alert(error, "danger")
                            dwn_reset();
                        }
                    }
                    function dwn_aud_part(){
                        try {
                            audiostream.pipe(fs.createWriteStream(tempaud));
                        } catch (error) {
                            show_alert(error, "danger")
                            dwn_reset();
                        }
                    }
                    function comnine_parts(){
                        dwn_progressbar.classList.add("progress-bar-striped");
                        dwn_progressbar.classList.add("progress-bar-animated")
                        dwn_progressbar.style.width = "100%";
                        dwn_progressbar.innerText = "Converting";
                        try {
                            execSync(`${getVal("ffmpeg")} -i "${tempvid}" -i "${tempaud}" -c:v copy "${saveto}"`);
                        } catch (error) {
                            show_alert(error, "danger");
                        }
                        dwn_reset();
                    }
                }else{
                    var stream = ytdl(urlinput.value, {
                        quality: itag
                    });
                    dwn_abort.addEventListener("click", function(ev){stream.destroy(); dwn_reset();});
                    stream.addListener("progress", function(chunk, downloaded, total){
                        var percent = `${Math.round((downloaded/total)*100)}%`
                        dwn_progressbar.style.width = percent
                        dwn_progressbar.innerText = percent
                    })
                    stream.addListener("end", dwn_reset)
                    stream.addListener("close", dwn_reset)
                    stream.addListener("error", dwn_reset)
                    try {
                        stream.pipe(fs.createWriteStream(saveto))
                    } catch (error) {
                        show_alert(error, "danger")
                        dwn_reset();
                    }
                }
            }
        }else{
            show_alert("Save Path invalid", "warning")
        }
    }
}

function apply_url(){
    applyurl.hidden = true;
    applyurlpr.hidden = false;
    show_alert("none")
    ytdl.getInfo(urlinput.value, function(err, vidinfo){
        if(err==null){
            info = vidinfo;
            set_preview(info)
            set_preconfig(info)
            urlinput.disabled = true;
            applyurlpr.hidden = true;
            changurl.hidden = false;
            controldiv.hidden = false;
        }else{
            show_alert(err, "danger");
            reset();
        }
    });
}

function set_preconfig(info){
    console.log(info)
    var format_obj = "<option value='{{value}}'>{{name}}</option>";
    var formats = info.formats
    for(format of formats){
        var audio = false;
        if(format.audioChannels >=1 ){audio = true;}
        var name = `Type: ${format.mimeType.split(";", 1)} | Quality: ${format.qualityLabel} | Audio: ${audio} | File: ${format.container}`
        
        dwn_formatselect.innerHTML += format_obj.replace("{{value}}", format.itag).replace("{{name}}", name)
    }
}

function setsavepath(){
    var path = dialog.showOpenDialogSync({
        title: "Select a Directory to save the File to",
        properties: [
            "openDirectory"
        ]
    });
    if(path===undefined){
        path = ""
    }
    dwn_savepath.value = path;
}

function set_preview(info){
    var id = info.player_response.videoDetails.videoId
    var name = info.player_response.videoDetails.title
    var author = info.player_response.videoDetails.author
    var authorURL = info.author.channel_url
    var views = info.player_response.videoDetails.viewCount
    var length = info.player_response.videoDetails.lengthSeconds
    var thumb = `http://i3.ytimg.com/vi/${id}/maxresdefault.jpg`
    video_thumbnail.src = thumb
    video_views.innerText = `Views: ${views}`
    video_author.innerHTML = `Channel: <a domain="${authorURL}" onclick="opendomain(this);" class="link" style="color: rgb(0, 110, 255);">${author}</a>`
    video_length.innerText = `Length: ${Math.round(length/60)} min`
    video_title.innerText = name
}

function opendomain(btn){
    shell.openExternal(btn.getAttribute("domain"))
}

function reset(){
    urlinput.disabled = false;
    applyurl.hidden = false;
    applyurlpr.hidden = true;
    changurl.hidden = true;
    controldiv.hidden = true;
    dwn_reset();
}

function dwn_reset(){
    dwn_start.hidden = false;
    dwn_prog.hidden = true;
    dwn_abort.hidden = true;
    dwn_progressbar.classList.remove("progress-bar-striped");
    dwn_progressbar.classList.remove("progress-bar-animated")
    dwn_progressbar.style.width = "0%"
    dwn_progressbar.innerText = ""
}

function show_alert(message, alert){
    var alert_wrapper = document.getElementById("alert_wrapper");
    if(message=="none"){
        alert_wrapper.innerHTML = ``
    }else{
        alert_wrapper.innerHTML = `
                                <div class="alert alert-${alert} alert-dismissible fade show">
                                    <span>${message}</span>
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">&times;</button>
                                </div>
                                `
    }
}

customNamecheck.addEventListener("click", function(ev){
    dwn_customname_div.hidden = !customNamecheck.checked;
})