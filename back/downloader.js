const { ipcMain, app } = require("electron")
const fs = require("fs")
const path = require("path")
const yt_dl = require('ytdl-core')
const axios = require("axios");
const { execFile } = require("child_process")

const cache = app.getPath("userData") + "/"
const tools = path.join(cache, "tools")

const extension = process.platform === "win32" ? ".exe" : ""

const ffmpeg = tools + "/ffmpeg" + extension
const ap = tools + "/ap" + extension

let video_stream;
let audio_stream;
let combiner;
let riser;


ipcMain.handle("download_cover", async (e, url) => {
    let pt = `${cache}temp_thumb.jpg`
    let writer = fs.createWriteStream(pt)
    let data = await axios.get(url, {responseType: "stream"})
    data.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.addListener("finish", () => {
            resolve(pt)
        })
        writer.addListener("error", reject)
    })
})

ipcMain.handle("info", async (e, url) => {
    return yt_dl.getInfo(url, {lang: "en"})
})

ipcMain.on("format", (e, info, options) => {
    e.returnValue = yt_dl.chooseFormat(info, options)
})

ipcMain.on("download", (e, url, format, export_format, filename, meta) => {
    e.reply("download_start")
    function abort(){
        e.reply("download_abort")

        if(video_stream !== undefined) video_stream.destroy()
        if(audio_stream !== undefined) audio_stream.destroy()

        video_stream = undefined
        audio_stream = undefined
        combiner = undefined
        riser = undefined
    }
    ipcMain.once("abort", abort)
    function finish(){
        video_stream = undefined
        audio_stream = undefined
        combiner = undefined

        e.reply("download_apply")

        setTimeout(() => {
            e.reply("download_complete", filename, meta)
        }, 1000)
    }

    if(format === "highest"){
        video_stream = yt_dl(url, {
            filter: "videoonly",
            quality: "highestvideo"
        })
        audio_stream = yt_dl(url, {
            filter: "audioonly",
            quality: "highestaudio"
        })

        video_stream.addListener("progress", (chunk, downloaded, total) => {
            let percent = Math.round(downloaded/total*100/2 )
            e.reply("download_progress", {chunk, downloaded, total, percent})
        })
        audio_stream.addListener("progress", (chunk, downloaded, total) => {
            let percent = Math.round(downloaded/total*100/2 + 50 )
            e.reply("download_progress", {chunk, downloaded, total, percent})
        })

        let temp_vid = `${cache}temp_vid.${export_format.video}`
        let temp_aud = `${cache}temp_aud.${export_format.audio}`

        let start_download = () => {
            try {
                video_stream.pipe(fs.createWriteStream(temp_vid))
            } catch (error) {
                e.reply("download_error", error)
            }
        }
        video_stream.addListener("end", () => {
            try {
                audio_stream.pipe(fs.createWriteStream(temp_aud))
            } catch (error) {
                e.reply("download_error", error)
            }
        })
        function combine_and_finish(){
            combiner = execFile(ffmpeg, ["-i", temp_vid, "-i", temp_aud, "-c:v", "copy", filename], () => {
                finish()
            })
        }
        audio_stream.addListener("end", () => {
            try {
                e.reply("download_convert")
                // if(export_format.audio !== "mp4"){
                //     const old = temp_aud
                //     temp_aud = `${cache}temp_aud.mp4`
                //     combiner = execFile(ffmpeg, ["-i", old, temp_aud], () => {
                //         combine_and_finish()
                //     })
                // }else{
                //     combine_and_finish()
                // }
                combine_and_finish()
            } catch (e) {
                e.reply("download_error", e)
            }
        })

        video_stream.addListener("close", abort)
        video_stream.addListener("error", abort)
        audio_stream.addListener("close", abort)
        audio_stream.addListener("error", abort)
        start_download()
    }
    else{
        let opts = {quality: format}

        if (format === "highestvideo") opts.filter = "videoonly"
        if (format === "highestaudio") opts.filter = "audioonly"

        video_stream = yt_dl(url, opts)

        video_stream.addListener("progress", (chunk, downloaded, total) => {
            let percent = Math.round(downloaded/total*100 )
            e.reply("download_progress", {chunk, downloaded, total, percent})
        })

        let temp_vid = `${cache}temp_vid.${export_format.container}`

        let start_download = () => {
            try {
                video_stream.pipe(fs.createWriteStream(temp_vid))
            } catch (error) {
                e.reply("download_error", error)
            }
        }
        video_stream.addListener("end", () => {
            try {
                e.reply("download_convert")
                combiner = execFile(ffmpeg, ["-i", temp_vid, filename], () => {
                    finish()
                })
            } catch (e) {
                e.reply("download_error", e)
            }
        })

        video_stream.addListener("close", abort)
        video_stream.addListener("error", abort)
        start_download()
    }
})




String.prototype.replaceAll = function(search, replacement) {
    let target = this
    return target.split(search).join(replacement)
}