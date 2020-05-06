const iswin32 = process.platform === "win32"
const fs = require('fs');

var setfile;
var cachefile;

var settings;
var cachedata;
var tempdata;
var cachedir;

const settingsfile = "settings.json";
const tempfilefile = "cachefile.json";

if(iswin32){
    setfile = require("os").homedir() + "/AppData/Roaming/YT\ Downloader/" + settingsfile;
    cachefile = require("os").homedir() + "/AppData/Roaming/YT\ Downloader/" + tempfilefile;
    cachedir = require("os").homedir() + "/AppData/Roaming/YT\ Downloader/";
}else{
    setfile = require("os").homedir() + "/.config/YT\ Downloader/" + settingsfile;
    cachefile = require("os").homedir() + "/.config/YT\ Downloader/" + tempfilefile;
    cachedir = require("os").homedir() + "/.config/YT\ Downloader/";
}

try {
    exports.init_settings = init_settings;
    exports.setVal = setVal;
    exports.getVal = getVal;
    exports.setCacheVal = setCacheVal;
    exports.getCacheVal = getCacheVal;
    exports.cachedir = cachedir;
    exports.tempdata = tempdata;
} catch (error) {
    init_settings();
}


function init_settings (){
    const def_config = {"theme":"dark", "devMode": false}
    if(!fs.existsSync(setfile)){
        fs.writeFileSync(setfile, JSON.stringify(def_config));
    }
    if(!fs.existsSync(cachefile)){
        fs.writeFileSync(cachefile, JSON.stringify({}));
    }
    settings = JSON.parse(fs.readFileSync(setfile, "utf8"));
    cachedata = JSON.parse(fs.readFileSync(cachefile, "utf8"));
    tempdata = JSON.stringify({})
}

function commit_cache(){
    fs.writeFileSync(cachefile, JSON.stringify(cachedata));
}

function setCacheVal(key, val){
    cachedata[key] = val;
    commit_cache();
}

function getCacheVal(key){
    return cachedata[key];
}


function commit(){
    fs.writeFileSync(setfile, JSON.stringify(settings));
}

function setVal(key, val){
    settings[key] = val;
    commit();
}

function getVal(key){
    return settings[key];
}